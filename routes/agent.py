from fastapi import APIRouter, HTTPException, BackgroundTasks
from camel.messages import BaseMessage
from agents.pm_agent import pm_agent
from agents.dev_agent import dev_agent
from schemas.agent import ChatRequest, ChatResponse
from routes.github import github_tools
from tools.progress_tracker import progress_tracker
from logging_config.logger import logger
import anyio

router = APIRouter(prefix="/agent", tags=["agent"])

def _sync_agent_step(agent, message):
    return agent.step(message)

async def run_agent_task(agent, message: str, task_id: str):
    """
    Runs the agent in the background and updates the final response.
    """
    try:
        # Run the blocking agent.step in a separate thread
        response = await anyio.to_thread.run_sync(_sync_agent_step, agent, message)
        final_text = response.msg.content if response.msg else "Task processed."
        progress_tracker.final_response[task_id] = final_text
        logger.info(f"✅ Background task {task_id} completed.")
    except Exception as e:
        logger.error(f"❌ Background task {task_id} failed: {e}")
        progress_tracker.update_step(task_id, "System", "failed", str(e))

@router.get("/progress")
async def get_agent_progress(task_id: str = "dev"):
    return progress_tracker.get_progress(task_id)

@router.post("/chat", response_model=ChatResponse)
async def chat_with_agent(request: ChatRequest, background_tasks: BackgroundTasks):
    """
    Handles chat interactions with the selected Agent (PM or Dev).
    """
    agent_type = request.agent_type.lower() if request.agent_type else "pm"
    logger.info(f"📩 [{agent_type.upper()}] Objective: {request.message[:50]}...")
    
    try:
        if agent_type == "dev":
            # Start with a clean but minimal state
            progress_tracker.init_task("dev", ["Analyzing Requirements"])
            
            # Inject context if available
            if request.metadata and request.metadata.get("ticket_key"):
                ticket_key = request.metadata.get("ticket_key")
                branch = request.metadata.get("branch", "main")
                repo = github_tools.current_repo
                token = github_tools.access_token or "None"
                context_msg = f"Target Repository: {repo}. GITHUB_ACCESS_TOKEN: {token}. Target Ticket: {ticket_key}. Base Branch: {branch}. "
                request.message = context_msg + request.message
            
            # Start implementation in background
            background_tasks.add_task(run_agent_task, dev_agent, request.message, "dev")
            
            return ChatResponse(
                response="Implementation task started in the workspace. Watch the progress tracker for updates.",
                status="in_progress"
            )
        else:
            # PM Agent remains synchronous as it is usually fast (planning)
            response = pm_agent.step(request.message)
            final_text = response.msg.content if response.msg else "Task processed."
            return ChatResponse(
                response=final_text,
                status="completed" if response.terminated else "in_progress"
            )
        
    except Exception as e:
        logger.error(f"❌ Error in chat_with_agent: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

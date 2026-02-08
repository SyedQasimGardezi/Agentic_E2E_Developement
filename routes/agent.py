import os
from fastapi import APIRouter, HTTPException, BackgroundTasks
from camel.messages import BaseMessage
from agents.specs_agent import specs_agent
from agents.dev_agent import dev_agent
from schemas.agent import ChatRequest, ChatResponse
from routes.github import github_tools
from config.settings import settings
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
        progress_tracker.set_final_response(task_id, final_text)
        logger.info(f"✅ Background task {task_id} completed.")
    except Exception as e:
        error_msg = str(e)
        logger.error(f"❌ Background task {task_id} failed: {error_msg}")
        # Don't clear the checklist - just add error to logs
        if "timed out" in error_msg.lower():
            progress_tracker.add_log(task_id, f"⚠️ Agent timeout - work may have completed. Check logs and repository.")
        else:
            progress_tracker.add_log(task_id, f"❌ Error: {error_msg}")


@router.get("/progress")
async def get_agent_progress(task_id: str = "dev"):
    return progress_tracker.get_progress(task_id)

@router.post("/chat", response_model=ChatResponse)
async def chat_with_agent(request: ChatRequest, background_tasks: BackgroundTasks):
    """
    Handles chat interactions with the selected Agent (Specs or Dev).
    """
    agent_type = request.agent_type.lower() if request.agent_type else "specs"
    logger.info(f"📩 [{agent_type.upper()}] Objective: {request.message[:50]}...")
    
    try:
        repo = github_tools.current_repo or "NOT_CONNECTED"
        jira_project = settings.JIRA_PROJECT_KEY
        
        if agent_type == "dev":
            # Start with a clean but minimal state
            progress_tracker.init_task("dev", ["Analyzing Requirements"])
            
            # Enhanced context for Dev Agent
            ticket_key = request.metadata.get("ticket_key") if request.metadata else None
            branch = request.metadata.get("branch", "main") if request.metadata else "main"
            
            context_msg = f"[CONTEXT] Active Repository: {repo}. Jira Project: {jira_project}. "
            if ticket_key:
                context_msg += f"Target Ticket: {ticket_key}. Base Branch: {branch}. "
                
            if repo == "NOT_CONNECTED":
                context_msg += "Warning: No repository linked. "
            
            request.message = context_msg + request.message
            
            # Start implementation in background
            background_tasks.add_task(run_agent_task, dev_agent, request.message, "dev")
            
            return ChatResponse(
                response=f"Implementation task started. Using repository: {repo}" if repo != "NOT_CONNECTED" else "Implementation task started. WARNING: No repository linked.",
                status="in_progress"
            )
        else:
            # Enhanced context for Specs Agent (Planning)
            context_msg = f"[CONTEXT] Active Repository: {repo}. Jira Project: {jira_project}. "
            if repo == "NOT_CONNECTED":
                context_msg += "Note: No repository is currently linked. "
            
            request.message = context_msg + request.message
            
            # Specs Agent remains synchronous as it is usually fast
            response = specs_agent.step(request.message)
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

import os
from fastapi import APIRouter, HTTPException, BackgroundTasks
from camel.messages import BaseMessage
from agents.specs_agent import specs_agent
from agents.dev_agent import dev_agent
from agents.qa_agent import qa_agent
from schemas.agent import ChatRequest, ChatResponse
from routes.github import github_tools
from routes.figma import figma_tools as figma_service
from config.settings import settings
from tools.progress_tracker import progress_tracker
from logging_config.logger import logger
import anyio

router = APIRouter(prefix="/agent", tags=["agent"])

class AgentSessionState:
    last_dev_ticket: str = None

session_state = AgentSessionState()

def _sync_agent_step(agent, message):
    return agent.step(message)

import asyncio

async def run_agent_task(agent, message: str, task_id: str, metadata: dict = None):
    """
    Runs the agent in the background, updates response, and handles chaining (Dev -> QA).
    """
    try:
        # Run the blocking agent.step in a separate thread
        response = await anyio.to_thread.run_sync(_sync_agent_step, agent, message)
        final_text = response.msg.content if response.msg else "Task processed."
        progress_tracker.set_final_response(task_id, final_text)
        
        # --- CHAINING LOGIC ---
        # 1. If DEV agent finishes successfully, Trigger QA
        if task_id == "dev" and "PR Created" in final_text: # weak check, ideally structured
             # Assuming Dev Agent always ends with PR creation for success
             progress_tracker.add_log("dev", "🤖 Dev Task Complete. Triggering QA Agent...")
             
             # Wait a moment for systems to sync
             await asyncio.sleep(2)
             
             # Construct QA context
             ticket_key = metadata.get("ticket_key") if metadata else None
             qa_msg = f"[AUTOMATED HANDOFF] Verify implementation for ticket {ticket_key}. Check functionality and tests."
             if ticket_key:
                 progress_tracker.init_task("qa", ["Initializing from Dev Handoff"])
                 # Recursive call to run QA
                 await run_agent_task(qa_agent, qa_msg, "qa", metadata)
                 
        # 2. If QA agent fails (finds bugs), Trigger Dev again (Repair Loop)
        elif task_id == "qa":
            # Check if QA reported failure
            qa_progress = progress_tracker.get_progress("qa")
            # We look for a step status of 'failed' OR if multiple subtasks were created (bugs)
            has_failures = any(s['status'] == 'failed' for s in qa_progress['steps'])
            
            if has_failures or "QA Defect" in final_text:
                 progress_tracker.add_log("qa", "❌ QA Failed. Routing back to Dev Agent for fixes...")
                 await asyncio.sleep(2)
                 
                 fix_msg = f"[AUTOMATED FEEDBACK] QA Validation Failed. Fix the reported defects for {metadata.get('ticket_key')} and re-submit."
                 # Reset dev tracker for the fix phase
                 progress_tracker.init_task("dev", ["Analyzing QA Feedback", "Fixing Bugs", "Verify Fixes", "Push Update"])
                 await run_agent_task(dev_agent, fix_msg, "dev", metadata)
            else:
                 progress_tracker.add_log("qa", "✅ QA Passed. ready for deployment.")

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
    Handles chat interactions with the selected Agent (Specs, Dev, or QA).
    """
    agent_type = request.agent_type.lower() if request.agent_type else "specs"
    logger.info(f"📩 [{agent_type.upper()}] Objective: {request.message[:50]}...")
    
    try:
        repo = github_tools.current_repo or "NOT_CONNECTED"
        jira_project = settings.JIRA_PROJECT_KEY
        
        # Use dynamic file key if set, otherwise fallback to project ID
        active_figma = figma_service.current_file or settings.FIGMA_PROJECT_ID or "NOT_CONFIGURED"
        
        if agent_type == "dev":
            ticket_key = request.metadata.get("ticket_key") if request.metadata else None
            branch = request.metadata.get("branch", "main") if request.metadata else "main"
            
            # --- MEMORY MANAGEMENT ---
            # If the user switches tickets, we MUST reset the agent's short-term memory
            if ticket_key and ticket_key != session_state.last_dev_ticket:
                logger.info(f"🔄 Context Switch detected: {session_state.last_dev_ticket} -> {ticket_key}. Resetting Agent Memory.")
                dev_agent.reset()
                session_state.last_dev_ticket = ticket_key
                # Initialize new progress tracker for the new task
                progress_tracker.init_task("dev", ["Analyzing Requirements"])
            elif not ticket_key:
                 pass
            
            # Use dynamic file key if set, otherwise fallback to project ID
            active_figma = figma_service.current_file or settings.FIGMA_PROJECT_ID or "NOT_CONFIGURED"
            
            # Enhanced context for Dev Agent
            context_msg = ""
            # Only add context preamble if memory was just reset or it's the first message
            if len(dev_agent.memory.get_context()) == 0: 
                 context_msg = f"[CONTEXT] Active Repository: {repo}. Jira Project: {jira_project}. Figma Context: {active_figma}. "
                 if ticket_key:
                     context_msg += f"Target Ticket: {ticket_key}. Base Branch: {branch}. "
                     
                 if repo == "NOT_CONNECTED":
                     context_msg += "Warning: No repository linked. "
            
            full_message = context_msg + request.message
            
            # Start implementation in background
            background_tasks.add_task(run_agent_task, dev_agent, full_message, "dev", request.metadata)
            
            return ChatResponse(
                response=f"Working on {ticket_key}..." if ticket_key else "Processing request...",
                status="in_progress"
            )
            
        elif agent_type == "qa":
            # Start with a clean state for QA
            progress_tracker.init_task("qa", ["Initializing QA Environment"])
            
            ticket_key = request.metadata.get("ticket_key") if request.metadata else None
            
            context_msg = f"[CONTEXT] Active Repository: {repo}. Jira Project: {jira_project}. "
            if ticket_key:
                context_msg += f"Verify Ticket: {ticket_key}. "
            
            request.message = context_msg + request.message
            
            # Start QA in background
            background_tasks.add_task(run_agent_task, qa_agent, request.message, "qa", request.metadata)
            
            return ChatResponse(
                response=f"QA Task started for {ticket_key or 'current request'}.",
                status="in_progress"
            )
            
        else:
            # Enhanced context for Specs Agent (Planning)
            context_msg = f"[CONTEXT] Active Repository: {repo}. Jira Project: {jira_project}. Figma Project: {active_figma}. "
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

@router.get("/files")
async def list_files(path: str = "."):
    """List files in the workspace directory."""
    workspace_root = os.path.join(os.getcwd(), "workspace")
    if not os.path.exists(workspace_root):
        os.makedirs(workspace_root, exist_ok=True)
    
    target_path = os.path.join(workspace_root, path)
    if not os.path.abspath(target_path).startswith(workspace_root):
        raise HTTPException(status_code=403, detail="Forbidden")
    
    if not os.path.exists(target_path):
        return []
    
    items = []
    for item in os.listdir(target_path):
        full_path = os.path.join(target_path, item)
        rel_path = os.path.relpath(full_path, workspace_root)
        items.append({
            "name": item,
            "path": rel_path,
            "is_dir": os.path.isdir(full_path),
            "size": os.path.getsize(full_path) if not os.path.isdir(full_path) else 0
        })
    return sorted(items, key=lambda x: (not x["is_dir"], x["name"]))

@router.get("/file_content")
async def get_file_content(path: str):
    """Get the content of a file in the workspace."""
    workspace_root = os.path.join(os.getcwd(), "workspace")
    target_path = os.path.join(workspace_root, path)
    
    if not os.path.abspath(target_path).startswith(workspace_root):
        raise HTTPException(status_code=403, detail="Forbidden")
    
    if not os.path.exists(target_path) or os.path.isdir(target_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        with open(target_path, 'r') as f:
            return {"content": f.read()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

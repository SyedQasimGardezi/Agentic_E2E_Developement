from fastapi import APIRouter, HTTPException
from camel.messages import BaseMessage
from agents.pm_agent import pm_agent
from schemas.agent import ChatRequest, ChatResponse
from logging_config.logger import logger

router = APIRouter(prefix="/agent", tags=["agent"])

@router.post("/chat", response_model=ChatResponse)
async def chat_with_agent(request: ChatRequest):
    """
    Handles chat interactions with the PM Agent.
    The agent is configured to handle tool calls and reasoning internally 
    within a single step() call.
    """
    logger.info(f"📩 Received objective: {request.message[:50]}...")
    
    try:
        # ChatAgent.step(message) will internally loop until tool calls are finished
        # or max iterations are reached.
        response = pm_agent.step(request.message)
        
        logger.info("🤖 Agent response turn completed")
        
        # The final message from the agent after all tool calls/reasoning
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

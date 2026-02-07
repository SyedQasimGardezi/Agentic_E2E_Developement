from fastapi import APIRouter, HTTPException
from typing import List
from tools.jira_tools import JiraTools
from schemas.jira import TicketRequest
from logging_config.logger import logger

router = APIRouter(prefix="/jira", tags=["jira"])
jira_tools = JiraTools()

@router.get("/tickets")
async def list_jira_tickets(max_results: int = 10):
    logger.info(f"📋 Fetching {max_results} Jira tickets...")
    try:
        tickets = jira_tools.list_tickets(max_results=max_results)
        return tickets
    except Exception as e:
        logger.error(f"❌ Failed to fetch tickets: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tickets")
async def create_jira_ticket(ticket: TicketRequest):
    try:
        result = jira_tools.create_ticket(
            summary=ticket.summary,
            description=ticket.description,
            issue_type=ticket.issue_type,
            story_points=ticket.story_points,
            labels=ticket.labels,
            parent_key=ticket.parent_key
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

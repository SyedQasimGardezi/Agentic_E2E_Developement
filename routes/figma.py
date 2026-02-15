from fastapi import APIRouter, HTTPException, Depends
from tools.figma_tools import FigmaTools
from logging_config.logger import logger
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/figma", tags=["figma"])
figma_tools = FigmaTools()

class ConnectFileRequest(BaseModel):
    file_key: str
    access_token: Optional[str] = None

@router.get("/status")
async def get_figma_status():
    """
    Returns the current connection status to Figma.
    """
    try:
        return {
            "connected": bool(figma_tools.access_token and figma_tools.current_file),
            "file_key": figma_tools.current_file,
            "team_id": figma_tools.team_id,
            "project_id": figma_tools.current_project_id
        }
    except Exception as e:
        logger.error(f"Failed to get Figma status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/disconnect")
async def disconnect_figma():
    """
    Disconnects the current Figma file.
    """
    figma_tools.current_file = None
    return {"success": True, "message": "Disconnected from Figma"}

@router.post("/connect")
async def connect_file(request: ConnectFileRequest):
    """
    Connects to a specified Figma file (retrieves details).
    """
    logger.info(f"Connecting to Figma file: {request.file_key}")
    try:
        # Update token if provided
        if request.access_token:
            figma_tools.access_token = request.access_token
        
        # Use depth=1 to avoid huge payloads when just verifying connection
        result = figma_tools.get_file(request.file_key, depth=1)
        if result.get("success"):
            # Persist current file context for agents
            figma_tools.current_file = result.get("key")
            return result
        else:
            raise HTTPException(status_code=400, detail=result.get("error", "Failed to connect to file"))
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Failed to connect to file: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/file/{file_key}")
async def get_file_details(file_key: str):
    """
    Returns details about a specific Figma file.
    """
    try:
        details = figma_tools.get_file(file_key)
        return details
    except Exception as e:
        logger.error(f"Failed to get file details: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/comments/{file_key}")
async def get_file_comments(file_key: str):
    """
    Returns comments for a Figma file.
    """
    try:
        comments = figma_tools.get_file_comments(file_key)
        return {"comments": comments}
    except Exception as e:
        logger.error(f"Failed to get comments: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/team/projects")
async def list_team_projects():
    """
    Lists projects for the default configured team.
    """
    try:
        projects = figma_tools.get_team_projects()
        return {"projects": projects}
    except Exception as e:
        logger.error(f"Failed to list team projects: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/project/{project_id}/files")
async def list_project_files(project_id: str):
    """
    Lists files for a specific project.
    """
    try:
        files = figma_tools.get_project_files(project_id)
        return {"files": files}
    except Exception as e:
        logger.error(f"Failed to list project files: {e}")
        raise HTTPException(status_code=500, detail=str(e))

from fastapi import APIRouter, HTTPException, Depends
from tools.github_tools import GitHubTools
from logging_config.logger import logger
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/github", tags=["github"])
github_tools = GitHubTools()

class ConnectRepoRequest(BaseModel):
    repo_name: str
    access_token: Optional[str] = None

@router.get("/status")
async def get_github_status():
    """
    Returns the current connection status to GitHub.
    """
    try:
        status = github_tools.get_status()
        return status
    except Exception as e:
        logger.error(f"Failed to get GitHub status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/repos")
async def list_repos():
    """
    Lists updated repositories for the user.
    """
    try:
        return github_tools.list_user_repos()
    except Exception as e:
        logger.error(f"Failed to list repos: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/branches")
async def list_branches():
    """
    Lists branches for the connected repository.
    """
    try:
        return github_tools.list_branches()
    except Exception as e:
        logger.error(f"Failed to list branches: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/connect")
async def connect_repo(request: ConnectRepoRequest):
    """
    Connects to a specified GitHub repository.
    """
    logger.info(f"Connecting to GitHub repo: {request.repo_name}")
    try:
        # Update token if provided
        if request.access_token:
            github_tools.access_token = request.access_token
            # Re-initialize toolkit with new token
            from camel.toolkits.github_toolkit import GithubToolkit
            try:
                github_tools.toolkit = GithubToolkit(access_token=request.access_token)
            except Exception as e:
                 raise HTTPException(status_code=400, detail=f"Invalid token: {e}")
        
        result = github_tools.connect_repo(request.repo_name)
        if result.get("success"):
            return result
        else:
            raise HTTPException(status_code=400, detail=result.get("error", "Failed to connect"))
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Failed to connect to repo: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/details")
async def get_repo_details():
    """
    Returns details about the currently connected repository.
    """
    try:
        if not github_tools.current_repo:
            raise HTTPException(status_code=400, detail="No repository connected")
        
        details = github_tools.get_repo_details()
        return details
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Failed to get repo details: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/files")
async def get_repo_files(path: str = ""):
    """
    Returns the file tree of the connected repository.
    """
    try:
        if not github_tools.current_repo:
             raise HTTPException(status_code=400, detail="No repository connected")
        
        files = github_tools.get_file_tree(path)
        return {"files": files}
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Failed to get repo files: {e}")
        raise HTTPException(status_code=500, detail=str(e))

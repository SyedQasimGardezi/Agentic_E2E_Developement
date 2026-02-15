from typing import List, Optional, Dict, Any
import requests
from config.settings import settings
from logging_config.logger import logger
from models.figma import FigmaFile, FigmaComment

class FigmaTools:
    BASE_URL = "https://api.figma.com/v1"

    def __init__(self):
        self.access_token = settings.FIGMA_ACCESS_TOKEN
        self.team_id = settings.FIGMA_TEAM_ID
        self.current_project_id = settings.FIGMA_PROJECT_ID
        self.current_file = None # Tracks the currently connected file content/key
        
        if self.access_token:
            logger.info("Figma Tools initialized with token.")
        else:
            logger.warning("FIGMA_ACCESS_TOKEN not found in settings.")

    def _get_headers(self) -> Dict[str, str]:
        if not self.access_token:
            return {}
        return {
            "X-Figma-Token": self.access_token
        }

    def _extract_key(self, key_or_url: str) -> str:
        """
        Extracts the file key from a full URL or returns the key if it's already just a key.
        Supports:
        - https://www.figma.com/file/KEY/Title
        - https://www.figma.com/design/KEY/Title
        - KEY
        """
        import re
        if "figma.com" in key_or_url:
            match = re.search(r"(?:file|design)/([a-zA-Z0-9]+)", key_or_url)
            if match:
                return match.group(1)
        return key_or_url

    def get_file(self, file_key: str, depth: int = None) -> Dict[str, Any]:
        """
        Retrieves metadata and content for a specific Figma file.
        Use depth=1 for lightweight metadata checks.
        Includes retry logic for rate limits.
        """
        import time
        if not self.access_token:
            return {"success": False, "error": "Figma token not configured."}
        
        real_key = self._extract_key(file_key)
        url = f"{self.BASE_URL}/files/{real_key}"
        
        params = {}
        if depth is not None:
             params["depth"] = depth
             
        max_retries = 3
        backoff = 2
        
        for attempt in range(max_retries):
            try:
                response = requests.get(url, headers=self._get_headers(), params=params)
                if response.status_code == 429:
                    # Check for Retry-After header from Figma
                    retry_after = response.headers.get("Retry-After")
                    if retry_after:
                        wait_time = int(retry_after)
                    else:
                        wait_time = backoff ** (attempt + 1)
                    
                    logger.warning(f"Figma API Rate Limited (429). Retry-After: {retry_after}s. Waiting {wait_time}s... (Attempt {attempt+1}/{max_retries})")
                    time.sleep(wait_time)
                    continue
                
                response.raise_for_status()
                data = response.json()
                
                file_data = FigmaFile(
                    key=real_key,
                    name=data.get("name"),
                    last_modified=data.get("lastModified"),
                    thumbnail_url=data.get("thumbnailUrl"),
                    editor_type=data.get("editorType")
                )
                
                result = file_data.to_dict()
                if depth is None:
                    result["document"] = data.get("document") 
                
                result["success"] = True
                return result
            except requests.exceptions.RequestException as e:
                # If it's not a 429, or we've exhausted retries
                if attempt == max_retries - 1 or (hasattr(e, 'response') and e.response is not None and e.response.status_code != 429):
                    logger.error(f"Failed to get Figma file {real_key}: {e}")
                    return {"success": False, "error": str(e)}
        
        return {"success": False, "error": "Max retries exceeded for Figma API."}

    def get_file_comments(self, file_key: str) -> List[Dict[str, Any]]:
        """
        Retrieves comments from a Figma file.
        Includes retry logic for rate limits.
        """
        import time
        if not self.access_token:
            return []
            
        real_key = self._extract_key(file_key)
        url = f"{self.BASE_URL}/files/{real_key}/comments"
        
        max_retries = 3
        backoff = 2
        
        for attempt in range(max_retries):
            try:
                response = requests.get(url, headers=self._get_headers())
                if response.status_code == 429:
                    retry_after = response.headers.get("Retry-After")
                    if retry_after:
                        wait_time = int(retry_after)
                    else:
                        wait_time = backoff ** (attempt + 1)
                        
                    logger.warning(f"Figma API Rate Limited (429) on comments. Waiting {wait_time}s...")
                    time.sleep(wait_time)
                    continue
                    
                response.raise_for_status()
                comments_data = response.json().get("comments", [])
                
                comments = []
                for c in comments_data:
                    comment = FigmaComment(
                        id=c.get("id"),
                        file_key=real_key,
                        message=c.get("message"),
                        user_name=c.get("user", {}).get("handle"),
                        created_at=c.get("created_at"),
                        resolved_at=c.get("resolved_at")
                    )
                    comments.append(comment.to_dict())
                return comments
            except requests.exceptions.RequestException as e:
                if attempt == max_retries - 1 or (hasattr(e, 'response') and e.response is not None and e.response.status_code != 429):
                    logger.error(f"Failed to get comments for file {real_key}: {e}")
                    return []
        return []
            
    def get_team_projects(self, team_id: str = None) -> List[Dict[str, Any]]:
        """
        Lists projects for a specific team.
        """
        target_team_id = team_id or self.team_id
        if not self.access_token or not target_team_id:
            return []

        url = f"{self.BASE_URL}/teams/{target_team_id}/projects"
        try:
            response = requests.get(url, headers=self._get_headers())
            response.raise_for_status()
            return response.json().get("projects", [])
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to get team projects: {e}")
            return []

    def get_project_files(self, project_id: str = None) -> List[Dict[str, Any]]:
        """
        Lists files within a project.
        """
        target_project_id = project_id or self.current_project_id
        if not self.access_token or not target_project_id:
            return []

        url = f"{self.BASE_URL}/projects/{target_project_id}/files"
        try:
            response = requests.get(url, headers=self._get_headers())
            response.raise_for_status()
            files_data = response.json().get("files", [])
            
            files = []
            for f in files_data:
                file_obj = FigmaFile(
                    key=f.get("key"),
                    name=f.get("name"),
                    last_modified=f.get("last_modified"),
                    thumbnail_url=f.get("thumbnail_url"),
                    editor_type=None # specific detail usually not in list
                )
                files.append(file_obj.to_dict())
            return files
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to get project files: {e}")
            return []

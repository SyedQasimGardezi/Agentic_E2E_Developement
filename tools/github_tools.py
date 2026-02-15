from typing import List, Optional, Dict, Any
from camel.toolkits.github_toolkit import GithubToolkit
from config.settings import settings
from logging_config.logger import logger
from models.github import GitHubRepo

class GitHubTools:
    def __init__(self):
        self.access_token = settings.GITHUB_ACCESS_TOKEN
        self.current_repo = None # Initially disconnected
        self.toolkit = None
        
        if self.access_token:
            try:
                self.toolkit = GithubToolkit(access_token=self.access_token)
                logger.info("GitHub Toolkit initialized with token.")
            except Exception as e:
                logger.error(f"Failed to initialize GitHub Toolkit: {e}")
                self.toolkit = None
        else:
            logger.warning("GITHUB_ACCESS_TOKEN not found in settings.")

    def connect_repo(self, repo_name: str) -> Dict[str, Any]:
        """
        Connects to a specific GitHub repository and verifies access.
        """
        if not self.toolkit:
             return {"success": False, "error": "GitHub token not configured."}

        try:
            repo = self.toolkit.github.get_repo(repo_name)
            self.current_repo = repo.full_name
            
            repo_model = GitHubRepo(
                full_name=repo.full_name,
                name=repo.name,
                description=repo.description,
                private=repo.private,
                stars=repo.stargazers_count,
                forks=repo.forks_count,
                open_issues=repo.open_issues_count,
                language=repo.language,
                url=repo.html_url
            )
            
            result = repo_model.to_dict()
            result["success"] = True
            return result
        except Exception as e:
            logger.error(f"Failed to connect to repo {repo_name}: {e}")
            return {"success": False, "error": str(e)}

    def get_status(self) -> Dict[str, Any]:
        """
        Returns the current connection status.
        """
        return {
            "connected": bool(self.toolkit and self.current_repo),
            "repo_name": self.current_repo if (self.toolkit and self.current_repo) else None
        }

    def get_repo_details(self) -> Dict[str, Any]:
        """
        Returns detailed information about the currently connected repository.
        """
        if not self.current_repo:
            return {"success": False, "error": "No repository connected."}
        
        return self.connect_repo(self.current_repo)

    def list_issues(self, state: str = "open") -> List[Dict[str, Any]]:
        """
        Lists issues from the connected repository.
        """
        if not self.current_repo or not self.toolkit:
            return []
        return self.toolkit.github_get_issue_list(self.current_repo, state=state)

    def list_pull_requests(self, state: str = "open") -> List[Dict[str, Any]]:
        """
        Lists pull requests from the connected repository.
        """
        if not self.current_repo or not self.toolkit:
            return []
        return self.toolkit.github_get_pull_request_list(self.current_repo, state=state)
    
    def list_user_repos(self) -> List[Dict[str, Any]]:
        """
        Lists repositories available to the authenticated user.
        """
        if not self.toolkit:
            return []
        try:
            # toolkit.github is the PyGithub instance
            repos = self.toolkit.github.get_user().get_repos(sort="updated")
            return [
                {
                    "full_name": r.full_name,
                    "name": r.name,
                    "description": r.description,
                    "private": r.private
                }
                for r in repos[:20]  # Limit to 20 for brevity
            ]
        except Exception as e:
            logger.error(f"Failed to list repos: {e}")
            return []

    def list_branches(self) -> List[str]:
        """
        Lists branches of the current repository.
        """
        if not self.current_repo or not self.toolkit:
            return []
        try:
            repo = self.toolkit.github.get_repo(self.current_repo)
            return [b.name for b in repo.get_branches()]
        except Exception as e:
            logger.error(f"Failed to list branches: {e}")
            return []

    def get_file_tree(self, path: str = "") -> List[str]:
        """
        Returns the file tree of the repository.
        """
        if not self.current_repo or not self.toolkit:
             return []
        # GithubToolkit's get_all_file_paths returns a list of strings
        try:
            return self.toolkit.github_get_all_file_paths(self.current_repo, path)
        except Exception as e:
            logger.error(f"Failed to get file tree: {e}")
            return []

    def create_repository(self, name: str, description: str = "", private: bool = False) -> Dict[str, Any]:
        """
        Creates a new GitHub repository for the authenticated user.
        """
        if not self.toolkit:
            return {"success": False, "error": "GitHub token not configured."}
        try:
            user = self.toolkit.github.get_user()
            repo = user.create_repo(
                name=name,
                description=description,
                private=private,
                auto_init=True
            )
            self.current_repo = repo.full_name
            logger.info(f"Created new GitHub repo: {self.current_repo}")
            
            repo_model = GitHubRepo(
                full_name=repo.full_name,
                name=repo.name,
                description=repo.description,
                private=repo.private,
                stars=repo.stargazers_count,
                forks=repo.forks_count,
                open_issues=repo.open_issues_count,
                language=repo.language,
                url=repo.html_url
            )
            
            result = repo_model.to_dict()
            result["success"] = True
            return result
        except Exception as e:
            logger.error(f"Failed to create repo {name}: {e}")
            return {"success": False, "error": str(e)}

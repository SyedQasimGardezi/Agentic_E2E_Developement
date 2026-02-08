from dataclasses import dataclass, field
from typing import List, Optional

@dataclass
class GitHubRepo:
    """
    Domain model representing a GitHub Repository.
    """
    full_name: str
    name: str
    description: Optional[str] = None
    private: bool = False
    stars: int = 0
    forks: int = 0
    open_issues: int = 0
    language: Optional[str] = None
    url: Optional[str] = None

    def to_dict(self):
        return {
            "full_name": self.full_name,
            "repo_name": self.full_name, # Alias for frontend compatibility
            "name": self.name,
            "description": self.description,
            "private": self.private,
            "stars": self.stars,
            "forks": self.forks,
            "open_issues": self.open_issues,
            "language": self.language,
            "url": self.url
        }

@dataclass
class GitHubBranch:
    """
    Domain model representing a GitHub Branch.
    """
    name: str
    commit_sha: str
    protected: bool = False

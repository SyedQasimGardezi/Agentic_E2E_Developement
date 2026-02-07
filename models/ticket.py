from dataclasses import dataclass, field
from typing import List, Optional

@dataclass
class JiraTicket:
    """
    Domain model representing a Jira Ticket.
    """
    key: str
    summary: str
    status: str
    description: Optional[str] = None
    assignee: Optional[str] = None
    labels: List[str] = field(default_factory=list)
    issue_type: str = "Task"
    story_points: Optional[int] = None
    url: Optional[str] = None
    parent_key: Optional[str] = None

    def to_dict(self):
        return {
            "key": self.key,
            "summary": self.summary,
            "status": self.status,
            "description": self.description,
            "assignee": self.assignee,
            "labels": self.labels,
            "issue_type": self.issue_type,
            "story_points": self.story_points,
            "url": self.url,
            "parent_key": self.parent_key
        }

from dataclasses import dataclass, field
from typing import List, Optional

@dataclass
class TicketProposal:
    """
    Domain model representing a proposed Jira Ticket before creation.
    """
    summary: str
    description: str
    issue_type: str = "Story"
    story_points: Optional[int] = None
    labels: List[str] = field(default_factory=lambda: ["agent-core"])
    parent_key: Optional[str] = None

    def to_dict(self):
        return {
            "type": "PROPOSAL",
            "summary": self.summary,
            "description": self.description,
            "issue_type": self.issue_type,
            "story_points": self.story_points,
            "labels": self.labels,
            "parent_key": self.parent_key
        }

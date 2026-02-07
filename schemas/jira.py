from pydantic import BaseModel
from typing import List, Optional

class TicketRequest(BaseModel):
    summary: str
    description: str
    issue_type: str = "Task"
    story_points: Optional[int] = None
    labels: Optional[List[str]] = None
    parent_key: Optional[str] = None

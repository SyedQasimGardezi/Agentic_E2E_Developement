from pydantic import BaseModel
from typing import Optional, Dict, Any

class ChatRequest(BaseModel):
    message: str
    agent_type: Optional[str] = "pm"  # e.g., 'pm' or 'dev'
    metadata: Optional[Dict[str, Any]] = None  # e.g. { "ticket_id": "KAN-123" }

class ChatResponse(BaseModel):
    response: str
    status: str

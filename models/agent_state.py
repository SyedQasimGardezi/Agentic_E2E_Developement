from dataclasses import dataclass, field
from typing import List, Optional, Literal

@dataclass
class AgentStep:
    """
    Represents a single step in an agent's implementation plan.
    """
    id: str
    label: str
    status: Literal["pending", "active", "completed", "failed"] = "pending"
    details: str = ""

    def to_dict(self):
        return {
            "id": self.id,
            "label": self.label,
            "status": self.status,
            "details": self.details
        }

@dataclass
class AgentTaskProgress:
    """
    Represents the full progress state of an agent task.
    """
    task_id: str
    steps: List[AgentStep] = field(default_factory=list)
    logs: List[str] = field(default_factory=list)
    final_response: Optional[str] = None

    def to_dict(self):
        return {
            "task_id": self.task_id,
            "steps": [s.to_dict() for s in self.steps],
            "logs": self.logs,
            "final_response": self.final_response
        }

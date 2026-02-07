from typing import List, Dict, Any, Optional
import time

class ProgressTracker:
    def __init__(self):
        # Dictionary of task_id -> list of steps
        # Each step: { "id": str, "label": str, "status": "pending" | "active" | "completed" | "failed", "details": str }
        self.state: Dict[str, List[Dict[str, Any]]] = {}
        self.logs: Dict[str, List[str]] = {}
        self.final_response: Dict[str, Optional[str]] = {}

    def init_task(self, task_id: str, steps: List[str]):
        self.state[task_id] = [
            {"id": f"step_{i}", "label": label, "status": "pending", "details": ""}
            for i, label in enumerate(steps)
        ]
        self.logs[task_id] = [f"Task {task_id} initialized."]
        self.final_response[task_id] = None

    def set_steps(self, task_id: str, steps: List[str]):
        """Override the current checklist with a new list of steps."""
        self.state[task_id] = [
            {"id": f"step_{i}", "label": label, "status": "pending", "details": ""}
            for i, label in enumerate(steps)
        ]
        self.add_log(task_id, f"Plan updated: {', '.join(steps)}")

    def add_log(self, task_id: str, message: str):
        if task_id not in self.logs:
            self.logs[task_id] = []
        self.logs[task_id].append(message)

    def update_step(self, task_id: str, step_label: str, status: str, details: str = ""):
        if task_id not in self.state:
            self.state[task_id] = []
        
        # Mapping of agent phrasing to hardcoded checklist labels
        synonyms = {
            "read": ["review", "inspect", "get", "jira"],
            "verify": ["workspace", "env", "folder", "check"],
            "clone": ["download", "pull", "git"],
            "implement": ["write", "code", "edit", "create", "fix"],
            "run": ["test", "verify", "npm", "pip", "pytest"],
            "commit": ["push", "pr", "pull request", "branch"]
        }

        # Try to find an existing step that matches
        target_step = None
        s_label = step_label.lower()
        
        for step in self.state[task_id]:
            base_label = step["label"].lower()
            # Direct match
            if base_label in s_label or s_label in base_label:
                target_step = step
                break
            
            # Synonym match
            for primary, alternatives in synonyms.items():
                if primary in base_label:
                    if any(alt in s_label for alt in alternatives):
                        target_step = step
                        break
            if target_step: break
        
        if target_step:
            target_step["status"] = status
            if details:
                target_step["details"] = details
        else:
            # Only create new step if it's a major milestone (not too many steps)
            if len(self.state[task_id]) < 15:
                self.state[task_id].append({
                    "id": f"step_{len(self.state[task_id])}",
                    "label": step_label,
                    "status": status,
                    "details": details
                })
        
        self.add_log(task_id, f"[{status.upper()}] {step_label}: {details}")

    def get_progress(self, task_id: str):
        return {
            "steps": self.state.get(task_id, []),
            "logs": self.logs.get(task_id, []),
            "final_response": self.final_response.get(task_id)
        }

# Global tracker instance
progress_tracker = ProgressTracker()

from typing import List, Dict, Any, Optional
from models.agent_state import AgentStep, AgentTaskProgress
import time

class ProgressTracker:
    def __init__(self):
        # task_id -> AgentTaskProgress
        self.tasks: Dict[str, AgentTaskProgress] = {}

    def init_task(self, task_id: str, steps: List[str]):
        task = AgentTaskProgress(
            task_id=task_id,
            steps=[AgentStep(id=f"step_{i}", label=label) for i, label in enumerate(steps)],
            logs=[f"Task {task_id} initialized."]
        )
        self.tasks[task_id] = task

    def set_steps(self, task_id: str, steps: List[str]):
        """Override the current checklist with a new list of steps."""
        if task_id not in self.tasks:
            self.init_task(task_id, steps)
        else:
            self.tasks[task_id].steps = [AgentStep(id=f"step_{i}", label=label) for i, label in enumerate(steps)]
            self.add_log(task_id, f"Plan updated: {', '.join(steps)}")

    def add_log(self, task_id: str, message: str):
        if task_id not in self.tasks:
            self.tasks[task_id] = AgentTaskProgress(task_id=task_id)
        self.tasks[task_id].logs.append(message)

    def update_step(self, task_id: str, step_label: str, status: any, details: str = ""):
        if task_id not in self.tasks:
            self.tasks[task_id] = AgentTaskProgress(task_id=task_id)
        
        task = self.tasks[task_id]
        
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
        
        for step in task.steps:
            base_label = step.label.lower()
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
            target_step.status = status
            if details:
                target_step.details = details
        else:
            # Only create new step if it's a major milestone (not too many steps)
            if len(task.steps) < 15:
                task.steps.append(AgentStep(
                    id=f"step_{len(task.steps)}",
                    label=step_label,
                    status=status,
                    details=details
                ))
        
        self.set_final_response(task_id, None) # Keep it live
        self.add_log(task_id, f"[{status.upper()}] {step_label}: {details}")

    def set_final_response(self, task_id: str, response: Optional[str]):
        if task_id in self.tasks:
            self.tasks[task_id].final_response = response

    def get_progress(self, task_id: str):
        if task_id not in self.tasks:
            return {"steps": [], "logs": [], "final_response": None}
        
        task = self.tasks[task_id]
        return {
            "steps": [s.to_dict() for s in task.steps],
            "logs": task.logs,
            "final_response": task.final_response
        }

# Global tracker instance
progress_tracker = ProgressTracker()

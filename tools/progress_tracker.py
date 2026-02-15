from typing import List, Dict, Any, Optional
from models.agent_state import AgentStep, AgentTaskProgress
import time
import asyncio
from tools.websocket_manager import manager

from config.settings import settings

class ProgressTracker:
    def __init__(self):
        # task_id -> AgentTaskProgress
        self.tasks: Dict[str, AgentTaskProgress] = {}
        # List of sensitive values to redact
        self.sensitive_values = [
            v for v in [
                settings.JIRA_API_TOKEN,
                settings.GITHUB_ACCESS_TOKEN,
                settings.FIGMA_ACCESS_TOKEN,
                settings.AZURE_OPENAI_API_KEY
            ] if v and len(v) > 5 # Only redact meaningful secrets
        ]

    def _redact(self, message: str) -> str:
        """Replace sensitive tokens with [REDACTED]."""
        if not message:
            return message
        redacted = str(message)
        for val in self.sensitive_values:
            redacted = redacted.replace(val, "[REDACTED]")
        return redacted

    def _broadcast(self, task_id: str):
        """Helper to broadcast the current state of a task."""
        progress = self.get_progress(task_id)
        manager.sync_broadcast({"type": "progress", "task_id": task_id, "data": progress})

    def init_task(self, task_id: str, steps: List[str]):
        task = AgentTaskProgress(
            task_id=task_id,
            steps=[AgentStep(id=f"step_{i}", label=label) for i, label in enumerate(steps)],
            logs=[f"Task {task_id} initialized."]
        )
        self.tasks[task_id] = task
        self._broadcast(task_id)

    def set_steps(self, task_id: str, steps: List[str]):
        """Override the current checklist with a new list of steps."""
        if task_id not in self.tasks:
            self.init_task(task_id, steps)
        else:
            self.tasks[task_id].steps = [AgentStep(id=f"step_{i}", label=label) for i, label in enumerate(steps)]
            self.add_log(task_id, f"Plan updated: {', '.join(steps)}")
        self._broadcast(task_id)

    def add_log(self, task_id: str, message: str):
        if task_id not in self.tasks:
            self.tasks[task_id] = AgentTaskProgress(task_id=task_id)
        self.tasks[task_id].logs.append(self._redact(message))
        self._broadcast(task_id)

    def update_step(self, task_id: str, step_label: str, status: any, details: str = "", 
                    total_tests: Optional[int] = None, passed_tests: Optional[int] = None, failed_tests: Optional[int] = None):
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
                target_step.details = self._redact(details)
            if total_tests is not None: target_step.total_tests = total_tests
            if passed_tests is not None: target_step.passed_tests = passed_tests
            if failed_tests is not None: target_step.failed_tests = failed_tests
        else:
            # Only create new step if it's a major milestone (not too many steps)
            if len(task.steps) < 15:
                task.steps.append(AgentStep(
                    id=f"step_{len(task.steps)}",
                    label=step_label,
                    status=status,
                    details=self._redact(details),
                    total_tests=total_tests,
                    passed_tests=passed_tests,
                    failed_tests=failed_tests
                ))
        
        test_info = ""
        if total_tests:
            test_info = f" ({passed_tests or 0}/{total_tests} tests passed)"

        self.set_final_response(task_id, None) # Keep it live
        self.add_log(task_id, f"[{status.upper()}] {step_label}{test_info}: {details}")
        # _broadcast is called by add_log

    def set_final_response(self, task_id: str, response: Optional[str]):
        if task_id in self.tasks:
            self.tasks[task_id].final_response = response
            if response:
                 # Auto-complete any remaining steps as the task is officially finished
                 self.finalize_task(task_id)
            self._broadcast(task_id)

    def finalize_task(self, task_id: str):
        if task_id in self.tasks:
            for step in self.tasks[task_id].steps:
                if step.status != 'failed':
                    step.status = 'completed'
            self.add_log(task_id, "✅ Task finalized. All steps marked complete.")
            # _broadcast is called by add_log

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

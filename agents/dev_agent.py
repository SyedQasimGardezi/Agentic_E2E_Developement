from typing import List
from camel.agents import ChatAgent
from camel.toolkits import FunctionTool, GithubToolkit, CodeExecutionToolkit
from tools.jira_tools import JiraTools
from prompts.dev_agent_prompt import DEV_AGENT_PROMPT
from config.model_config import get_model
from config.settings import settings
import logging

logger = logging.getLogger(__name__)

from tools.progress_tracker import progress_tracker

# Define a tool for the agent to report progress
def report_task_progress(step_label: str, status: str, details: str = "") -> str:
    """
    Update the user on your current progress.
    Args:
        step_label: A short name for the step (e.g. "Cloning Repo", "Running Tests")
        status: One of "pending", "active", "completed", "failed"
        details: Optional technical details or logs
    """
    # For now we use 'dev' as the session id
    progress_tracker.update_step("dev", step_label, status, details)
    return f"Progress reported: {step_label} is now {status}."

def set_implementation_plan(steps: List[str]) -> str:
    """
    Define a custom checklist of steps for the current task. 
    Use this AFTER reading the ticket to show the user your planned workflow.
    Args:
        steps: List of strings/labels for the checklist.
    """
    progress_tracker.set_steps("dev", steps)
    return "Implementation plan has been updated on the dashboard."

# Initialize Jira Tools (Read-Only wrappers for Dev Agent)
jira_tools = JiraTools()
jira_dev_tools = [
    FunctionTool(jira_tools.get_ticket),
    FunctionTool(jira_tools.add_comment),
    FunctionTool(jira_tools.update_ticket_status),
    FunctionTool(report_task_progress),
    FunctionTool(set_implementation_plan)
]

# Initialize Code Execution Tools (Sandbox)
# sandbox type 'subprocess' allows local terminal commands and python scripts
code_toolkit = CodeExecutionToolkit(
    sandbox="subprocess", 
    verbose=True, 
    unsafe_mode=True,
    require_confirm=False
)

def log_command_progress(command: str) -> str:
    """Execute a shell command with detailed logging to sandbox."""
    # Add to logs immediately
    progress_tracker.add_log("dev", f"Running: {command}")
    
    # Check if this command matches a major checklist step to update status
    milestone = None
    if "git clone" in command: milestone = "Clone Repo"
    elif "git push" in command: milestone = "Commit & Push"
    elif "test" in command or "verify" in command: milestone = "Run Verification"
    
    if milestone:
        progress_tracker.update_step("dev", milestone, "active", f"Running {command[:20]}...")

    try:
        orig_tool = next(t for t in code_toolkit.get_tools() if t.func.__name__ == 'execute_command')
        result = orig_tool.func(command)
        
        # Log result
        progress_tracker.add_log("dev", f"Output: {str(result)[:500]}")
        if milestone:
            progress_tracker.update_step("dev", milestone, "completed")
            
        return result
    except Exception as e:
        progress_tracker.add_log("dev", f"ERROR: {str(e)}")
        if milestone:
            progress_tracker.update_step("dev", milestone, "failed", str(e))
        raise e

# Replace original execute_command with our wrapped version for better UX
code_tools = []
for tool in code_toolkit.get_tools():
    if tool.func.__name__ == 'execute_command':
        code_tools.append(FunctionTool(log_command_progress))
    else:
        code_tools.append(tool)

# Initialize GitHub Tools
github_tools_list = []
# Force use the hardcoded token
gh_token = settings.GITHUB_ACCESS_TOKEN
try:
    gh_toolkit = GithubToolkit(access_token=gh_token)
    github_tools_list = gh_toolkit.get_tools()
    logger.info(f"GitHub tools hardcoded for Developer Agent.")
except Exception as e:
    logger.warning(f"Failed to initialize GitHub tools for Dev Agent: {e}")

# Retrieve the model
model = get_model()

# Create Developer Agent with Full Toolset
dev_agent = ChatAgent(
    system_message=DEV_AGENT_PROMPT,
    model=model,
    tools=jira_dev_tools + code_tools + github_tools_list
)

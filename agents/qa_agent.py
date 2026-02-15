from typing import List
from camel.agents import ChatAgent
from camel.toolkits import FunctionTool, GithubToolkit, CodeExecutionToolkit
from tools.jira_tools import JiraTools
from prompts.qa_agent_prompt import QA_AGENT_PROMPT
from config.model_config import get_model
from config.settings import settings
import logging
from tools.progress_tracker import progress_tracker
import os
import uuid
from camel.interpreters import DockerInterpreter
from camel.interpreters.interpreter_error import InterpreterError
from camel.utils import is_docker_running

logger = logging.getLogger(__name__)

# --- Progress Reporting ---
def report_task_progress(step_label: str, status: str, details: str = "", 
                         total_tests: int = 0, passed_tests: int = 0, failed_tests: int = 0) -> str:
    """
    Update the user on your current testing progress.
    Args:
        step_label: A short name for the step (e.g. "Running Unit Tests")
        status: One of "pending", "active", "completed", "failed"
        details: Optional technical details or logs (e.g. "5/5 tests passed")
        total_tests: Total number of test cases
        passed_tests: Number of tests passed
        failed_tests: Number of tests failed
    """
    safe_details = details if details is not None else ""
    t_val = total_tests if total_tests is not None else 0
    p_val = passed_tests if passed_tests is not None else 0
    f_val = failed_tests if failed_tests is not None else 0

    # Use 'qa' as the session id
    progress_tracker.update_step("qa", step_label, status, safe_details, 
                                 t_val if t_val > 0 else None, 
                                 p_val if t_val > 0 else None, 
                                 f_val if t_val > 0 else None)
    return f"Progress reported: {step_label} is now {status}."

def set_implementation_plan(steps: List[str]) -> str:
    """
    Define a custom checklist of steps for the QA task. 
    Args:
        steps: List of strings/labels for the checklist.
    """
    if steps is None:
        return "Error: steps list cannot be None."
    progress_tracker.set_steps("qa", steps)
    return "QA plan has been updated on the dashboard."

# --- Jira Tools (QA Specific) ---
jira_tools = JiraTools()
jira_qa_tools = [
    FunctionTool(jira_tools.get_ticket),
    FunctionTool(jira_tools.create_ticket),  # QA needs to create bugs/subtasks
    FunctionTool(jira_tools.add_comment),
    FunctionTool(jira_tools.update_ticket_status),
    FunctionTool(report_task_progress),
    FunctionTool(set_implementation_plan)
]

# --- Docker Environment (Reuse Workspace) ---
class WorkspaceDockerInterpreter(DockerInterpreter):
    """Custom Docker interpreter that mounts the host workspace directory."""
    def _initialize_if_needed(self) -> None:
        if self._container is not None:
            return

        if not is_docker_running():
            raise InterpreterError(
                "Docker daemon is not running. Please install/start docker and try again."
            )

        import docker
        client = docker.from_env()

        # Build or get custom dev image
        image_tag = "agentic-dev-env:latest"
        try:
            client.images.get(image_tag)
        except docker.errors.ImageNotFound:
            logger.info(f"Building {image_tag} with git and essential tools...")
            dockerfile = """
            FROM python:3.11-slim
            RUN apt-get update && apt-get install -y git curl build-essential && rm -rf /var/lib/apt/lists/*
            """
            from io import BytesIO
            f = BytesIO(dockerfile.encode('utf-8'))
            client.images.build(fileobj=f, tag=image_tag, rm=True)

        workspace_path = os.path.abspath("workspace")
        if not os.path.exists(workspace_path):
            os.makedirs(workspace_path)

        logger.info(f"Starting Docker container with volume mount: {workspace_path} -> /workspace")
        self._container = client.containers.run(
            image_tag,
            detach=True,
            name=f"agentic-qa-{uuid.uuid4().hex[:8]}",
            command="tail -f /dev/null",
            volumes={workspace_path: {'bind': '/workspace', 'mode': 'rw'}},
            working_dir='/workspace'
        )

# Initialize Toolkit
code_toolkit = CodeExecutionToolkit(
    sandbox="docker", 
    verbose=True, 
    unsafe_mode=True,
    require_confirm=False
)
# Overwrite with our workspace-aware interpreter
code_toolkit.interpreter = WorkspaceDockerInterpreter(
    require_confirm=False,
    print_stdout=True,
    print_stderr=True
)

def execute_command(command: str) -> str:
    """Execute a shell command with detailed logging in Docker container."""
    if command is None:
        return "Error: command cannot be None."
    # Add to logs immediately
    progress_tracker.add_log("qa", f"Running: {command}")
    
    # Check if this command matches a major checklist step to update status
    # Simple heuristic
    milestone = None
    if "test" in command or "npm run" in command or "pytest" in command: milestone = "Run Tests"
    
    if milestone:
        progress_tracker.update_step("qa", milestone, "active", f"Running {command[:20]}...")

    try:
        orig_tool = next(t for t in code_toolkit.get_tools() if t.func.__name__ == 'execute_command')
        
        # Transparent Git Auth: If command uses git, ensure identity and token are set
        if "git" in command.lower():
            git_auth_setup = (
                f'git config --global user.email "{settings.GIT_USER_EMAIL}" && '
                f'git config --global user.name "{settings.GIT_USER_NAME}" && '
                f'git config --global url."https://{settings.GITHUB_ACCESS_TOKEN}@github.com/".insteadOf "https://github.com/" && '
            )
            command = git_auth_setup + command

        # Docker doesn't support shell built-ins (cd) or operators (&&, |, etc.) directly
        # Wrap command with /bin/sh -c to execute through shell
        escaped_command = command.replace('"', '\\"')
        wrapped_command = f'/bin/sh -c "{escaped_command}"'
        
        result = orig_tool.func(wrapped_command)
        
        # Log result
        progress_tracker.add_log("qa", f"Output: {str(result)[:500]}")
        if milestone:
             # Don't auto-complete "Run Tests" because we might run multiple.
             # Let the agent decide when to complete.
             pass
            
        return result
    except Exception as e:
        progress_tracker.add_log("qa", f"ERROR: {str(e)}")
        if milestone:
            progress_tracker.update_step("qa", milestone, "failed", str(e))
        raise e

# Replace original execute_command with our wrapped version
code_tools = []
for tool in code_toolkit.get_tools():
    if tool.func.__name__ == 'execute_command':
        # Name it execute_command so the agent recognizes it
        code_tools.append(FunctionTool(execute_command))
    else:
        code_tools.append(tool)

# --- GitHub Tools ---
github_tools_list = []
gh_token = settings.GITHUB_ACCESS_TOKEN
try:
    gh_toolkit = GithubToolkit(access_token=gh_token)
    github_tools_list = gh_toolkit.get_tools()
except Exception as e:
    logger.warning(f"Failed to initialize GitHub tools for QA Agent: {e}")

# Retrieve the model
model = get_model()

# Create QA Agent
qa_agent = ChatAgent(
    system_message=QA_AGENT_PROMPT,
    model=model,
    tools=jira_qa_tools + code_tools + github_tools_list,
    step_timeout=600  # 10 minutes for long running tests
)

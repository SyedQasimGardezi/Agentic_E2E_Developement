from camel.agents import ChatAgent
from camel.toolkits import FunctionTool, GithubToolkit
from tools.jira_tools import JiraTools
from tools.figma_tools import FigmaTools
from prompts.specs_agent_prompt import SPECS_AGENT_PROMPT
from config.model_config import get_model
from config.settings import settings
import logging

logger = logging.getLogger(__name__)

# Initialize Jira tools
jira_tools = JiraTools()

# Wrap Jira methods as CAMEL FunctionTools
jira_tools_list = [
    FunctionTool(jira_tools.propose_ticket),
    FunctionTool(jira_tools.get_ticket),
    FunctionTool(jira_tools.update_ticket_status),
    FunctionTool(jira_tools.update_ticket),
    FunctionTool(jira_tools.add_comment),
    FunctionTool(jira_tools.list_tickets),
]

# Initialize Figma tools
figma_tools = FigmaTools()
figma_tools_list = []
if settings.FIGMA_ACCESS_TOKEN:
    figma_tools_list = [
        FunctionTool(figma_tools.get_file),
        FunctionTool(figma_tools.get_file_comments),
        FunctionTool(figma_tools.get_team_projects),
        FunctionTool(figma_tools.get_project_files),
    ]
    logger.info("Figma tools enabled for Specs Agent.")
else:
    logger.info("Figma tools disabled (no token provided).")

# Initialize GitHub tools (Optional)
github_tools_list = []
if settings.GITHUB_ACCESS_TOKEN:
    try:
        gh_toolkit = GithubToolkit(access_token=settings.GITHUB_ACCESS_TOKEN)
        github_tools_list = gh_toolkit.get_tools()
        logger.info("GitHub tools enabled for Specs Agent.")
    except Exception as e:
        logger.warning(f"Failed to initialize GitHub tools for agent: {e}")
else:
    logger.info("GitHub tools disabled (no token provided).")

# Get centralized model configuration (always uses Azure 5.1 as per requirements)
model = get_model()

# Create Specs Agent with all tools
specs_agent = ChatAgent(
    system_message=SPECS_AGENT_PROMPT,
    model=model,
    tools=jira_tools_list + github_tools_list + figma_tools_list
)

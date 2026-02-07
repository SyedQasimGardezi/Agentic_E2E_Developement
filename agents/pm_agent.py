from camel.agents import ChatAgent
from camel.toolkits import FunctionTool
from tools.jira_tools import JiraTools
from prompts.pm_agent_prompt import PM_AGENT_PROMPT
from config.model_config import get_model

# Initialize Jira tools
jira_tools = JiraTools()

# Wrap methods as CAMEL FunctionTools
jira_create_tool = FunctionTool(jira_tools.create_ticket)
jira_get_tool = FunctionTool(jira_tools.get_ticket)
jira_update_tool = FunctionTool(jira_tools.update_ticket_status)
jira_comment_tool = FunctionTool(jira_tools.add_comment)
jira_list_tool = FunctionTool(jira_tools.list_tickets)

# Get centralized model configuration (always uses Azure 5.1 as per requirements)
model = get_model()

# Create PM Agent with Jira tools
pm_agent = ChatAgent(
    system_message=PM_AGENT_PROMPT,
    model=model,
    tools=[
        jira_create_tool,
        jira_get_tool,
        jira_update_tool,
        jira_comment_tool,
        jira_list_tool,
    ]
)
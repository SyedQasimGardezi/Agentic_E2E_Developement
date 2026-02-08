from typing import List, Optional
from jira import JIRA
from config.settings import settings
from logging_config.logger import logger
from models.ticket import JiraTicket
from models.proposal import TicketProposal

class JiraTools:
    def __init__(self):
        self.base_url = settings.JIRA_BASE_URL
        self.email = settings.JIRA_EMAIL
        self.api_token = settings.JIRA_API_TOKEN
        self.project_key = settings.JIRA_PROJECT_KEY or "PROJ"
        
        # Initialize Jira client
        logger.info(f"Connecting to Jira at {self.base_url}...")
        self.jira = JIRA(
            server=self.base_url,
            basic_auth=(self.email, self.api_token)
        )
        logger.info(f"Jira client initialized for project {self.project_key}")
    
    def propose_ticket(self, summary: str, description: str, 
                      issue_type: str = "Story", 
                      story_points: Optional[int] = None,
                      labels: Optional[List[str]] = None,
                      parent_key: Optional[str] = None) -> dict:
        """
        PROPOSES a ticket for user review. Call this tool whenever a user wants to create a new task.
        DO NOT call create_ticket directly unless the user explicitly bypasses review.

        Args:
            summary (str): Title for the proposed ticket.
            description (str): Technical details and requirements.
            issue_type (str): 'Story', 'Task', 'Bug', 'Subtask'.
            story_points (int, optional): Complexity.
            labels (List[str], optional): Tags.
            parent_key (str, optional): Parent link.
        """
        type_mapping = {
            "sub-task": "Subtask",
            "subtask": "Subtask",
            "story": "Story",
            "task": "Task",
            "epic": "Epic",
            "bug": "Bug"
        }
        normalized_type = type_mapping.get(issue_type.lower(), issue_type)

        logger.info(f"Proposing ticket: {summary}")
        proposal = TicketProposal(
            summary=summary,
            description=description,
            issue_type=normalized_type,
            story_points=story_points,
            labels=labels or ["agent-core"],
            parent_key=parent_key
        )
        return proposal.to_dict()

    def create_ticket(self, summary: str, description: str, 
                     issue_type: str = "Story", 
                     story_points: Optional[int] = None,
                     labels: Optional[List[str]] = None,
                     parent_key: Optional[str] = None) -> dict:
        """
        Creates a new ticket in the Jira project. Use this for ANY request to create, track, or manage a new task or feature.

        Args:
            summary (str): A short, clear title for the ticket.
            description (str): Detailed requirements, user stories, and acceptance criteria.
            issue_type (str, optional): The type of ticket. Defaults to 'Story'. Options: 'Story', 'Task', 'Bug', 'Subtask'.
            story_points (int, optional): The complexity of the ticket.
            labels (List[str], optional): List of tags/labels to apply.
            parent_key (str, optional): The Jira key of the parent ticket (required for 'Subtask').
        """
        type_mapping = {
            "sub-task": "Subtask",
            "subtask": "Subtask",
            "story": "Story",
            "task": "Task",
            "epic": "Epic",
            "bug": "Bug"
        }
        
        normalized_type = type_mapping.get(issue_type.lower(), issue_type)

        issue_dict = {
            'project': {'key': self.project_key},
            'summary': summary,
            'description': description,
            'issuetype': {'name': normalized_type},
        }
        
        if normalized_type == "Subtask" and parent_key:
            issue_dict['parent'] = {'key': parent_key}
        
        if story_points:
            issue_dict['customfield_10016'] = story_points
        
        if labels:
            issue_dict['labels'] = labels
        
        try:
            logger.info(f"Creating ticket: {summary[:50]}...")
            new_issue = self.jira.create_issue(fields=issue_dict)
            logger.info(f"Ticket created successfully: {new_issue.key}")
        except Exception as e:
            if 'customfield_10016' in issue_dict:
                del issue_dict['customfield_10016']
                try:
                    new_issue = self.jira.create_issue(fields=issue_dict)
                    logger.info(f"Ticket created successfully (without story points): {new_issue.key}")
                except Exception as second_e:
                    logger.error(f"Failed to create ticket: {str(second_e)}")
                    return {"success": False, "error": str(second_e)}
            else:
                logger.error(f"Failed to create ticket: {str(e)}")
                return {"success": False, "error": str(e)}
        
        return {
            "success": True,
            "ticket_id": new_issue.id,
            "key": new_issue.key,
            "status": str(new_issue.fields.status),
            "url": f"{self.base_url}/browse/{new_issue.key}"
        }
    
    def get_ticket(self, ticket_key: str) -> dict:
        """
        Retrieves full details for a specific Jira ticket.

        Args:
            ticket_key (str): The unique Jira key (e.g., 'KAN-1').
        """
        logger.info(f"Fetching ticket details for {ticket_key}")
        issue = self.jira.issue(ticket_key)
        
        return {
            "key": issue.key,
            "summary": issue.fields.summary,
            "description": getattr(issue.fields, 'description', None),
            "status": str(issue.fields.status),
            "assignee": str(issue.fields.assignee) if issue.fields.assignee else None,
            "created": str(issue.fields.created),
            "updated": str(issue.fields.updated),
        }
    
    def update_ticket_status(self, ticket_key: str, transition_name: str) -> dict:
        """
        Moves a ticket through its workflow (e.g., from 'To Do' to 'In Progress').

        Args:
            ticket_key (str): The Jira key (e.g., 'KAN-1').
            transition_name (str): The name of the transition (e.g., 'In Progress', 'Done').
        """
        logger.info(f"Updating ticket {ticket_key} to status {transition_name}")
        issue = self.jira.issue(ticket_key)
        transitions = self.jira.transitions(issue)
        transition_id = None
        
        for t in transitions:
            if t['name'].lower() == transition_name.lower():
                transition_id = t['id']
                break
        
        if transition_id:
            self.jira.transition_issue(issue, transition_id)
            logger.info(f"Ticket {ticket_key} successfully transitioned to {transition_name}")
            return {
                "success": True,
                "ticket_key": ticket_key,
                "new_status": transition_name
            }
        else:
            available = [t['name'] for t in transitions]
            logger.warning(f"Failed to find transition {transition_name} for ticket {ticket_key}")
            return {
                "success": False,
                "error": f"Transition '{transition_name}' not found",
                "available_transitions": available
            }

    def update_ticket(self, ticket_key: str, summary: Optional[str] = None, description: Optional[str] = None) -> dict:
        """
        Updates an existing ticket's summary or description.

        Args:
            ticket_key (str): The Jira key (e.g., 'KAN-1').
            summary (str, optional): The new title for the ticket.
            description (str, optional): The new detailed requirements.
        """
        logger.info(f"Updating fields for ticket {ticket_key}")
        issue = self.jira.issue(ticket_key)
        fields = {}
        if summary:
            fields['summary'] = summary
        if description:
            fields['description'] = description
        
        if fields:
            issue.update(fields=fields)
            logger.info(f"Ticket {ticket_key} successfully updated.")
            return {"success": True, "ticket_key": ticket_key}
        return {"success": False, "error": "No fields provided to update."}
    
    def add_comment(self, ticket_key: str, comment: str) -> dict:
        """
        Adds a comment to an existing Jira ticket.

        Args:
            ticket_key (str): The Jira key (e.g., 'KAN-1').
            comment (str): The text of the comment to add.
        """
        logger.info(f"Adding comment to ticket {ticket_key}")
        issue = self.jira.issue(ticket_key)
        self.jira.add_comment(issue, comment)
        return {"success": True, "ticket_key": ticket_key}
    
    def assign_ticket(self, ticket_key: str, assignee_email: str) -> dict:
        """
        Assigns a Jira ticket to a user by their email.

        Args:
            ticket_key (str): The Jira key (e.g., 'KAN-1').
            assignee_email (str): The email of the person to assign the ticket to.
        """
        logger.info(f"Assigning ticket {ticket_key} to {assignee_email}")
        issue = self.jira.issue(ticket_key)
        users = self.jira.search_users(query=assignee_email)
        
        if users:
            user = users[0]
            issue.update(assignee={'accountId': user.accountId})
            logger.info(f"Ticket {ticket_key} assigned to {user.displayName}")
            return {"success": True, "assigned_to": user.displayName}
        else:
            logger.warning(f"User {assignee_email} not found for assignment")
            return {"success": False, "error": f"User {assignee_email} not found"}
    
    def list_tickets(self, max_results: int = 50) -> list:
        """
        Lists the most recent tickets in the project. Use this to get an overview of what's already in the system.

        Args:
            max_results (int, optional): The number of tickets to return. Defaults to 50.
        """
        jql = f"project = {self.project_key} ORDER BY created DESC"
        
        logger.info(f"Executing JQL: {jql}")
        issues = self.jira.search_issues(jql, maxResults=max_results)
        
        ticket_list = []
        for issue in issues:
            ticket = JiraTicket(
                key=issue.key,
                summary=issue.fields.summary,
                status=str(issue.fields.status),
                description=getattr(issue.fields, 'description', None),
                assignee=str(issue.fields.assignee) if issue.fields.assignee else "Unassigned",
                labels=getattr(issue.fields, 'labels', []),
                issue_type=issue.fields.issuetype.name,
                parent_key=getattr(issue.fields, 'parent', None).key if hasattr(issue.fields, 'parent') else None
            )
            ticket_list.append(ticket.to_dict())
            
        return ticket_list
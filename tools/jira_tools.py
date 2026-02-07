from typing import List, Optional
from jira import JIRA
from config.settings import settings

class JiraTools:
    def __init__(self):
        self.base_url = settings.JIRA_BASE_URL
        self.email = settings.JIRA_EMAIL
        self.api_token = settings.JIRA_API_TOKEN
        self.project_key = settings.JIRA_PROJECT_KEY or "PROJ"
        
        # Initialize Jira client
        self.jira = JIRA(
            server=self.base_url,
            basic_auth=(self.email, self.api_token)
        )
    
    def create_ticket(self, summary: str, description: str, 
                     issue_type: str = "Task", 
                     story_points: Optional[int] = None,
                     labels: Optional[List[str]] = None,
                     parent_key: Optional[str] = None) -> dict:
        """
        Create a Jira ticket.
        
        Args:
            summary: Brief summary of the issue.
            description: Detailed description including requirements and acceptance criteria.
            issue_type: Type of issue (e.g., 'Story', 'Task', 'Bug', 'Subtask').
            story_points: Optional story points.
            labels: Optional list of labels.
            parent_key: If creating a sub-task, the key of the parent issue (e.g., 'KAN-1').
        """
        # Map common variants to exact Jira names
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
        
        # Add parent for subtasks
        if normalized_type == "Subtask" and parent_key:
            issue_dict['parent'] = {'key': parent_key}
        
        # Add optional fields
        if story_points:
            issue_dict['customfield_10016'] = story_points  # Story points field ID
        
        if labels:
            issue_dict['labels'] = labels
        
        try:
            new_issue = self.jira.create_issue(fields=issue_dict)
        except Exception as e:
            # If it fails (likely due to customfield_10016 not existing), try without it
            if 'customfield_10016' in issue_dict:
                del issue_dict['customfield_10016']
                try:
                    new_issue = self.jira.create_issue(fields=issue_dict)
                except Exception as second_e:
                    return {"success": False, "error": str(second_e)}
            else:
                return {"success": False, "error": str(e)}
        
        return {
            "success": True,
            "ticket_id": new_issue.id,
            "key": new_issue.key,
            "status": str(new_issue.fields.status),
            "url": f"{self.base_url}/browse/{new_issue.key}"
        }
    
    def get_ticket(self, ticket_key: str) -> dict:
        """Get ticket details"""
        issue = self.jira.issue(ticket_key)
        
        return {
            "key": issue.key,
            "summary": issue.fields.summary,
            "description": issue.fields.description,
            "status": str(issue.fields.status),
            "assignee": str(issue.fields.assignee) if issue.fields.assignee else None,
            "created": str(issue.fields.created),
            "updated": str(issue.fields.updated),
        }
    
    def update_ticket_status(self, ticket_key: str, transition_name: str) -> dict:
        """Update ticket status (e.g., 'In Progress', 'Done')"""
        issue = self.jira.issue(ticket_key)
        
        # Get available transitions
        transitions = self.jira.transitions(issue)
        transition_id = None
        
        for t in transitions:
            if t['name'].lower() == transition_name.lower():
                transition_id = t['id']
                break
        
        if transition_id:
            self.jira.transition_issue(issue, transition_id)
            return {
                "success": True,
                "ticket_key": ticket_key,
                "new_status": transition_name
            }
        else:
            available = [t['name'] for t in transitions]
            return {
                "success": False,
                "error": f"Transition '{transition_name}' not found",
                "available_transitions": available
            }
    
    def add_comment(self, ticket_key: str, comment: str) -> dict:
        """Add comment to ticket"""
        issue = self.jira.issue(ticket_key)
        self.jira.add_comment(issue, comment)
        
        return {
            "success": True,
            "ticket_key": ticket_key,
            "comment_added": comment[:50] + "..." if len(comment) > 50 else comment
        }
    
    def assign_ticket(self, ticket_key: str, assignee_email: str) -> dict:
        """Assign ticket to user"""
        issue = self.jira.issue(ticket_key)
        
        # Get user account ID from email
        users = self.jira.search_users(query=assignee_email)
        
        if users:
            user = users[0]
            issue.update(assignee={'accountId': user.accountId})
            return {
                "success": True,
                "ticket_key": ticket_key,
                "assigned_to": user.displayName
            }
        else:
            return {
                "success": False,
                "error": f"User with email {assignee_email} not found"
            }
    
    def list_tickets(self, jql: str = None, max_results: int = 50) -> list:
        """List tickets using JQL query"""
        if not jql:
            jql = f"project = {self.project_key} ORDER BY created DESC"
        
        issues = self.jira.search_issues(jql, maxResults=max_results)
        
        return [
            {
                "key": issue.key,
                "summary": issue.fields.summary,
                "status": str(issue.fields.status),
                "assignee": str(issue.fields.assignee) if issue.fields.assignee else "Unassigned"
            }
            for issue in issues
        ]
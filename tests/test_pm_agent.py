from agents.pm_agent import pm_agent
from camel.messages import BaseMessage

# Test PM agent creating a ticket
user_msg = """Create a Jira ticket for implementing user authentication.

Requirements:
- Email/password login
- OAuth (Google, GitHub)
- Password reset functionality
- Session management

Break this into appropriate sub-tasks and create them in Jira."""

print("--- Starting PM Agent Task ---")
print(f"Objective: {user_msg[:100]}...\n")

# In recent CAMEL versions, step() handles the whole turn including tool calls.
response = pm_agent.step(user_msg)

print("\n[Final PM Agent Response]:")
print(response.msg.content if response.msg else "(No verbal response)")

if response.terminated:
    print("\nStatus: Terminated")
else:
    print("\nStatus: In Progress (Waiting for next turn)")

print("\n--- Task Completed ---")
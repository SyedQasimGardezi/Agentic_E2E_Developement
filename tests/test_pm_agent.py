from agents.pm_agent import pm_agent
from camel.messages import BaseMessage

# Test PM agent creating a ticket
user_msg = BaseMessage.make_user_message(
    role_name="User",
    content="""Create a Jira ticket for implementing user authentication.
    
    Requirements:
    - Email/password login
    - OAuth (Google, GitHub)
    - Password reset functionality
    - Session management
    
    Break this into appropriate sub-tasks and create them in Jira."""
)

print("--- Starting PM Agent Task ---")
response = pm_agent.step(user_msg)

# Loop to handle multiple steps if the agent wants to continue (e.g., creating sub-tasks)
# In CAMEL, the agent will keep running if it has more tool calls or thoughts
for i in range(10):  # Allow up to 10 steps for a complex breakdown
    print(f"\n[Step {i+1}] PM Agent Response:")
    print(response.msg.content or "(Performing tool call...)")
    
    if response.terminated:
        print("Agent terminated.")
        break
        
    # Step again to continue the conversation/process tool results
    response = pm_agent.step()

print("\n--- Task Completed ---")
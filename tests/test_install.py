# test_install.py
from camel.agents import ChatAgent
from camel.messages import BaseMessage
from camel.toolkits import GithubToolkit, CodeExecutionToolkit

print("✅ CAMEL-AI installed successfully!")

# Test basic agent
agent = ChatAgent(
    role_name="Assistant",
    system_message="You are a helpful assistant."
)

response = agent.step(
    BaseMessage.make_user_message(
        role_name="User",
        content="Hello, are you working?"
    )
)

print(f"Agent response: {response.msg.content}")
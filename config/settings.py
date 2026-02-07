import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    # Azure OpenAI GPT-5.1 Settings
    AZURE_OPENAI_API_KEY = os.getenv("GPT51_AZURE_OPENAI_API_KEY")
    AZURE_OPENAI_RESOURCE = os.getenv("GPT51_OPENAI_RESOURCE")
    AZURE_OPENAI_MODEL = os.getenv("GPT51_OPENAI_MODEL")
    AZURE_OPENAI_API_VERSION = os.getenv("GPT51_OPENAI_API_VERSION")
    AZURE_OPENAI_MAX_TOKENS = int(os.getenv("GPT51_MAX_TOKENS", 8000))
    
    # Jira Settings
    JIRA_API_TOKEN = os.getenv("JIRA_API_TOKEN")
    JIRA_BASE_URL = os.getenv("JIRA_BASE_URL")
    JIRA_EMAIL = os.getenv("JIRA_EMAIL")
    JIRA_PROJECT_KEY = os.getenv("JIRA_PROJECT_KEY")

settings = Settings()

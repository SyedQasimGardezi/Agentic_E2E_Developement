from camel.models import ModelFactory
from camel.types import ModelPlatformType
from camel.configs import ChatGPTConfig
from config.settings import settings

def get_model():
    """Returns a configured CAMEL model instance for Azure OpenAI 5.1."""

    model_config = ChatGPTConfig(
        temperature=0.7,
    )

    model = ModelFactory.create(
        model_platform=ModelPlatformType.AZURE,
        model_type=settings.AZURE_OPENAI_MODEL,  # Deployment name
        model_config_dict=model_config.as_dict(),
        url=f"https://{settings.AZURE_OPENAI_RESOURCE}.openai.azure.com",
        api_key=settings.AZURE_OPENAI_API_KEY,
        api_version=settings.AZURE_OPENAI_API_VERSION,
    )
    
    return model

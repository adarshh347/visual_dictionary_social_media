from typing import Optional
from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

load_dotenv()

class Settings(BaseSettings):
    MONGO_DETAILS:str
    CLOUDINARY_NAME: str
    CLOUDINARY_API_KEY: str
    CLOUDINARY_API_SECRET: str
    OPENROUTER_API_KEY: str
    GROQ_API_KEY: Optional[str] = None
    model_config = SettingsConfigDict(env_file=".env")

settings=Settings()
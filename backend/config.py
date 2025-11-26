from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    MONGO_DETAILS:str
    CLOUDINARY_NAME: str
    CLOUDINARY_API_KEY: str
    CLOUDINARY_API_SECRET: str
    OPENROUTER_API_KEY: str
    model_config = SettingsConfigDict(env_file=".env")

settings=Settings()
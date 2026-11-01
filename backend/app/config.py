from pydantic_settings import BaseSettings, SettingsConfigDict
class Settings(BaseSettings):
    database_url: str = "sqlite:///./neurolab.db"
    secret_key: str = "change-this-secret-key-before-production"
    access_token_expire_minutes: int = 60
    frontend_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
settings = Settings()

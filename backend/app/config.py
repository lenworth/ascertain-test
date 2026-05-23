from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    database_url: str = "postgresql://postgres:postgres@localhost:5432/healthcare"
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    seed_on_startup: bool = True


settings = Settings()

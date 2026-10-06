import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """
    ClauseLens backend configuration with strict validation and safe defaults.
    Works seamlessly whether GEMINI_API_KEY is provided or not.
    """
    gemini_api_key: Optional[str] = None
    gemini_model: str = "gemini-2.5-flash"
    gemini_timeout_seconds: int = 25
    gemini_max_retries: int = 3
    
    cors_origins: List[str] = ["http://localhost:5173", "http://127.0.0.1:5173"]
    log_level: str = "INFO"
    
    # Contract validation constraints
    min_contract_chars: int = 50
    max_contract_chars: int = 100000
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

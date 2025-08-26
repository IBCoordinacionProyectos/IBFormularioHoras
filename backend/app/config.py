"""
Configuration module for the application.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import secrets

class Settings(BaseSettings):
    """
    Application settings and environment variables
    """
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Formulario Horas API"
    
    # Security
    JWT_SECRET_KEY: str = secrets.token_urlsafe(64)  # Default fallback, should be overridden in prod
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = []
    
    # Cookie settings
    COOKIE_SECURE: bool = True
    COOKIE_SAMESITE: str = "Lax"
    COOKIE_HTTPONLY: bool = True
    
    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = 100
    
    # Security headers
    SECURITY_HEADERS: dict = {
        "X-Frame-Options": "DENY",
        "X-Content-Type-Options": "nosniff",
        "X-XSS-Protection": "1; mode=block",
        "Content-Security-Policy": "default-src 'self'; frame-ancestors 'none'",
        "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
        "Permissions-Policy": "geolocation=(), microphone=(), camera=()"
    }

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True
    )

settings = Settings()

import os
from datetime import timedelta

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, ".."))

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "medibridge-ai-insecure-secret-academic-dev-key-2026")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "medibridge-jwt-super-secret-key-2026")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=7)
    
    # SQLite default database path (can be switched to PostgreSQL/MySQL via DATABASE_URL)
    _db_url = os.environ.get(
        "DATABASE_URL", 
        f"sqlite:///{os.path.join(BASE_DIR, 'database', 'medibridge.db')}"
    )
    if _db_url.startswith("postgres://"):
        _db_url = _db_url.replace("postgres://", "postgresql://", 1)
    SQLALCHEMY_DATABASE_URI = _db_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Machine Learning Models Directory
    ML_MODELS_DIR = os.path.join(PROJECT_ROOT, "machine_learning", "saved_models")
    DATASETS_DIR = os.path.join(PROJECT_ROOT, "machine_learning", "datasets")

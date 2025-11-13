import os
from dotenv import load_dotenv
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

DB_NAME = "habit-tracker.db"
DB_PATH = BASE_DIR / DB_NAME
DB_URL = f"sqlite:///{DB_PATH}"

DOTENV_PATH = BASE_DIR / ".env"
load_dotenv(dotenv_path=DOTENV_PATH)

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL")
OPENROUTER_URL = os.getenv("OPENROUTER_URL")
FRONTEND_URL = os.getenv("FRONTEND_URL")
LOCAL_CORS_ORIGIN = os.getenv("LOCAL_CORS_ORIGIN")
import sys
import os

# Add current directory to sys.path to allow absolute imports when running from root
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

import logging
import sqlite3
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from dotenv import load_dotenv

# Load env vars
load_dotenv()

# Security Check
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY or SECRET_KEY == "supersecretkey123":
    # In production, we might want to raise an error. 
    # For now, we print a critical warning.
    print("CRITICAL WARNING: SECRET_KEY is missing or default! Security is compromised.")
    if os.getenv("ENV") == "production":
        sys.exit("Error: SECRET_KEY must be set in production.")

# Routers
from routers import auth, jobs, applications, users, ai, notifications, interview
from routers import webhooks as webhooks_router

# Create DB Tables
Base.metadata.create_all(bind=engine)

def _ensure_sqlite_schema():
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "sql_app.db")
    db_path = os.path.abspath(db_path)
    if not os.path.exists(db_path):
        return
    conn = sqlite3.connect(db_path)
    try:
        cursor = conn.cursor()

        def table_exists(name: str) -> bool:
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name=?", (name,))
            return cursor.fetchone() is not None

        def column_exists(table: str, column: str) -> bool:
            cursor.execute(f"PRAGMA table_info({table})")
            return any(row[1] == column for row in cursor.fetchall())

        def add_column(table: str, column_def: str):
            cursor.execute(f"ALTER TABLE {table} ADD COLUMN {column_def}")

        if table_exists("users") and not column_exists("users", "profile_data"):
            add_column("users", "profile_data TEXT")

        if table_exists("applications") and not column_exists("applications", "structured_resume"):
            add_column("applications", "structured_resume TEXT")

        conn.commit()
    finally:
        conn.close()

_ensure_sqlite_schema()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("server")

app = FastAPI(title="AI Interviewer Backend")

# Ensure upload dir
UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

# CORS Security
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(jobs.router)
app.include_router(applications.router)
app.include_router(ai.router)
app.include_router(notifications.router)
app.include_router(interview.router)
app.include_router(webhooks_router.router)

if __name__ == "__main__":
    import uvicorn
    print("Starting server...")
    try:
        uvicorn.run(app, host="0.0.0.0", port=8000)
    except Exception as e:
        print(f"Error: {e}")

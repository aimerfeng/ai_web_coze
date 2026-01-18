import sqlite3
from passlib.context import CryptContext

# Setup password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def ensure_user():
    db_path = "sql_app.db"
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    email = "test@example.com"
    password = "password123"
    full_name = "Test Candidate"
    role = "candidate"

    # Check if user exists
    cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()

    if user:
        print(f"User {email} already exists.")
    else:
        print(f"Creating user {email}...")
        hashed_password = get_password_hash(password)
        cursor.execute(
            "INSERT INTO users (email, hashed_password, full_name, role) VALUES (?, ?, ?, ?)",
            (email, hashed_password, full_name, role)
        )
        conn.commit()
        print("User created successfully!")

    conn.close()

if __name__ == "__main__":
    ensure_user()

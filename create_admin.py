import sqlite3
from passlib.context import CryptContext

# Setup password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

def ensure_admin():
    db_path = "sql_app.db"
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    email = "admin@example.com"
    password = "adminpassword123"
    full_name = "System Admin"
    role = "admin"

    # Check if user exists
    cursor.execute("SELECT id FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()

    if user:
        print(f"Admin user {email} already exists. Updating role to admin...")
        cursor.execute("UPDATE users SET role = ? WHERE email = ?", (role, email))
    else:
        print(f"Creating admin user {email}...")
        hashed_password = get_password_hash(password)
        cursor.execute(
            "INSERT INTO users (email, hashed_password, full_name, role) VALUES (?, ?, ?, ?)",
            (email, hashed_password, full_name, role)
        )
    
    conn.commit()
    conn.close()
    print("Admin user ready!")
    print(f"Email: {email}")
    print(f"Password: {password}")

if __name__ == "__main__":
    ensure_admin()

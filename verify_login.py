import sqlite3
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_user(email, password):
    try:
        conn = sqlite3.connect("sql_app.db")
        cursor = conn.cursor()
        cursor.execute("SELECT hashed_password FROM users WHERE email = ?", (email,))
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            print(f"User {email} not found")
            return False
            
        hashed = row[0]
        is_valid = pwd_context.verify(password, hashed)
        print(f"User {email} password '{password}' valid: {is_valid}")
        return is_valid
    except Exception as e:
        print(f"Error verifying {email}: {e}")
        return False

if __name__ == "__main__":
    print("Verifying credentials...")
    verify_user("test@example.com", "password123")
    verify_user("admin@example.com", "adminpassword123")

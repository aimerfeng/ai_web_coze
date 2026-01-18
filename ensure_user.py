import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

from backend.database import SessionLocal, engine, Base
from backend import models
from backend import auth

def ensure_test_user():
    db = SessionLocal()
    try:
        email = "test@example.com"
        # Check if user exists
        user = db.query(models.User).filter(models.User.email == email).first()
        
        if user:
            print(f"User found: {email}")
            # We can't easily check the password hash, so we'll just report success
            # If the user can't login, we can reset the password
            print("User already exists.")
        else:
            print(f"Creating user: {email}")
            password = "password123"
            hashed_password = auth.get_password_hash(password)
            new_user = models.User(
                email=email, 
                hashed_password=hashed_password, 
                full_name="Test Candidate",
                role="candidate"
            )
            db.add(new_user)
            db.commit()
            print("User created successfully.")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    ensure_test_user()

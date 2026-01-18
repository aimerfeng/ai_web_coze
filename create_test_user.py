import sys
import os

# Add backend to path so we can import modules directly
sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

# Use direct imports matching how internal modules import each other
from database import SessionLocal, engine, Base
import models
import auth

def create_test_user():
    print("Initializing database...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        email = "test@example.com"
        password = "password123"
        
        # Check if user exists
        existing_user = db.query(models.User).filter(models.User.email == email).first()
        if existing_user:
            print(f"Test user {email} already exists.")
            return

        print(f"Creating test user: {email}")
        hashed_password = auth.get_password_hash(password)
        user = models.User(
            email=email,
            hashed_password=hashed_password,
            full_name="Test Candidate",
            role="candidate"
        )
        db.add(user)
        db.commit()
        print("Test user created successfully!")
        print(f"Email: {email}")
        print(f"Password: {password}")
        
    except Exception as e:
        print(f"Error creating test user: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_test_user()

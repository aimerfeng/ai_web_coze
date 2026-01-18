from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Enum
from sqlalchemy.orm import relationship
from database import Base
import datetime
import enum

class UserRole(str, enum.Enum):
    CANDIDATE = "candidate"
    HR = "hr"

class User(Base):
    __tablename__ = "users"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    role = Column(String, default="candidate")
    
    applications = relationship("Application", back_populates="candidate")

class Job(Base):
    __tablename__ = "jobs"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    department = Column(String)
    location = Column(String)
    description = Column(Text)
    requirements = Column(Text)
    knowledge_base = Column(Text)
    
    applications = relationship("Application", back_populates="job")

class Application(Base):
    __tablename__ = "applications"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    job_id = Column(Integer, ForeignKey("jobs.id"))
    status = Column(String, default="pending") # pending, profiling, interview_ready, completed
    github_link = Column(String, nullable=True)
    resume_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    candidate = relationship("User", back_populates="applications")
    job = relationship("Job", back_populates="applications")
    interviews = relationship("InterviewRecord", back_populates="application")

class InterviewRecord(Base):
    __tablename__ = "interviews"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"))
    start_time = Column(DateTime)
    end_time = Column(DateTime, nullable=True)
    risk_logs = Column(Text, nullable=True) # JSON string
    transcript = Column(Text, nullable=True) # JSON string
    report = Column(Text, nullable=True)
    
    application = relationship("Application", back_populates="interviews")

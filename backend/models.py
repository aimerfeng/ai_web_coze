import enum
from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import relationship

from database import Base


class UserRole(str, enum.Enum):
    CANDIDATE = "candidate"
    HR = "hr"
    ADMIN = "admin"


class User(Base):
    __tablename__ = "users"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    role = Column(String, default="candidate")
    profile_data = Column(JSON, nullable=True)

    applications = relationship("Application", back_populates="candidate", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="owner", cascade="all, delete-orphan")


class Job(Base):
    __tablename__ = "jobs"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    department = Column(String)
    location = Column(String)
    type = Column(String, default="全职")
    salary_range = Column(String)
    description = Column(Text)
    requirements = Column(Text)
    knowledge_base = Column(Text)
    public_knowledge = Column(Text, nullable=True)
    is_active = Column(Integer, default=1)

    applications = relationship("Application", back_populates="job", cascade="all, delete-orphan")


class Application(Base):
    __tablename__ = "applications"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    job_id = Column(Integer, ForeignKey("jobs.id"))
    status = Column(String, default="pending")
    github_link = Column(String, nullable=True)
    resume_path = Column(String, nullable=True)
    structured_resume = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    candidate = relationship("User", back_populates="applications")
    job = relationship("Job", back_populates="applications")
    interviews = relationship("InterviewRecord", back_populates="application", cascade="all, delete-orphan")


class InterviewRecord(Base):
    __tablename__ = "interviews"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"))
    start_time = Column(DateTime)
    end_time = Column(DateTime, nullable=True)
    risk_logs = Column(Text, nullable=True)
    transcript = Column(Text, nullable=True)
    report = Column(Text, nullable=True)

    application = relationship("Application", back_populates="interviews")


class Notification(Base):
    __tablename__ = "notifications"
    __table_args__ = {"extend_existing": True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String)
    message = Column(String)
    type = Column(String, default="info")
    is_read = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    owner = relationship("User", back_populates="notifications")

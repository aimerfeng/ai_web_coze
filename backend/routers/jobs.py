from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import auth
import models
from dependencies import get_db

router = APIRouter(tags=["jobs"])

class JobCreate(BaseModel):
    title: str
    department: str
    location: str
    type: str = "全职"
    salary_range: str
    description: str
    requirements: str
    knowledge_base: str
    public_knowledge: Optional[str] = None

@router.get("/jobs")
def get_jobs(db: Session = Depends(get_db)):
    return db.query(models.Job).filter(models.Job.is_active == 1).all()

@router.get("/jobs/{job_id}")
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.post("/jobs")
def create_job(job: JobCreate, current_user: models.User = Depends(auth.get_current_admin), db: Session = Depends(get_db)):
    # Now protected by get_current_admin
    new_job = models.Job(**job.dict())
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return new_job

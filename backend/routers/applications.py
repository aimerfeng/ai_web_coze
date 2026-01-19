from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import shutil
import os
import json
from datetime import datetime
import auth
import models
from dependencies import get_db
from resume_parser import ResumeParser

router = APIRouter(tags=["applications"])

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

resume_parser = ResumeParser()

class ApplicationCreate(BaseModel):
    job_id: int
    github_link: Optional[str] = None
    resume_path: Optional[str] = None

def validate_pdf_header(file: UploadFile):
    """
    Reads the first 4 bytes of the file to check for %PDF magic bytes.
    Resets the file cursor after checking.
    """
    header = file.file.read(4)
    file.file.seek(0) # Reset cursor
    if header != b'%PDF':
        raise HTTPException(status_code=400, detail="Invalid file format. The file is not a valid PDF.")

@router.post("/resume/parse")
async def parse_resume(resume: UploadFile = File(...)):
    """
    Standalone endpoint to parse a resume and return structured data for preview/editing.
    Does NOT save to DB.
    """
    file_ext = resume.filename.split('.')[-1]
    if file_ext.lower() != 'pdf':
        raise HTTPException(status_code=400, detail="Only PDF files are supported for auto-parsing")
    
    # Security: Check Magic Bytes
    validate_pdf_header(resume)
    
    # Save temp file
    temp_filename = f"temp_{datetime.now().strftime('%Y%m%d%H%M%S')}.pdf"
    temp_path = os.path.join(UPLOAD_DIR, temp_filename)
    
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(resume.file, buffer)
            
        # Parse
        structured_data = resume_parser.parse_pdf(temp_path)
        return structured_data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Cleanup temp file
        if os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except:
                pass

@router.post("/applications")
def submit_application(
    job_id: int = Form(...),
    github_link: str = Form(None),
    resume: UploadFile = File(None),
    structured_resume_json: str = Form(None), # Receive JSON string from frontend
    current_user: models.User = Depends(auth.get_current_user), 
    db: Session = Depends(get_db)
):
    # 1. Save Resume File
    resume_path = None
    structured_data = None
    
    # Parse the manually edited JSON if provided
    if structured_resume_json:
        try:
            structured_data = json.loads(structured_resume_json)
        except json.JSONDecodeError:
            pass # Ignore invalid JSON
    
    if resume:
        file_ext = resume.filename.split('.')[-1]
        
        # Validate extension
        if file_ext.lower() != 'pdf':
            raise HTTPException(status_code=400, detail="Only PDF files are accepted.")
            
        # Security: Check Magic Bytes
        validate_pdf_header(resume)

        filename = f"user_{current_user.id}_job_{job_id}_{datetime.now().strftime('%Y%m%d%H%M%S')}.{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(resume.file, buffer)
        
        resume_path = file_path
        
        # 2. Auto-parse if NO manual data provided (Fallback)
        if not structured_data and file_ext.lower() == 'pdf':
            print(f"Parsing PDF (Fallback): {file_path}")
            structured_data = resume_parser.parse_pdf(file_path)

    # 3. Create Application Record
    application = models.Application(
        user_id=current_user.id,
        job_id=job_id,
        github_link=github_link,
        resume_path=resume_path,
        structured_resume=structured_data, 
        status="pending"
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    return application

@router.get("/applications/me")
def get_my_applications(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    apps = db.query(models.Application).filter(models.Application.user_id == current_user.id).all()
    return apps

@router.get("/admin/applications")
def get_all_applications(current_user: models.User = Depends(auth.get_current_admin), db: Session = Depends(get_db)):
    # Join with User and Job to get names
    results = db.query(
        models.Application, 
        models.User.full_name, 
        models.Job.title
    ).join(models.User, models.Application.user_id == models.User.id)\
     .join(models.Job, models.Application.job_id == models.Job.id)\
     .all()
    
    # Format response
    apps_data = []
    for app, user_name, job_title in results:
        apps_data.append({
            "id": app.id,
            "name": user_name,
            "job": job_title,
            "status": app.status,
            "score": None, # Placeholder for AI score
            "appliedAt": app.created_at.strftime("%Y-%m-%d"),
            "resume_path": app.resume_path,
            "structured_resume": app.structured_resume, # Include structured data
            "github_link": app.github_link
        })
    return apps_data

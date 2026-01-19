import sys
import os

# Add current directory to sys.path to allow absolute imports when running from root
current_dir = os.path.dirname(os.path.abspath(__file__))
if current_dir not in sys.path:
    sys.path.append(current_dir)

import json
import asyncio
import logging
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from controller import InterviewController
from database import engine, Base, SessionLocal
import models
import auth
from pydantic import BaseModel
from typing import Optional

# Create DB Tables
Base.metadata.create_all(bind=engine)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("server")

app = FastAPI(title="AI Interviewer Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

controller = InterviewController()

# Pydantic Models
class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str

class Token(BaseModel):
    access_token: str
    token_type: str

class LoginRequest(BaseModel):
    email: str
    password: str

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

class ApplicationCreate(BaseModel):
    job_id: int
    github_link: Optional[str] = None
    resume_path: Optional[str] = None

class ChatRequest(BaseModel):
    job_id: int
    message: str

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Job APIs ---
@app.get("/jobs")
def get_jobs(db: Session = Depends(get_db)):
    return db.query(models.Job).filter(models.Job.is_active == 1).all()

@app.get("/jobs/{job_id}")
def get_job(job_id: int, db: Session = Depends(get_db)):
    job = db.query(models.Job).filter(models.Job.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@app.post("/jobs")
def create_job(job: JobCreate, current_user: models.User = Depends(auth.get_current_admin), db: Session = Depends(get_db)):
    # Now protected by get_current_admin
    new_job = models.Job(**job.dict())
    db.add(new_job)
    db.commit()
    db.refresh(new_job)
    return new_job

# --- Application APIs ---
@app.post("/applications")
def submit_application(app: ApplicationCreate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    # Check if already applied
    existing = db.query(models.Application).filter(
        models.Application.user_id == current_user.id,
        models.Application.job_id == app.job_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Already applied to this job")

    new_app = models.Application(
        user_id=current_user.id,
        job_id=app.job_id,
        github_link=app.github_link,
        resume_path=app.resume_path,
        status="pending"
    )
    db.add(new_app)
    db.commit()
    db.refresh(new_app)
    return new_app

@app.get("/applications/me")
def get_my_applications(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    apps = db.query(models.Application).filter(models.Application.user_id == current_user.id).all()
    # Eager load job details? Or frontend fetches job separately?
    # For simplicity, let's return list and frontend can fetch job details or we join here.
    # Returning apps is fine, frontend can match with job list or we return a joined structure.
    return apps

# --- AI Query API (Mock/RAG) ---
@app.post("/ai/chat")
async def chat_about_job(req: ChatRequest, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    job = db.query(models.Job).filter(models.Job.id == req.job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Mock RAG response
    # In real world: Call Coze API with job.knowledge_base + req.message
    response_text = f"基于职位【{job.title}】的知识库：关于您的问题“{req.message}”，我们的情况是..."
    
    # Simple keyword matching for demo
    if "薪资" in req.message:
        response_text = f"该职位的薪资范围是 {job.salary_range}。"
    elif "加班" in req.message:
        response_text = "我们提倡工作生活平衡，但也视项目紧急程度而定。"
    
    return {"response": response_text}

@app.post("/auth/register", response_model=Token)
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = auth.get_password_hash(user.password)
    new_user = models.User(email=user.email, hashed_password=hashed_password, full_name=user.full_name)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = auth.create_access_token(data={"sub": new_user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/auth/login", response_model=Token)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user or not auth.verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me")
async def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return {"email": current_user.email, "name": current_user.full_name, "id": current_user.id, "role": current_user.role}

@app.post("/admin/login", response_model=Token)
def admin_login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user or not auth.verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not an admin account"
        )
    
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.websocket("/ws/interview")
async def websocket_endpoint(websocket: WebSocket, token: Optional[str] = None):
    # Verify Token
    try:
        if token is None:
             await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
             return
        
        # Manually decode token here as Depends doesn't work easily with WS in some versions
        # Or use a query param "token"
        payload = auth.jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        email = payload.get("sub")
        if email is None:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
            
    except Exception as e:
        logger.error(f"Auth failed: {e}")
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await websocket.accept()
    logger.info(f"New WebSocket connection: {email}")
    
    # Register the connection with the controller
    session_id = str(id(websocket))
    await controller.connect(session_id, websocket)
    
    try:
        while True:
            # Expecting JSON messages or Binary audio/video
            message = await websocket.receive()
            
            if "text" in message:
                try:
                    data = json.loads(message["text"])
                    if data.get("type") == "PING":
                         await websocket.send_json({"type": "PONG"})
                    else:
                        await controller.handle_event(session_id, data)
                except:
                    pass
            elif "bytes" in message:
                # Assuming bytes are audio chunks for now
                await controller.handle_audio_stream(session_id, message["bytes"])
                
    except WebSocketDisconnect:
        controller.disconnect(session_id)
        logger.info(f"WebSocket disconnected: {session_id}")
    except Exception as e:
        logger.error(f"Error: {e}")
        controller.disconnect(session_id)

if __name__ == "__main__":
    import uvicorn
    print("Starting server...")
    try:
        uvicorn.run(app, host="0.0.0.0", port=8000)
    except Exception as e:
        print(f"Error: {e}")

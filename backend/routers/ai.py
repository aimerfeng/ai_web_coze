from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List
import auth
import models
from dependencies import get_db
from services import DeepSeekService

router = APIRouter(tags=["ai"])

deepseek_service = DeepSeekService()

class ChatRequest(BaseModel):
    job_id: int
    message: str

class CompanyChatRequest(BaseModel):
    history: List[dict] # [{"role": "user", "content": "..."}]

@router.post("/ai/chat")
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

@router.post("/ai/company-chat")
async def chat_with_company_ai(req: CompanyChatRequest):
    """
    General Company AI Chatbot (DeepSeek RAG)
    """
    response = await deepseek_service.chat(req.history)
    return {"response": response}

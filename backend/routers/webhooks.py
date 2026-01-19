from fastapi import APIRouter, Depends, HTTPException, Header, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Dict, Any, Optional
import models
from dependencies import get_db
import logging

router = APIRouter(tags=["webhooks"])
logger = logging.getLogger("server")

# Coze Webhook Secret (Should be in env)
COZE_WEBHOOK_SECRET = "your_coze_webhook_secret"

class ScreeningResult(BaseModel):
    application_id: int
    score: int
    passed: bool
    reason: str
    suggested_questions: list[str] = []
    deep_dive_strategy: str = ""

class AnalysisResult(BaseModel):
    interview_id: int
    scores: Dict[str, int] # {"technical": 80, "communication": 90}
    summary: str
    risk_assessment: str
    video_url: Optional[str] = None

@router.post("/webhook/coze/screening_result")
async def handle_screening_result(
    payload: ScreeningResult, 
    x_coze_signature: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Callback from Coze Pre-screening Agent
    """
    # Verify signature (Mock logic for now)
    # if x_coze_signature != COZE_WEBHOOK_SECRET:
    #     raise HTTPException(status_code=403, detail="Invalid signature")

    logger.info(f"Received Screening Result for App {payload.application_id}: {payload.passed}")

    app = db.query(models.Application).filter(models.Application.id == payload.application_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    # Update Application Status
    if payload.passed:
        app.status = "interview_ready"
        # Store questions in structured_resume or a new field if we had one on Application
        # For now, we might store it in the first InterviewRecord placeholder
        interview = models.InterviewRecord(
            application_id=app.id,
            pre_screening_result={
                "questions": payload.suggested_questions,
                "strategy": payload.deep_dive_strategy
            }
        )
        db.add(interview)
    else:
        app.status = "rejected"
    
    db.commit()
    return {"status": "processed"}

@router.post("/webhook/coze/analysis_result")
async def handle_analysis_result(
    payload: AnalysisResult,
    db: Session = Depends(get_db)
):
    """
    Callback from Coze Analyst Agent
    """
    logger.info(f"Received Analysis Result for Interview {payload.interview_id}")

    interview = db.query(models.InterviewRecord).filter(models.InterviewRecord.id == payload.interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    interview.report = payload.summary
    interview.risk_logs = payload.risk_assessment
    interview.analysis_json = payload.scores
    if payload.video_url:
        interview.video_url = payload.video_url
    
    db.commit()
    return {"status": "processed"}

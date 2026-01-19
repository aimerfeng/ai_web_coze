from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import auth
import models
from dependencies import get_db

router = APIRouter(tags=["notifications"])

@router.get("/notifications")
def get_notifications(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    return db.query(models.Notification)\
        .filter(models.Notification.user_id == current_user.id)\
        .order_by(models.Notification.created_at.desc())\
        .all()

@router.post("/notifications/{notif_id}/read")
def mark_notification_read(notif_id: int, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    notif = db.query(models.Notification).filter(
        models.Notification.id == notif_id,
        models.Notification.user_id == current_user.id
    ).first()
    if notif:
        notif.is_read = 1
        db.commit()
    return {"status": "ok"}

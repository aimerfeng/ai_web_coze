from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
import auth
import models
from dependencies import get_db

router = APIRouter(tags=["users"])

class ProfileUpdate(BaseModel):
    profile_data: dict

@router.get("/users/me/profile")
def get_my_profile(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == current_user.id).first()
    return {"profile_data": user.profile_data or {}}

@router.put("/users/me/profile")
def update_my_profile(payload: ProfileUpdate, current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == current_user.id).first()
    user.profile_data = payload.profile_data
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"profile_data": user.profile_data}

@router.get("/users/me")
async def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return {"email": current_user.email, "name": current_user.full_name, "id": current_user.id, "role": current_user.role}

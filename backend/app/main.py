from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from pwdlib import PasswordHash

from .database import Base, engine, get_db
from . import models
from .schemas import UserCreate, TaskCreate, TaskUpdate
from .security import (
    hash_password,
    verify_password,
    create_access_token,
    verify_access_token
)

# Password hashing instance
password_hash = PasswordHash.recommended()

# Database tables creation
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="StudyMate AI API",
    description="Backend API for StudyMate AI",
    version="1.0.0"
)

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    user_id = verify_access_token(token)

    if user_id is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    return user_id


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Login Request Model
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@app.get("/")
def home():
    return {
        "message": "StudyMate AI API is running 🚀"
    }


@app.post("/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = (
        db.query(models.User)
        .filter(models.User.email == user.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    new_user = models.User(
        name=user.name,
        email=user.email,
        password_hash=hash_password(user.password)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User created successfully",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email
        }
    }


@app.post("/login")
def login(
    data: LoginRequest,
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(
        models.User.email == data.email
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        data.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "email": user.email
        }
    )

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email
        }
    }


@app.post("/tasks")
def create_task(
    task: TaskCreate,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user)
):
    new_task = models.Task(
        title=task.title,
        description=task.description,
        status=task.status,
        user_id=current_user_id
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return {
        "message": "Task created successfully",
        "task": {
            "id": new_task.id,
            "title": new_task.title,
            "description": new_task.description,
            "status": new_task.status,
            "user_id": new_task.user_id
        }
    }


@app.get("/tasks")
def get_tasks(
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user)
):
    tasks = (
        db.query(models.Task)
        .filter(models.Task.user_id == current_user_id)
        .all()
    )

    return {
        "tasks": [
            {
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "status": task.status,
                "user_id": task.user_id
            }
            for task in tasks
        ]
    }


@app.put("/tasks/{task_id}")
def update_task(
    task_id: int,
    task: TaskUpdate,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user)
):
    existing_task = (
        db.query(models.Task)
        .filter(
            models.Task.id == task_id,
            models.Task.user_id == current_user_id
        )
        .first()
    )

    if not existing_task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    if task.title is not None:
        existing_task.title = task.title

    if task.description is not None:
        existing_task.description = task.description

    if task.status is not None:
        existing_task.status = task.status

    db.commit()
    db.refresh(existing_task)

    return {
        "message": "Task updated successfully",
        "task": {
            "id": existing_task.id,
            "title": existing_task.title,
            "description": existing_task.description,
            "status": existing_task.status,
            "user_id": existing_task.user_id
        }
    }


@app.delete("/tasks/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user_id: int = Depends(get_current_user)
):
    existing_task = (
        db.query(models.Task)
        .filter(
            models.Task.id == task_id,
            models.Task.user_id == current_user_id
        )
        .first()
    )

    if not existing_task:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    db.delete(existing_task)
    db.commit()

    return {
        "message": "Task deleted successfully",
        "task_id": task_id
    }
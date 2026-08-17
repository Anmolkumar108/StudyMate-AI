from pydantic import BaseModel, EmailStr
from datetime import date as Date


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class TaskCreate(BaseModel):
    title: str
    description: str | None = None
    status: str = "pending"


class TaskUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: str | None = None


class NoteCreate(BaseModel):
    title: str
    content: str


class NoteUpdate(BaseModel):
    title: str | None = None
    content: str | None = None


# Planner Schemas

class PlannerCreate(BaseModel):
    title: str
    description: str | None = None
    date: Date
    duration: int
    status: str = "pending"


class PlannerUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    date: Date | None = None
    duration: int | None = None
    status: str | None = None
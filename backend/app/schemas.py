from pydantic import BaseModel, EmailStr, Field
from datetime import date as Date


class UserCreate(BaseModel):
    name: str = Field(min_length=2, max_length=50)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


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


class UserUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=50)
    email: EmailStr | None = None

class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8, max_length=128)

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str
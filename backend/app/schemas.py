# schemas.py
from pydantic import BaseModel, ConfigDict
from datetime import date
from typing import Optional

class EmployeeBase(BaseModel):
    id: int
    name: str
    short_name: str
    model_config = ConfigDict(from_attributes=True)

class ProjectBase(BaseModel):
    id: int
    name: str
    code: str
    model_config = ConfigDict(from_attributes=True)

class ActivityBase(BaseModel):
    id: int
    project_code: str
    phase: str
    discipline: str
    activity: str
    model_config = ConfigDict(from_attributes=True)

class ReportedHourCreate(BaseModel):
    date: date
    employee_id: int
    project_code: str
    phase: str
    discipline: str
    activity: str
    hours: float
    note: Optional[str] = None

class ReportedHourUpdate(BaseModel):
    date: Optional[date] = None
    employee_id: Optional[int] = None
    project_code: Optional[str] = None
    phase: Optional[str] = None
    discipline: Optional[str] = None
    activity: Optional[str] = None
    hours: Optional[float] = None
    note: Optional[str] = None

class ReportedHour(ReportedHourCreate):
    id: str  # UUID
    model_config = ConfigDict(from_attributes=True)

class DailyActivity(BaseModel):
    id: str  # UUID
    date: date
    employee_id: int
    project_code: str
    project_name: str
    phase: str
    discipline: str
    activity: str
    hours: float
    note: str = None
    model_config = ConfigDict(from_attributes=True)

# Añade esta clase al final del archivo
class ActivityItem(BaseModel):
    id: int
    name: str
    model_config = ConfigDict(from_attributes=True)

class UserLogin(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    message: str
    employee_id: int
    employee_name: str

class GroupedHour(BaseModel):
    date: str
    employee_id: str
    short_name: str
    hours: float
    model_config = ConfigDict(from_attributes=True)
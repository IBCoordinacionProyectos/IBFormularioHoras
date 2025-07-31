from sqlalchemy import Column, Integer, String, Date, Float, ForeignKey
from .database import Base

class Project(Base):
    __tablename__ = "IB_Projects"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    code = Column(String, unique=True)
    created_at = Column(Date)

class Employee(Base):
    __tablename__ = "IB_Members"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    short_name = Column(String)
    created_at = Column(Date)

class Activity(Base):
    __tablename__ = "IB_Activities"
    id = Column(Integer, primary_key=True, index=True)
    project_code = Column(String, ForeignKey("IB_Projects.code"))
    phase = Column(String)
    discipline = Column(String)
    activity = Column(String)
    hours_direction = Column(Float)
    hours_engineering = Column(Float)
    hours_modeling_ad = Column(Float)
    status = Column(String)
    hours = Column(Float)

class ReportedHour(Base):
    __tablename__ = "IB_Reported_Hours"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date)
    employee_id = Column(Integer, ForeignKey("IB_Members.id"))
    project_code = Column(String)
    phase = Column(String)
    discipline = Column(String)
    activity = Column(String)
    hours = Column(Float)
    note = Column(String)
    created_at = Column(Date)

class Authentication(Base):
    __tablename__ = "IB_Authentication"
    id_authentication = Column(Integer, primary_key=True, index=True)
    id_members = Column(Integer, ForeignKey("IB_Members.id"))
    user = Column(String, unique=True, index=True)
    password = Column(String)
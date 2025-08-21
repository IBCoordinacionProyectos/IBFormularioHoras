# main.py
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from .routers import projects, activities, hours, employees, daily_activities, auth, permissions
from .middleware.security import SecurityMiddleware, RateLimitMiddleware

app = FastAPI(title="FormularioHoras API",
             description="API for managing work hours and activities",
             version="1.0.0")

# Configuration
import os
from dotenv import load_dotenv

load_dotenv()

# CORS Configuration
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "").split(",")
if not ALLOWED_ORIGINS:
    raise ValueError("ALLOWED_ORIGINS must be set in environment variables")

# Add Security Middleware
app.add_middleware(SecurityMiddleware)
app.add_middleware(RateLimitMiddleware, calls=100, period=60)  # 100 requests per minute

# Add CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=[
        "Content-Type",
        "Authorization",
        "Accept",
        "Origin",
        "X-Requested-With",
    ],
    expose_headers=["Content-Length"],
    max_age=600  # 10 minutes cache for preflight requests
)


app.include_router(daily_activities.router, prefix="/daily-activities", tags=["daily-activities"])
app.include_router(projects.router, prefix="/projects", tags=["projects"])
app.include_router(activities.router, prefix="/activities", tags=["activities"])
app.include_router(hours.router, prefix="/hours", tags=["hours"])
app.include_router(employees.router, prefix="/employees", tags=["employees"])
app.include_router(permissions.router, prefix="/permissions", tags=["permissions"])
app.include_router(auth.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the API"}

@app.get("/health", status_code=status.HTTP_200_OK)
def health_check():
    """Endpoint de verificación de salud del servicio"""
    return {"status": "ok", "message": "Service is running"}
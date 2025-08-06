# main.py
from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from .routers import projects, activities, hours, employees, daily_activities, auth

app = FastAPI()

# Configuración de CORS
origins = [
    "http://localhost",
    "http://localhost:3000",
    "https://yeisonduque.top",
    "https://www.yeisonduque.top",
    "https://backend.yeisonduque.top",
    "http://horas.yeisonduque.top",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from .routers import projects, activities, hours, employees, daily_activities, auth  # Nuevo import

app.include_router(daily_activities.router, prefix="/daily-activities", tags=["daily-activities"])
app.include_router(projects.router, prefix="/projects", tags=["projects"])
app.include_router(activities.router, prefix="/activities", tags=["activities"])
app.include_router(hours.router, prefix="/hours", tags=["hours"])
app.include_router(employees.router, prefix="/employees", tags=["employees"])
app.include_router(auth.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the API"}

@app.get("/health", status_code=status.HTTP_200_OK)
def health_check():
    """Endpoint de verificación de salud del servicio"""
    return {"status": "ok", "message": "Service is running"}
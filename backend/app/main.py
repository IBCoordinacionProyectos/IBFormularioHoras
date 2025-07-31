# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # Importa esto
from .routers import projects, activities, hours, employees

app = FastAPI()

# Configuración de CORS - ¡Verifica que esto esté en tu archivo!
origins = [
    "http://localhost",
    "http://localhost:3000", # ¡Este es CRUCIAL para tu frontend!
    # Puedes añadir otros orígenes aquí si tu frontend se despliega en otro lugar
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
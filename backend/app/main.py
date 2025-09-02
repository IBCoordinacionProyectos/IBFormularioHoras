# main.py
from fastapi import FastAPI, status, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from .routers import projects, activities, hours, employees, daily_activities, auth

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers['X-Frame-Options'] = 'DENY'
        response.headers['X-Content-Type-Options'] = 'nosniff'
        response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        response.headers['Content-Security-Policy'] = "default-src 'self'; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; img-src 'self' https://fastapi.tiangolo.com data:; connect-src 'self' https://backend.yeisonduque.top https://supabase.yeisonduque.top"
        return response

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI()

# Add rate limiting middleware
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

# Configuración de CORS
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:3001",
    "https://yeisonduque.top",
    "https://www.yeisonduque.top",
    "https://backend.yeisonduque.top",
    "http://horas.yeisonduque.top",
    "https://horas.yeisonduque.top",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add security headers middleware
app.add_middleware(SecurityHeadersMiddleware)


app.include_router(daily_activities.router, prefix="/daily-activities", tags=["daily-activities"])
app.include_router(projects.router, prefix="/projects", tags=["projects"])
app.include_router(activities.router, prefix="/activities", tags=["activities"])
app.include_router(hours.router, prefix="/hours", tags=["hours"])
app.include_router(employees.router, prefix="/employees", tags=["employees"])
app.include_router(auth.router)

@app.get("/")
@limiter.limit("10/minute")
def read_root(request: Request):
    return {"message": "Welcome to the API"}

@app.get("/health", status_code=status.HTTP_200_OK)
@limiter.limit("30/minute")
def health_check(request: Request):
    """Endpoint de verificación de salud del servicio"""
    return {"status": "ok", "message": "Service is running"}

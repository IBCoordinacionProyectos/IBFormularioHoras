# main.py
from fastapi import FastAPI, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
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

# Custom exception handlers to ensure CORS headers are added to all responses
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    response = JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )
    # Add CORS headers to the response
    response.headers["Access-Control-Allow-Origin"] = request.headers.get("origin", "*")
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"
    return response

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    response = JSONResponse(
        status_code=422,
        content={"detail": exc.errors()}
    )
    # Add CORS headers to the response
    response.headers["Access-Control-Allow-Origin"] = request.headers.get("origin", "*")
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"
    return response

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    response = JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )
    # Add CORS headers to the response
    response.headers["Access-Control-Allow-Origin"] = request.headers.get("origin", "*")
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Methods"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"
    return response

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
    "https://www.horas.yeisonduque.top",  # Add www version
    "*",  # Allow all origins temporarily for debugging
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

@app.get("/health/db", status_code=status.HTTP_200_OK)
@limiter.limit("10/minute")
def database_health_check(request: Request):
    """Endpoint de verificación de salud de la base de datos"""
    try:
        # Test basic database connectivity
        from .database import supabase
        response = supabase.table("IB_Projects").select("code").limit(1).execute()

        return {
            "status": "ok",
            "message": "Database connection is healthy",
            "timestamp": request.headers.get("date", "unknown")
        }
    except Exception as e:
        return JSONResponse(
            status_code=503,
            content={
                "status": "error",
                "message": f"Database connection failed: {str(e)}",
                "timestamp": request.headers.get("date", "unknown")
            }
        )

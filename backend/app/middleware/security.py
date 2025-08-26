from fastapi import Request, HTTPException
from fastapi.security import HTTPBearer
from ratelimit import limits, RateLimitException
from typing import Callable
import time
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

class SecurityMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        # Add security headers
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains; preload"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self' cdn.jsdelivr.net; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval' cdn.jsdelivr.net; "
            "style-src 'self' 'unsafe-inline' cdn.jsdelivr.net; "
            "img-src 'self' data: https:; "
            "font-src 'self' data: https:; "
            "connect-src 'self' https:;"
        )
        response.headers["Permissions-Policy"] = (
            "accelerometer=(), "
            "camera=(), "
            "geolocation=(), "
            "gyroscope=(), "
            "magnetometer=(), "
            "microphone=(), "
            "payment=(), "
            "usb=()"
        )
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        
        return response

class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, calls: int = 100, period: int = 60):
        super().__init__(app)
        self.calls = calls
        self.period = period
        self.clients = {}

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        client_ip = request.client.host
        
        # Check if IP is in the clients dict
        if client_ip in self.clients:
            last_time, count = self.clients[client_ip]
            if time.time() - last_time > self.period:
                # Reset if period has passed
                self.clients[client_ip] = (time.time(), 1)
            elif count >= self.calls:
                raise HTTPException(
                    status_code=429,
                    detail="Too many requests"
                )
            else:
                # Increment count
                self.clients[client_ip] = (last_time, count + 1)
        else:
            # Add new client
            self.clients[client_ip] = (time.time(), 1)
        
        return await call_next(request)

security_bearer = HTTPBearer(
    auto_error=True,
    scheme_name="Bearer"
)

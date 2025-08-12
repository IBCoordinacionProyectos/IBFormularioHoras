"""
Módulo de dependencias para la inyección de dependencias.
"""
from typing import Generator
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import ValidationError
from sqlalchemy.orm import Session

from . import models, schemas
from .database import SessionLocal, supabase

# Configuración de seguridad
SECRET_KEY = "your-secret-key-here"  # Cambia esto por una clave secreta segura en producción
ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_db() -> Generator:
    """
    Proveedor de dependencia para obtener una sesión de base de datos.
    
    Yields:
        Session: Sesión de SQLAlchemy
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(token: str = Depends(oauth2_scheme)) -> schemas.EmployeeBase:
    """
    Obtiene el usuario actual basado en el token JWT.
    
    Args:
        token: Token JWT del encabezado de autorización
        
    Returns:
        EmployeeBase: Datos del empleado autenticado
        
    Raises:
        HTTPException: Si el token es inválido o el usuario no existe
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        employee_id: int = int(payload.get("sub"))
        if employee_id is None:
            raise credentials_exception
        token_data = schemas.TokenData(employee_id=employee_id)
    except (JWTError, ValidationError):
        raise credentials_exception
        
    # Aquí podrías obtener el usuario de la base de datos si es necesario
    # Por ahora, devolvemos un objeto básico con el ID
    return schemas.EmployeeBase(
        id=token_data.employee_id,
        name="",  # Estos valores deberían venir de la base de datos
        short_name=""
    )

def get_supabase():
    """
    Proveedor de dependencia para la instancia de Supabase.
    
    Returns:
        Client: Cliente de Supabase
    """
    return supabase

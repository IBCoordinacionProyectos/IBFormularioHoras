from fastapi import APIRouter, HTTPException, status, Request
from fastapi.responses import JSONResponse
from .. import crud, schemas
from passlib.context import CryptContext
import logging

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)

logger = logging.getLogger(__name__)

@router.post("/login", response_model=schemas.LoginResponse)
async def login(user_credentials: schemas.UserLogin, request: Request):
    try:
        # Log the login attempt
        logger.info(f"Login attempt for username: {user_credentials.username}")
        
        db_user = crud.get_user_by_username(username=user_credentials.username)

        if not db_user:
            logger.warning(f"User not found: {user_credentials.username}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Incorrect username or password",
            )

        # Check if password field exists and is not None
        user_password = db_user.get('password')
        if user_password is None:
            logger.warning(f"Password is None for user: {user_credentials.username}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Incorrect username or password",
            )

        # Verify password using passlib
        if not pwd_context.verify(user_credentials.password, user_password):
            logger.warning(f"Invalid password for user: {user_credentials.username}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Incorrect username or password",
            )

        # Check if id_members exists and is not None
        member_id = db_user.get('id_members')
        if member_id is None:
            logger.error(f"id_members is None for user: {user_credentials.username}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Empleado no encontrado",
            )

        member = crud.get_member_by_id(member_id=member_id)
        if not member:
            logger.error(f"Member not found for user: {user_credentials.username} with member_id: {member_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Empleado no encontrado",
            )

        logger.info(f"Successful login for user: {user_credentials.username}")
        return {
            "message": "Login successful",
            "employee_id": db_user.get('id_members'),
            "employee_name": member['name']
        }
    except HTTPException as e:
        # Re-raise HTTP exceptions but ensure CORS headers are added
        logger.warning(f"HTTP exception during login for user {user_credentials.username}: {e.detail}")
        raise
    except Exception as e:
        # Log the error with traceback
        logger.error(f"Unexpected error during login for user {user_credentials.username}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )

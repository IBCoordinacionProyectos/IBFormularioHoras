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

        # Get user from database
        try:
            db_user = crud.get_user_by_username(username=user_credentials.username)
        except Exception as db_e:
            logger.error(f"Database error getting user {user_credentials.username}: {db_e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error",
            )

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

        # Verify password - handle both hashed and plain text passwords
        password_valid = False
        
        # Handle bcrypt length limitation (72 bytes max) by truncating the input password
        input_password = user_credentials.password
        if len(input_password.encode('utf-8')) > 72:
            # Truncate to 72 bytes while preserving UTF-8 character boundaries
            input_bytes = input_password.encode('utf-8')[:72]
            input_password = input_bytes.decode('utf-8', errors='ignore')
        
        try:
            # First try to verify as a bcrypt hash
            password_valid = pwd_context.verify(input_password, user_password)
        except Exception as pwd_e:
            # If bcrypt verification fails, check if it's a plain text password
            if "hash could not be identified" in str(pwd_e):
                # Plain text comparison
                password_valid = user_credentials.password == user_password
                if password_valid:
                    logger.info(f"User {user_credentials.username} is using plain text password - should be migrated to hashed")
            elif "password cannot be longer than 72 bytes" in str(pwd_e):
                logger.error(f"Password too long for bcrypt after truncation for user {user_credentials.username}: {pwd_e}", exc_info=True)
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Incorrect username or password",
                )
            else:
                logger.error(f"Password verification error for user {user_credentials.username}: {pwd_e}", exc_info=True)
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Incorrect username or password",
                )

        if not password_valid:
            logger.warning(f"Invalid password for user: {user_credentials.username}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Incorrect username or password",
            )

        # If password was plain text, hash it for future use
        if user_password == user_credentials.password:
            logger.info(f"Migrating plain text password to hash for user: {user_credentials.username}")
            try:
                # Ensure the password is within bcrypt length limits before hashing
                password_to_hash = user_credentials.password
                if len(password_to_hash.encode('utf-8')) > 72:
                    # Truncate to 72 bytes while preserving UTF-8 character boundaries
                    password_bytes = password_to_hash.encode('utf-8')[:72]
                    password_to_hash = password_bytes.decode('utf-8', errors='ignore')
                    logger.info(f"Truncated password for hashing (72-byte limit) for user: {user_credentials.username}")
                
                hashed_password = pwd_context.hash(password_to_hash)
                crud.update_user_password(user_credentials.username, hashed_password)
                logger.info(f"Successfully migrated password for user: {user_credentials.username}")
            except Exception as e:
                logger.error(f"Failed to migrate password for user {user_credentials.username}: {e}", exc_info=True)
        # Check if id_members exists and is not None
        member_id = db_user.get('id_members')
        if member_id is None:
            logger.error(f"id_members is None for user: {user_credentials.username}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Empleado no encontrado",
            )

        # Get member from database
        try:
            member = crud.get_member_by_id(member_id=member_id)
        except Exception as member_e:
            logger.error(f"Database error getting member {member_id} for user {user_credentials.username}: {member_e}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error",
            )

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

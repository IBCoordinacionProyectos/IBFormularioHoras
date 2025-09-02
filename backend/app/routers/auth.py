from fastapi import APIRouter, HTTPException, status
from .. import crud, schemas
from passlib.context import CryptContext

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)

@router.post("/login", response_model=schemas.LoginResponse)
def login(user_credentials: schemas.UserLogin):
    db_user = crud.get_user_by_username(username=user_credentials.username)
    
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Incorrect username or password",
        )
    
    # Verify password using passlib
    if not pwd_context.verify(user_credentials.password, db_user.get('password')):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Incorrect username or password",
        )

    member = crud.get_member_by_id(member_id=db_user.get('id_members'))
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empleado no encontrado",
        )

    return {
        "message": "Login successful",
        "employee_id": db_user.get('id_members'),
        "employee_name": member['name']
    }

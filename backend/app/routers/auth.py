from fastapi import APIRouter, HTTPException, status
from .. import crud, schemas

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
    
    # En una aplicación real, deberías usar una biblioteca de hash de contraseñas segura como passlib
    if user_credentials.password != db_user.get('password'):
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
        "status": "success", 
        "message": "Login successful", 
        "employee_id": db_user.get('id_members'),
        "employee_name": member['name']
    }
    return {"status": "success", "message": "Login successful", "employee_id": db_user.get('id_members')}

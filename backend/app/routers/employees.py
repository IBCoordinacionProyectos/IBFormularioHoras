from fastapi import APIRouter, HTTPException
from .. import crud

router = APIRouter()

@router.get("/")
def get_employees_endpoint():
    try:
        employees = crud.get_employees()
        return employees
    except Exception as e:
        raise HTTPException(500, f"Error retrieving employees: {str(e)}")
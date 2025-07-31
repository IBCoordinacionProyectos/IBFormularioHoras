# app/routers/daily_activities.py
from fastapi import APIRouter, Query, HTTPException
from .. import crud
from ..schemas import DailyActivity

router = APIRouter(redirect_slashes=False)

@router.get("", response_model=list[DailyActivity])
def get_daily_activities(
    date: str = Query(..., description="Fecha en formato YYYY-MM-DD"),
    employee_id: int = Query(..., description="ID del empleado")
):
    try:
        activities = crud.get_daily_activities(date, employee_id)
        return activities
    except Exception as e:
        raise HTTPException(500, f"Error al obtener actividades diarias: {str(e)}")
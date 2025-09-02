# hours.py
from fastapi import APIRouter, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address
import logging
logging.basicConfig(level=logging.DEBUG)
from .. import crud
from ..schemas import ReportedHourCreate, ReportedHourUpdate, ReportedHour, GroupedHour

limiter = Limiter(key_func=get_remote_address)

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/", response_model=ReportedHour)
@limiter.limit("20/minute")
def create_hour(request: Request, hour: ReportedHourCreate):
    logger.debug(f"Creando hora con: {hour}")
    try:
        return crud.create_reported_hour(hour)
    except HTTPException:
        raise
    except Exception as e:
        logger.exception("🔴 Error interno al crear hora")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{hour_id}", response_model=ReportedHour)
@limiter.limit("30/minute")
def update_hour(request: Request, hour_id: str, hour: ReportedHourUpdate):
    logger.info(f"--- Intentando actualizar hora ID: {hour_id} ---")
    logger.info(f"Datos recibidos: {hour.dict()}")
    try:
        updated_hour = crud.update_reported_hour(hour_id, hour)
        logger.info(f"Hora ID: {hour_id} actualizada exitosamente.")
        return updated_hour
    except ValueError as e:
        logger.error(f"Error de valor al actualizar hora ID: {hour_id} - {e}")
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Excepción inesperada al actualizar hora ID: {hour_id}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error interno al actualizar: {str(e)}")

@router.delete("/{hour_id}")
@limiter.limit("10/minute")
def delete_hour(request: Request, hour_id: str):
    try:
        deleted_hour_info = crud.delete_reported_hour(hour_id)
        return deleted_hour_info
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno al eliminar: {str(e)}")


@router.get("/grouped-by-employee", response_model=list[GroupedHour])
@limiter.limit("50/minute")
def get_grouped_hours_by_employee(request: Request, year: int, month: int):
    logger.info(f"▶ get_grouped_hours_by_employee | year={year} month={month}")
    try:
        grouped_data = crud.get_grouped_hours_by_employee(year, month)
        logger.info(f"Grouped hours by employee: {len(grouped_data)} records")
        return grouped_data
    except Exception as e:
        logger.error(f"Excepción inesperada al obtener horas agrupadas por empleado", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error interno al obtener horas agrupadas: {str(e)}")

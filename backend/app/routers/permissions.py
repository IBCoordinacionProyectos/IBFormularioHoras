"""
Módulo de rutas para la gestión de permisos.
"""
from datetime import date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status

from .. import schemas, crud_permissions
from ..database import supabase

router = APIRouter(
    prefix="/permissions",
    tags=["permissions"],
    responses={404: {"description": "No encontrado"}},
)

@router.post(
    "/", 
    response_model=schemas.ReportedPermission,
    status_code=status.HTTP_201_CREATED,
    summary="Crear un nuevo permiso",
    description="Crea un nuevo registro de permiso en el sistema."
)
async def create_permission(
    permission: schemas.ReportedPermissionCreate
):
    """
    Crea un nuevo permiso con los datos proporcionados.
    
    - **date**: Fecha del permiso (YYYY-MM-DD)
    - **employee_id**: ID del empleado
    - **project_code**: Código del proyecto
    - **phase**: Fase del proyecto
    - **discipline**: Disciplina
    - **activity**: Actividad
    - **hours**: Horas de permiso
    - **note**: Nota adicional (opcional)
    - **status**: Estado del permiso (opcional, por defecto 'Pendiente')
    - **response**: Respuesta del aprobador (opcional)
    """
    try:
        return crud_permissions.create_reported_permission(permission)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al crear el permiso: {str(e)}")

@router.put(
    "/{permission_id}",
    response_model=schemas.ReportedPermission,
    summary="Actualizar un permiso",
    description="Actualiza un permiso existente por su ID.",
    responses={
        200: {"description": "Permiso actualizado correctamente"},
        404: {"description": "Permiso no encontrado"},
        400: {"description": "Datos de entrada inválidos"}
    }
)
async def update_permission(
    permission_id: int,
    permission_update: schemas.ReportedPermissionUpdate
):
    """
    Actualiza un permiso existente.
    
    Solo se deben incluir los campos que se desean actualizar.
    """
    try:
        updated_permission = crud_permissions.update_reported_permission(permission_id, permission_update)
        if not updated_permission:
            raise HTTPException(status_code=404, detail=f"Permiso con ID {permission_id} no encontrado")
        return updated_permission
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al actualizar el permiso: {str(e)}")

@router.delete(
    "/{permission_id}",
    response_model=schemas.ReportedPermission,
    summary="Eliminar un permiso",
    description="Elimina un permiso por su ID.",
    responses={
        200: {"description": "Permiso eliminado correctamente"},
        404: {"description": "Permiso no encontrado"}
    }
)
async def delete_permission(
    permission_id: int
):
    """
    Elimina un permiso por su ID.
    
    Devuelve los datos del permiso eliminado.
    """
    try:
        deleted_permission = crud_permissions.delete_reported_permission(permission_id)
        if not deleted_permission:
            raise HTTPException(status_code=404, detail=f"Permiso con ID {permission_id} no encontrado")
        return deleted_permission
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al eliminar el permiso: {str(e)}")

@router.get(
    "/{permission_id}",
    response_model=schemas.ReportedPermission,
    summary="Obtener un permiso por ID",
    description="Obtiene los detalles de un permiso por su ID.",
    responses={
        200: {"description": "Permiso encontrado"},
        404: {"description": "Permiso no encontrado"}
    }
)
async def get_permission(
    permission_id: int
):
    """
    Obtiene los detalles de un permiso por su ID.
    """
    try:
        permission = crud_permissions.get_permission_by_id(permission_id)
        if not permission:
            raise HTTPException(status_code=404, detail=f"Permiso con ID {permission_id} no encontrado")
        return permission
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener el permiso: {str(e)}")

@router.get(
    "/employee/{employee_id}",
    response_model=List[schemas.ReportedPermission],
    summary="Obtener permisos por empleado",
    description="Obtiene todos los permisos de un empleado, opcionalmente filtrados por rango de fechas.",
    responses={
        200: {"description": "Lista de permisos del empleado"}
    }
)
async def get_employee_permissions(
    employee_id: int,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None
):
    """
    Obtiene todos los permisos de un empleado.
    
    Parámetros opcionales:
    - **start_date**: Fecha de inicio para filtrar (YYYY-MM-DD)
    - **end_date**: Fecha de fin para filtrar (YYYY-MM-DD)
    """
    try:
        return crud_permissions.get_permissions_by_employee(employee_id, start_date, end_date)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener los permisos: {str(e)}")

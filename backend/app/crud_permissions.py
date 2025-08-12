"""
Módulo con funciones CRUD para la gestión de permisos.
"""
from datetime import date, datetime, timezone
from typing import List, Optional
import logging

from .database import supabase
from . import schemas

logger = logging.getLogger(__name__)

def create_reported_permission(permission: schemas.ReportedPermissionCreate) -> dict:
    """
    Crea un nuevo registro de permiso en la base de datos.
    
    Args:
        permission: Datos del permiso a crear
        
    Returns:
        dict: El permiso creado con su ID asignado
        
    Raises:
        ValueError: Si hay un error al crear el permiso
    """
    try:
        now = datetime.now(timezone.utc)
        permission_data = permission.model_dump()
        
        # Convertir fechas a cadenas ISO
        if 'date' in permission_data and permission_data['date'] is not None:
            if isinstance(permission_data['date'], (date, datetime)):
                permission_data['date'] = permission_data['date'].isoformat()
                
        # Agregar marcas de tiempo
        permission_data['created_at'] = now.isoformat()
        permission_data['updated_at'] = now.isoformat()
        
        # Asegurarse de que los campos opcionales tengan valores por defecto
        if 'status' not in permission_data or not permission_data['status']:
            permission_data['status'] = 'Pendiente'
            
        logger.debug(f"Intentando insertar permiso con datos: {permission_data}")
        response = supabase.table("IB_Reported_permissions").insert(permission_data).execute()
        
        if not response.data:
            logger.error("No se recibieron datos al crear el permiso")
            raise ValueError("Error al crear el permiso: respuesta vacía del servidor")
            
        created_permission = response.data[0] if response.data else None
        if not created_permission:
            logger.error("No se pudo crear el permiso")
            raise ValueError("No se pudo crear el permiso")
            
        return created_permission
        
    except Exception as e:
        logger.error(f"Error al crear permiso: {str(e)}", exc_info=True)
        raise ValueError(f"Error al crear el permiso: {str(e)}")

def update_reported_permission(permission_id: int, permission_update: schemas.ReportedPermissionUpdate) -> Optional[dict]:
    """
    Actualiza un permiso existente.
    
    Args:
        permission_id: ID del permiso a actualizar
        permission_update: Datos a actualizar
        
    Returns:
        Optional[dict]: El permiso actualizado o None si no se encontró
        
    Raises:
        ValueError: Si hay un error al actualizar el permiso
    """
    try:
        update_data = {k: v for k, v in permission_update.model_dump(exclude_unset=True).items() if v is not None}
        if not update_data:
            raise ValueError("No se proporcionaron datos para actualizar")
            
        update_data['updated_at'] = datetime.now(timezone.utc).date().isoformat()
        
        response = (
            supabase
            .table("IB_Reported_permissions")
            .update(update_data)
            .eq("id", permission_id)
            .execute()
        )
        
        if not response.data:
            raise ValueError(f"No se encontró el permiso con ID {permission_id}")
            
        return response.data[0] if response.data else None
        
    except Exception as e:
        logger.error(f"Error al actualizar permiso: {str(e)}", exc_info=True)
        raise ValueError(f"Error al actualizar el permiso: {str(e)}")

def delete_reported_permission(permission_id: int) -> dict:
    """
    Elimina un permiso por su ID.
    
    Args:
        permission_id: ID del permiso a eliminar
        
    Returns:
        dict: Los datos del permiso eliminado
        
    Raises:
        ValueError: Si el permiso no existe o hay un error al eliminarlo
    """
    try:
        # Primero obtenemos el permiso para devolverlo después de eliminarlo
        response = (
            supabase
            .table("IB_Reported_permissions")
            .select("*")
            .eq("id", permission_id)
            .execute()
        )
        
        if not response.data:
            raise ValueError(f"No se encontró el permiso con ID {permission_id}")
            
        permission_data = response.data[0]
        
        # Ahora eliminamos el permiso
        delete_response = (
            supabase
            .table("IB_Reported_permissions")
            .delete()
            .eq("id", permission_id)
            .execute()
        )
        
        return permission_data
        
    except Exception as e:
        logger.error(f"Error al eliminar permiso: {str(e)}", exc_info=True)
        raise ValueError(f"Error al eliminar el permiso: {str(e)}")

def get_permission_by_id(permission_id: int) -> Optional[dict]:
    """
    Obtiene un permiso por su ID.
    
    Args:
        permission_id: ID del permiso a buscar
        
    Returns:
        Optional[dict]: Los datos del permiso o None si no se encuentra
        
    Raises:
        ValueError: Si hay un error al obtener el permiso
    """
    try:
        response = (
            supabase
            .table("IB_Reported_permissions")
            .select("*")
            .eq("id", permission_id)
            .execute()
        )
        
        if not response.data:
            return None
            
        return response.data[0] if response.data else None
        
    except Exception as e:
        logger.error(f"Error al obtener permiso: {str(e)}", exc_info=True)
        raise ValueError(f"Error al obtener el permiso: {str(e)}")

def get_permissions_by_employee(
    employee_id: int, 
    start_date: Optional[date] = None, 
    end_date: Optional[date] = None
) -> List[dict]:
    """
    Obtiene todos los permisos de un empleado, opcionalmente filtrados por rango de fechas.
    
    Args:
        employee_id: ID del empleado
        start_date: Fecha de inicio para filtrar (opcional)
        end_date: Fecha de fin para filtrar (opcional)
        
    Returns:
        List[dict]: Lista de permisos que coinciden con los criterios
        
    Raises:
        ValueError: Si hay un error al obtener los permisos
    """
    try:
        query = (
            supabase
            .table("IB_Reported_permissions")
            .select("*")
            .eq("employee_id", employee_id)
            .order("date", desc=True)
        )
        
        if start_date:
            query = query.gte("date", start_date.isoformat())
        if end_date:
            query = query.lte("date", end_date.isoformat())
            
        response = query.execute()
        
        return response.data if response.data else []
        
    except Exception as e:
        logger.error(f"Error al obtener permisos del empleado: {str(e)}", exc_info=True)
        raise ValueError(f"Error al obtener los permisos: {str(e)}")

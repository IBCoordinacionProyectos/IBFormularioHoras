# crud.py
from .database import supabase
from . import schemas
import uuid
from datetime import date, datetime
import logging

logger = logging.getLogger(__name__)

def get_project_by_code(project_code: str):
    clean_code = project_code.strip()
    response = (
        supabase
        .table("IB_Projects")
        .select("*")
        .eq("code", clean_code)
        .execute()
    )
    if not response.data:
        return None

    row = response.data[0]
    # Ajustar tipos para el esquema
    if isinstance(row.get("employee_id"), str):
        try:
            row["employee_id"] = int(row["employee_id"])
        except ValueError:
            pass
    if isinstance(row.get("hours"), str):
        try:
            row["hours"] = float(row["hours"])
        except ValueError:
            pass

    return row

def get_stages_by_project(project_code: str):
    clean_project_code = project_code.strip()
    response = (
        supabase
        .table("IB_Activities")
        .select("phase")
        .eq("project_code", clean_project_code)
        .execute()
    )
    return list({item["phase"] for item in response.data})

def get_projects():
    response = supabase.table("IB_Projects").select("*").execute()
    return response.data

def get_employees():
    response = supabase.table("IB_Members").select("*").execute()
    return response.data

def get_member_by_id(member_id: int):
    response = (
        supabase
        .table("IB_Members")
        .select("*")
        .eq("id", member_id)
        .execute()
    )
    if not response.data:
        return None

    row = response.data[0]
    # Ajustar tipos para el esquema
    if isinstance(row.get("employee_id"), str):
        try:
            row["employee_id"] = int(row["employee_id"])
        except ValueError:
            pass
    if isinstance(row.get("hours"), str):
        try:
            row["hours"] = float(row["hours"])
        except ValueError:
            pass

    return row

def get_all_activities():
    response = supabase.table("IB_Activities").select("*").execute()
    return response.data

def get_disciplines_by_stage(project_code: str, stage: str):
    clean_project_code = project_code.strip()
    clean_stage = stage.strip()
    response = (
        supabase
        .table("IB_Activities")
        .select("discipline")
        .eq("project_code", clean_project_code)
        .eq("phase", clean_stage)
        .execute()
    )
    return list({item["discipline"] for item in response.data})

def get_activities_by_discipline(project_code: str, stage: str, discipline: str):
    try:
        clean_project_code = " ".join(project_code.strip().split())
        clean_stage = " ".join(stage.strip().split())
        clean_discipline = " ".join(discipline.strip().split())

        response = (
            supabase
            .table("IB_Activities")
            .select("activity_id, activity")
            .eq("project_code", clean_project_code)
            .eq("phase", clean_stage)
            .eq("discipline", clean_discipline)
            .execute()
        )

        if not response.data:
            return []

        activities = []
        for item in response.data:
            activities.append({
                "id": item["activity_id"],
                "name": item["activity"]
            })
        return activities

    except Exception as e:
        logger.error(f"Error en get_activities_by_discipline: {e}", exc_info=True)
        raise

def get_user_by_username(username: str):
    response = (
        supabase
        .table("IB_Authentication")
        .select("*")
        .eq("user", username)
        .execute()
    )
    if not response.data:
        return None

    row = response.data[0]
    # Ajustar tipos para el esquema
    if isinstance(row.get("employee_id"), str):
        try:
            row["employee_id"] = int(row["employee_id"])
        except ValueError:
            pass
    if isinstance(row.get("hours"), str):
        try:
            row["hours"] = float(row["hours"])
        except ValueError:
            pass

    return row

def get_activity_id(project_code: str, phase: str, discipline: str, activity: str) -> int:
    """Obtiene el ID de una actividad específica."""
    response = (
        supabase
        .table("IB_Activities")
        .select("activity_id")
        .eq("project_code", project_code)
        .eq("phase", phase)
        .eq("discipline", discipline)
        .eq("activity", activity)
        .execute()
    )
    if not response.data:
        raise ValueError(
            f"No se encontró la actividad: {activity} en la fase '{phase}' "
            f"y disciplina '{discipline}' del proyecto '{project_code}'."
        )

    row = response.data[0]
    return int(row["activity_id"])

def create_reported_hour(hour: schemas.ReportedHourCreate):
    # 1. Validar que el proyecto existe
    project = get_project_by_code(hour.project_code)
    if not project:
        raise ValueError(f"Proyecto no encontrado: {hour.project_code}")

    # 2. Obtener el ID de la actividad
    activity_id = get_activity_id(
        hour.project_code, hour.phase, hour.discipline, hour.activity
    )

    # 3. Preparar los datos para la inserción
    data_to_insert = {
        "date": hour.date.isoformat(),
        "employee_id": str(hour.employee_id),
        "project_code": hour.project_code,
        "phase": hour.phase,
        "discipline": hour.discipline,
        "activity": hour.activity,
        "hours": str(hour.hours),
        "note": hour.note,
        "id": str(uuid.uuid4()),
    }

    # 4. Insertar en la base de datos
    response = supabase.table("IB_Reported_Hours").insert(data_to_insert).execute()
    error_info = getattr(response, "error", None)
    if error_info:
        logger.error(f"Supabase insert error: {error_info}")
    if not response.data:
        raise ValueError("Error al insertar el registro de horas en la base de datos.")

    row = response.data[0]
    # Ajustar tipos para el esquema
    if isinstance(row.get("employee_id"), str):
        try:
            row["employee_id"] = int(row["employee_id"])
        except ValueError:
            pass
    if isinstance(row.get("hours"), str):
        try:
            row["hours"] = float(row["hours"])
        except ValueError:
            pass

    return row

def update_reported_hour(hour_id: str, hour_update: schemas.ReportedHourUpdate):
    try:
        data_to_update = hour_update.dict(exclude_unset=True)

        # --- VALIDACIÓN AÑADIDA ---
        if "project_code" in data_to_update:
            project = get_project_by_code(data_to_update["project_code"])
            if not project:
                raise ValueError(
                    f"El proyecto con código {data_to_update['project_code']} no fue encontrado."
                )

        if "date" in data_to_update and data_to_update["date"]:
            data_to_update["date"] = data_to_update["date"].isoformat()

        response = (
            supabase
            .table("IB_Reported_Hours")
            .update(data_to_update)
            .eq("id", hour_id)
            .execute()
        )
        if not response.data:
            raise ValueError(f"No se encontró el registro con id {hour_id} para actualizar.")

        row = response.data[0]
        # Ajustar tipos para el esquema
        if isinstance(row.get("employee_id"), str):
            try:
                row["employee_id"] = int(row["employee_id"])
            except ValueError:
                pass
        if isinstance(row.get("hours"), str):
            try:
                row["hours"] = float(row["hours"])
            except ValueError:
                pass

        return row

    except Exception as e:
        logger.error(f"Error al actualizar el registro de horas: {e}", exc_info=True)
        raise

def delete_reported_hour(hour_id: str):
    try:
        response = (
            supabase
            .table("IB_Reported_Hours")
            .delete()
            .eq("id", hour_id)
            .execute()
        )
        if not response.data:
            raise ValueError(f"No se encontró el registro con id {hour_id} para eliminar.")

        row = response.data[0]
        # Ajustar tipos para el esquema
        if isinstance(row.get("employee_id"), str):
            try:
                row["employee_id"] = int(row["employee_id"])
            except ValueError:
                pass
        if isinstance(row.get("hours"), str):
            try:
                row["hours"] = float(row["hours"])
            except ValueError:
                pass

        return row

    except Exception as e:
        logger.error(f"Error al eliminar el registro de horas: {e}", exc_info=True)
        raise

def get_daily_activities(date: str, employee_id: int):
    """Devuelve las horas reportadas del día (YYYY-MM-DD) junto al nombre del proyecto."""
    logger.info("▶ get_daily_activities | date=%s employee_id=%s", date, employee_id)

    # 1. Traer horas del día para el empleado
    hours_resp = (
        supabase
        .table("IB_Reported_Hours")
        .select("*")
        .eq("date", date)
        .eq("employee_id", employee_id)
        .execute()
    )
    if not hours_resp.data:
        logger.info("Sin registros de horas para esos criterios")
        return []

    # 2. Obtener nombres de proyectos
    project_codes = list({h["project_code"] for h in hours_resp.data})
    proj_resp = (
        supabase
        .table("IB_Projects")
        .select("code, name")
        .in_("code", project_codes)
        .execute()
    )
    projects_map = {p["code"]: p["name"] for p in (proj_resp.data or [])}

    activities = []
    for row in hours_resp.data:
        # Convertir fecha string -> date para el esquema Pydantic
        try:
            row_date = datetime.fromisoformat(row["date"]).date()
        except ValueError:
            try:
                row_date = datetime.strptime(row["date"], "%d/%m/%Y").date()
            except ValueError:
                row_date = None

        activity = {
            **row,
            "date": row_date,
            "project_name": projects_map.get(row["project_code"], "Proyecto no encontrado"),
        }
        activities.append(activity)

    return activities

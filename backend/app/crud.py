# crud.py
from .database import supabase
from . import schemas
from .utils.validation import (
    validate_project_code,
    validate_phase_discipline_activity,
    validate_hours,
    validate_date,
    validate_employee_id,
    validate_note,
    sanitize_string
)
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
    # 1. Validar y sanitizar los datos de entrada
    validated_project_code = validate_project_code(hour.project_code)
    validated_phase = validate_phase_discipline_activity(hour.phase, "Phase")
    validated_discipline = validate_phase_discipline_activity(hour.discipline, "Discipline")
    validated_activity = validate_phase_discipline_activity(hour.activity, "Activity")
    validated_hours = validate_hours(hour.hours)
    validated_date = validate_date(hour.date.isoformat())
    validated_employee_id = validate_employee_id(hour.employee_id)
    validated_note = validate_note(hour.note)

    # 2. Validar que el proyecto existe
    project = get_project_by_code(validated_project_code)
    if not project:
        raise ValueError(f"Proyecto no encontrado: {validated_project_code}")

    # 3. Obtener el ID de la actividad
    activity_id = get_activity_id(
        validated_project_code, validated_phase, validated_discipline, validated_activity
    )

    # 4. Preparar los datos para la inserción
    data_to_insert = {
        "date": validated_date,
        "employee_id": str(validated_employee_id),
        "project_code": validated_project_code,
        "phase": validated_phase,
        "discipline": validated_discipline,
        "activity": validated_activity,
        "hours": str(validated_hours),
        "note": validated_note,
        "id": str(uuid.uuid4()),
    }

    # 5. Insertar en la base de datos
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

        # Validar y sanitizar los datos de entrada si están presentes
        if "project_code" in data_to_update:
            data_to_update["project_code"] = validate_project_code(data_to_update["project_code"])
            project = get_project_by_code(data_to_update["project_code"])
            if not project:
                raise ValueError(
                    f"El proyecto con código {data_to_update['project_code']} no fue encontrado."
                )

        if "phase" in data_to_update:
            data_to_update["phase"] = validate_phase_discipline_activity(data_to_update["phase"], "Phase")

        if "discipline" in data_to_update:
            data_to_update["discipline"] = validate_phase_discipline_activity(data_to_update["discipline"], "Discipline")

        if "activity" in data_to_update:
            data_to_update["activity"] = validate_phase_discipline_activity(data_to_update["activity"], "Activity")

        if "hours" in data_to_update:
            data_to_update["hours"] = validate_hours(data_to_update["hours"])

        if "date" in data_to_update and data_to_update["date"]:
            data_to_update["date"] = validate_date(data_to_update["date"].isoformat())

        if "employee_id" in data_to_update:
            data_to_update["employee_id"] = validate_employee_id(data_to_update["employee_id"])

        if "note" in data_to_update:
            data_to_update["note"] = validate_note(data_to_update["note"])

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


def get_grouped_hours_by_employee(year: int, month: int):
    """Fetch records from IB_Reported_Hours for a specific year and month, grouped by employee, summing hours per day."""
    logger.info(f"▶ get_grouped_hours_by_employee | year={year} month={month}")
    
    # Calculate the start and end date for the given month
    from datetime import date
    import calendar
    
    start_date = date(year, month, 1)
    last_day = calendar.monthrange(year, month)[1]
    end_date = date(year, month, last_day)
    
    # 1. Fetch records from IB_Reported_Hours for the specific month
    hours_resp = (
        supabase
        .table("IB_Reported_Hours")
        .select("*")
        .gte("date", start_date.isoformat())
        .lte("date", end_date.isoformat())
        .execute()
    )
    
    if not hours_resp.data:
        logger.info("No records found in IB_Reported_Hours")
        return []
    
    # 2. Fetch all employees to get their short names
    employees_resp = supabase.table("IB_Members").select("id, name, short_name").execute()
    employees_map = {emp["id"]: {"name": emp["name"], "short_name": emp["short_name"]} for emp in employees_resp.data}
    
    # 3. Process and group the data
    grouped_data = {}
    
    for row in hours_resp.data:
        # Extract date and employee_id
        date = row.get("date")
        employee_id = row.get("employee_id")
        
        # Convert employee_id to int for lookup if it's a string
        employee_id_key = employee_id
        if isinstance(employee_id, str):
            try:
                employee_id_key = int(employee_id)
            except ValueError:
                # Skip records with invalid employee_id
                continue
        
        # Get employee info
        employee_info = employees_map.get(employee_id_key)
        
        # Skip records with missing employee data
        if not employee_info:
            continue
        
        # Create a unique key for grouping
        key = (date, employee_id)
        
        # Convert hours to float
        hours = row.get("hours", 0)
        if isinstance(hours, str):
            try:
                hours = float(hours)
            except ValueError:
                hours = 0
        elif not isinstance(hours, (int, float)):
            hours = 0
        
        # Add to grouped data
        if key in grouped_data:
            grouped_data[key]["hours"] += hours
        else:
            grouped_data[key] = {
                "date": date,
                "employee_id": str(employee_id),
                "short_name": employee_info["short_name"],
                "hours": hours
            }
    
    # 4. Convert to list format
    result = list(grouped_data.values())
    
    logger.info(f"Grouped hours by employee: {len(result)} records")
    return result

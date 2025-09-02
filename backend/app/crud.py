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

def get_monthly_hours_report(year: int, month: int):
    """Devuelve un reporte de horas mensuales agrupadas por colaborador."""
    logger.info("▶ get_monthly_hours_report | year=%s month=%s", year, month)
    
    # Formatear las fechas para el rango del mes
    from datetime import date
    import calendar
    
    # Primer y último día del mes
    start_date = date(year, month, 1)
    last_day = calendar.monthrange(year, month)[1]
    end_date = date(year, month, last_day)
    
    # 1. Traer todas las horas del mes
    hours_resp = (
        supabase
        .table("IB_Reported_Hours")
        .select("*")
        .gte("date", start_date.isoformat())
        .lte("date", end_date.isoformat())
        .order("date", desc=False)
        .execute()
    )
    
    if not hours_resp.data:
        logger.info("Sin registros de horas para el mes especificado")
        return []
    
    # 2. Obtener todos los empleados
    employees_resp = supabase.table("IB_Members").select("id, name, short_name").execute()
    employees_map = {emp["id"]: {"name": emp["name"], "short_name": emp["short_name"]} for emp in employees_resp.data}
    
    # 3. Procesar y agrupar los datos
    monthly_report = []
    for row in hours_resp.data:
        # Convertir fecha string -> date para el esquema Pydantic
        try:
            row_date = datetime.fromisoformat(row["date"]).date()
        except ValueError:
            try:
                row_date = datetime.strptime(row["date"], "%d/%m/%Y").date()
            except ValueError:
                row_date = None
                
        # Obtener información del empleado
        employee_info = employees_map.get(row["employee_id"], {"name": f"Empleado {row['employee_id']}", "short_name": f"E{row['employee_id']}"})
        
        # Asegurarse de que las horas sean un número
        hours = row.get("hours", 0)
        if isinstance(hours, str):
            try:
                hours = float(hours)
            except ValueError:
                hours = 0
        elif not isinstance(hours, (int, float)):
            hours = 0
        
        report_entry = {
            **row,
            "date": row_date,
            "employee_name": employee_info["name"],
            "employee_short_name": employee_info["short_name"],
            "hours": hours
        }
        monthly_report.append(report_entry)
    
    return monthly_report

def get_monthly_hours_matrix(year: int, month: int):
    """Devuelve un reporte de horas mensuales en formato matriz (colaboradores x días)."""
    logger.info("▶ get_monthly_hours_matrix | year=%s month=%s", year, month)
    
    # Formatear las fechas para el rango del mes
    from datetime import date
    import calendar
    
    # Primer y último día del mes
    start_date = date(year, month, 1)
    last_day = calendar.monthrange(year, month)[1]
    end_date = date(year, month, last_day)
    
    # 1. Traer todas las horas del mes
    hours_resp = (
        supabase
        .table("IB_Reported_Hours")
        .select("*")
        .gte("date", start_date.isoformat())
        .lte("date", end_date.isoformat())
        .order("date", desc=False)
        .execute()
    )
    
    if not hours_resp.data:
        logger.info("Sin registros de horas para el mes especificado")
        return {"employees": [], "days": [], "matrix": [], "totals": {"rows": [], "cols": []}}
    
    # 2. Obtener todos los empleados
    employees_resp = supabase.table("IB_Members").select("id, name, short_name").execute()
    employees_map = {emp["id"]: {"name": emp["name"], "short_name": emp["short_name"]} for emp in employees_resp.data}
    
    # 3. Crear estructura de días del mes
    days_in_month = [date(year, month, day) for day in range(1, last_day + 1)]
    days_str = [day.strftime("%Y-%m-%d") for day in days_in_month]
    
    # 4. Inicializar matriz de horas
    employee_ids = list(employees_map.keys())
    employee_names = [employees_map[emp_id]["name"] for emp_id in employee_ids]
    employee_short_names = [employees_map[emp_id]["short_name"] for emp_id in employee_ids]
    
    # Crear diccionario para almacenar horas por empleado y día
    hours_matrix = {}
    for emp_id in employee_ids:
        hours_matrix[emp_id] = {day: 0.0 for day in days_str}
    
    # 5. Llenar la matriz con los datos reales
    for row in hours_resp.data:
        # Convertir fecha string -> date para el esquema Pydantic
        try:
            row_date = datetime.fromisoformat(row["date"]).date()
        except ValueError:
            try:
                row_date = datetime.strptime(row["date"], "%d/%m/%Y").date()
            except ValueError:
                row_date = None
                
        if row_date is None:
            continue
            
        date_str = row_date.strftime("%Y-%m-%d")
        
        # Obtener información del empleado
        employee_id = row["employee_id"]
        
        # Asegurarse de que las horas sean un número
        hours = row.get("hours", 0)
        if isinstance(hours, str):
            try:
                hours = float(hours)
            except ValueError:
                hours = 0
        elif not isinstance(hours, (int, float)):
            hours = 0
        
        # Agregar horas a la matriz
        if employee_id in hours_matrix and date_str in hours_matrix[employee_id]:
            hours_matrix[employee_id][date_str] += hours
    
    # 6. Convertir la matriz a formato de lista para la respuesta
    matrix_data = []
    row_totals = []
    
    for i, emp_id in enumerate(employee_ids):
        row_data = []
        row_total = 0.0
        
        for day in days_str:
            day_hours = hours_matrix[emp_id][day]
            row_data.append(round(day_hours, 1))
            row_total += day_hours
            
        matrix_data.append(row_data)
        row_totals.append(round(row_total, 1))
    
    # 7. Calcular totales por columna (día)
    col_totals = []
    for j, day in enumerate(days_str):
        col_total = 0.0
        for i, emp_id in enumerate(employee_ids):
            col_total += hours_matrix[emp_id][day]
        col_totals.append(round(col_total, 1))
    
    # 8. Formatear días para mostrar
    days_formatted = [day.split("-")[2] for day in days_str]  # Solo el número del día
    
    return {
        "employees": [
            {"id": emp_id, "name": employee_names[i], "short_name": employee_short_names[i]}
            for i, emp_id in enumerate(employee_ids)
        ],
        "days": days_formatted,
        "matrix": matrix_data,
        "totals": {
            "rows": row_totals,
            "cols": col_totals
        }
    }

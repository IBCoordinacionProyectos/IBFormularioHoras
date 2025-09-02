// src/api/horasApi.ts
import axios from 'axios';

export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://backend.yeisonduque.top';

/* =========================
   Tipos base (ajusta si quieres)
   ========================= */
export interface DailyActivity {
  id: string;
  date: string;              // "YYYY-MM-DD"
  employee_id: number;
  project_code: string;
  project_name: string;
  phase: string;
  discipline: string;
  activity: string;
  hours: number;
  note?: string;
}

export interface HourData {
  id?: string;               // <- presente SOLO al editar
  project_code: string;
  phase: string;
  discipline: string;
  activity: string;
  hours: number | string;
  date: string;              // "YYYY-MM-DD"
  employee_id?: number | string; // requerido en creación
  note?: string;
}

/* =========================
   Helpers
   ========================= */
const normalizeHours = (h: number | string | undefined) =>
  typeof h === 'string' ? parseFloat(h.replace(',', '.')) : (h ?? 0);

// Para creación (POST) - incluye date
const sanitizeCreate = (data: any) => ({
  project_code: String(data.project_code ?? ''),
  phase: String(data.phase ?? ''),
  discipline: String(data.discipline ?? ''),
  activity: String(data.activity ?? ''),
  hours: typeof data.hours === 'string' ? parseFloat(data.hours.replace(',', '.')) : Number(data.hours ?? 0),
  date: String(data.date ?? ''), // En POST sí va date
  employee_id: typeof data.employee_id === 'string' ? parseInt(data.employee_id, 10) : Number(data.employee_id),
  note: data.note ? String(data.note) : '',
});

// Para actualización (PUT) - sin date y sin campos no editables
const sanitizeUpdate = (data: any) => {
  // Extraer campos no permitidos en el update
  const { date, id, employee_id, project_name, ...rest } = data;
  return {
    ...rest,
    project_code: String(rest.project_code ?? ''),
    phase: String(rest.phase ?? ''),
    discipline: String(rest.discipline ?? ''),
    activity: String(rest.activity ?? ''),
    hours: typeof rest.hours === 'string' ? parseFloat(rest.hours.replace(',', '.')) : Number(rest.hours ?? 0),
    note: rest.note ? String(rest.note) : '',
  };
};

const encodeId = (id: string | number) => encodeURIComponent(String(id));

/* =========================
   Crear/Actualizar (botón Guardar/Actualizar)
   ========================= */
export const submitHours = async (data: any) => {
  try {
    if (data?.id) {
      // UPDATE (PUT)
      const id = encodeURIComponent(String(data.id));
      const body = sanitizeUpdate(data);
      console.log('Enviando datos de actualización:', { hourId: id, payload: body });
      const res = await axios.put(`${API_BASE_URL}/hours/${id}`, body);
      return res.data;
    } else {
      // CREATE (POST)
      const body = sanitizeCreate(data);
      console.log('Creando nueva hora:', body);
      const res = await axios.post(`${API_BASE_URL}/hours/`, body);
      return res.data;
    }
  } catch (error: any) {
    console.error('Error al enviar las horas:', error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Detalles del error (submitHours):', error.response.data);
      const detail = (error.response.data as any)?.detail ?? (error.response.data as any)?.message;
      if (detail) throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
    }
    throw error;
  }
};

/* =========================
   Update/Delete directos (si los usas en otros lados)
   ========================= */
export const updateHour = async (hourId: string | number, data: any) => {
  try {
    const id = encodeURIComponent(String(hourId));
    // Quitar campos que el backend no acepta en PUT
    const { date: _dropDate, id: _dropId, employee_id: _dropEmp, project_name: _dropPN, ...rest } = data ?? {};
    const body = sanitizeUpdate(rest);
    console.log('Enviando datos de actualización:', { hourId: id, payload: body });
    const res = await axios.put(`${API_BASE_URL}/hours/${id}`, body);
    return res.data;
  } catch (error: any) {
    console.error(`Error al actualizar la hora ${hourId}:`, error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Detalles del error (updateHour):', error.response.data);
      const detail = (error.response.data as any)?.detail ?? (error.response.data as any)?.message;
      if (detail) throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
    }
    throw error;
  }
};

export const deleteHour = async (hourId: string | number) => {
  if (!hourId) throw new Error('hourId vacío para DELETE');
  const id = encodeURIComponent(String(hourId)); // ← NUNCA Number(...)
  console.log('DELETE /hours/', id);
  try {
    const res = await axios.delete(`${API_BASE_URL}/hours/${id}`);
    return res.data;
  } catch (error: any) {
    console.error(`Error al eliminar el registro de horas ${hourId}:`, error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Detalles del error (deleteHour):', error.response.data);
      const detail = (error.response.data as any)?.detail ?? (error.response.data as any)?.message;
      if (detail) throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
    }
    throw error;
  }
};

/* =========================
   Catálogos / dependencias
   ========================= */
export const getProjects = async () => {
  const res = await axios.get(`${API_BASE_URL}/projects/`);
  return res.data;
};

export const getEmployees = async () => {
  const res = await axios.get(`${API_BASE_URL}/employees/`);
  return res.data;
};

export const getProjectStages = async (projectCode: string) => {
  const res = await axios.get(
    `${API_BASE_URL}/activities/project/${encodeURIComponent(projectCode)}/stages`
  );
  return res.data;
};

export const getDisciplinesByStage = async (projectCode: string, stage: string) => {
  const res = await axios.get(
    `${API_BASE_URL}/activities/${encodeURIComponent(projectCode)}::${encodeURIComponent(stage)}/disciplines`
  );
  return res.data;
};

export const getActivitiesByDiscipline = async (
  projectCode: string,
  stage: string,
  discipline: string
) => {
  const res = await axios.get(
    `${API_BASE_URL}/activities/${encodeURIComponent(projectCode)}::${encodeURIComponent(stage)}::${encodeURIComponent(discipline)}/activities`
  );
  return res.data;
};

/* =========================
   Consultas de horas
   ========================= */
export const getDailyActivities = async (
  date: Date | string,
  employeeId: number | string
): Promise<DailyActivity[]> => {
  const dateStr = date instanceof Date ? date.toISOString().slice(0, 10) : String(date);
  const empId =
    typeof employeeId === 'string' ? parseInt(employeeId, 10) : Number(employeeId);

  const res = await axios.get<DailyActivity[]>(`${API_BASE_URL}/daily-activities`, {
    params: { date: dateStr, employee_id: empId },
    validateStatus: (s) => s >= 200 && s < 300,
  });
  return res.data || [];
};

/* =========================
   Auth (si lo usas)
   ========================= */
export const loginUser = async (credentials: any) => {
  const res = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
  return res.data;
};

/* =========================
   Reportes
   ========================= */
export interface MonthlyReportEntry {
  id: string;
  date: string;              // "YYYY-MM-DD"
  employee_id: number;
  employee_name: string;
  employee_short_name: string;
  project_code: string;
  phase: string;
  discipline: string;
  activity: string;
  hours: number;
  note?: string;
}

export const getMonthlyHoursReport = async (year: number, month: number): Promise<MonthlyReportEntry[]> => {
  try {
    const res = await axios.get<MonthlyReportEntry[]>(`${API_BASE_URL}/hours/monthly-report/${year}/${month}`);
    return res.data || [];
  } catch (error: any) {
    console.error(`Error al obtener el reporte mensual de horas para ${year}-${month}:`, error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Detalles del error (getMonthlyHoursReport):', error.response.data);
      const detail = (error.response.data as any)?.detail ?? (error.response.data as any)?.message;
      if (detail) throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
    }
    throw error;
  }
};

export interface MonthlyMatrixData {
  employees: Array<{
    id: number;
    name: string;
    short_name: string;
  }>;
  days: string[];
  matrix: number[][];
  totals: {
    rows: number[];
    cols: number[];
  };
}

export const getMonthlyHoursMatrix = async (year: number, month: number): Promise<MonthlyMatrixData> => {
  try {
    const res = await axios.get<MonthlyMatrixData>(`${API_BASE_URL}/hours/monthly-matrix/${year}/${month}`);
    return res.data || { employees: [], days: [], matrix: [], totals: { rows: [], cols: [] } };
  } catch (error: any) {
    console.error(`Error al obtener el reporte mensual de horas en formato matriz para ${year}-${month}:`, error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Detalles del error (getMonthlyHoursMatrix):', error.response.data);
      const detail = (error.response.data as any)?.detail ?? (error.response.data as any)?.message;
      if (detail) throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
    }
    throw error;
  }
};

export interface GroupedHour {
  date: string;
  employee_id: string;
  short_name: string;
  hours: number;
}

export const getGroupedHoursByEmployee = async (year: number, month: number): Promise<GroupedHour[]> => {
  try {
    const res = await axios.get<GroupedHour[]>(`${API_BASE_URL}/hours/grouped-by-employee`, {
      params: { year, month }
    });
    return res.data || [];
  } catch (error: any) {
    console.error(`Error al obtener las horas agrupadas por empleado para ${year}-${month}:`, error);
    if (axios.isAxiosError(error) && error.response) {
      console.error('Detalles del error (getGroupedHoursByEmployee):', error.response.data);
      const detail = (error.response.data as any)?.detail ?? (error.response.data as any)?.message;
      if (detail) throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
    }
    throw error;
  }
};

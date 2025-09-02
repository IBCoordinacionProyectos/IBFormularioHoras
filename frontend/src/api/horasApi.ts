// src/api/horasApi.ts
import axios from 'axios';

// Security: Configure axios with security best practices
axios.defaults.timeout = 30000; // 30 second timeout
axios.defaults.maxRedirects = 5; // Limit redirects
axios.defaults.validateStatus = (status) => status >= 200 && status < 300;

// Additional security headers
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.headers.common['X-Content-Type-Options'] = 'nosniff';

// CSRF protection for non-GET requests
axios.interceptors.request.use((config) => {
  if (config.method && !['get', 'head', 'options'].includes(config.method.toLowerCase())) {
    // Add CSRF token if available
    const csrfToken = localStorage.getItem('csrf_token');
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
  }
  return config;
});

// Input validation helpers
const isValidUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    // Only allow HTTPS in production
    const isProduction = (process as any).env?.NODE_ENV === 'production';
    if (isProduction && parsedUrl.protocol !== 'https:') {
      return false;
    }
    // Prevent SSRF by only allowing specific domains
    const allowedDomains = [
      'backend.yeisonduque.top',
      'localhost',
      '127.0.0.1'
    ];
    return allowedDomains.some(domain =>
      parsedUrl.hostname === domain || parsedUrl.hostname.endsWith('.' + domain)
    );
  } catch {
    return false;
  }
};

const sanitizeString = (input: string, maxLength: number = 1000): string => {
  if (typeof input !== 'string') return '';
  // Remove potentially dangerous characters and limit length
  return input
    .slice(0, maxLength)
    .replace(/[<>'"&]/g, '') // Remove HTML injection chars
    .replace(/[\x00-\x1F\x7F]/g, ''); // Remove control characters
};

// Enhanced input validation
const validateInput = (input: any, type: string, maxLength: number = 1000): string => {
  if (input === null || input === undefined) return '';

  const str = String(input).trim();

  // Length validation
  if (str.length > maxLength) {
    throw new Error(`${type} exceeds maximum length of ${maxLength} characters`);
  }

  // Pattern validation based on type
  switch (type) {
    case 'project_code':
      if (!/^[A-Z0-9_\- .()/]+$/i.test(str)) {
        throw new Error('Project code contains invalid characters');
      }
      break;
    case 'phase':
    case 'discipline':
    case 'activity':
      // Allow letters, numbers, spaces, hyphens, underscores, parentheses, forward slashes, and accented characters
      if (!/^[A-Za-z0-9\s\-_()/ÁÉÍÓÚáéíóúÑñ]+$/i.test(str)) {
        throw new Error(`${type} contains invalid characters`);
      }
      break;
    case 'hours':
      const num = parseFloat(str.replace(',', '.'));
      if (isNaN(num) || num < 0 || num > 24) {
        throw new Error('Hours must be a valid number between 0 and 24');
      }
      return num.toString();
    case 'date':
      if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        throw new Error('Date must be in YYYY-MM-DD format');
      }
      break;
    case 'employee_id':
      const empId = parseInt(str, 10);
      if (isNaN(empId) || empId <= 0) {
        throw new Error('Employee ID must be a positive integer');
      }
      return empId.toString();
  }

  return sanitizeString(str, maxLength);
};

export const API_BASE_URL = (process as any).env?.REACT_APP_API_BASE_URL || 'https://backend.yeisonduque.top';

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
const sanitizeCreate = (data: any) => {
  try {
    return {
      project_code: validateInput(data.project_code, 'project_code', 50),
      phase: validateInput(data.phase, 'phase', 100),
      discipline: validateInput(data.discipline, 'discipline', 100),
      activity: validateInput(data.activity, 'activity', 200),
      hours: validateInput(data.hours, 'hours'),
      date: validateInput(data.date, 'date'),
      employee_id: validateInput(data.employee_id, 'employee_id'),
      note: data.note ? validateInput(data.note, 'note', 500) : '',
    };
  } catch (error) {
    throw new Error(`Validation error in create data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Para actualización (PUT) - sin date y sin campos no editables
const sanitizeUpdate = (data: any) => {
  try {
    // Extraer campos no permitidos en el update
    const { date, id, employee_id, project_name, ...rest } = data;
    return {
      project_code: validateInput(rest.project_code, 'project_code', 50),
      phase: validateInput(rest.phase, 'phase', 100),
      discipline: validateInput(rest.discipline, 'discipline', 100),
      activity: validateInput(rest.activity, 'activity', 200),
      hours: validateInput(rest.hours, 'hours'),
      note: rest.note ? validateInput(rest.note, 'note', 500) : '',
    };
  } catch (error) {
    throw new Error(`Validation error in update data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
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

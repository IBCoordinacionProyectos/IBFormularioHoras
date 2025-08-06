// horasApi.ts
import axios from 'axios';

const API_BASE_URL = 'http://backend.yeisonduque.top/';

export const submitHours = async (data: any) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/hours/`, data);
        return response.data;
    } catch (error) {
        console.error('Error al enviar las horas:', error);
        throw error;
    }
};

export const getProjects = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/projects/`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener proyectos:', error);
        throw error;
    }
};

export const getEmployees = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/employees/`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener empleados:', error);
        throw error;
    }
};

export const getDisciplinesByStage = async (projectCode: string, stage: string) => {
  try {
    const params = [
      encodeURIComponent(projectCode),
      encodeURIComponent(stage)
    ].join('::');

    const response = await axios.get(
      `${API_BASE_URL}/activities/${params}/disciplines`
    );
    return response.data;
  } catch (error) {
    console.error(`Error al obtener disciplinas para el proyecto ${projectCode}, etapa ${stage}:`, error);
    throw error;
  }
};

export const getActivitiesByDiscipline = async (
  projectCode: string, 
  stage: string, 
  discipline: string
) => {
  try {
    const params = [
      encodeURIComponent(projectCode),
      encodeURIComponent(stage),
      encodeURIComponent(discipline)
    ].join('::');
    
    const response = await axios.get(
      `${API_BASE_URL}/activities/${params}/activities`
    );
    return response.data;
  } catch (error) {
    console.error(`Error al obtener actividades para el proyecto ${projectCode}, etapa ${stage}, disciplina ${discipline}:`, error);
    throw error;
  }
};

export const getDailyActivities = async (date: string, employeeId: number) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/daily-activities`, {
            params: { date, employee_id: employeeId }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching daily activities:', error);
        throw error;
    }
};

// horasApi.ts
export const getProjectStages = async (projectCode: string) => {
  try {
    const encodedProjectCode = encodeURIComponent(projectCode);
    // Usa el nuevo endpoint en activities
    const response = await axios.get(
      `${API_BASE_URL}/activities/project/${encodedProjectCode}/stages`
    );
    return response.data;
  } catch (error) {
    console.error(`Error al obtener etapas para el proyecto ${projectCode}:`, error);
    throw error;
  }
};

export const updateHour = async (hourId: number, data: any) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/hours/${hourId}`, data);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar el registro de horas ${hourId}:`, error);
    throw error;
  }
};

export const deleteHour = async (hourId: number) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/hours/${hourId}`);
    return response.data;
  } catch (error) {
    console.error(`Error al eliminar el registro de horas ${hourId}:`, error);
    throw error;
  }
};

export const getProjectByCode = async (projectCode: string) => {
  try {
    const encodedProjectCode = encodeURIComponent(projectCode);
    const response = await axios.get(
      `${API_BASE_URL}/projects/${encodedProjectCode}`
    );
    return response.data;
  } catch (error) {
    console.error(`Error al obtener proyecto ${projectCode}:`, error);
    throw error;
  }
};

export const loginUser = async (credentials: any) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
        return response.data;
    } catch (error) {
        console.error('Error en el inicio de sesión:', error);
        throw error;
    }
};
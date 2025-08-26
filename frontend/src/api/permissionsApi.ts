import axios from 'axios';
import { API_BASE_URL } from './horasApi';

export interface Permission {
  id: string;
  date: string;
  employee_id: number;
  project_code: string;
  phase: string;
  discipline: string;
  activity: string;
  hours: number;
  note?: string;
  status: string;
  response?: string;
  created_at: string;
  updated_at: string;
}

export interface PermissionCreate {
  date: string;
  employee_id: number;
  project_code: string;
  phase: string;
  discipline: string;
  activity: string;
  hours: number;
  note?: string;
}

export interface Project {
  code: string;
  name: string;
}

// Helper functions
export const getProjects = async (): Promise<Project[]> => {
  const res = await axios.get(`${API_BASE_URL}/projects/`);
  return res.data;
};

export const getProjectStages = async (projectCode: string): Promise<string[]> => {
  const res = await axios.get(`${API_BASE_URL}/projects/${projectCode}/stages`);
  return res.data;
};

export const getDisciplinesByStage = async (projectCode: string, stage: string): Promise<string[]> => {
  const res = await axios.get(`${API_BASE_URL}/projects/${projectCode}/stages/${stage}/disciplines`);
  return res.data;
};

export const getActivitiesByDiscipline = async (projectCode: string, stage: string, discipline: string): Promise<string[]> => {
  const res = await axios.get(`${API_BASE_URL}/projects/${projectCode}/stages/${stage}/disciplines/${discipline}/activities`);
  return res.data;
};

// Sort helpers
export const sortAZ = (arr: string[]) =>
  [...arr].sort((a, b) => a.localeCompare(b, 'es', { numeric: true, sensitivity: 'base' }));

export const createPermission = async (permission: PermissionCreate): Promise<Permission> => {
  const res = await axios.post(`${API_BASE_URL}/permissions/`, permission);
  return res.data;
};

export const updatePermission = async (id: string, permission: Partial<PermissionCreate>): Promise<Permission> => {
  const res = await axios.put(`${API_BASE_URL}/permissions/${id}`, permission);
  return res.data;
};

export const deletePermission = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE_URL}/permissions/${id}`);
};

export const getPermissions = async (employeeId: number, startDate?: string, endDate?: string): Promise<Permission[]> => {
  const params = new URLSearchParams();
  if (employeeId) params.append('employee_id', employeeId.toString());
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  
  const res = await axios.get(`${API_BASE_URL}/permissions/?${params.toString()}`);
  return res.data;
};

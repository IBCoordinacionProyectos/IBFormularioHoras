// Tipos para los datos del formulario
export interface FormData {
  employee_id: string;
  project_code: string;
  phase: string;
  discipline: string;
  activity: string;
  hours: string;
  note: string;
}

// Tipos para los proyectos
export interface Project {
  code: string;
  name: string;
}

// Importar la interfaz DailyActivity desde la API
import { DailyActivity } from '../../../api/horasApi';

// Usar la interfaz DailyActivity como base para Activity
export type Activity = DailyActivity;

// Tipos para el estado de carga
export interface LoadingState {
  submit: boolean;
  projects: boolean;
  stages: boolean;
  disciplines: boolean;
  activities: boolean;
  dailyActivities: boolean;
  delete: string | null; // Cambiado a string | null para manejar IDs como strings
}

// Tipos para las props del componente principal
export interface FormularioHorasProps {
  onSuccess?: () => void;
  employeeId: number;
  employeeName: string;
  onLogout: () => void;
}

// Tipos para los selectores de formulario
export interface FormSelectProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  disabled: boolean;
  required?: boolean;
  className?: string;
}

// Tipos para el componente de lista de actividades
export interface ActivityListProps {
  activities: Activity[];
  loading: boolean;
  selectedDate: Date;
  onEdit: (activity: Activity) => void;
  onDelete: (id: string) => void; // Cambiado a string para manejar IDs como strings
  deleteLoadingId: string | null; // Cambiado a string | null
}

// Tipos para el componente de progreso de horas
export interface TotalHoursProgressProps {
  totalHours: number;
  targetHours: number;
  className?: string;
}

// Tipos para el componente de selector de fecha
export interface DateSelectorProps {
  selectedDate: Date;
  onSelect: (date: Date | undefined) => void;
  className?: string;
}

// Tipos para el hook de datos del proyecto
export interface ProjectDataHook {
  projects: Project[];
  stages: string[];
  disciplines: string[];
  activities: string[];
  loading: {
    projects: boolean;
    stages: boolean;
    disciplines: boolean;
    activities: boolean;
  };
  fetchProjects: () => Promise<void>;
  fetchStages: (projectCode: string) => Promise<string[]>;
  fetchDisciplines: (projectCode: string, stage: string) => Promise<string[]>;
  fetchActivities: (projectCode: string, stage: string, discipline: string) => Promise<string[]>;
}

// Tipos para el hook de actividades
export interface ActivitiesHook {
  dailyActivities: Activity[];
  loading: {
    dailyActivities: boolean;
    delete: string | null; // Cambiado a string | null
  };
  refreshDailyActivities: (date: Date | string, employeeId: string | number) => Promise<void>;
  handleDelete: (id: string, onSuccess?: () => void) => Promise<void>; // Cambiado a string
}

// Tipos para el hook de datos del formulario
export interface FormDataHook {
  formData: FormData;
  editingActivityId: string | null; // Cambiado a string | null
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  setEditingActivityId: React.Dispatch<React.SetStateAction<string | null>>; // Actualizado a string | null
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  resetForm: () => void;
  handleEditActivity: (activity: Activity) => Promise<void>;
}

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import Header from './Header';

import { toast } from 'sonner';
import {
  Calendar as CalendarIcon,
  Briefcase,
  Save,
  Pencil,
  ListChecks,
  ClipboardList,
  XCircle,
  PlusCircle,
  Loader2,
} from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from '../lib/utils';

import { FormSelect } from './formulario/FormSelect';
import { ActivityItem } from './formulario/ActivityItem';
import { ActivityListSkeleton } from './formulario/ActivityListSkeleton';
import { EmptyState } from './formulario/EmptyState';
import { TotalHoursProgress } from './formulario/TotalHoursProgress';

import {
  submitHours,
  getProjects,
  getProjectStages,
  getDisciplinesByStage,
  getActivitiesByDiscipline,
  getDailyActivities,
  deleteHour,
  updateHour,
} from '../api/horasApi';

// Props e interfaces
interface FormularioHorasProps {
  onSuccess: () => void;
  employeeId: number;
  employeeName: string;
  onLogout: () => void;
}

interface Project {
  code: string;
  name: string;
}

// Importar la interfaz DailyActivity desde horasApi
import { DailyActivity } from '../api/horasApi';

// Usar la interfaz DailyActivity en lugar de definir Activity
type Activity = DailyActivity;

const initialFormData = (employeeId: number) => ({
  employee_id: String(employeeId),
  project_code: '',
  phase: '',
  discipline: '',
  activity: '',
  hours: '',
  note: '',
});

const FormularioHoras: React.FC<FormularioHorasProps> = ({
  onSuccess,
  employeeId,
  employeeName,
  onLogout,
}) => {
  // State
  const [formData, setFormData] = useState(initialFormData(employeeId));
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dailyActivities, setDailyActivities] = useState<Activity[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stages, setStages] = useState<string[]>([]);
  const [disciplines, setDisciplines] = useState<string[]>([]);
  const [activities, setActivities] = useState<string[]>([]);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);

  // Loading
  const [loading, setLoading] = useState({
    submit: false,
    projects: true,
    stages: false,
    disciplines: false,
    activities: false,
    dailyActivities: true,
    delete: null as string | null, // ID de la actividad que se está eliminando o null
  });

  // Derivados
  const totalHoursToday = useMemo(
    () => dailyActivities.reduce((sum, a) => sum + a.hours, 0),
    [dailyActivities]
  );

  const selectedProjectName = useMemo(
    () => projects.find((p) => p.code === formData.project_code)?.name || '',
    [formData.project_code, projects]
  );

  // Normaliza horas: '1,5' -> 1.5
  const hoursNumber = useMemo(() => {
    const raw = String(formData.hours ?? '').replace(',', '.').trim();
    const n = Number(raw);
    return Number.isFinite(n) ? n : 0;
  }, [formData.hours]);

  // Validación booleana real
  const isFormValid = useMemo(() => {
    const required = [
      formData.project_code,
      formData.phase,
      formData.discipline,
      formData.activity,
    ];
    const allFilled = required.every((v) =>
      typeof v === 'string' ? v.trim().length > 0 : Boolean(v)
    );
    return allFilled && hoursNumber > 0;
  }, [formData.project_code, formData.phase, formData.discipline, formData.activity, hoursNumber]);

  // Fetchers
  const refreshDailyActivities = useCallback(async (date: Date, id: string) => {
    setLoading((prev) => ({ ...prev, dailyActivities: true }));
    try {
      const dateString = format(date, 'yyyy-MM-dd');
      const acts = await getDailyActivities(dateString, Number(id));
      setDailyActivities(acts);
    } catch (error) {
      toast.error('Error al cargar las actividades del día.');
      console.error(error);
    } finally {
      setLoading((prev) => ({ ...prev, dailyActivities: false }));
    }
  }, []);

  const fetchProjects = useCallback(async () => {
    setLoading((prev) => ({ ...prev, projects: true }));
    try {
      const projectData = await getProjects();
      setProjects(projectData);
    } catch (error) {
      toast.error('Error al cargar proyectos.');
      console.error(error);
    } finally {
      setLoading((prev) => ({ ...prev, projects: false }));
    }
  }, []);

  const fetchStages = useCallback(async (projectCode: string) => {
    if (!projectCode) return;
    
    setLoading((prev) => ({ ...prev, stages: true }));
    try {
      const stageData = await getProjectStages(projectCode);
      // Filtrar valores nulos o vacíos y convertir a string
      const validStages = stageData
        .filter((stage: any) => stage != null && String(stage).trim() !== '')
        .map(String);
      
      setStages(validStages);
      return validStages;
    } catch (error) {
      console.error('Error al cargar las etapas:', error);
      toast.error('Error al cargar las etapas del proyecto.');
      setStages([]);
      return [];
    } finally {
      setLoading((prev) => ({ ...prev, stages: false }));
    }
  }, []);

  const fetchDisciplines = useCallback(async (projectCode: string, stage: string) => {
    if (!projectCode || !stage) {
      setDisciplines([]);
      return [];
    }
    
    setLoading((prev) => ({ ...prev, disciplines: true }));
    try {
      const disciplineData = await getDisciplinesByStage(projectCode, stage);
      // Filtrar valores nulos o vacíos y convertir a string
      const validDisciplines = disciplineData
        .filter((discipline: any) => discipline != null && String(discipline).trim() !== '')
        .map(String);
      
      setDisciplines(validDisciplines);
      return validDisciplines;
    } catch (error) {
      console.error('Error al cargar las disciplinas:', error);
      toast.error('Error al cargar las disciplinas.');
      setDisciplines([]);
      return [];
    } finally {
      setLoading((prev) => ({ ...prev, disciplines: false }));
    }
  }, []);

  const fetchActivities = useCallback(
    async (projectCode: string, stage: string, discipline: string) => {
      if (!projectCode || !stage || !discipline) {
        setActivities([]);
        return [];
      }
      
      setLoading((prev) => ({ ...prev, activities: true }));
      try {
        const activityData = await getActivitiesByDiscipline(projectCode, stage, discipline);
        // Filtrar valores nulos o vacíos y convertir a string
        const validActivities = activityData
          .filter((activity: any) => activity != null && String(activity).trim() !== '')
          .map(String);
        
        setActivities(validActivities);
        return validActivities;
      } catch (error) {
        console.error('Error al cargar las actividades:', error);
        toast.error('Error al cargar las actividades.');
        setActivities([]);
        return [];
      } finally {
        setLoading((prev) => ({ ...prev, activities: false }));
      }
    },
    []
  );

  // Effects
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    refreshDailyActivities(selectedDate, String(employeeId));
  }, [selectedDate, employeeId, refreshDailyActivities]);

  // Handlers
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      refreshDailyActivities(date, String(employeeId));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const v = name === 'hours' ? value.replace(',', '.') : value;
    setFormData((prev) => ({ ...prev, [name]: v }));
  };

  // Manejar la tecla Enter en el textarea de notas
  const handleNoteKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
    }
  };

  const handleSelectChange = async (name: string, value: string) => {
    // Crear una copia actualizada del formulario
    const updatedFormData = { ...formData, [name]: value };

    // Manejar cambios en cascada basados en el campo modificado
    switch (name) {
      case 'project_code':
        // Limpiar campos dependientes
        updatedFormData.phase = '';
        updatedFormData.discipline = '';
        updatedFormData.activity = '';
        
        // Limpiar estados de opciones
        setStages([]);
        setDisciplines([]);
        setActivities([]);
        
        // Cargar etapas si hay un proyecto seleccionado
        if (value) {
          await fetchStages(value);
        }
        break;
        
      case 'phase':
        // Limpiar campos dependientes
        updatedFormData.discipline = '';
        updatedFormData.activity = '';
        
        // Limpiar estados de opciones dependientes
        setDisciplines([]);
        setActivities([]);
        
        // Cargar disciplinas si hay una fase seleccionada
        if (value && updatedFormData.project_code) {
          await fetchDisciplines(updatedFormData.project_code, value);
        }
        break;
        
      case 'discipline':
        // Limpiar actividad
        updatedFormData.activity = '';
        
        // Limpiar actividades
        setActivities([]);
        
        // Cargar actividades si hay una disciplina seleccionada
        if (value && updatedFormData.project_code && updatedFormData.phase) {
          await fetchActivities(
            updatedFormData.project_code, 
            updatedFormData.phase, 
            value
          );
        }
        break;
    }

    // Actualizar el estado del formulario
    setFormData(updatedFormData);
  };

  const resetForm = useCallback(() => {
    setFormData(initialFormData(employeeId));
    setEditingActivityId(null);
  }, [employeeId]);

  // Precarga dependencias al editar + rellena form
  const handleEditActivity = useCallback(
    async (activity: Activity) => {
      try {
        setLoading(prev => ({ ...prev, form: true }));
        
        // 1. Primero actualizamos la fecha si es necesario
        if (activity.date) {
          try {
            const activityDate = parseISO(activity.date);
            // Solo actualizar la fecha si es diferente a la actual
            if (format(activityDate, 'yyyy-MM-dd') !== format(selectedDate, 'yyyy-MM-dd')) {
              setSelectedDate(activityDate);
              // Esperamos un momento para que se actualice la fecha
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          } catch (error) {
            console.error('Error al analizar la fecha:', error);
          }
        }

        // 2. Establecer el ID de edición y datos iniciales del formulario
        setEditingActivityId(activity.id);
        
        // 3. Crear un objeto con los datos iniciales
        const initialData = {
          ...initialFormData(employeeId),
          project_code: activity.project_code || '',
          phase: activity.phase || '',
          discipline: activity.discipline || '',
          activity: activity.activity || '',
          hours: activity.hours ? String(activity.hours).replace('.', ',') : '',
          note: activity.note || '',
        };
        
        // 4. Actualizar el formulario con los datos iniciales
        setFormData(initialData);
        
        // 5. Si hay proyecto, cargar etapas
        if (activity.project_code) {
          await fetchStages(activity.project_code);
          
          // 6. Si hay fase, cargar disciplinas
          if (activity.phase) {
            await fetchDisciplines(activity.project_code, activity.phase);
            
            // 7. Si hay disciplina, cargar actividades
            if (activity.discipline) {
              await fetchActivities(
                activity.project_code, 
                activity.phase, 
                activity.discipline
              );
            }
          }
        }

        // Desplazar al formulario
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
      } catch (error) {
        console.error('Error al cargar la actividad para edición:', error);
        toast.error('Error al cargar la actividad para edición', { duration: 2000 });
      } finally {
        setLoading(prev => ({ ...prev, form: false }));
      }
    },
    [fetchStages, fetchDisciplines, fetchActivities, selectedDate, formData, employeeId]
  );

  const handleDelete = async (idToDelete: string) => {
    if (!idToDelete) {
      console.error('handleDelete: ID de actividad no proporcionado');
      toast.error('No se pudo eliminar: ID de actividad no válido');
      return;
    }

    try {
      setLoading(prev => ({ ...prev, delete: idToDelete }));
      
      // Mostrar mensaje de carga
      const toastId = toast.loading('Eliminando actividad...', { duration: 2000 });
      
      // Pasar el ID como string, sin convertirlo a número
      await deleteHour(idToDelete);
      
      // Actualizar la lista de actividades
      await refreshDailyActivities(selectedDate, String(employeeId));
      
      // Si la actividad eliminada es la que se estaba editando, limpiar el formulario
      if (editingActivityId === idToDelete) {
        resetForm();
      }
      
      // Mostrar mensaje de éxito
      toast.success('Actividad eliminada correctamente', { 
        id: toastId,
        duration: 2000,
      });
      
    } catch (error: any) {
      console.error('Error al eliminar la actividad:', error);
      const errorMessage = error.message || 'Error al eliminar la actividad. Por favor, intente nuevamente.';
      toast.error(errorMessage, { 
        duration: 2000,
      });
    } finally {
      setLoading(prev => ({ ...prev, delete: null }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos requeridos
    const requiredFields: (keyof typeof formData)[] = ['project_code', 'phase', 'discipline', 'activity', 'hours'];
    const missingFields = requiredFields.filter(field => {
      const value = formData[field];
      // Considerar el campo como faltante si es undefined, null, string vacío o array/objeto vacío
      return value === undefined || value === null || value === '' || 
             (Array.isArray(value) && value.length === 0) ||
             (typeof value === 'object' && Object.keys(value).length === 0);
    });
    
    if (missingFields.length > 0) {
      toast.error('Por favor complete todos los campos requeridos.', { duration: 2000 });
      return;
    }

    // Validar formato de horas
    const hoursValue = typeof formData.hours === 'string' 
      ? parseFloat(formData.hours.replace(',', '.')) 
      : formData.hours;
      
    if (isNaN(hoursValue) || hoursValue <= 0) {
      toast.error('Por favor ingrese un número válido de horas.', { duration: 2000 });
      return;
    }

    setLoading((prev) => ({ ...prev, submit: true }));

    try {
      // Buscar el nombre del proyecto
      const project = projects.find(p => p.code === formData.project_code);
      
      // Preparar datos para enviar
      const submissionData = {
        project_code: formData.project_code,
        phase: formData.phase,
        discipline: formData.discipline,
        activity: formData.activity,
        hours: hoursValue,
        note: formData.note || '',
        date: format(selectedDate, 'yyyy-MM-dd'),
        employee_id: employeeId,
      };
      
      console.log('Datos a enviar:', submissionData);

      // Mostrar mensaje de carga
      const loadingMessage = editingActivityId 
        ? 'Actualizando actividad...' 
        : 'Guardando actividad...';
      
      const toastId = toast.loading(loadingMessage);

      try {
        // Usar submitHours que maneja tanto CREATE como UPDATE basado en el ID
        if (editingActivityId) {
          await updateHour(editingActivityId, submissionData);
        } else {
          await submitHours(submissionData);
        }
        
        // Mostrar mensaje de éxito
        toast.success(
          `Actividad ${editingActivityId ? 'actualizada' : 'guardada'} con éxito.`,
          { 
            id: toastId,
            duration: 2000,
            style: { 
              backgroundColor: '#28a745', 
              color: 'white', 
              border: 'none',
              fontSize: '14px',
              padding: '12px 20px',
              borderRadius: '4px'
            }
          }
        );
        
        // Limpiar formulario y actualizar lista de actividades
        resetForm();
        await refreshDailyActivities(selectedDate, String(employeeId));
        
        // Llamar a la función de éxito si existe
        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        // Mostrar mensaje de error específico
        toast.error(
          `Error al ${editingActivityId ? 'actualizar' : 'guardar'} la actividad.`, 
          { id: toastId, duration: 2000 }
        );
        throw error; // Relanzar el error para que sea capturado por el catch externo
      }
      
    } catch (error) {
      console.error('Error al guardar la actividad:', error);
      toast.error(
        'Error al guardar la actividad. Por favor, intente nuevamente.', 
        { 
          duration: 4000,
          style: { 
            backgroundColor: '#dc3545', 
            color: 'white',
            fontSize: '14px',
            padding: '12px 20px',
            borderRadius: '4px'
          } 
        }
      );
    } finally {
      setLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  // Render
  return (
    <div>
      <Header userName={employeeName} onLogout={onLogout} />
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <main className="lg:col-span-3">
            {/* z-10 evita que el Popover tape el botón */}
            <Card className="relative z-10">
              <CardHeader>
                <CardTitle className="flex items-center justify-center">
                  {editingActivityId ? (
                    <Pencil className="mr-2 h-5 w-5" />
                  ) : (
                    <PlusCircle className="mr-2 h-5 w-5" />
                  )}
                  {editingActivityId ? 'Editar Actividad' : 'Registrar Actividad'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="w-full md:w-1/3">
                    <label
                      htmlFor="date"
                      className="block text-sm font-medium text-foreground/80 mb-1"
                    >
                      Fecha
                    </label>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full justify-start text-left font-normal',
                            !selectedDate && 'text-muted-foreground'
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? (
                            <span>{format(selectedDate, 'PPP', { locale: es })}</span>
                          ) : (
                            <span>Seleccione una fecha</span>
                          )}
                        </Button>
                      </PopoverTrigger>

                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={handleDateChange}
                          initialFocus
                          locale={es}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormSelect
                      label="Código de Proyecto"
                      name="project_code"
                      value={formData.project_code}
                      onValueChange={handleSelectChange}
                      options={projects.map((p) => ({
                        value: p.code,
                        label: p.code, // En el trigger solo se ve el código
                        dropdownLabel: `${p.code} - ${p.name}`, // En la lista: código - nombre
                      }))}
                      placeholder="Seleccione un proyecto"
                      loading={loading.projects}
                      disabled={loading.projects}
                      icon={<Briefcase className="h-4 w-4" />}
                      required
                    />

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-foreground/80 mb-1">
                        Nombre del Proyecto
                      </label>
                      <Input value={selectedProjectName} readOnly className="bg-muted/50" />
                    </div>

                    <FormSelect
                      label="Etapa"
                      name="phase"
                      value={formData.phase}
                      onValueChange={handleSelectChange}
                      options={stages.map((s) => ({ value: s, label: s }))}
                      placeholder="Seleccione una etapa"
                      loading={loading.stages}
                      disabled={!formData.project_code || loading.stages}
                      icon={<ListChecks className="h-4 w-4" />}
                      required
                    />

                    <FormSelect
                      label="Disciplina"
                      name="discipline"
                      value={formData.discipline}
                      onValueChange={handleSelectChange}
                      options={disciplines.map((d) => ({ value: d, label: d }))}
                      placeholder="Seleccione una disciplina"
                      loading={loading.disciplines}
                      disabled={!formData.phase || loading.disciplines}
                      icon={<Pencil className="h-4 w-4" />}
                      required
                    />

                    <FormSelect
                      label="Actividad"
                      name="activity"
                      value={formData.activity}
                      onValueChange={handleSelectChange}
                      options={activities.map((a) => ({ value: a, label: a }))}
                      placeholder="Seleccione una actividad"
                      loading={loading.activities}
                      disabled={!formData.discipline || loading.activities}
                      icon={<ClipboardList className="h-4 w-4" />}
                      required
                    />

                    <div className="space-y-2">
                      <label
                        htmlFor="hours"
                        className="block text-sm font-medium text-foreground/80 mb-1"
                      >
                        Horas <span className="text-destructive">*</span>
                      </label>
                      <Input
                        id="hours"
                        name="hours"
                        type="number"
                        value={formData.hours}
                        onChange={handleChange}
                        min="0.5"
                        step="0.5"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="note"
                      className="block text-sm font-medium text-foreground/80 mb-1"
                    >
                      Nota (Opcional)
                    </label>
                    <textarea
                      id="note"
                      name="note"
                      value={formData.note}
                      onChange={handleChange}
                      onKeyDown={handleNoteKeyDown}
                      rows={3}
                      className="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Escriba una nota (opcional)"
                    />
                  </div>

                  <div className="flex justify-end items-center gap-3 pt-4">
                    {editingActivityId && (
                      <Button type="button" variant="outline" onClick={resetForm}>
                        <XCircle className="mr-2 h-4 w-4" />
                        Cancelar Edición
                      </Button>
                    )}

                    <Button
                      type="submit"
                      disabled={!isFormValid || loading.submit}
                      className="min-w-[150px]"
                    >
                      {loading.submit ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      {editingActivityId ? 'Actualizar' : 'Guardar'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </main>

          <aside className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Actividades del Día</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading.dailyActivities ? (
                    <ActivityListSkeleton />
                  ) : dailyActivities.length > 0 ? (
                    dailyActivities.map((activity) => (
                      <ActivityItem
                        key={activity.id}
                        activity={activity}
                        onEdit={handleEditActivity}
                        onDelete={handleDelete}
                      />
                    ))
                  ) : (
                    <EmptyState />
                  )}
                </div>
                <div className="mt-6">
                  <TotalHoursProgress totalHours={totalHoursToday} selectedDate={selectedDate} />
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default FormularioHoras;

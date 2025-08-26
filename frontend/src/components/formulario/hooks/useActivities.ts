import { useState, useCallback, useEffect } from 'react';
import { Activity, LoadingState } from '../types';
import { getDailyActivities, deleteHour } from '../../../api/horasApi';
import { toast } from 'sonner';

interface UseActivitiesReturn {
  dailyActivities: Activity[];
  loading: {
    dailyActivities: boolean;
    delete: string | null; // Cambiado a string | null
  };
  refreshDailyActivities: (date: Date | string, empId: string | number) => Promise<void>;
  handleDelete: (idToDelete: string, onSuccess?: () => void) => Promise<void>; // Cambiado a string
}

export const useActivities = (
  employeeId: number, 
  selectedDate: Date, 
  refreshDeps: any[] = []
): UseActivitiesReturn => {
  const [dailyActivities, setDailyActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState({
    dailyActivities: true,
    delete: null as string | null, // Cambiado a string | null
  });

  const refreshDailyActivities = useCallback(async (date: Date | string, empId: string | number) => {
    try {
      setLoading(prev => ({ ...prev, dailyActivities: true }));
      const activities = await getDailyActivities(date, empId);
      setDailyActivities(activities);
    } catch (error) {
      console.error('Error al cargar actividades:', error);
      toast.error('Error al cargar las actividades del día');
    } finally {
      setLoading(prev => ({ ...prev, dailyActivities: false }));
    }
  }, []);

  const handleDelete = useCallback(async (idToDelete: string, onSuccess?: () => void) => {
    try {
      setLoading(prev => ({ ...prev, delete: idToDelete }));
      const toastId = toast.loading('Eliminando actividad...');
      
      // Convertir a número si es necesario para la función deleteHour
      await deleteHour(Number(idToDelete));
      
      // Actualizar la lista de actividades
      await refreshDailyActivities(selectedDate, String(employeeId));
      
      // Mostrar mensaje de éxito
      toast.success('Actividad eliminada correctamente', { 
        id: toastId,
        duration: 3000,
      });
      
      if (onSuccess) onSuccess();
      
    } catch (error) {
      console.error('Error al eliminar la actividad:', error);
      toast.error('Error al eliminar la actividad. Por favor, intente nuevamente.', { 
        duration: 4000,
      });
    } finally {
      setLoading(prev => ({ ...prev, delete: null }));
    }
  }, [employeeId, selectedDate, refreshDailyActivities]);

  // Efecto para cargar las actividades cuando cambia la fecha o el empleado
  useEffect(() => {
    const dateStr = selectedDate instanceof Date ? selectedDate.toISOString().split('T')[0] : selectedDate;
    refreshDailyActivities(dateStr, String(employeeId));
  }, [selectedDate, employeeId, refreshDailyActivities, ...refreshDeps]);

  return {
    dailyActivities,
    loading,
    refreshDailyActivities,
    handleDelete,
  };
};

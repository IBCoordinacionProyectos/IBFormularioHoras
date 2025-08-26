import { useState, useCallback } from 'react';
import { FormData, Activity } from '../types';

export const useFormData = (employeeId: number) => {
  const initialFormData = (employeeId: number): FormData => ({
    employee_id: String(employeeId),
    project_code: '',
    phase: '',
    discipline: '',
    activity: '',
    hours: '',
    note: '',
  });

  const [formData, setFormData] = useState<FormData>(initialFormData(employeeId));
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const v = name === 'hours' ? value.replace(',', '.') : value;
    setFormData(prev => ({ ...prev, [name]: v }));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialFormData(employeeId));
    setEditingActivityId(null);
  }, [employeeId]);

  const handleEditActivity = useCallback((activity: Activity) => {
    console.log('Editando actividad:', activity);
    
    // Primero establecemos el ID de edición
    setEditingActivityId(String(activity.id));
    
    // Luego actualizamos el formulario con los datos de la actividad
    setFormData(prev => ({
      ...prev,
      employee_id: String(activity.employee_id),
      project_code: activity.project_code || '',
      phase: activity.phase || '',
      discipline: activity.discipline || '',
      activity: activity.activity || '',
      hours: activity.hours ? String(activity.hours).replace('.', ',') : '',
      note: activity.note || '',
    }));
    
    console.log('Formulario actualizado para edición');
  }, []);

  return {
    formData,
    editingActivityId,
    setFormData,
    setEditingActivityId,
    handleChange,
    resetForm,
    handleEditActivity,
  };
};

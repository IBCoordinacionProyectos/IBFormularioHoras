// FormularioPermisos.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  Calendar as CalendarIcon,
  Save,
  XCircle,
  Loader2,
  UserCheck,
} from 'lucide-react';

import { 
  createPermission, 
  updatePermission, 
  deletePermission, 
  getEmployeePermissions,
  type PermissionData 
} from '../api/horasApi';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from '../lib/utils';

// Props e interfaces
interface FormularioPermisosProps {
  onSuccess?: () => void;
  employeeId: number;
  employeeName: string;
  onLogout: () => void;
  onShowPowerBI?: () => void;  // Hacer opcional
  onNavigateToHours: () => void;
  onNavigateToPermissions: () => void;
}

interface FormData {
  date: string;
  employee_id: string;
  project_code: string;
  phase: string;
  discipline: string;
  activity: string;
  hours: string;
  note: string;
  employee_name?: string;
  status?: string;
  response?: string;
}

const initialFormData = (employeeId: number): FormData => ({
  date: format(new Date(), 'yyyy-MM-dd'),
  employee_id: String(employeeId),
  project_code: 'IB-INTERNO',
  phase: 'PERMISOS',
  discipline: 'PERMISOS',
  activity: 'PERMISO_REMUNERADO',
  hours: '8',
  note: '',
  employee_name: '',
});

const DRAFT_KEY = 'fh_permisos_draft_v1';

const FormularioPermisos: React.FC<FormularioPermisosProps> = ({
  onSuccess,
  employeeId,
  employeeName,
  onLogout,
  onNavigateToHours,
  onNavigateToPermissions,
  onShowPowerBI,
}) => {
  const [formData, setFormData] = useState<FormData>(() => initialFormData(employeeId));
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [editingPermission, setEditingPermission] = useState<PermissionData | null>(null);
  const navigate = useNavigate();

  // Manejar clic en el botón de Power BI
  const handleShowPowerBIClick = useCallback(() => {
    if (onShowPowerBI) {
      onShowPowerBI();
    }
    navigate('/powerbi');
  }, [navigate, onShowPowerBI]);

  // Cargar borrador guardado
  useEffect(() => {
    const savedDraft = localStorage.getItem(DRAFT_KEY);
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        setFormData(prev => ({
          ...initialFormData(employeeId),
          ...parsedDraft,
          employee_id: String(employeeId)
        }));
      } catch (e) {
        console.error('Error al cargar el borrador:', e);
      }
    }
  }, [employeeId]);

  // Guardar borrador cuando cambia el formulario
  useEffect(() => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
  }, [formData]);

  const handleDateChange = (date: Date | undefined) => {
    if (date) setSelectedDate(date);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Validación en tiempo real
    if (name === 'note') {
      setErrors(prev => ({
        ...prev,
        note: value.trim().length < 5 ? 'Por favor proporciona más detalles' : ''
      }));
    } else if (name === 'activity') {
      setErrors(prev => ({
        ...prev,
        activity: !value ? 'Selecciona un tipo de permiso' : ''
      }));
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpiar error al seleccionar una opción
    if (name === 'activity') {
      setErrors(prev => ({
        ...prev,
        activity: ''
      }));
    }
  };

  const handleNoteKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
    }
  };

  const resetForm = useCallback(() => {
    setFormData(initialFormData(employeeId));
    setErrors({});
  }, [employeeId]);

  const handleSubmitPermission = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación final
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.activity) newErrors.activity = 'Selecciona un tipo de permiso';
    if (!formData.note || formData.note.trim().length < 5) {
      newErrors.note = 'Por favor proporciona más detalles sobre el motivo del permiso';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    try {
      setIsSubmitting(true);

      const submissionData = {
        ...formData,
        date: format(selectedDate, 'yyyy-MM-dd'),
        employee_id: String(employeeId),
        employee_name: employeeName,
        hours: '8', // Día completo de permiso
        project_code: 'IB-INTERNO',
        phase: 'PERMISOS',
        discipline: 'PERMISOS',
      };

      if (editingPermission?.id) {
        // Actualizar permiso existente
        const permissionId = Number(editingPermission.id);
        if (isNaN(permissionId)) {
          throw new Error('ID de permiso no válido para actualizar');
        }
        await updatePermission(permissionId, submissionData);
        toast.success('Permiso actualizado exitosamente');
      } else {
        // Crear nuevo permiso
        await createPermission(submissionData);
        toast.success('Solicitud de permiso enviada exitosamente');
      }

      resetForm();
      onSuccess?.();
    } catch (error: any) {
      console.error('Error al procesar la solicitud de permiso:', error);
      toast.error(error.message || 'Error al procesar la solicitud de permiso');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para cargar un permiso para edición
  const loadPermissionForEdit = (permission: PermissionData) => {
    // Verificar que el permiso tenga un ID numérico válido
    const permissionId = permission.id ? Number(permission.id) : NaN;
    if (isNaN(permissionId)) {
      console.error('No se puede editar un permiso sin un ID válido');
      return;
    }
    
    setEditingPermission({
      ...permission,
      id: permissionId // Asegurar que el ID sea un número
    });
    
    setFormData({
      date: permission.date || format(new Date(), 'yyyy-MM-dd'),
      employee_id: String(permission.employee_id),
      project_code: permission.project_code || 'IB-INTERNO',
      phase: permission.phase || 'PERMISOS',
      discipline: permission.discipline || 'PERMISOS',
      activity: permission.activity || '',
      hours: String(permission.hours || '8'),
      note: permission.note || '',
      employee_name: permission.employee_name || '',
      status: permission.status,
      response: permission.response
    });
    
    if (permission.date) {
      setSelectedDate(new Date(permission.date));
    } else {
      setSelectedDate(new Date());
    }
  };

  // Función para eliminar un permiso
  const handleDeletePermission = async (permissionId: number) => {
    if (!permissionId) {
      console.error('No se puede eliminar un permiso sin ID');
      return;
    }
    if (!confirm('¿Estás seguro de que deseas eliminar este permiso?')) {
      return;
    }

    try {
      setIsSubmitting(true);
      await deletePermission(permissionId);
      toast.success('Permiso eliminado exitosamente');
      onSuccess?.();
    } catch (error: any) {
      console.error('Error al eliminar el permiso:', error);
      toast.error(error.message || 'Error al eliminar el permiso');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Card className="mb-8">
            <CardHeader className="bg-blue-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-6 w-6" />
                Solicitud de Permiso
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmitPermission} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Fecha del Permiso</label>
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
                            format(selectedDate, 'PPP', { locale: es })
                          ) : (
                            <span>Selecciona una fecha</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
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

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Tipo de Permiso</label>
                    <select
                      name="activity"
                      value={formData.activity}
                      onChange={handleSelectChange}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Selecciona un tipo de permiso</option>
                      <option value="PERMISO_REMUNERADO">Permiso Remunerado</option>
                      <option value="PERMISO_NO_REMUNERADO">Permiso No Remunerado</option>
                      <option value="PERMISO_MEDICO">Permiso Médico</option>
                      <option value="OTRO">Otro</option>
                    </select>
                    {errors.activity && (
                      <p className="text-sm text-red-500 mt-1">{errors.activity}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Motivo del Permiso <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Describe el motivo del permiso (mínimo 5 caracteres)"
                    name="note"
                    value={formData.note}
                    onChange={handleChange}
                    onKeyDown={handleNoteKeyDown}
                    rows={4}
                  />
                  {errors.note && (
                    <p className="text-sm text-red-500 mt-1">{errors.note}</p>
                  )}
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    disabled={isSubmitting}
                    className="flex items-center"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || Object.keys(errors).length > 0}
                    className="flex items-center bg-blue-600 hover:bg-blue-700"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Enviar Solicitud
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FormularioPermisos;

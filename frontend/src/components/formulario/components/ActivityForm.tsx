import React, { FormEvent } from 'react';
import { Save, Loader2, PlusCircle } from 'lucide-react';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { FormData } from '../types';
import { ProjectSelector } from './ProjectSelector';
import { StageSelector } from './StageSelector';
import { DisciplineSelector } from './DisciplineSelector';
import { ActivitySelector } from './ActivitySelector';

interface ActivityFormProps {
  formData: FormData;
  projects: any[];
  stages: string[];
  disciplines: string[];
  activities: string[];
  loading: {
    submit: boolean;
    projects: boolean;
    stages: boolean;
    disciplines: boolean;
    activities: boolean;
  };
  onProjectSelect: (projectCode: string) => void;
  onStageSelect: (stage: string) => void;
  onDisciplineSelect: (discipline: string) => void;
  onActivitySelect: (activity: string) => void;
  onHoursChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNoteChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onNoteKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSave: (e: FormEvent) => void;
  onUpdate: (e: FormEvent) => void;
  onCancel: () => void;
  isEditing: boolean;
}

export const ActivityForm: React.FC<ActivityFormProps> = ({
  formData,
  projects,
  stages,
  disciplines,
  activities,
  loading,
  onProjectSelect,
  onStageSelect,
  onDisciplineSelect,
  onActivitySelect,
  onHoursChange,
  onNoteChange,
  onNoteKeyDown,
  onSave,
  onUpdate,
  onCancel,
  isEditing,
}) => {
  // Manejador de envío del formulario que previene el comportamiento por defecto
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // No hacemos nada aquí, los botones manejarán la acción específica
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ProjectSelector
          projects={projects}
          loading={loading.projects}
          value={formData.project_code}
          onChange={onProjectSelect}
        />

        <StageSelector
          stages={stages}
          loading={loading.stages}
          value={formData.phase}
          onChange={onStageSelect}
        />

        <DisciplineSelector
          disciplines={disciplines}
          loading={loading.disciplines}
          value={formData.discipline}
          onChange={onDisciplineSelect}
        />

        <ActivitySelector
          activities={activities}
          loading={loading.activities}
          value={formData.activity}
          onChange={onActivitySelect}
        />

        <div>
          <label htmlFor="hours" className="block text-sm font-medium mb-1">
            Horas <span className="text-destructive">*</span>
          </label>
          <Input
            type="number"
            id="hours"
            name="hours"
            value={formData.hours}
            onChange={onHoursChange}
            step="0.5"
            min="0.5"
            max="24"
            placeholder="Ej: 2.5"
            required
            className="w-full"
          />
        </div>

        <div>
          <label htmlFor="note" className="block text-sm font-medium mb-1">
            Nota (Opcional)
          </label>
          <Textarea
            id="note"
            name="note"
            value={formData.note}
            onChange={onNoteChange}
            onKeyDown={onNoteKeyDown}
            placeholder="Agregue una nota descriptiva"
            rows={1}
            className="min-h-[40px]"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-2">
        {/* Botón Cancelar - visible solo en modo edición */}
        {isEditing && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading.submit}
            className="mr-auto"
          >
            Cancelar
          </Button>
        )}

        {/* Botón Guardar - visible siempre */}
        <Button 
          type="button" 
          onClick={onSave}
          disabled={loading.submit}
          variant={isEditing ? "outline" : "default"}
          className={isEditing ? "" : "bg-green-600 hover:bg-green-700"}
        >
          {loading.submit ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <PlusCircle className="mr-2 h-4 w-4" />
              Guardar Nuevo
            </>
          )}
        </Button>

        {/* Botón Actualizar - visible solo en modo edición */}
        {isEditing && (
          <Button 
            type="button"
            onClick={onUpdate}
            disabled={loading.submit}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading.submit ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Actualizando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Actualizar
              </>
            )}
          </Button>
        )}
      </div>
    </form>
  );
};

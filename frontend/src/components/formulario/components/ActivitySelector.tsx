import React from 'react';
import { FormSelect } from './FormSelect';

interface ActivitySelectorProps {
  activities: string[];
  loading: boolean;
  value: string;
  onChange: (value: string) => void;
}

export const ActivitySelector: React.FC<ActivitySelectorProps> = ({
  activities,
  loading,
  value,
  onChange,
}) => {
  // Asegurarse de que el valor actual esté en las opciones
  const options = React.useMemo(() => {
    console.log('Actividades disponibles:', activities);
    console.log('Valor actual del selector:', value);
    
    // Crear un Set para evitar duplicados
    const uniqueActivities = new Set(activities);
    
    // Si hay un valor, lo aseguramos en las opciones
    if (value && value.trim() !== '') {
      uniqueActivities.add(value);
      console.log('Valor actual añadido a las opciones:', value);
    }
    
    // Convertir a array de opciones
    const activityOptions = Array.from(uniqueActivities).map(activity => ({
      value: activity,
      label: activity
    }));
    
    console.log('Opciones finales del selector:', activityOptions);
    return activityOptions;
  }, [activities, value]);

  return (
    <div className="w-full">
      <FormSelect
        label="Actividad"
        name="activity"
        value={value}
        onChange={onChange}
        options={options}
        placeholder={options.length > 0 ? "Seleccione una actividad" : "No hay actividades disponibles"}
        disabled={false}
        required
      />
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-gray-500 mt-1">
          {options.length} opciones disponibles
        </div>
      )}
    </div>
  );
};

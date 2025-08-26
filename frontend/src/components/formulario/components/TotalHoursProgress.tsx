import React from 'react';
import { Progress } from '@/components/ui/progress';

interface TotalHoursProgressProps {
  totalHours: number;
  targetHours?: number;
  className?: string;
}

export const TotalHoursProgress: React.FC<TotalHoursProgressProps> = ({
  totalHours,
  targetHours = 8, // Valor por defecto de 8 horas
  className = '',
}) => {
  const progress = Math.min(Math.round((totalHours / targetHours) * 100), 100);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between text-sm">
        <span>Horas registradas: {totalHours.toFixed(2)}</span>
        <span className="text-muted-foreground">
          {targetHours} horas objetivo
        </span>
      </div>
      <Progress value={progress} className="h-2" />
      <p className="text-xs text-muted-foreground text-right">
        {progress}% completado
      </p>
    </div>
  );
};

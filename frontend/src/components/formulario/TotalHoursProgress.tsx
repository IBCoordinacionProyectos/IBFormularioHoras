import React from 'react';
import { getDay } from 'date-fns';
import { Progress } from '../ui/progress';

interface TotalHoursProgressProps {
    totalHours: number;
    selectedDate: Date;
}

export const TotalHoursProgress: React.FC<TotalHoursProgressProps> = ({ totalHours, selectedDate }) => {
    const dayOfWeek = getDay(selectedDate); // Domingo = 0, Lunes = 1, ..., Sábado = 6
    const maxHours = (dayOfWeek === 5) ? 8 : 9; // Viernes es 8, el resto 9

    const progress = totalHours > 0 ? Math.min((totalHours / maxHours) * 100, 100) : 0;
    const remainingHours = maxHours - totalHours;

    return (
        <div className="bg-primary/5 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Horas trabajadas hoy:</span>
                <span className="text-sm font-semibold">{totalHours.toFixed(1)} / {maxHours.toFixed(1)} horas</span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
                {totalHours < maxHours
                    ? `Faltan ${remainingHours.toFixed(1)} horas para completar la jornada.`
                    : '¡Jornada completa! Buen trabajo.'}
            </p>
        </div>
    );
};

import React from 'react';
import { Clock } from 'lucide-react';

export const EmptyState = () => (
    <div className="text-center py-10 px-4 bg-muted/20 rounded-lg border-2 border-dashed">
        <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
        <p className="font-medium text-muted-foreground">No hay actividades registradas para hoy</p>
        <p className="text-sm text-muted-foreground mt-1">Utilice el formulario para agregar su primera actividad.</p>
    </div>
);

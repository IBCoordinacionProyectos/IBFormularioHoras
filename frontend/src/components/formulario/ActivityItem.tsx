import React from 'react';
import { Button } from '../ui/button';
import { Trash2 } from 'lucide-react';

// Importar la interfaz DailyActivity desde horasApi
import { DailyActivity } from '../../api/horasApi';

// Usar la interfaz DailyActivity en lugar de definir Activity
type Activity = DailyActivity;

interface ActivityItemProps {
    activity: Activity;
    onEdit: (activity: Activity) => void;
    onDelete: (id: string) => void;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({ activity, onEdit, onDelete }) => {
    const handleCardClick = (e: React.MouseEvent) => {
        if ((e.target as HTMLElement).closest('.delete-button')) return;
        onEdit(activity);
    };

    return (
        <div onClick={handleCardClick} className="p-4 border rounded-lg transition-colors hover:bg-muted/50 cursor-pointer">
            <div className="flex items-start justify-between">
                <div className="flex-1 pr-4">
                    <p className="font-bold text-foreground">{activity.project_code} - {activity.project_name}</p>
                    <p className="text-sm text-muted-foreground">{activity.phase} - {activity.discipline}</p>
                    <p className="text-sm mt-2">{activity.activity}</p>
                    {activity.note && <p className="text-xs text-muted-foreground mt-1 italic">Nota: {activity.note}</p>}
                </div>
                <div className="flex items-center space-x-1">
                    <div className="text-right mr-2">
                        <div className="font-bold text-lg text-primary">{activity.hours.toFixed(1)}</div>
                        <div className="text-xs text-muted-foreground -mt-1">hrs</div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); onDelete(activity.id); }} className="delete-button">
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
            </div>
        </div>
    );
};

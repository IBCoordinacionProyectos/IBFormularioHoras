import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Pencil, Trash2 } from 'lucide-react';
import { Activity } from '../types';
import { DailyActivity } from '../../../api/horasApi';
import { Button } from '../../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { EmptyState } from './EmptyState';
import { ActivityListSkeleton } from './ActivityListSkeleton';

interface ActivityListProps {
  activities: Activity[];
  loading: boolean;
  selectedDate: Date;
  onEdit: (activity: Activity) => void;
  onDelete: (id: string) => void; // Actualizado a string
  deleteLoadingId: string | null; // Actualizado a string | null
}

export const ActivityList: React.FC<ActivityListProps> = ({
  activities,
  loading,
  selectedDate,
  onEdit,
  onDelete,
  deleteLoadingId,
}) => {
  if (loading) {
    return <ActivityListSkeleton />;
  }

  if (activities.length === 0) {
    return (
      <EmptyState
        title="No hay actividades registradas"
        description={`No se encontraron actividades para el ${format(selectedDate, 'PPP', {
          locale: es,
        })}`}
      />
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg">
          Actividades del {format(selectedDate, 'PPP', { locale: es })}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start justify-between rounded-lg border p-4 hover:bg-accent/50 transition-colors"
            >
              <div className="space-y-1">
                <h4 className="font-medium">{activity.activity}</h4>
                <p className="text-sm text-muted-foreground">
                  {activity.project_name} • {activity.phase} • {activity.discipline}
                </p>
                {activity.note && (
                  <p className="text-sm text-muted-foreground mt-1">{activity.note}</p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{activity.hours}h</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(activity);
                  }}
                  className="h-8 w-8"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(activity.id)}
                  disabled={deleteLoadingId === activity.id}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  {deleteLoadingId === activity.id ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-destructive border-t-transparent" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

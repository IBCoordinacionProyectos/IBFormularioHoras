import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Clock, AlertTriangle } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: string;
    type: 'up' | 'down';
  };
  icon?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

export const StatsCard = ({
  title,
  value,
  description,
  trend,
  icon,
  variant = 'default',
  className,
}: StatsCardProps) => {
  const variantClasses = {
    default: 'bg-card text-card-foreground border',
    success: 'bg-success/10 text-success-foreground border-success/20',
    warning: 'bg-warning/10 text-warning-foreground border-warning/20',
    danger: 'bg-destructive/10 text-destructive-foreground border-destructive/20',
  };

  const trendIcons = {
    up: <TrendingUp className="h-4 w-4" />,
    down: <TrendingDown className="h-4 w-4" />,
  };

  const defaultIcons = {
    default: <Clock className="h-5 w-5 text-muted-foreground" />,
    success: <TrendingUp className="h-5 w-5 text-success" />,
    warning: <AlertTriangle className="h-5 w-5 text-warning" />,
    danger: <AlertTriangle className="h-5 w-5 text-destructive" />,
  };

  const displayIcon = icon || defaultIcons[variant] || defaultIcons.default;

  return (
    <div
      className={cn(
        'rounded-lg border p-6 transition-all hover:shadow-md',
        variantClasses[variant],
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="mt-1 text-2xl font-bold">{value}</h3>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
          {trend && (
            <div
              className={cn(
                'mt-2 flex items-center text-sm',
                trend.type === 'up' ? 'text-success' : 'text-destructive'
              )}
            >
              {trendIcons[trend.type]}
              <span className="ml-1">{trend.value}</span>
            </div>
          )}
        </div>
        <div className="rounded-lg bg-background/50 p-3">
          {displayIcon}
        </div>
      </div>
    </div>
  );
};

// Componente contenedor para las tarjetas de estadísticas
export const StatsContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4',
        className
      )}
    >
      {children}
    </div>
  );
};

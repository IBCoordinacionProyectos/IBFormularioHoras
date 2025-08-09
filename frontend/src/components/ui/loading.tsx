import { cn } from '@/lib/utils';

interface LoadingProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'muted';
}

export const Loading = ({
  className,
  size = 'md',
  color = 'primary',
}: LoadingProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  const colorClasses = {
    primary: 'text-brand',
    white: 'text-white',
    muted: 'text-muted-foreground',
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <svg
        className={cn('animate-spin', sizeClasses[size], colorClasses[color])}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="sr-only">Cargando...</span>
    </div>
  );
};

export const LoadingPage = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <Loading size="lg" />
  </div>
);

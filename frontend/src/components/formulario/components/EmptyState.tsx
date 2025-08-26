import React from 'react';
import { FileText } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = <FileText className="h-10 w-10 text-muted-foreground" />,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
};

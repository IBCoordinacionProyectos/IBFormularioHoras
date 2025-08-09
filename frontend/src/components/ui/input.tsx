import * as React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
  label?: string;
  description?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      leftIcon,
      rightIcon,
      error,
      label,
      description,
      ...props
    },
    ref
  ) => {
    const inputId = React.useId();
    const descriptionId = description ? `${inputId}-description` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;

    return (
      <div className="w-full space-y-1">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-destructive focus-visible:ring-destructive/30',
              className
            )}
            ref={ref}
            aria-invalid={!!error}
            aria-describedby={`${descriptionId || ''} ${errorId || ''}`.trim()}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              {rightIcon}
            </div>
          )}
        </div>
        {description && (
          <p
            id={descriptionId}
            className="text-xs text-muted-foreground mt-1"
          >
            {description}
          </p>
        )}
        {error && (
          <p
            id={errorId}
            className="text-xs text-destructive mt-1"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };

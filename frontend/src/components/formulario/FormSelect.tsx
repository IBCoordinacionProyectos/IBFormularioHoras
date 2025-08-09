import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger } from '../ui/select';
import { Loader2 } from 'lucide-react';

type Option = {
  value: string;
  /** Texto que se muestra en el trigger (lo que queda visible tras seleccionar). */
  label: string;
  /** Texto opcional solo para el dropdown; si no se provee, usa label. */
  dropdownLabel?: string;
};

interface FormSelectProps {
  label: string;
  name: string;
  value: string;
  onValueChange: (name: string, value: string) => void;
  options: Option[];
  placeholder: string;
  loading: boolean;
  disabled: boolean;
  icon: React.ReactNode;
  required?: boolean;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  name,
  value,
  onValueChange,
  options,
  placeholder,
  loading,
  disabled,
  icon,
  required,
}) => {
  const selected = React.useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value]
  );

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="text-sm font-medium flex items-center">
        {icon}
        <span className="ml-2">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </span>
        {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
      </label>

      <Select
        value={value}
        onValueChange={(val) => onValueChange(name, val)}
        disabled={disabled || loading}
      >
        <SelectTrigger id={name} className="w-full">
          {/* Trigger: si hay seleccionado mostramos su label; si no, el placeholder */}
          <span className={selected ? undefined : 'text-muted-foreground'}>
            {selected ? selected.label : placeholder}
          </span>
        </SelectTrigger>

        <SelectContent>
          {loading ? (
            // IMPORTANT: no usar value="" — Radix lo prohíbe
            <SelectItem value="__loading__" disabled>
              Cargando...
            </SelectItem>
          ) : options.length > 0 ? (
            options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.dropdownLabel ?? option.label}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="__empty__" disabled>
              Sin opciones
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

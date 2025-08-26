import React from 'react';
import { FormSelectProps } from '../types';
import { Label } from '../../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
  disabled,
  required = false,
  className = '',
}) => {
  // Asegurarse de que el valor actual esté en las opciones
  const currentOption = options.find(opt => opt.value === value);
  
  return (
    <div className={className}>
      <Label htmlFor={name} className="block text-sm font-medium mb-1">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <Select
        name={name}
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        required={required}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={currentOption ? currentOption.label : placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
          {options.length === 0 && (
            <div className="px-3 py-1.5 text-sm text-muted-foreground">
              No hay opciones disponibles
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

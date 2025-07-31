// src/components/TextareaField.tsx
import React from 'react';

interface TextareaFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  icon?: React.ReactNode;
}

const TextareaField: React.FC<TextareaFieldProps> = ({ 
  label, 
  name, 
  value, 
  onChange, 
  placeholder, 
  rows = 3, 
  icon
}) => {
  const hasIcon = icon != null;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        {hasIcon && (
          <div className="absolute top-0 left-0 pl-3 pt-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          className={`w-full py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#083c4c] focus:border-transparent transition-all ${
            hasIcon ? 'pl-10 pr-4' : 'px-4'
          }`}
        />
      </div>
    </div>
  );
};

export default TextareaField;
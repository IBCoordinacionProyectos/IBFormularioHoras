import React from 'react';

interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  min?: string;
  max?: string;
  step?: string;
  required?: boolean;
  error?: string;
  readOnly?: boolean;
  icon?: React.ReactNode;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  name,
  type = 'text',
  value,
  onChange = () => {},
  placeholder,
  min,
  max,
  step,
  required = false,
  error = '',
  readOnly = false,
  icon,
}) => {
  const hasIcon = icon != null;

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {hasIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          required={required}
          readOnly={readOnly}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${name}-error` : undefined}
          className={`w-full py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#083c4c] focus:border-transparent transition-all ${
            hasIcon ? 'pl-10 pr-4' : 'px-4'
          } ${
            error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300'
          } ${readOnly ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        />
      </div>
      {error && (
        <p id={`${name}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default InputField;
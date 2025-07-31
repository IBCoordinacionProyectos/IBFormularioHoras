import React from 'react';

interface SelectFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  isLoading?: boolean;
  disabled?: boolean;
  required?: boolean;
  icon?: React.ReactNode;
}

const SelectField: React.FC<SelectFieldProps> = ({ 
  label, 
  name, 
  value, 
  onChange, 
  options, 
  isLoading = false, 
  disabled = false,
  required = false,
  icon
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
        <select
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled || isLoading}
          required={required}
          className={`w-full py-3 border rounded-lg focus:ring-2 focus:outline-none appearance-none transition-all ${
            hasIcon ? 'pl-10 pr-10' : 'px-4 pr-10'
          } ${
            disabled 
              ? 'bg-gray-100 text-gray-400 border-gray-200' 
              : 'bg-white text-gray-800 border-gray-300 focus:border-[#083c4c] focus:ring-[#083c4c]'
          }`}
        >
          {options.map((option, index) => (
            <option 
                key={`${option.value}-${index}`}
                value={option.value}
            >
                {option.label}
            </option>
          ))}
        </select>

        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
            {!isLoading ? (
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path></svg>
            ) : (
                <div className="w-5 h-5 border-t-2 border-[#083c4c] border-r-2 border-transparent rounded-full animate-spin" aria-label="Cargando opciones"></div>
            )}
        </div>
      </div>
    </div>
  );
};

export default SelectField;
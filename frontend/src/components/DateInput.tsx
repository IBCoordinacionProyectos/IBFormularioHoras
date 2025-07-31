import React from 'react';

interface DateInputProps {
    label: string;
    value: string;
    onChange: (date: string) => void;
    required?: boolean;
}

const DateInput: React.FC<DateInputProps> = ({ 
    label, 
    value, 
    onChange, 
    required = false 
}) => {
    return (
        <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type="date"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
        </div>
    );
};

export default DateInput;
import React from 'react';
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

interface DatePickerProps {
    label: string;
    selectedDate: Date | null;
    onChange: (date: Date | null) => void;
    required?: boolean;
    className?: string;
    icon?: React.ReactNode;
}

const DatePicker: React.FC<DatePickerProps> = ({ 
    label, 
    selectedDate, 
    onChange, 
    required = false,
    className = '',
    icon
}) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const hasIcon = icon != null;

    const handleSelect = (date?: Date) => {
        onChange(date || null);
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`.trim()}>
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
                    type="text"
                    readOnly
                    value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
                    onClick={() => setIsOpen(!isOpen)}
                    placeholder="Seleccionar fecha"
                    className={`w-full py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#083c4c] focus:border-transparent transition-all cursor-pointer ${
                        hasIcon ? 'pl-10 pr-10' : 'px-4 pr-10'
                    } border-gray-300`}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                {isOpen && (
                    <div
                        className="absolute z-10 mt-1 bg-white border border-gray-300 rounded-md shadow-lg"
                        style={{ top: '100%' }} // Posiciona el calendario debajo del input
                    >
                        <DayPicker
                            mode="single"
                            selected={selectedDate || undefined}
                            onSelect={handleSelect}
                            initialFocus
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default DatePicker;
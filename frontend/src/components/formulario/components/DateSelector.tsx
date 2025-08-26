import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '../../ui/button';
import { Calendar } from '../../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../ui/popover';
import { cn } from '../../../lib/utils';

interface DateSelectorProps {
  selectedDate: Date;
  onSelect: (date: Date | undefined) => void;
  className?: string;
}

export const DateSelector: React.FC<DateSelectorProps> = ({
  selectedDate,
  onSelect,
  className,
}) => {
  return (
    <div className={cn('grid gap-2', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            className={cn(
              'w-full justify-start text-left font-normal',
              !selectedDate && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className='mr-2 h-4 w-4' />
            {selectedDate ? (
              format(selectedDate, 'PPP', { locale: es })
            ) : (
              <span>Seleccione una fecha</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='start'>
          <Calendar
            mode='single'
            selected={selectedDate}
            onSelect={onSelect}
            initialFocus
            locale={es}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import clsx from 'clsx';

export interface DatePickerProps {
  value?: Date | string;
  onChange: (date: Date) => void;
  placeholder?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  quickSelections?: { label: string; date: Date }[];
  className?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Selecione uma data',
  disabled = false,
  minDate,
  maxDate,
  quickSelections = [
    { label: 'Hoje', date: new Date() },
    { label: 'Amanhã', date: addDays(new Date(), 1) },
    { label: 'Em 7 dias', date: addDays(new Date(), 7) },
  ],
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Converter value para Date se for string
  const selectedDate = value ? (typeof value === 'string' ? parseISO(value) : value) : null;

  // Gerar dias do calendário
  const generateCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart, { locale: ptBR });
    const endDate = endOfWeek(monthEnd, { locale: ptBR });

    const days: Date[] = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  // Verificar se data está desabilitada
  const isDateDisabled = (date: Date): boolean => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  // Handler de seleção de data
  const handleDateSelect = (date: Date) => {
    if (!isDateDisabled(date)) {
      onChange(date);
      setIsOpen(false);
    }
  };

  // Navegar meses
  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  // Formatar data selecionada
  const formatSelectedDate = (): string => {
    if (!selectedDate) return placeholder;
    return format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  return (
    <div className={clsx('relative w-full', className)}>
      {/* Input */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={clsx(
          'w-full flex items-center justify-between',
          'px-4 py-3',
          'bg-white dark:bg-neutral-900',
          'border-2 rounded-lg',
          'transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary-500',
          {
            'border-neutral-300 dark:border-neutral-600': !isOpen,
            'border-primary-500 dark:border-primary-400': isOpen,
            'opacity-60 cursor-not-allowed': disabled,
            'hover:border-neutral-400 dark:hover:border-neutral-500': !disabled && !isOpen,
          }
        )}
      >
        <span
          className={clsx({
            'text-neutral-400 dark:text-neutral-500': !selectedDate,
            'text-neutral-900 dark:text-neutral-100': selectedDate,
          })}
        >
          {formatSelectedDate()}
        </span>
        <Calendar className="w-5 h-5 text-neutral-400" />
      </button>

      {/* Calendário */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={clsx(
              'absolute z-50 mt-2 w-80',
              'bg-white dark:bg-neutral-900',
              'border-2 border-neutral-200 dark:border-neutral-700',
              'rounded-lg shadow-xl',
              'p-4'
            )}
          >
            {/* Seleções rápidas */}
            {quickSelections.length > 0 && (
              <div className="flex gap-2 mb-4 pb-4 border-b border-neutral-200 dark:border-neutral-700">
                {quickSelections.map((quick, index) => (
                  <button
                    key={index}
                    onClick={() => handleDateSelect(quick.date)}
                    className="px-3 py-1.5 text-sm rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-primary-100 dark:hover:bg-primary-900/20 text-neutral-700 dark:text-neutral-300 transition-colors"
                  >
                    {quick.label}
                  </button>
                ))}
              </div>
            )}

            {/* Header do calendário */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handlePreviousMonth}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
              </h3>

              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Dias da semana */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-neutral-500 dark:text-neutral-400 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Dias do mês */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isTodayDate = isToday(day);
                const isDisabled = isDateDisabled(day);

                return (
                  <button
                    key={index}
                    onClick={() => handleDateSelect(day)}
                    disabled={isDisabled}
                    className={clsx(
                      'aspect-square flex items-center justify-center',
                      'text-sm rounded-lg',
                      'transition-colors duration-150',
                      {
                        // Data selecionada
                        'bg-primary-500 text-white font-semibold': isSelected,

                        // Data de hoje (não selecionada)
                        'border-2 border-primary-500 text-primary-500 font-semibold':
                          isTodayDate && !isSelected,

                        // Mês atual
                        'text-neutral-900 dark:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800':
                          isCurrentMonth && !isSelected && !isTodayDate && !isDisabled,

                        // Outro mês
                        'text-neutral-400 dark:text-neutral-600': !isCurrentMonth,

                        // Desabilitada
                        'opacity-40 cursor-not-allowed': isDisabled,
                      }
                    )}
                  >
                    {format(day, 'd')}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop para fechar */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

DatePicker.displayName = 'DatePicker';

export default DatePicker;

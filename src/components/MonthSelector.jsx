import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

const MonthSelector = ({ selectedMonth, selectedYear, onMonthChange, onYearChange }) => {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      onMonthChange(11);
      onYearChange(selectedYear - 1);
    } else {
      onMonthChange(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      onMonthChange(0);
      onYearChange(selectedYear + 1);
    } else {
      onMonthChange(selectedMonth + 1);
    }
  };

  return (
    <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-2 border border-slate-700">
      <Button
        variant="ghost"
        size="sm"
        onClick={handlePrevMonth}
        className="text-slate-300 hover:bg-slate-700"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      
      <div className="flex items-center gap-2 px-3">
        <Calendar className="w-4 h-4 text-slate-400" />
        <span className="text-white font-medium min-w-[120px] text-center">
          {months[selectedMonth]} {selectedYear}
        </span>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleNextMonth}
        className="text-slate-300 hover:bg-slate-700"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default MonthSelector;
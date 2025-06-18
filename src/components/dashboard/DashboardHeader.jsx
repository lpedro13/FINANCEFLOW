import React from 'react';
import { Button } from '@/components/ui/button';
import MonthSelector from '@/components/MonthSelector';
import { BookOpen, Bell } from 'lucide-react';

const DashboardHeader = ({
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
  alertsCount,
  onShowAlerts,
  onShowFinancialTip,
}) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-3xl font-bold text-white">Dashboard Financeiro</h2>
        <p className="text-slate-400">Visão geral das suas finanças</p>
      </div>
      <div className="flex gap-4">
        <MonthSelector
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          onMonthChange={onMonthChange}
          onYearChange={onYearChange}
        />
        <Button
          onClick={onShowFinancialTip}
          variant="outline"
          className="border-slate-600 text-slate-300 hover:bg-slate-700 flex items-center gap-2"
        >
          <BookOpen className="w-4 h-4" />
          Dica Financeira
        </Button>
      </div>
    </div>
  );
};

export default DashboardHeader;
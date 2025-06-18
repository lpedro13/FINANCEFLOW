import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, DollarSign, Calendar } from 'lucide-react';

const GoalSummaryCards = ({ goals, formatCurrency }) => {
  const totalGoalsValue = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const totalTargetValue = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
  const overallProgress = totalTargetValue > 0 ? (totalGoalsValue / totalTargetValue) * 100 : (goals.length > 0 && totalGoalsValue > 0 ? 100 : 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-300">Total Acumulado</CardTitle>
          <Target className="w-4 h-4 text-green-500" />
        </CardHeader>
        <CardContent><div className="text-2xl font-bold text-white">{formatCurrency(totalGoalsValue)}</div></CardContent>
      </Card>
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-300">Meta Total</CardTitle>
          <DollarSign className="w-4 h-4 text-blue-500" />
        </CardHeader>
        <CardContent><div className="text-2xl font-bold text-white">{formatCurrency(totalTargetValue)}</div></CardContent>
      </Card>
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-300">Progresso Geral</CardTitle>
          <Calendar className="w-4 h-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-500">
            {overallProgress.toFixed(1)}%
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoalSummaryCards;
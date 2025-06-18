
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

const TransactionSummaryCards = ({ totalRevenue, totalExpenses, formatCurrency }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-300">Receitas do Mês</CardTitle>
          <TrendingUp className="w-4 h-4 text-green-500" />
        </CardHeader>
        <CardContent><div className="text-2xl font-bold text-green-500">{formatCurrency(totalRevenue)}</div></CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-300">Despesas do Mês</CardTitle>
          <TrendingDown className="w-4 h-4 text-red-500" />
        </CardHeader>
        <CardContent><div className="text-2xl font-bold text-red-500">{formatCurrency(totalExpenses)}</div></CardContent>
      </Card>

      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-300">Saldo do Mês</CardTitle>
          <DollarSign className="w-4 h-4 text-blue-500" />
        </CardHeader>
        <CardContent><div className={`text-2xl font-bold ${totalRevenue - totalExpenses >= 0 ? 'text-green-500' : 'text-red-500'}`}>{formatCurrency(totalRevenue - totalExpenses)}</div></CardContent>
      </Card>
    </div>
  );
};

export default TransactionSummaryCards;

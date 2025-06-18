import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, PieChart, BarChart3 } from 'lucide-react';

const InvestmentSummaryCards = ({ investments, formatCurrency }) => {
  const totalInvested = investments.reduce((sum, inv) => sum + inv.totalInvested, 0);
  const totalValue = investments.reduce((sum, inv) => sum + inv.totalValue, 0);
  const totalDividendsReceived = investments.reduce((sum, inv) => sum + inv.dividends, 0);
  const totalNetReturn = investments.reduce((sum, inv) => sum + inv.return, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-300">Total Investido</CardTitle>
          <DollarSign className="w-4 h-4 text-blue-500" />
        </CardHeader>
        <CardContent><div className="text-2xl font-bold text-white">{formatCurrency(totalInvested)}</div></CardContent>
      </Card>
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-300">Valor Atual</CardTitle>
          <TrendingUp className="w-4 h-4 text-green-500" />
        </CardHeader>
        <CardContent><div className="text-2xl font-bold text-white">{formatCurrency(totalValue)}</div></CardContent>
      </Card>
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-300">Dividendos Recebidos</CardTitle>
          <PieChart className="w-4 h-4 text-purple-500" />
        </CardHeader>
        <CardContent><div className="text-2xl font-bold text-purple-500">{formatCurrency(totalDividendsReceived)}</div></CardContent>
      </Card>
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-300">Retorno Total Líquido</CardTitle>
          <BarChart3 className="w-4 h-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${totalNetReturn >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {formatCurrency(totalNetReturn)}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {totalInvested > 0 ? ((totalNetReturn / totalInvested) * 100).toFixed(2) : 0}%
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default InvestmentSummaryCards;
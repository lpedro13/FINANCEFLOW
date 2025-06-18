import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, TrendingUp, TrendingDown } from 'lucide-react';

const InvestmentSummaryCard = ({ investments, history }) => {
  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

  const summary = useMemo(() => {
    const totalInvested = investments.reduce((sum, inv) => sum + (inv.totalValue || 0), 0);
    const totalDividends = history.filter(h => h.type === 'dividend').reduce((sum, h) => sum + h.amount, 0);
    
    const initialInvestment = investments.reduce((sum, inv) => sum + (inv.quantity * inv.averagePrice), 0);
    const currentValue = totalInvested;
    
    const profit = (currentValue - initialInvestment) + totalDividends;
    const profitability = initialInvestment > 0 ? (profit / initialInvestment) * 100 : 0;

    return { totalInvested, profit, profitability };
  }, [investments, history]);

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <LineChart className="w-5 h-5 text-blue-500" />
          Resumo de Investimentos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-slate-400">Total Investido</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(summary.totalInvested)}</p>
        </div>
        <div>
          <p className="text-sm text-slate-400">Rentabilidade Total</p>
          <div className="flex items-center gap-2">
            <p className={`text-xl font-bold ${summary.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatCurrency(summary.profit)}
            </p>
            <div className={`flex items-center text-xs px-2 py-1 rounded-full ${summary.profit >= 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {summary.profit >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
              {summary.profitability.toFixed(2)}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvestmentSummaryCard;
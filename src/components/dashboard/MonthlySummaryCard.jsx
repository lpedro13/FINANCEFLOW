
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';

const CustomTooltip = ({ active, payload, label, formatCurrency }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-700/80 p-3 rounded-lg border border-slate-600 shadow-lg">
          <p className="label text-slate-300 text-sm">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color }} className="text-xs">
              {`${entry.name} : ${formatCurrency(entry.value)}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
};

const MonthlySummaryCard = ({ monthlyData, monthlyChartData, formatCurrency, onMonthChartClick }) => {
  const chartDataWithMinLength = monthlyChartData && monthlyChartData.length > 0 ? monthlyChartData : [
    { name: 'N/A', Receitas: 0, Despesas: 0 } 
  ];
  const barCount = chartDataWithMinLength.length;
  const minChartWidth = Math.max(300, barCount * 60);

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          Resumo Mensal e Evolução
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {monthlyData.prevMonthBalance > 0 && (
            <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Saldo do Mês Anterior</span>
                <span className="text-slate-400 font-semibold">
                {formatCurrency(monthlyData.prevMonthBalance)}
                </span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-slate-300">Receitas do Mês</span>
            <span className="text-green-500 font-semibold">
              {formatCurrency(monthlyData.revenue)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-300">Despesas do Mês</span>
            <span className="text-red-500 font-semibold">
              {formatCurrency(monthlyData.expenses)}
            </span>
          </div>
          <div className="border-t border-slate-600 pt-4">
            <div className="flex justify-between items-center">
              <span className="text-white font-semibold">Saldo Líquido Atual</span>
              <span className={`font-bold ${
                monthlyData.balance >= 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {formatCurrency(monthlyData.balance)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 h-64 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-700/50 pb-4">
            <div style={{ minWidth: `${minChartWidth}px`, height: '100%' }}>
                {monthlyChartData && monthlyChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyChartData} onClick={onMonthChartClick} margin={{ top: 5, right: 0, left: -25, bottom: 5 }}>
                            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} interval={0} />
                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => formatCurrency(value).replace('R$', '').trim()} />
                            <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }} />
                            <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8', paddingTop: '10px' }} />
                            <Bar dataKey="Receitas" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={15} />
                            <Bar dataKey="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={15} />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-slate-500 text-center text-sm">Dados insuficientes para o gráfico de evolução.</p>
                    </div>
                )}
            </div>
        </div>

      </CardContent>
    </Card>
  );
};

export default MonthlySummaryCard;

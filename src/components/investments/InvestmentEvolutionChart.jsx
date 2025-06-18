import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getFormattedBrasiliaDate } from '@/lib/dateUtils';

const InvestmentEvolutionChart = ({ history, formatCurrency }) => {
  if (!history || history.length < 2) {
    return <p className="text-slate-400 text-center py-8">Dados insuficientes para exibir a evolução.</p>;
  }

  const chartData = history.map(entry => ({
    date: getFormattedBrasiliaDate(entry.date),
    'Valor Total': entry.totalValue,
    'Total Investido': entry.totalInvested,
    'Dividendos Acumulados': entry.totalDividends,
  })).sort((a,b) => new Date(a.date.split('/').reverse().join('-')) - new Date(b.date.split('/').reverse().join('-')));


  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
          <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 10 }} />
          <YAxis tickFormatter={formatCurrency} tick={{ fill: '#94a3b8', fontSize: 10 }} />
          <Tooltip 
            formatter={(value) => formatCurrency(value)}
            cursor={{ stroke: '#475569', strokeWidth: 1 }}
            contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', border: 'none', borderRadius: '0.5rem' }}
            labelStyle={{ color: '#cbd5e1', fontWeight: 'bold' }}
            itemStyle={{ color: '#94a3b8' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
          <Line type="monotone" dataKey="Valor Total" stroke="#22c55e" strokeWidth={2} dot={{ r: 3, fill: '#22c55e' }} activeDot={{ r: 6 }} name="Valor Total" />
          <Line type="monotone" dataKey="Total Investido" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} activeDot={{ r: 6 }} name="Total Investido" />
          <Line type="monotone" dataKey="Dividendos Acumulados" stroke="#a855f7" strokeWidth={2} dot={{ r: 3, fill: '#a855f7' }} activeDot={{ r: 6 }} name="Dividendos Acumulados" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default InvestmentEvolutionChart;
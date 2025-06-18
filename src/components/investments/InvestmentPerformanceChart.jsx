import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const InvestmentPerformanceChart = ({ investments, formatCurrency }) => {
  const chartData = investments.map(inv => ({
    name: inv.name,
    'Valor Investido': inv.totalInvested,
    'Valor Atual': inv.totalValue,
    'Proventos Recebidos': inv.dividendsReceived || 0,
    fillInvestido: '#3b82f6', 
    fillAtual: '#22c55e', 
    fillProventos: '#a855f7', 
  }));

  if (investments.length === 0) {
    return <p className="text-slate-400 text-center py-8">Nenhum investimento para exibir no gráfico.</p>;
  }

  return (
    <div style={{ width: '100%', height: 300 + investments.length * 20 }} className="overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
          <XAxis type="number" tickFormatter={formatCurrency} tick={{ fill: '#94a3b8', fontSize: 10 }} />
          <YAxis dataKey="name" type="category" width={80} tick={{ fill: '#cbd5e1', fontSize: 10 }} />
          <Tooltip 
            formatter={(value) => formatCurrency(value)}
            cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }}
            contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', border: 'none', borderRadius: '0.5rem' }}
            labelStyle={{ color: '#cbd5e1', fontWeight: 'bold' }}
            itemStyle={{ color: '#94a3b8' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }} />
          <Bar dataKey="Valor Investido" name="Investido" fill="url(#colorInvestido)" barSize={15} radius={[0, 4, 4, 0]} />
          <Bar dataKey="Valor Atual" name="Atual" fill="url(#colorAtual)" barSize={15} radius={[0, 4, 4, 0]} />
          <Bar dataKey="Proventos Recebidos" name="Proventos" fill="url(#colorProventos)" barSize={15} radius={[0, 4, 4, 0]} />
          <defs>
            <linearGradient id="colorInvestido" x1="0" y1="0" x2="1" y2="0">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.8}/>
            </linearGradient>
            <linearGradient id="colorAtual" x1="0" y1="0" x2="1" y2="0">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#16a34a" stopOpacity={0.8}/>
            </linearGradient>
             <linearGradient id="colorProventos" x1="0" y1="0" x2="1" y2="0">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#9333ea" stopOpacity={0.8}/>
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default InvestmentPerformanceChart;
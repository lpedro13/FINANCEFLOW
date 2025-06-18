import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, PiggyBank } from 'lucide-react';

const cardIconMap = {
  Receitas: <TrendingUp className="w-5 h-5 text-green-500" />,
  Despesas: <TrendingDown className="w-5 h-5 text-red-500" />,
  Investimentos: <PiggyBank className="w-5 h-5 text-blue-500" />,
  'Saldo Total': <DollarSign className="w-5 h-5 text-purple-500" />,
};

const DashboardCards = ({ dashboardData, formatCurrency, onCardClick }) => {
  const cards = [
    { title: 'Receitas', value: dashboardData.totalRevenue, change: dashboardData.cardChanges.revenue, color: 'text-green-500' },
    { title: 'Despesas', value: dashboardData.totalExpenses, change: dashboardData.cardChanges.expenses, color: 'text-red-500' },
    { title: 'Investimentos', value: dashboardData.totalInvestments, change: dashboardData.cardChanges.investments, color: 'text-blue-500' },
    { title: 'Saldo Total', value: dashboardData.monthlyData.balance, change: '', color: dashboardData.monthlyData.balance >= 0 ? 'text-purple-400' : 'text-red-400' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 pb-3 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="min-w-[260px] sm:min-w-0 flex-shrink-0"
        >
          <Card 
            className="bg-slate-800/60 border-slate-700 hover:bg-slate-700/80 transition-all duration-300 cursor-pointer card-hover shadow-lg h-full"
            onClick={() => onCardClick(card.title)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-medium text-slate-300">{card.title}</CardTitle>
              {cardIconMap[card.title]}
            </CardHeader>
            <CardContent className="pb-4 px-4">
              <div className={`text-2xl font-bold ${card.color}`}>{formatCurrency(card.value)}</div>
              {card.change && (
                <p className={`text-xs ${card.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                  {card.change} em relação ao mês anterior
                </p>
              )}
              {!card.change && card.title === 'Saldo Total' && (
                 <p className="text-xs text-slate-500">Saldo líquido atual</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default DashboardCards;
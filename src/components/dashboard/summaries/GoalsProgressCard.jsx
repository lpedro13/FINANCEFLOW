import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target } from 'lucide-react';
import { motion } from 'framer-motion';

const GoalsProgressCard = ({ goals }) => {
  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-yellow-500" />
          Progresso das Metas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[220px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50">
          {goals && goals.length > 0 ? (
            goals.map(goal => {
              const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
              return (
                <div key={goal.id}>
                  <div className="flex justify-between items-center mb-1 text-sm">
                    <span className="text-slate-300 font-medium">{goal.name}</span>
                    <span className="text-slate-400">{formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2.5">
                    <motion.div
                      className="bg-yellow-500 h-2.5 rounded-full"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(progress, 100)}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-slate-500 text-center py-4">Nenhuma meta cadastrada.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GoalsProgressCard;
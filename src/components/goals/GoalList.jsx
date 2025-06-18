import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Edit, Trash2, Target, Plus, Minus, TrendingUp } from 'lucide-react';
import { formatDateToBrasilia, getFormattedBrasiliaDate } from '@/lib/dateUtils';

const GoalList = ({ goals, formatCurrency, calculateProgress, getDaysRemaining, onEdit, onDelete, onOpenContribution, onOpenWithdraw }) => {
  if (goals.length === 0) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-8 text-center">
          <Target className="w-16 h-16 text-slate-500 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">Nenhuma meta cadastrada</p>
          <p className="text-slate-500 text-sm">Crie sua primeira meta financeira!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {goals.map((goal, index) => {
        const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
        const daysRemaining = getDaysRemaining(goal.deadline);
        const isOverdue = daysRemaining !== null && daysRemaining < 0;
        const monthlyYieldPercentage = goal.yieldRate > 0 ? (Math.pow(1 + goal.yieldRate / 100, 1/12) - 1) * 100 : 0;
        const totalYieldEarned = goal.totalYieldEarned || 0;
        
        return (
          <motion.div key={goal.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-white text-xl">{goal.name}</CardTitle>
                    <p className="text-slate-400 text-sm mt-1">
                      Criada em {getFormattedBrasiliaDate(goal.createdAt)}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-wrap justify-end">
                    <Button size="sm" onClick={() => onOpenContribution(goal)} className="bg-green-600 hover:bg-green-700"><Plus className="w-4 h-4 mr-1" />Aportar</Button>
                    <Button size="sm" variant="outline" onClick={() => onOpenWithdraw(goal)} className="border-orange-600 text-orange-400 hover:bg-orange-600/20"><Minus className="w-4 h-4 mr-1" />Retirar</Button>
                    <Button size="sm" variant="ghost" onClick={() => onEdit(goal)} className="text-slate-400 hover:text-white"><Edit className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => onDelete(goal.id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Progresso</span>
                    <span className="text-white font-semibold">{progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}/>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div><p className="text-slate-400 text-sm">Valor Atual</p><p className="text-white font-semibold">{formatCurrency(goal.currentAmount)}</p></div>
                    <div><p className="text-slate-400 text-sm">Meta</p><p className="text-white font-semibold">{formatCurrency(goal.targetAmount)}</p></div>
                    <div><p className="text-slate-400 text-sm">Faltam</p><p className="text-white font-semibold">{formatCurrency(Math.max(0, goal.targetAmount - goal.currentAmount))}</p></div>
                    <div>
                      <p className="text-slate-400 text-sm">Prazo</p>
                      {goal.deadline ? (
                        <p className={`font-semibold ${isOverdue ? 'text-red-400' : 'text-white'}`}>
                          {isOverdue ? `${Math.abs(daysRemaining)} dias atrás` : `${daysRemaining} dias`}
                        </p>
                      ) : (
                        <p className="text-slate-500">Não definido</p>
                      )}
                    </div>
                  </div>
                  {goal.yieldRate > 0 && (
                    <div className="bg-slate-700/50 rounded-lg p-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300 flex items-center gap-1"><TrendingUp className="w-4 h-4 text-green-400"/>Lucro Até o Momento:</span>
                        <span className="text-green-400 font-semibold">{formatCurrency(totalYieldEarned)} ({monthlyYieldPercentage.toFixed(2)}% <span className="text-xs text-slate-400">mensal est.</span>)</span>
                      </div>
                    </div>
                  )}
                  {goal.deadline && goal.monthlyContribution > 0 && !isOverdue && (
                    <div className="bg-slate-700/50 rounded-lg p-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-300">Aporte mensal sugerido:</span>
                        <span className="text-green-400 font-semibold">{formatCurrency(goal.monthlyContribution)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export default GoalList;
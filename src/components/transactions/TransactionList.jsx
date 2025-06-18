
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Edit, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { getCategoryName } from '@/lib/utils';
import { getFormattedBrasiliaDate } from '@/lib/dateUtils';

const TransactionList = ({ transactions, categories, formatCurrency, onEdit, onDelete }) => {
  if (transactions.length === 0) {
    return (
      <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700">
        <CardHeader><CardTitle className="text-white">Transações do Mês</CardTitle></CardHeader>
        <CardContent>
          <p className="text-slate-400 text-center py-8">Nenhuma transação encontrada para este mês</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700">
      <CardHeader><CardTitle className="text-white">Transações do Mês</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50">
          {transactions.map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${transaction.type === 'receita' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  {transaction.type === 'receita' ? (<TrendingUp className="w-4 h-4 text-green-500" />) : (<TrendingDown className="w-4 h-4 text-red-500" />)}
                </div>
                <div>
                  <p className="text-white font-medium">{transaction.description}</p>
                  <p className="text-slate-400 text-xs">{getCategoryName(transaction.category, categories)} • {getFormattedBrasiliaDate(transaction.date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-semibold ${transaction.type === 'receita' ? 'text-green-500' : 'text-red-500'}`}>{transaction.type === 'receita' ? '+' : '-'}{formatCurrency(transaction.amount)}</span>
                <Button size="sm" variant="ghost" onClick={() => onEdit(transaction)} className="text-slate-400 hover:text-white"><Edit className="w-4 h-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => onDelete(transaction.id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></Button>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionList;

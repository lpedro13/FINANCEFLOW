import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, TrendingDown, Edit, Trash2 } from 'lucide-react';
import { getFormattedBrasiliaDate } from '@/lib/dateUtils';
import { useToast } from '@/components/ui/use-toast';

const RecentTransactionsCard = ({ transactions, formatCurrency, onOpenModal, onEditTransaction, onDataUpdate, categories }) => {
  const { toast } = useToast();
  
  const handleDeleteTransaction = (id) => {
    let allTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const transactionToDelete = allTransactions.find(t => t.id === id);
    
    allTransactions = allTransactions.filter(t => t.id !== id);
    localStorage.setItem('transactions', JSON.stringify(allTransactions));

    if (transactionToDelete?.source?.type === 'investment_purchase') {
        let investments = JSON.parse(localStorage.getItem('investments') || '[]');
        investments = investments.filter(inv => inv.id !== transactionToDelete.source.investmentId);
        localStorage.setItem('investments', JSON.stringify(investments));
    } else if (transactionToDelete?.source?.type === 'investment_dividend') {
        let investments = JSON.parse(localStorage.getItem('investments') || '[]');
        investments = investments.map(inv => {
            if (inv.id === transactionToDelete.source.investmentId) {
                const newDividends = (inv.dividends || 0) - transactionToDelete.amount;
                const newTotalValue = (inv.totalValue || 0) - transactionToDelete.amount;
                return { ...inv, dividends: newDividends, totalValue: newTotalValue, return: newTotalValue + newDividends - inv.totalInvested };
            }
            return inv;
        });
        localStorage.setItem('investments', JSON.stringify(investments));
    }

    toast({ title: "Transação excluída!" });
    if(onDataUpdate) onDataUpdate();
    window.dispatchEvent(new Event('storage'));
  };

  const getCategoryName = (catIdentifier, allCategories) => {
    if (!catIdentifier) return "Sem Categoria";
    if (typeof catIdentifier === 'object' && catIdentifier !== null && catIdentifier.name) {
        return catIdentifier.name;
    }
    if (typeof catIdentifier === 'string') {
        const found = allCategories.find(c => c.id === catIdentifier || c.name === catIdentifier);
        return found ? found.name : catIdentifier;
    }
    return 'Categoria Inválida';
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-white flex items-center gap-2">
            <Wallet className="w-5 h-5 text-green-500" />
            Transações Recentes
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onOpenModal} className="border-slate-600 text-slate-300">
            Ver Todas
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50">
          {transactions.length > 0 ? (
            transactions.map(t => (
              <motion.div 
                key={t.id} 
                className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${t.type === 'receita' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                    {t.type === 'receita' ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
                  </div>
                  <div>
                    <p className="text-white font-medium">{t.description}</p>
                    <p className="text-slate-400 text-xs">{getCategoryName(t.category, categories)} • {getFormattedBrasiliaDate(t.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                    <span className={`font-semibold ${t.type === 'receita' ? 'text-green-500' : 'text-red-500'}`}>
                    {t.type === 'receita' ? '+' : '-'}{formatCurrency(t.amount)}
                    </span>
                    <Button size="icon" variant="ghost" onClick={() => onEditTransaction(t)} className="text-slate-400 hover:text-white h-7 w-7"><Edit className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDeleteTransaction(t.id)} className="text-red-400 hover:text-red-300 h-7 w-7"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-slate-400 text-center py-4">Nenhuma transação este mês.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentTransactionsCard;
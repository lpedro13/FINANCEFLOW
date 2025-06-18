
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trash2, Landmark, ShoppingCart, DollarSign, TrendingDown } from 'lucide-react';
import { formatDateToBrasilia, getFormattedBrasiliaDate } from '@/lib/dateUtils';
import { useToast } from '@/components/ui/use-toast';

const InvestmentTransactionHistory = ({ formatCurrency, onDeleteTransaction }) => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState([]);
  const [visibleTransactions, setVisibleTransactions] = useState(4);

  useEffect(() => {
    loadInvestmentTransactions();
    const handleStorageChange = () => {
      loadInvestmentTransactions();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const loadInvestmentTransactions = () => {
    const allTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const investmentTransactions = JSON.parse(localStorage.getItem('investmentTransactions') || '[]');
    
    // Combinar transações gerais relacionadas à corretora com transações específicas de investimentos
    const brokerageTransactions = allTransactions
      .filter(tx => 
        ['transferencia_corretora', 'resgate_corretora'].includes(tx.category) || 
        (tx.source && (tx.source.type === 'brokerage_deposit' || tx.source.type === 'brokerage_withdraw'))
      )
      .map(tx => ({
        id: tx.id,
        date: tx.date,
        description: tx.description,
        amount: tx.amount,
        type: tx.type, 
        category: tx.category,
        transactionType: tx.source?.type || 'brokerage',
        source: 'general'
      }));

    // Adicionar transações específicas de investimentos
    const investmentSpecificTransactions = investmentTransactions.map(tx => ({
      ...tx,
      source: 'investment'
    }));

    const allInvestmentRelated = [...brokerageTransactions, ...investmentSpecificTransactions]
      .sort((a, b) => new Date(formatDateToBrasilia(b.date)) - new Date(formatDateToBrasilia(a.date)));
    
    setTransactions(allInvestmentRelated);
  };

  const getTransactionIcon = (transaction) => {
    if (transaction.category === 'transferencia_corretora' || transaction.transactionType === 'brokerage_deposit') {
      return <Landmark className="w-4 h-4 text-green-500" />;
    }
    if (transaction.category === 'resgate_corretora' || transaction.transactionType === 'brokerage_withdraw') {
      return <Landmark className="w-4 h-4 text-red-500" />;
    }
    if (transaction.transactionType === 'purchase') {
      return <ShoppingCart className="w-4 h-4 text-blue-500" />;
    }
    if (transaction.transactionType === 'dividend') {
      return <DollarSign className="w-4 h-4 text-purple-500" />;
    }
    if (transaction.transactionType === 'sale') {
      return <TrendingDown className="w-4 h-4 text-orange-500" />;
    }
    return <Landmark className="w-4 h-4 text-slate-500" />;
  };

  const getTransactionColor = (transaction) => {
    if (transaction.transactionType === 'purchase') {
      return 'text-blue-500';
    }
    if (transaction.transactionType === 'dividend') {
      return 'text-purple-500';
    }
    if (transaction.transactionType === 'sale') {
      return 'text-orange-500';
    }
    if (transaction.type === 'receita' || transaction.category === 'resgate_corretora') {
      return 'text-green-500';
    }
    return 'text-red-500';
  };

  const getTransactionSign = (transaction) => {
    if (transaction.transactionType === 'purchase') {
      return '-'; // Compra reduz saldo da corretora
    }
    if (transaction.transactionType === 'dividend' || transaction.transactionType === 'sale') {
      return '+'; // Dividendos e vendas aumentam saldo da corretora
    }
    if (transaction.type === 'receita' || transaction.category === 'resgate_corretora') {
      return '+';
    }
    return '-';
  };
  
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">Histórico de Transações de Investimentos</CardTitle>
      </CardHeader>
      <CardContent className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50">
        {transactions.length === 0 ? (
          <p className="text-slate-400 text-center py-4">Nenhuma transação de investimento encontrada.</p>
        ) : (
          transactions.slice(0, visibleTransactions).map(tx => (
            <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg mb-2">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  tx.transactionType === 'purchase' ? 'bg-blue-500/20' :
                  tx.transactionType === 'dividend' ? 'bg-purple-500/20' :
                  tx.transactionType === 'sale' ? 'bg-orange-500/20' :
                  tx.type === 'receita' || tx.category === 'resgate_corretora' ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                  {getTransactionIcon(tx)}
                </div>
                <div>
                  <p className="text-white font-medium">{tx.description}</p>
                  <p className="text-slate-400 text-xs">{getFormattedBrasiliaDate(tx.date)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-semibold ${getTransactionColor(tx)}`}>
                  {getTransactionSign(tx)}{formatCurrency(tx.amount)}
                </span>
                <Button size="icon" variant="ghost" onClick={() => onDeleteTransaction(tx.id, tx.source)} className="text-red-400 hover:text-red-300 h-7 w-7">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
        {transactions.length > visibleTransactions && (
          <Button 
            variant="outline" 
            className="w-full mt-2 border-slate-600 text-slate-300 hover:bg-slate-700"
            onClick={() => setVisibleTransactions(transactions.length)}
          >
            Ver Mais Transações ({transactions.length - visibleTransactions})
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default InvestmentTransactionHistory;


import React from 'react';
import { useToast } from '@/components/ui/use-toast';
import { formatDateToBrasilia, getCurrentBrasiliaDateISO } from '@/lib/dateUtils';

const TransactionManager = () => {
  const { toast } = useToast();

  const saveTransaction = (formData, editingTransaction) => {
    const allTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const transaction = {
      id: editingTransaction?.id || Date.now().toString(),
      ...formData,
      amount: parseFloat(formData.amount) || 0,
      date: formData.date ? formatDateToBrasilia(formData.date) : getCurrentBrasiliaDateISO()
    };

    let updatedTransactions;
    if (editingTransaction) {
      updatedTransactions = allTransactions.map(t => 
        t.id === editingTransaction.id ? transaction : t
      );
    } else {
      updatedTransactions = [...allTransactions, transaction];
    }

    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
    window.dispatchEvent(new Event('storage'));
    
    return transaction;
  };

  const deleteTransaction = (id) => {
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
    } else if (transactionToDelete?.source?.type === 'goal') {
        let goals = JSON.parse(localStorage.getItem('goals') || '[]');
        goals = goals.map(g => {
            if (g.id === transactionToDelete.source.id) {
                const newAmount = transactionToDelete.type === 'despesa' 
                                ? g.currentAmount - transactionToDelete.amount 
                                : g.currentAmount + transactionToDelete.amount;
                return { ...g, currentAmount: newAmount };
            }
            return g;
        });
        localStorage.setItem('goals', JSON.stringify(goals));
    } else if (transactionToDelete?.source?.type === 'bill') {
        let bills = JSON.parse(localStorage.getItem('bills') || '[]');
        bills = bills.map(b => {
            if (b.id === transactionToDelete.source.id) {
                return { ...b, paid: false };
            }
            return b;
        });
        localStorage.setItem('bills', JSON.stringify(bills));
    }

    window.dispatchEvent(new Event('storage'));
    return transactionToDelete;
  };

  return {
    saveTransaction,
    deleteTransaction
  };
};

export default TransactionManager;


import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { Plus, LayoutGrid } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import MonthSelector from '@/components/MonthSelector';
import CategoryManager from '@/components/CategoryManager';
import AccountsPayable from '@/components/AccountsPayable';
import TransactionManager from '@/components/transactions/TransactionManager';
import TransactionForm from '@/components/transactions/TransactionForm';
import TransactionList from '@/components/transactions/TransactionList';
import TransactionSummaryCards from '@/components/transactions/TransactionSummaryCards';
import CategorySpendingCard from '@/components/transactions/CategorySpendingCard';
import { formatDateToBrasilia, getCurrentBrasiliaDateISO } from '@/lib/dateUtils';
import { getCategoryName } from '@/lib/utils';

const Transactions = ({ selectedMonth, selectedYear, onMonthChange, onYearChange }) => {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'despesa',
    category: '',
    date: getCurrentBrasiliaDateISO().split('T')[0]
  });
  const [spendingByCategory, setSpendingByCategory] = useState({});

  const transactionManager = TransactionManager();

  useEffect(() => {
    loadTransactions();
    loadCategories();
    const handleStorageChange = () => {
        loadTransactions();
        loadCategories();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    calculateSpendingByCategory();
  }, [transactions, categories]);

  const generateRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const loadTransactions = () => {
    const stored = JSON.parse(localStorage.getItem('transactions') || '[]');
    const filtered = stored.filter(t => {
      const date = new Date(formatDateToBrasilia(t.date));
      return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
    });
    setTransactions(filtered.sort((a, b) => new Date(formatDateToBrasilia(b.date)) - new Date(formatDateToBrasilia(a.date))));
  };

  const loadCategories = () => {
    const stored = JSON.parse(localStorage.getItem('categories') || '[]');
    const defaultCategoryNames = ['Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Educação', 'Lazer', 'Roupas', 'Investimentos', 'Metas', 'Contas', 'Outros'];
    
    if (stored.length === 0) {
        const initialCategories = defaultCategoryNames.map(name => ({ id: name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''), name, color: generateRandomColor() }));
        localStorage.setItem('categories', JSON.stringify(initialCategories));
        setCategories(initialCategories);
    } else {
        setCategories(stored.map(cat => 
          typeof cat === 'string' 
          ? { id: cat.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''), name: cat, color: generateRandomColor() } 
          : { ...cat, color: cat.color || generateRandomColor() } 
        ));
    }
  };

  const calculateSpendingByCategory = () => {
    const spending = {};
    transactions.forEach(transaction => {
      if (transaction.type === 'despesa') {
        const categoryName = getCategoryName(transaction.category, categories);
        spending[categoryName] = (spending[categoryName] || 0) + transaction.amount;
      }
    });
    setSpendingByCategory(spending);
  };

  const saveTransaction = () => {
    const savedTransaction = transactionManager.saveTransaction(formData, editingTransaction);
    loadTransactions();
    resetTransactionForm();
    toast({
      title: editingTransaction ? "Transação atualizada!" : "Transação criada!",
      description: "Sua transação foi salva com sucesso."
    });
  };

  const deleteTransaction = (id) => {
    const deletedTransaction = transactionManager.deleteTransaction(id);
    loadTransactions();
    toast({
      title: "Transação excluída!",
      description: "A transação e seus vínculos foram removidos/ajustados."
    });
  };

  const resetTransactionForm = () => {
    setFormData({
      description: '',
      amount: '',
      type: 'despesa',
      category: '',
      date: getCurrentBrasiliaDateISO().split('T')[0]
    });
    setEditingTransaction(null);
    setShowTransactionForm(false);
  };

  const editTransaction = (transaction) => {
    const categoryName = getCategoryName(transaction.category, categories);
    setFormData({
      description: transaction.description,
      amount: transaction.amount.toString(),
      type: transaction.type,
      category: categoryName === 'Sem Categoria' || categoryName === 'Categoria Inválida' ? '' : categoryName,
      date: formatDateToBrasilia(transaction.date).split('T')[0]
    });
    setEditingTransaction(transaction);
    setShowTransactionForm(true);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const totalRevenue = transactions.filter(t => t.type === 'receita').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'despesa').reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">Transações</h2>
          <p className="text-slate-400">Gerencie suas receitas e despesas</p>
        </div>
        <div className="flex gap-4">
          <MonthSelector
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            onMonthChange={onMonthChange}
            onYearChange={onYearChange}
          />
          <Button variant="outline" className="border-slate-600 text-slate-300" onClick={() => setShowCategoryManager(true)}>
            <LayoutGrid className="w-4 h-4 mr-2" />
            Categorias
          </Button>
          <Dialog open={showTransactionForm} onOpenChange={(isOpen) => { if (!isOpen) resetTransactionForm(); else setShowTransactionForm(true);}}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Nova Transação
              </Button>
            </DialogTrigger>
            <TransactionForm
              open={showTransactionForm}
              onOpenChange={setShowTransactionForm}
              formData={formData}
              setFormData={setFormData}
              editingTransaction={editingTransaction}
              categories={categories}
              onSave={saveTransaction}
              onCancel={resetTransactionForm}
            />
          </Dialog>
        </div>
      </div>

      <TransactionSummaryCards 
        totalRevenue={totalRevenue}
        totalExpenses={totalExpenses}
        formatCurrency={formatCurrency}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TransactionList
          transactions={transactions}
          categories={categories}
          formatCurrency={formatCurrency}
          onEdit={editTransaction}
          onDelete={deleteTransaction}
        />
        
        <CategorySpendingCard
          spendingByCategory={spendingByCategory}
          categories={categories}
          formatCurrency={formatCurrency}
        />
      </div>
      
      <AccountsPayable selectedMonth={selectedMonth} selectedYear={selectedYear} categories={categories} />
      <CategoryManager 
        open={showCategoryManager} 
        onOpenChange={setShowCategoryManager}
        onCategoriesUpdate={loadCategories} 
      />
    </div>
  );
};

export default Transactions;

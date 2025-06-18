import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import MonthSelector from '@/components/MonthSelector';
import { getCategoryName } from '@/lib/utils';
import { formatDateToBrasilia, getCurrentBrasiliaDateISO } from '@/lib/dateUtils';

const Budgets = ({ selectedMonth, selectedYear, onMonthChange, onYearChange }) => {
  const { toast } = useToast();
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    month: selectedMonth,
    year: selectedYear,
  });

  useEffect(() => {
    loadBudgets();
    loadCategories();
    loadTransactions();
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, month: selectedMonth, year: selectedYear, category: '', amount: '' }));
  }, [selectedMonth, selectedYear]);

  const loadBudgets = () => {
    const storedBudgets = JSON.parse(localStorage.getItem('budgets') || '[]');
    setBudgets(storedBudgets.filter(b => b.month === selectedMonth && b.year === selectedYear));
  };

  const loadCategories = () => {
    const storedCategories = JSON.parse(localStorage.getItem('categories') || '[]');
    setCategories(storedCategories);
  };

  const loadTransactions = () => {
    const storedTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    setTransactions(storedTransactions.filter(t => {
        const tDate = new Date(formatDateToBrasilia(t.date));
        return tDate.getMonth() === selectedMonth && tDate.getFullYear() === selectedYear && t.type === 'despesa';
    }));
  };

  const saveBudget = () => {
    const allBudgets = JSON.parse(localStorage.getItem('budgets') || '[]');
    const categoryToSave = formData.category || "Sem Categoria";
    
    const budgetItem = {
      id: editingBudget?.id || Date.now().toString(),
      ...formData,
      category: categoryToSave,
      amount: parseFloat(formData.amount) || 0,
    };

    let updatedBudgets;
    if (editingBudget) {
      updatedBudgets = allBudgets.map(b => b.id === editingBudget.id ? budgetItem : b);
    } else {
      const existing = allBudgets.find(b => b.category === budgetItem.category && b.month === budgetItem.month && b.year === budgetItem.year);
      if (existing) {
        toast({ title: "Aviso", description: `Orçamento para ${budgetItem.category} já existe este mês. Edite o existente.`, variant: "default"});
        return;
      }
      updatedBudgets = [...allBudgets, budgetItem];
    }
    
    localStorage.setItem('budgets', JSON.stringify(updatedBudgets));
    loadBudgets();
    resetForm();
    toast({ title: editingBudget ? "Orçamento atualizado!" : "Orçamento criado!", description: "Seu orçamento foi salvo." });
    window.dispatchEvent(new Event('storage'));
  };

  const deleteBudget = (id) => {
    const allBudgets = JSON.parse(localStorage.getItem('budgets') || '[]');
    const updatedBudgets = allBudgets.filter(b => b.id !== id);
    localStorage.setItem('budgets', JSON.stringify(updatedBudgets));
    loadBudgets();
    toast({ title: "Orçamento excluído!", description: "O orçamento foi removido." });
    window.dispatchEvent(new Event('storage'));
  };

  const editBudget = (budget) => {
    setFormData({
      category: budget.category,
      amount: budget.amount.toString(),
      month: budget.month,
      year: budget.year,
    });
    setEditingBudget(budget);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ category: '', amount: '', month: selectedMonth, year: selectedYear });
    setEditingBudget(null);
    setShowForm(false);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const getCategorySpending = (categoryName) => {
    return transactions
      .filter(t => getCategoryName(t.category, categories) === categoryName)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">Orçamentos Mensais</h2>
          <p className="text-slate-400">Defina e acompanhe seus limites de gastos por categoria.</p>
        </div>
        <div className="flex gap-4">
          <MonthSelector selectedMonth={selectedMonth} selectedYear={selectedYear} onMonthChange={onMonthChange} onYearChange={onYearChange} />
          <Dialog open={showForm} onOpenChange={(isOpen) => { if(!isOpen) resetForm(); else setShowForm(true); }}>
            <DialogTrigger asChild>
              <Button onClick={() => setShowForm(true)} className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" /> Novo Orçamento
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50">
              <DialogHeader><DialogTitle className="text-white">{editingBudget ? 'Editar Orçamento' : 'Novo Orçamento'}</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="category" className="text-slate-300">Categoria</Label>
                  <select id="category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full h-10 px-3 rounded-md bg-slate-700 border border-slate-600 text-white">
                    <option value="">Selecione uma categoria</option>
                    {categories.map(cat => (<option key={cat.id || cat.name} value={cat.name}>{cat.name}</option>))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="amount" className="text-slate-300">Valor do Orçamento</Label>
                  <Input id="amount" type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} className="bg-slate-700 border-slate-600 text-white" placeholder="500.00"/>
                </div>
                <div className="flex gap-2">
                  <Button onClick={saveBudget} className="bg-green-600 hover:bg-green-700">{editingBudget ? 'Atualizar' : 'Salvar'}</Button>
                  <Button variant="outline" onClick={resetForm} className="border-slate-600">Cancelar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.length === 0 ? (
             <Card className="md:col-span-2 lg:col-span-3 bg-slate-800/50 border-slate-700">
                <CardContent className="p-8 text-center">
                    <ShieldCheck className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                    <p className="text-slate-400 text-lg">Nenhum orçamento definido para este mês.</p>
                    <p className="text-slate-500 text-sm">Crie orçamentos para controlar seus gastos!</p>
                </CardContent>
             </Card>
        ) : (
          budgets.map((budget, index) => {
            const spending = getCategorySpending(budget.category);
            const progress = budget.amount > 0 ? (spending / budget.amount) * 100 : 0;
            const remaining = budget.amount - spending;
            const isOverBudget = spending > budget.amount;
            const isNearBudget = progress >= 80 && progress <= 100;

            return (
              <motion.div key={budget.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                <Card className={`bg-slate-800/50 border-slate-700 ${isOverBudget ? 'border-red-500/50' : isNearBudget ? 'border-yellow-500/50' : 'border-slate-700'}`}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-white text-xl">{budget.category}</CardTitle>
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => editBudget(budget)} className="text-slate-400 hover:text-white"><Edit className="w-4 h-4" /></Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteBudget(budget.id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="w-full bg-slate-700 rounded-full h-4 relative">
                        <div className={`h-4 rounded-full transition-all duration-500 ${isOverBudget ? 'bg-red-500' : isNearBudget ? 'bg-yellow-500' : 'bg-green-500'}`} style={{ width: `${Math.min(progress, 100)}%` }} />
                        <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white mix-blend-difference">
                            {formatCurrency(spending)} / {formatCurrency(budget.amount)} ({progress.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Gasto: <span className="text-white">{formatCurrency(spending)}</span></span>
                        <span className={`text-slate-400 ${remaining < 0 ? 'text-red-400' : 'text-green-400'}`}>
                          {remaining >= 0 ? "Restante:" : "Excedido:"} <span className="font-semibold">{formatCurrency(Math.abs(remaining))}</span>
                        </span>
                      </div>
                      {isOverBudget && <p className="text-xs text-red-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Orçamento ultrapassado!</p>}
                      {isNearBudget && !isOverBudget && <p className="text-xs text-yellow-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3"/> Perto de atingir o limite!</p>}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Budgets;
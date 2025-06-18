import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import MonthSelector from '@/components/MonthSelector';
import GoalForm from '@/components/goals/GoalForm';
import GoalList from '@/components/goals/GoalList';
import GoalSummaryCards from '@/components/goals/GoalSummaryCards';
import ContributionDialog from '@/components/goals/ContributionDialog';
import WithdrawDialog from '@/components/goals/WithdrawDialog';
import { Plus } from 'lucide-react';
import { formatDateToBrasilia, getCurrentBrasiliaDateISO, getDaysRemaining as calculateDaysRemaining } from '@/lib/dateUtils';

const Goals = ({ selectedMonth, selectedYear, onMonthChange, onYearChange }) => {
  const { toast } = useToast();
  const [goals, setGoals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showContributionForm, setShowContributionForm] = useState(false);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [selectedGoalForAction, setSelectedGoalForAction] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    deadline: getCurrentBrasiliaDateISO().split('T')[0],
    yieldRate: ''
  });
  const [contributionAmount, setContributionAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  useEffect(() => {
    loadAndProcessGoals();
    const handleStorageChange = () => {
        loadAndProcessGoals();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const loadAndProcessGoals = () => {
    let storedGoals = JSON.parse(localStorage.getItem('goals') || '[]');
    let transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    let needsToastUpdate = false;
    const now = new Date(getCurrentBrasiliaDateISO());

    storedGoals = storedGoals.map(goal => {
      let newYieldThisProcessing = 0;
      if (goal.yieldRate > 0 && goal.currentAmount > 0) {
        const lastCalc = new Date(formatDateToBrasilia(goal.lastYieldCalculation || goal.createdAt || getCurrentBrasiliaDateISO()));
        let currentDateIterator = new Date(lastCalc);
        currentDateIterator.setUTCHours(0,0,0,0); 

        let currentBalanceForYield = parseFloat(goal.currentAmount) || 0;
        
        if (goal.lastYieldCalculation && new Date(formatDateToBrasilia(goal.lastYieldCalculation)).toDateString() === now.toDateString()) {
            
        } else {
            while(currentDateIterator < now) {
              const nextDay = new Date(currentDateIterator);
              nextDay.setUTCDate(currentDateIterator.getUTCDate() + 1);
              nextDay.setUTCHours(0,0,0,0);

              if (nextDay > now) break;

              const dayOfWeek = nextDay.getUTCDay(); 
              if (dayOfWeek >= 1 && dayOfWeek <= 5) { 
                const dailyRate = Math.pow(1 + (parseFloat(goal.yieldRate) / 100), 1/252) - 1; 
                const yieldAmount = currentBalanceForYield * dailyRate;
                
                if (yieldAmount > 0) {
                  currentBalanceForYield += yieldAmount;
                  newYieldThisProcessing += yieldAmount;
                  
                  const yieldTransactionId = `yield-${goal.id}-${nextDay.toISOString().split('T')[0]}`;
                  const existingTransaction = transactions.find(t => t.id === yieldTransactionId);
                  if (existingTransaction) {
                    existingTransaction.amount = yieldAmount; 
                  } else {
                    
                  }
                  needsToastUpdate = true; 
                }
              }
              currentDateIterator = nextDay;
            }
        }
        if (newYieldThisProcessing > 0) {
            goal.currentAmount = currentBalanceForYield;
            goal.totalYieldEarned = (goal.totalYieldEarned || 0) + newYieldThisProcessing;
        }
        goal.lastYieldCalculation = now.toISOString();
      }
      return goal;
    });

    if (needsToastUpdate) {
      localStorage.setItem('goals', JSON.stringify(storedGoals));
      
      toast({ title: 'Metas atualizadas', description: 'Os rendimentos de suas metas foram calculados.'});
    } else {
      localStorage.setItem('goals', JSON.stringify(storedGoals));
    }

    setGoals(storedGoals);
  };
  
  const calculateMonthlyContribution = (goal) => {
    if (goal.deadline) {
      const deadlineDate = new Date(formatDateToBrasilia(goal.deadline));
      const currentDate = new Date(getCurrentBrasiliaDateISO());
      const monthsRemaining = Math.max(1, Math.ceil((deadlineDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)));
      const remainingAmount = parseFloat(goal.targetAmount) - (parseFloat(goal.currentAmount) || 0);
      return Math.max(0, remainingAmount / monthsRemaining);
    }
    return 0;
  };
  
  const saveGoal = () => {
    const currentGoals = JSON.parse(localStorage.getItem('goals') || '[]');
    
    const newCurrentAmount = parseFloat(formData.currentAmount) || 0;
    let originalGoalData = { currentAmount: 0, totalYieldEarned: 0 };
    let isEditing = !!editingGoal;

    if (isEditing) {
        const foundOriginalGoal = currentGoals.find(g => g.id === editingGoal.id);
        if (foundOriginalGoal) {
            originalGoalData = {
                currentAmount: parseFloat(foundOriginalGoal.currentAmount) || 0,
                totalYieldEarned: parseFloat(foundOriginalGoal.totalYieldEarned) || 0
            };
        }
    }

    const goal = {
      id: editingGoal?.id || Date.now().toString(),
      name: formData.name || "Meta Sem Nome",
      targetAmount: parseFloat(formData.targetAmount) || 0,
      currentAmount: newCurrentAmount,
      deadline: formData.deadline ? formatDateToBrasilia(formData.deadline) : null,
      yieldRate: parseFloat(formData.yieldRate) || 0,
      createdAt: editingGoal?.createdAt || getCurrentBrasiliaDateISO(),
      lastYieldCalculation: editingGoal?.lastYieldCalculation,
      totalYieldEarned: originalGoalData.totalYieldEarned, 
    };
    goal.monthlyContribution = calculateMonthlyContribution(goal);

    let updatedGoals;
    if (editingGoal) {
      updatedGoals = currentGoals.map(g => g.id === editingGoal.id ? goal : g);
    } else {
      updatedGoals = [...currentGoals, goal];
    }
    
    const amountDifference = newCurrentAmount - originalGoalData.currentAmount;

    if (isEditing && amountDifference !== 0) {
        goal.totalYieldEarned += amountDifference;
        goal.lastYieldCalculation = getCurrentBrasiliaDateISO(); 
        updatedGoals = updatedGoals.map(g => g.id === goal.id ? goal : g); 
    } else if (!isEditing && newCurrentAmount > 0) {
        goal.totalYieldEarned = newCurrentAmount;
        goal.lastYieldCalculation = getCurrentBrasiliaDateISO();
        updatedGoals = updatedGoals.map(g => g.id === goal.id ? goal : g);
    }


    localStorage.setItem('goals', JSON.stringify(updatedGoals));
    loadAndProcessGoals();
    resetForm();
    toast({ title: editingGoal ? "Meta atualizada!" : "Meta criada!", description: "Sua meta foi salva." });
    window.dispatchEvent(new Event('storage'));
  };

  const handleContribution = (isContribution) => {
    const amountStr = isContribution ? contributionAmount : withdrawAmount;
    if (!amountStr || !selectedGoalForAction) return;

    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) return;

    if (!isContribution && amount > selectedGoalForAction.currentAmount) {
      toast({ title: "Erro", description: "Valor de retirada maior que o saldo.", variant: "destructive" });
      return;
    }

    const currentGoals = JSON.parse(localStorage.getItem('goals') || '[]');
    const updatedGoals = currentGoals.map(goal => {
      if (goal.id === selectedGoalForAction.id) {
        const newCurrentAmount = isContribution ? goal.currentAmount + amount : goal.currentAmount - amount;
        const updatedGoal = { ...goal, currentAmount: newCurrentAmount, lastYieldCalculation: getCurrentBrasiliaDateISO() };
        updatedGoal.monthlyContribution = calculateMonthlyContribution(updatedGoal);
        return updatedGoal;
      }
      return goal;
    });

    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const transaction = {
      id: Date.now().toString(),
      description: `${isContribution ? 'Aporte' : 'Retirada'} para meta: ${selectedGoalForAction.name}`,
      amount: amount,
      type: isContribution ? 'despesa' : 'receita',
      category: 'Metas',
      date: getCurrentBrasiliaDateISO(),
      source: { type: 'goal_contribution_withdrawal', id: selectedGoalForAction.id, action: isContribution ? 'contribution' : 'withdrawal' }
    };
    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('goals', JSON.stringify(updatedGoals));
    loadAndProcessGoals();

    if(isContribution) {
      setContributionAmount('');
      setShowContributionForm(false);
    } else {
      setWithdrawAmount('');
      setShowWithdrawForm(false);
    }
    setSelectedGoalForAction(null);
    toast({ title: `${isContribution ? 'Aporte' : 'Retirada'} realizado!`, description: `Valor ${isContribution ? 'adicionado à' : 'retirado da'} meta e refletido nas transações.` });
    window.dispatchEvent(new Event('storage'));
  };

  const deleteGoal = (id) => {
    const updatedGoals = goals.filter(goal => goal.id !== id);
    localStorage.setItem('goals', JSON.stringify(updatedGoals));
    let transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    transactions = transactions.filter(t => t.source?.type !== 'goal_contribution_withdrawal' || t.source?.id !== id);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    loadAndProcessGoals();
    toast({ title: "Meta excluída!", description: "A meta e suas transações foram removidas." });
    window.dispatchEvent(new Event('storage'));
  };

  const editGoal = (goal) => {
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      deadline: goal.deadline ? formatDateToBrasilia(goal.deadline).split('T')[0] : getCurrentBrasiliaDateISO().split('T')[0],
      yieldRate: (goal.yieldRate || 0).toString(),
    });
    setEditingGoal(goal);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ name: '', targetAmount: '', currentAmount: '', deadline: getCurrentBrasiliaDateISO().split('T')[0], yieldRate: '' });
    setEditingGoal(null);
    setShowForm(false);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  };

  const calculateProgress = (current, target) => {
    if (target === 0 && current === 0) return 0;
    if (target === 0 && current > 0) return 100;
    return Math.min((current / target) * 100, 100);
  };

  const getDaysRemaining = (deadline) => {
    return calculateDaysRemaining(deadline);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">Metas Financeiras</h2>
          <p className="text-slate-400">Planeje e acompanhe seus objetivos</p>
        </div>
        <div className="flex gap-4">
          <MonthSelector selectedMonth={selectedMonth} selectedYear={selectedYear} onMonthChange={onMonthChange} onYearChange={onYearChange} />
          <Button onClick={() => { setEditingGoal(null); resetForm(); setShowForm(true); }} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" /> Nova Meta
          </Button>
        </div>
      </div>

      <GoalSummaryCards goals={goals} formatCurrency={formatCurrency} />
      
      <GoalForm 
        open={showForm} 
        onOpenChange={(isOpen) => { if (!isOpen) resetForm()}}
        formData={formData}
        setFormData={setFormData}
        editingGoal={editingGoal}
        onSave={saveGoal}
        onCancel={resetForm}
      />

      <GoalList
        goals={goals}
        formatCurrency={formatCurrency}
        calculateProgress={calculateProgress}
        getDaysRemaining={getDaysRemaining}
        onEdit={editGoal}
        onDelete={deleteGoal}
        onOpenContribution={(goal) => { setSelectedGoalForAction(goal); setShowContributionForm(true); }}
        onOpenWithdraw={(goal) => { setSelectedGoalForAction(goal); setShowWithdrawForm(true); }}
      />

      <ContributionDialog
        open={showContributionForm}
        onOpenChange={setShowContributionForm}
        goalName={selectedGoalForAction?.name}
        amount={contributionAmount}
        setAmount={setContributionAmount}
        onConfirm={() => handleContribution(true)}
        onCancel={() => { setShowContributionForm(false); setContributionAmount(''); setSelectedGoalForAction(null);}}
      />
      
      <WithdrawDialog
        open={showWithdrawForm}
        onOpenChange={setShowWithdrawForm}
        goalName={selectedGoalForAction?.name}
        currentAmount={selectedGoalForAction?.currentAmount || 0}
        amount={withdrawAmount}
        setAmount={setWithdrawAmount}
        formatCurrency={formatCurrency}
        onConfirm={() => handleContribution(false)}
        onCancel={() => { setShowWithdrawForm(false); setWithdrawAmount(''); setSelectedGoalForAction(null);}}
      />
    </div>
  );
};

export default Goals;
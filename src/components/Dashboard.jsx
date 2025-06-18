import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { formatDateToBrasilia, getCurrentBrasiliaDateISO, getFormattedBrasiliaDate } from '@/lib/dateUtils';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardCards from '@/components/dashboard/DashboardCards';
import RecentTransactionsCard from '@/components/dashboard/RecentTransactionsCard';
import MonthlySummaryCard from '@/components/dashboard/MonthlySummaryCard';
import SmartAlerts from '@/components/SmartAlerts';
import FinancialTip from '@/components/FinancialTip';
import AllTransactionsModal from '@/components/dashboard/modals/AllTransactionsModal';
import EditTransactionModal from '@/components/dashboard/modals/EditTransactionModal';
import CardDetailModal from '@/components/dashboard/modals/CardDetailModal';
import MonthlyReportModal from '@/components/dashboard/modals/MonthlyReportModal';
import ExpenseCategoryChart from '@/components/dashboard/charts/ExpenseCategoryChart';
import GoalsProgressCard from '@/components/dashboard/summaries/GoalsProgressCard';
import InvestmentSummaryCard from '@/components/dashboard/summaries/InvestmentSummaryCard';
import AlertsRemindersCard from '@/components/dashboard/summaries/AlertsRemindersCard'; 
import { AlertTriangle } from 'lucide-react';

const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

const Dashboard = ({ selectedMonth, selectedYear, onMonthChange, onYearChange }) => {
  const { toast } = useToast();
  const [data, setData] = useState({
    transactions: [],
    investments: [],
    goals: [],
    bills: [],
    categories: [],
    userAlerts: [],
    investmentHistory: []
  });

  const [modals, setModals] = useState({
    showAlerts: false, 
    showFinancialTip: false,
    showAllTransactions: false,
    showEditTransaction: false,
    showCardDetail: false,
    showMonthlyReport: false,
  });

  const [editingTransaction, setEditingTransaction] = useState(null);
  const [cardDetail, setCardDetail] = useState({ type: '', data: [] });
  const [monthlyReport, setMonthlyReport] = useState({ monthName: '', revenue: 0, expenses: 0, transactions: [] });
  
  useEffect(() => {
    loadAllData();
    const handleStorageChange = () => {
        loadAllData();
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, [selectedMonth, selectedYear]);

  const loadAllData = () => {
    try {
      const storedTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
      const storedInvestments = JSON.parse(localStorage.getItem('investments') || '[]');
      const storedGoals = JSON.parse(localStorage.getItem('goals') || '[]');
      const storedBills = JSON.parse(localStorage.getItem('bills') || '[]');
      const storedCategories = JSON.parse(localStorage.getItem('categories') || '[]');
      const storedUserAlerts = JSON.parse(localStorage.getItem('alerts') || '[]');
      const storedInvestmentHistory = JSON.parse(localStorage.getItem('investmentHistory') || '[]');
      
      setData({
        transactions: storedTransactions,
        investments: storedInvestments,
        goals: storedGoals,
        bills: storedBills,
        categories: storedCategories,
        userAlerts: storedUserAlerts,
        investmentHistory: storedInvestmentHistory,
      });

    } catch (error) {
        toast({ title: "Erro ao carregar dados", description: "Não foi possível ler os dados do armazenamento local.", variant: "destructive" });
    }
  };

  const handleDataUpdate = () => {
    loadAllData();
  };

  const handleAddAlert = (alert) => {
    const userAlerts = JSON.parse(localStorage.getItem('alerts') || '[]');
    const newAlert = { ...alert, id: Date.now().toString(), canEdit: true };
    const updatedAlerts = [...userAlerts, newAlert];
    localStorage.setItem('alerts', JSON.stringify(updatedAlerts));
    handleDataUpdate();
    toast({ title: "Alerta criado!", description: "Seu alerta foi adicionado com sucesso." });
  };

  const handleUpdateAlert = (alertId, updatedAlert) => {
    const userAlerts = JSON.parse(localStorage.getItem('alerts') || '[]');
    const updatedAlerts = userAlerts.map(alert => alert.id === alertId ? { ...alert, ...updatedAlert } : alert);
    localStorage.setItem('alerts', JSON.stringify(updatedAlerts));
    handleDataUpdate();
    toast({ title: "Alerta atualizado!", description: "Suas alterações foram salvas." });
  };

  const handleDeleteAlert = (alertId) => {
    const userAlerts = JSON.parse(localStorage.getItem('alerts') || '[]');
    const updatedAlerts = userAlerts.filter(alert => alert.id !== alertId);
    localStorage.setItem('alerts', JSON.stringify(updatedAlerts));
    handleDataUpdate();
    toast({ title: "Alerta removido!", description: "O alerta foi excluído com sucesso." });
  };

  const currentMonthTransactions = useMemo(() => 
    data.transactions.filter(t => {
      const date = new Date(formatDateToBrasilia(t.date));
      return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
    }), [data.transactions, selectedMonth, selectedYear]);

  const dashboardData = useMemo(() => {
    const prevMonthDate = new Date(selectedYear, selectedMonth - 1, 1);
    const prevMonth = prevMonthDate.getMonth();
    const prevYear = prevMonthDate.getFullYear();

    const prevMonthTransactions = data.transactions.filter(t => {
      const date = new Date(formatDateToBrasilia(t.date));
      return date.getMonth() === prevMonth && date.getFullYear() === prevYear;
    });
    
    const prevMonthRevenue = prevMonthTransactions.filter(t => t.type === 'receita').reduce((sum, t) => sum + t.amount, 0);
    const prevMonthExpenses = prevMonthTransactions.filter(t => t.type === 'despesa').reduce((sum, t) => sum + t.amount, 0);
    const prevMonthBalance = prevMonthRevenue - prevMonthExpenses;

    const totalRevenue = currentMonthTransactions.filter(t => t.type === 'receita').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = currentMonthTransactions.filter(t => t.type === 'despesa').reduce((sum, t) => sum + t.amount, 0);
    const totalInvestments = data.investments.reduce((sum, inv) => sum + (inv.totalValue || 0), 0);
    
    const calculateChange = (current, previous) => {
        if (previous === 0) return current > 0 ? "+∞%" : "0%";
        const change = ((current - previous) / Math.abs(previous)) * 100;
        return (change > 0 ? "+" : "") + change.toFixed(1) + "%";
    };
    
    const cardChanges = {
        revenue: calculateChange(totalRevenue, prevMonthRevenue),
        expenses: calculateChange(totalExpenses, prevMonthExpenses),
        investments: "+0.0%",
    };

    const monthlyChartData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(selectedYear, selectedMonth - i, 1);
      const month = date.getMonth();
      const year = date.getFullYear();
      
      const monthTransactions = data.transactions.filter(t => {
        const tDate = new Date(formatDateToBrasilia(t.date));
        return tDate.getMonth() === month && tDate.getFullYear() === year;
      });

      monthlyChartData.push({
        name: date.toLocaleDateString('pt-BR', { month: 'short' }),
        Receitas: monthTransactions.filter(t => t.type === 'receita').reduce((sum, t) => sum + t.amount, 0),
        Despesas: monthTransactions.filter(t => t.type === 'despesa').reduce((sum, t) => sum + t.amount, 0),
        month,
        year
      });
    }

    return {
      totalRevenue,
      totalExpenses,
      totalInvestments,
      monthlyData: {
        revenue: totalRevenue,
        expenses: totalExpenses,
        balance: totalRevenue - totalExpenses + prevMonthBalance,
        prevMonthBalance: prevMonthBalance
      },
      recentTransactions: [...currentMonthTransactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4),
      cardChanges,
      monthlyChartData
    };
  }, [data.transactions, data.investments, selectedMonth, selectedYear]);

  const alerts = useMemo(() => {
    const today = new Date(getCurrentBrasiliaDateISO());
    today.setHours(0, 0, 0, 0);

    const upcomingBills = data.bills.filter(bill => {
      const dueDate = new Date(formatDateToBrasilia(bill.dueDate));
      dueDate.setHours(0, 0, 0, 0);
      const diffTime = dueDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 2 && diffDays >= 0 && !bill.paid;
    }).map(bill => ({
      id: `bill-${bill.id}`,
      type: 'bill',
      title: 'Conta a Vencer',
      message: `${bill.description} vence em ${Math.max(0, Math.ceil((new Date(formatDateToBrasilia(bill.dueDate)) - today) / (1000 * 60 * 60 * 24)))} dias. Valor: ${formatCurrency(bill.amount)}`,
      priority: 'high',
      canEdit: false
    }));

    return [...data.userAlerts, ...upcomingBills];
  }, [data.userAlerts, data.bills]);

  const handleCardClick = (type) => {
    let detailData = [];
    switch (type) {
      case 'Receitas':
        detailData = currentMonthTransactions.filter(t => t.type === 'receita');
        break;
      case 'Despesas':
        detailData = currentMonthTransactions.filter(t => t.type === 'despesa');
        break;
      case 'Investimentos':
        detailData = data.investments;
        break;
      case 'Saldo Total':
        detailData = [
          { label: 'Receitas do Mês', value: dashboardData.totalRevenue, type: 'receita' },
          { label: 'Despesas do Mês', value: dashboardData.totalExpenses, type: 'despesa' },
          { label: 'Saldo do Mês Anterior', value: dashboardData.monthlyData.prevMonthBalance, type: 'saldo' },
          { label: 'Saldo Líquido Atual', value: dashboardData.monthlyData.balance, type: 'saldo_final' },
        ];
        break;
      default: break;
    }
    setCardDetail({ type, data: detailData });
    setModals(prev => ({ ...prev, showCardDetail: true }));
  };

  const handleMonthChartClick = (chartData) => {
    if (!chartData || !chartData.activePayload || chartData.activePayload.length === 0) return;
    const { month, year } = chartData.activePayload[0].payload;
    
    const clickedMonthTransactions = data.transactions.filter(t => {
      const date = new Date(formatDateToBrasilia(t.date));
      return date.getMonth() === month && date.getFullYear() === year;
    });

    setMonthlyReport({
        monthName: new Date(year, month).toLocaleString('pt-BR', { month: 'long', year: 'numeric' }),
        revenue: clickedMonthTransactions.filter(t => t.type === 'receita').reduce((sum, t) => sum + t.amount, 0),
        expenses: clickedMonthTransactions.filter(t => t.type === 'despesa').reduce((sum, t) => sum + t.amount, 0),
        transactions: clickedMonthTransactions
    });
    setModals(prev => ({ ...prev, showMonthlyReport: true }));
  };
  
  const handleEditTransactionClick = (transaction) => {
    setEditingTransaction(transaction);
    setModals(prev => ({ ...prev, showEditTransaction: true }));
  };

  return (
    <div className="space-y-6">
      <DashboardHeader
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onMonthChange={onMonthChange}
        onYearChange={onYearChange}
        onShowFinancialTip={() => setModals(prev => ({ ...prev, showFinancialTip: true }))}
      />

      <DashboardCards dashboardData={dashboardData} formatCurrency={formatCurrency} onCardClick={handleCardClick} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <RecentTransactionsCard
                transactions={dashboardData.recentTransactions}
                formatCurrency={formatCurrency}
                onOpenModal={() => setModals(prev => ({...prev, showAllTransactions: true}))}
                onEditTransaction={handleEditTransactionClick}
                onDataUpdate={handleDataUpdate}
                categories={data.categories}
            />
            <MonthlySummaryCard 
                monthlyData={dashboardData.monthlyData} 
                monthlyChartData={dashboardData.monthlyChartData}
                formatCurrency={formatCurrency} 
                onMonthChartClick={handleMonthChartClick}
            />
        </div>
        <div className="space-y-6">
            <AlertsRemindersCard 
                alerts={alerts} 
                onAddAlert={handleAddAlert}
                onUpdateAlert={handleUpdateAlert}
                onDeleteAlert={handleDeleteAlert}
                onOpenAlertsModal={() => setModals(prev => ({ ...prev, showAlerts: true }))}
            />
            <ExpenseCategoryChart transactions={currentMonthTransactions} categories={data.categories} />
            <InvestmentSummaryCard investments={data.investments} history={data.investmentHistory} />
            <GoalsProgressCard goals={data.goals} />
        </div>
      </div>
      
      <SmartAlerts
        open={modals.showAlerts}
        onOpenChange={(val) => setModals(prev => ({ ...prev, showAlerts: val }))}
        alerts={alerts}
        onAddAlert={handleAddAlert}
        onUpdateAlert={handleUpdateAlert}
        onDeleteAlert={handleDeleteAlert}
      />
      <FinancialTip open={modals.showFinancialTip} onOpenChange={(val) => setModals(prev => ({...prev, showFinancialTip: val}))} />
      <AllTransactionsModal open={modals.showAllTransactions} onOpenChange={(val) => setModals(prev => ({...prev, showAllTransactions: val}))} onEditTransaction={handleEditTransactionClick} transactions={data.transactions} categories={data.categories} onDataUpdate={handleDataUpdate} />
      <EditTransactionModal open={modals.showEditTransaction} onOpenChange={(val) => setModals(prev => ({...prev, showEditTransaction: val}))} transaction={editingTransaction} categories={data.categories} onDataUpdate={handleDataUpdate} />
      <CardDetailModal open={modals.showCardDetail} onOpenChange={(val) => setModals(prev => ({...prev, showCardDetail: val}))} cardDetail={cardDetail} categories={data.categories} />
      <MonthlyReportModal open={modals.showMonthlyReport} onOpenChange={(val) => setModals(prev => ({...prev, showMonthlyReport: val}))} reportData={monthlyReport} categories={data.categories} />
    </div>
  );
};

export default Dashboard;
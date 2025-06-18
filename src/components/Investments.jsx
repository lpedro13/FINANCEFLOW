
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import MonthSelector from '@/components/MonthSelector';
import InvestmentTypeManager from '@/components/InvestmentTypeManager';
import InvestmentForm from '@/components/investments/InvestmentForm';
import InvestmentList from '@/components/investments/InvestmentList';
import InvestmentSummaryCards from '@/components/investments/InvestmentSummaryCards';
import InvestmentEvolutionChart from '@/components/investments/InvestmentEvolutionChart';
import InvestmentPerformanceChart from '@/components/investments/InvestmentPerformanceChart';
import InvestmentTransactionHistory from '@/components/investments/InvestmentTransactionHistory';
import BrokerageBalanceCard from '@/components/investments/BrokerageBalanceCard';
import BrokerageTransactionDialog from '@/components/investments/BrokerageTransactionDialog';
import InvestmentManager from '@/components/investments/InvestmentManager';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Settings, LineChart, BarChartHorizontal, DollarSign, ArrowUpDown } from 'lucide-react';
import { formatDateToBrasilia, getCurrentBrasiliaDateISO } from '@/lib/dateUtils';
import { Dialog, DialogContent, DialogHeader, DialogTitle as ShadDialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const defaultInvestmentTypes = [
  { id: 'acao', name: 'Ação' },
  { id: 'fii', name: 'FII' },
  { id: 'renda_fixa', name: 'Renda Fixa' },
  { id: 'cripto', name: 'Criptomoeda' },
  { id: 'outros', name: 'Outros' },
];

const Investments = ({ selectedMonth, selectedYear, onMonthChange, onYearChange }) => {
  const { toast } = useToast();
  const [investments, setInvestments] = useState([]);
  const [investmentTypes, setInvestmentTypes] = useState(defaultInvestmentTypes);
  const [showForm, setShowForm] = useState(false);
  const [showTypeManager, setShowTypeManager] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'acao',
    quantity: '',
    averagePrice: '',
    currentPrice: '',
    dividends: '',
  });
  const [showDividendForm, setShowDividendForm] = useState(false);
  const [dividendData, setDividendData] = useState({ investmentId: null, amount: '' });
  const [brokerageBalance, setBrokerageBalance] = useState(0);
  const [showBrokerageTransactionDialog, setShowBrokerageTransactionDialog] = useState(false);
  const [brokerageTransactionType, setBrokerageTransactionType] = useState('deposit'); 

  const investmentManager = InvestmentManager();

  useEffect(() => {
    loadInvestments();
    loadInvestmentTypes();
    loadBrokerageBalance();
    
    const handleStorageChange = (event) => {
        if (event.key === 'investments' || event.key === 'investmentTypes' || event.key === 'brokerageBalance' || event.key === 'transactions' || event.key === 'investmentTransactions') {
            loadInvestments();
            loadInvestmentTypes();
            loadBrokerageBalance();
        }
    };

    // Listener específico para atualização do saldo da corretora
    const handleBrokerageBalanceUpdate = (event) => {
      setBrokerageBalance(event.detail);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('brokerageBalanceUpdate', handleBrokerageBalanceUpdate);
    
    return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('brokerageBalanceUpdate', handleBrokerageBalanceUpdate);
    };
  }, []);

  const loadBrokerageBalance = () => {
    const balance = JSON.parse(localStorage.getItem('brokerageBalance') || '0');
    setBrokerageBalance(balance);
  };

  const loadInvestmentTypes = () => {
    const storedTypes = JSON.parse(localStorage.getItem('investmentTypes') || JSON.stringify(defaultInvestmentTypes));
    setInvestmentTypes(storedTypes);
  };

  const updateInvestmentStorageHistory = (currentInvestments) => {
    const todayISO = getCurrentBrasiliaDateISO().split('T')[0];
    const newHistoryEntry = {
      date: todayISO,
      totalValue: currentInvestments.reduce((sum, inv) => sum + (inv.totalValue || 0), 0),
      totalInvested: currentInvestments.reduce((sum, inv) => sum + (inv.totalInvested || 0), 0),
      totalDividends: currentInvestments.reduce((sum, inv) => sum + (inv.dividends || 0), 0),
    };

    let history = JSON.parse(localStorage.getItem('investmentHistory') || '[]');
    const existingEntryIndex = history.findIndex(entry => entry.date === todayISO);
    let updatedHistory;

    if (existingEntryIndex !== -1) {
      updatedHistory = history.map((entry, index) => index === existingEntryIndex ? newHistoryEntry : entry);
    } else {
      updatedHistory = [...history, newHistoryEntry];
    }
    
    localStorage.setItem('investmentHistory', JSON.stringify(updatedHistory));
  };

  const loadInvestments = () => {
    const stored = JSON.parse(localStorage.getItem('investments') || '[]');
    setInvestments(stored);
    updateInvestmentStorageHistory(stored);
  };
  
  const saveInvestment = () => {
    const success = investmentManager.saveInvestment(formData, editingInvestment, brokerageBalance);
    if (success) {
      loadInvestments();
      loadBrokerageBalance(); // Recarregar saldo após salvar
      resetForm();
      toast({ title: editingInvestment ? "Investimento atualizado!" : "Investimento salvo!", description: "Seu investimento foi registrado." });
    }
  };

  const deleteInvestment = (id) => {
    const allInvestments = JSON.parse(localStorage.getItem('investments') || '[]');
    const investmentToDelete = allInvestments.find(inv => inv.id === id);
    if (!investmentToDelete) return;

    const updatedInvestments = allInvestments.filter(inv => inv.id !== id);
    localStorage.setItem('investments', JSON.stringify(updatedInvestments));
    
    investmentManager.updateBrokerageBalance(brokerageBalance + investmentToDelete.totalInvested - (investmentToDelete.dividends || 0));

    // Remover transações relacionadas
    let transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    transactions = transactions.filter(t => t.source?.investmentId !== id);
    localStorage.setItem('transactions', JSON.stringify(transactions));

    let investmentTransactions = JSON.parse(localStorage.getItem('investmentTransactions') || '[]');
    investmentTransactions = investmentTransactions.filter(t => t.investmentId !== id);
    localStorage.setItem('investmentTransactions', JSON.stringify(investmentTransactions));

    loadInvestments();
    loadBrokerageBalance(); // Recarregar saldo após deletar
    toast({ title: "Investimento excluído!", description: "O investimento foi removido e os saldos ajustados." });
    window.dispatchEvent(new Event('storage'));
  };

  const editInvestment = (investment) => {
    setFormData({
      name: investment.name,
      type: investment.type,
      quantity: investment.quantity.toString(),
      averagePrice: investment.averagePrice.toString(),
      currentPrice: investment.currentPrice.toString(),
      dividends: '0', 
    });
    setEditingInvestment(investment);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ name: '', type: investmentTypes.length > 0 ? investmentTypes[0].id : 'acao', quantity: '', averagePrice: '', currentPrice: '', dividends: '' });
    setEditingInvestment(null);
    setShowForm(false);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  };

  const getTypeLabel = (typeId) => {
    const type = investmentTypes.find(t => t.id === typeId);
    return type ? type.name : typeId;
  };

  const handleAddDividend = () => {
    if (!dividendData.investmentId || !dividendData.amount) {
      toast({ title: "Erro", description: "Selecione um ativo e informe o valor do dividendo.", variant: "destructive" });
      return;
    }
    const amountPerShare = parseFloat(dividendData.amount);
    if (isNaN(amountPerShare) || amountPerShare <= 0) {
      toast({ title: "Erro", description: "Valor do dividendo inválido.", variant: "destructive" });
      return;
    }

    const success = investmentManager.addDividend(dividendData.investmentId, amountPerShare);
    if (success) {
      const targetInvestment = investments.find(inv => inv.id === dividendData.investmentId);
      loadInvestments();
      loadBrokerageBalance(); // Recarregar saldo após adicionar dividendo
      setShowDividendForm(false);
      setDividendData({ investmentId: null, amount: '' });
      toast({ title: "Dividendo Adicionado!", description: `Dividendos de ${targetInvestment?.name} adicionados ao saldo da corretora.` });
    }
  };

  const handleSaleInvestment = (investmentId, quantity, salePrice) => {
    investmentManager.sellInvestment(investmentId, quantity, salePrice);
    loadInvestments();
    loadBrokerageBalance(); // Recarregar saldo após venda
  };

  const performanceChartData = investments.map(inv => ({
    name: inv.name,
    'Valor Investido': inv.totalInvested || 0,
    'Valor Atual': inv.totalValue || 0,
    'Proventos Recebidos': inv.dividends || 0,
  }));

  const handleDeleteInvestmentTransaction = (transactionId, source) => {
    investmentManager.deleteInvestmentTransaction(transactionId, source);
    loadInvestments();
    loadBrokerageBalance(); // Recarregar saldo após deletar transação
  };

  const handleBrokerageTransaction = (amount, type) => {
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast({ title: "Erro", description: "Valor inválido.", variant: "destructive" });
      return;
    }

    let newBalance = brokerageBalance;
    let transactionCategory = '';
    let transactionType = '';
    let transactionDescription = '';

    if (type === 'deposit') {
      newBalance += numericAmount;
      transactionCategory = 'transferencia_corretora';
      transactionType = 'despesa';
      transactionDescription = 'Aporte para Saldo da Corretora';
    } else {
      if (numericAmount > brokerageBalance) {
        toast({ title: "Erro", description: "Saldo insuficiente para retirada.", variant: "destructive" });
        return;
      }
      newBalance -= numericAmount;
      transactionCategory = 'resgate_corretora';
      transactionType = 'receita';
      transactionDescription = 'Retirada do Saldo da Corretora';
    }

    investmentManager.updateBrokerageBalance(newBalance);

    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const newTransaction = {
      id: `brokerage_${type}_${Date.now().toString()}`,
      description: transactionDescription,
      amount: numericAmount,
      type: transactionType,
      category: transactionCategory,
      date: getCurrentBrasiliaDateISO(),
      source: { type: `brokerage_${type}` }
    };
    transactions.push(newTransaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));

    toast({ title: "Sucesso!", description: `${type === 'deposit' ? 'Aporte' : 'Retirada'} realizado com sucesso.` });
    setShowBrokerageTransactionDialog(false);
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">Investimentos</h2>
          <p className="text-slate-400">Gerencie sua carteira de investimentos</p>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <MonthSelector selectedMonth={selectedMonth} selectedYear={selectedYear} onMonthChange={onMonthChange} onYearChange={onYearChange} />
          <Button variant="outline" className="border-slate-600 text-slate-300" onClick={() => setShowTypeManager(true)}>
            <Settings className="w-4 h-4 mr-2" /> Gerenciar Tipos
          </Button>
          <Button 
            variant="outline" 
            className="border-cyan-600 text-cyan-400 hover:bg-cyan-600/20" 
            onClick={() => { setBrokerageTransactionType('deposit'); setShowBrokerageTransactionDialog(true);}}
          >
            <ArrowUpDown className="w-4 h-4 mr-2" /> Aporte/Retirada Corretora
          </Button>
          <Dialog open={showDividendForm} onOpenChange={setShowDividendForm}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-purple-600 text-purple-400 hover:bg-purple-600/20">
                <DollarSign className="w-4 h-4 mr-2" /> Adicionar Dividendos
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50">
              <DialogHeader><ShadDialogTitle className="text-white">Adicionar Dividendos Recebidos</ShadDialogTitle></DialogHeader>
              <div className="space-y-4 py-2">
                <div>
                  <Label htmlFor="dividendAsset" className="text-slate-300">Ativo</Label>
                  <select id="dividendAsset" value={dividendData.investmentId || ''} onChange={(e) => setDividendData({...dividendData, investmentId: e.target.value})} className="w-full h-10 px-3 rounded-md bg-slate-700 border border-slate-600 text-white">
                    <option value="">Selecione um ativo</option>
                    {investments.map(inv => (<option key={inv.id} value={inv.id}>{inv.name}</option>))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="dividendAmount" className="text-slate-300">Valor do Dividendo (por cota/unidade)</Label>
                  <Input id="dividendAmount" type="number" step="0.01" value={dividendData.amount} onChange={(e) => setDividendData({...dividendData, amount: e.target.value})} className="bg-slate-700 border-slate-600 text-white" placeholder="0.00"/>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleAddDividend} className="bg-purple-600 hover:bg-purple-700">Salvar Dividendo</Button>
                  <Button variant="outline" onClick={() => {setShowDividendForm(false); setDividendData({investmentId: null, amount: ''})}} className="border-slate-600">Cancelar</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Button onClick={() => { setEditingInvestment(null); resetForm(); setShowForm(true); }} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" /> Novo Investimento
          </Button>
        </div>
      </div>
      
      <BrokerageBalanceCard balance={brokerageBalance} formatCurrency={formatCurrency} />
      <InvestmentSummaryCards investments={investments} formatCurrency={formatCurrency} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader><CardTitle className="text-white flex items-center gap-2"><LineChart className="w-5 h-5 text-blue-500" />Evolução da Carteira</CardTitle></CardHeader>
            <CardContent>
                <InvestmentEvolutionChart history={JSON.parse(localStorage.getItem('investmentHistory') || '[]')} formatCurrency={formatCurrency} />
            </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader><CardTitle className="text-white flex items-center gap-2"><BarChartHorizontal className="w-5 h-5 text-purple-500"/>Performance por Ativo</CardTitle></CardHeader>
            <CardContent>
                <InvestmentPerformanceChart investments={performanceChartData} formatCurrency={formatCurrency} />
            </CardContent>
        </Card>
      </div>

      <InvestmentForm
        open={showForm}
        onOpenChange={(isOpen) => { if (!isOpen) resetForm(); else setShowForm(true);}}
        formData={formData}
        setFormData={setFormData}
        editingInvestment={editingInvestment}
        investmentTypes={investmentTypes}
        onSave={saveInvestment}
        onCancel={resetForm}
      />
      
      <InvestmentList
        investments={investments}
        formatCurrency={formatCurrency}
        getTypeLabel={getTypeLabel}
        onEdit={editInvestment}
        onDelete={deleteInvestment}
        onSale={handleSaleInvestment}
      />

      <InvestmentTypeManager 
        open={showTypeManager} 
        onOpenChange={setShowTypeManager}
        types={investmentTypes}
        onTypesUpdate={(updatedTypes) => {
          setInvestmentTypes(updatedTypes);
          localStorage.setItem('investmentTypes', JSON.stringify(updatedTypes));
        }}
      />
      <InvestmentTransactionHistory 
        formatCurrency={formatCurrency}
        onDeleteTransaction={handleDeleteInvestmentTransaction}
      />
      <BrokerageTransactionDialog
        open={showBrokerageTransactionDialog}
        onOpenChange={setShowBrokerageTransactionDialog}
        transactionType={brokerageTransactionType}
        setTransactionType={setBrokerageTransactionType}
        currentBalance={brokerageBalance}
        onConfirm={handleBrokerageTransaction}
        formatCurrency={formatCurrency}
      />
    </div>
  );
};

export default Investments;

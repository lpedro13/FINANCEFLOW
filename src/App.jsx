
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select as ShadSelect, SelectValue, SelectTrigger, SelectContent, SelectItem as ShadSelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import Dashboard from '@/components/dashboard/Dashboard';
import Transactions from '@/components/Transactions';
import Investments from '@/components/Investments';
import Goals from '@/components/Goals';
import Reports from '@/components/Reports';
import Budgets from '@/components/Budgets';
import Education from '@/components/Education';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, Target, BarChart3, DollarSign, ShieldCheck, RefreshCcw, BookOpen, Home, Save, Upload } from 'lucide-react';
import { formatDateToBrasilia, getCurrentBrasiliaDateISO } from '@/lib/dateUtils';

function App() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedMonth, setSelectedMonth] = useState(new Date(getCurrentBrasiliaDateISO()).getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date(getCurrentBrasiliaDateISO()).getFullYear());
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetPeriod, setResetPeriod] = useState('all');
  const [resetTargetMonth, setResetTargetMonth] = useState(new Date(getCurrentBrasiliaDateISO()).getMonth());
  const [resetTargetYear, setResetTargetYear] = useState(new Date(getCurrentBrasiliaDateISO()).getFullYear());
  const fileInputRef = React.useRef(null);

  const generateRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  useEffect(() => {
    const brokerageBalance = localStorage.getItem('brokerageBalance');
    if (brokerageBalance === null) {
      localStorage.setItem('brokerageBalance', JSON.stringify(0));
    }
    
    const categories = localStorage.getItem('categories');
    if (!categories) {
        localStorage.setItem('categories', JSON.stringify([
          { id: "alimentacao", name: "Alimentação", color: generateRandomColor() },
          { id: "transporte", name: "Transporte", color: generateRandomColor() },
          { id: "moradia", name: "Moradia", color: generateRandomColor() },
          { id: "saude", name: "Saúde", color: generateRandomColor() },
          { id: "educacao", name: "Educação", color: generateRandomColor() },
          { id: "lazer", name: "Lazer", color: generateRandomColor() },
          { id: "roupas", name: "Roupas", color: generateRandomColor() },
          { id: "investimentos_compra", name: "Compra de Ativos", color: generateRandomColor() },
          { id: "metas", name: "Metas", color: generateRandomColor() },
          { id: "contas", name: "Contas", color: generateRandomColor() },
          { id: "transferencia_corretora", name: "Transferência Corretora", color: generateRandomColor() },
          { id: "resgate_corretora", name: "Resgate Corretora", color: generateRandomColor() },
          { id: "dividendos_corretora", name: "Dividendos (Corretora)", color: generateRandomColor() },
          { id: "outros", name: "Outros", color: generateRandomColor() }
        ]));
    }
  }, []);

  const handleResetAllData = () => {
    try {
      const keysToReset = ['transactions', 'investments', 'goals', 'bills', 'alerts', 'budgets', 'investmentHistory', 'categories', 'investmentTypes', 'brokerageBalance', 'investmentTransactions'];
      
      if (resetPeriod === 'all') {
        keysToReset.forEach(key => localStorage.removeItem(key));
        
        localStorage.setItem('categories', JSON.stringify([
          { id: "alimentacao", name: "Alimentação", color: generateRandomColor() },
          { id: "transporte", name: "Transporte", color: generateRandomColor() },
          { id: "moradia", name: "Moradia", color: generateRandomColor() },
          { id: "saude", name: "Saúde", color: generateRandomColor() },
          { id: "educacao", name: "Educação", color: generateRandomColor() },
          { id: "lazer", name: "Lazer", color: generateRandomColor() },
          { id: "roupas", name: "Roupas", color: generateRandomColor() },
          { id: "investimentos_compra", name: "Compra de Ativos", color: generateRandomColor() },
          { id: "metas", name: "Metas", color: generateRandomColor() },
          { id: "contas", name: "Contas", color: generateRandomColor() },
          { id: "transferencia_corretora", name: "Transferência Corretora", color: generateRandomColor() },
          { id: "resgate_corretora", name: "Resgate Corretora", color: generateRandomColor() },
          { id: "dividendos_corretora", name: "Dividendos (Corretora)", color: generateRandomColor() },
          { id: "outros", name: "Outros", color: generateRandomColor() }
        ]));
        localStorage.setItem('investmentTypes', JSON.stringify([
          { id: 'acao', name: 'Ação' },
          { id: 'fii', name: 'FII' },
          { id: 'renda_fixa', name: 'Renda Fixa' },
          { id: 'cripto', name: 'Criptomoeda' },
          { id: 'outros', name: 'Outros' },
        ]));
        localStorage.setItem('brokerageBalance', JSON.stringify(0));
        localStorage.setItem('investmentTransactions', JSON.stringify([]));

      } else if (resetPeriod === 'month') {
        keysToReset.forEach(key => {
          if (key === 'brokerageBalance' || key === 'categories' || key === 'investmentTypes') return; 
          let items = JSON.parse(localStorage.getItem(key) || '[]');
          if (items.length > 0) {
            const filteredItems = items.filter(item => {
              let itemDateSource = item.date || item.createdAt || item.dueDate;
              
              if (key === 'budgets' && item.month !== undefined && item.year !== undefined) {
                  return !(item.month === resetTargetMonth && item.year === resetTargetYear);
              }
              
              if (itemDateSource) {
                const itemDate = new Date(formatDateToBrasilia(itemDateSource));
                return !(itemDate.getMonth() === resetTargetMonth && itemDate.getFullYear() === resetTargetYear);
              }
              return true; 
            });
            localStorage.setItem(key, JSON.stringify(filteredItems));
          }
        });
      }

      toast({
        title: "Dados Resetados!",
        description: resetPeriod === 'all' ? "Todos os dados foram apagados com sucesso." : `Dados de ${new Date(resetTargetYear, resetTargetMonth).toLocaleString('default', { month: 'long' })}/${resetTargetYear} foram apagados.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao resetar",
        description: "Não foi possível resetar os dados.",
        variant: "destructive"
      });
    } finally {
      setShowResetDialog(false);
      setTimeout(() => window.location.reload(), 1000); 
    }
  };

  const handleSaveData = () => {
    try {
      const allData = {};
      const keysToSave = ['transactions', 'investments', 'goals', 'bills', 'alerts', 'budgets', 'investmentHistory', 'categories', 'investmentTypes', 'brokerageBalance', 'investmentTransactions'];
      keysToSave.forEach(key => {
        const item = localStorage.getItem(key);
        if (key === 'brokerageBalance') {
          allData[key] = item ? JSON.parse(item) : 0;
        } else {
          allData[key] = item ? JSON.parse(item) : (key === 'categories' || key === 'investmentTypes' ? [] : []);
        }
      });

      const jsonString = JSON.stringify(allData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const href = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = href;
      link.download = `financeflow_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(href);

      toast({
        title: "Dados Salvos!",
        description: "Seu backup foi baixado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao Salvar",
        description: "Não foi possível salvar os dados.",
        variant: "destructive"
      });
    }
  };

  const handleLoadData = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const loadedData = JSON.parse(e.target.result);
          const keysToLoad = ['transactions', 'investments', 'goals', 'bills', 'alerts', 'budgets', 'investmentHistory', 'categories', 'investmentTypes', 'brokerageBalance', 'investmentTransactions'];
          
          let dataIsValid = true;
          keysToLoad.forEach(key => {
            if (key === 'brokerageBalance') {
              if (loadedData[key] === undefined || typeof loadedData[key] !== 'number') {
                loadedData[key] = 0; 
              }
            } else if (loadedData[key] === undefined || !Array.isArray(loadedData[key])) {
               if (key === 'categories' || key === 'investmentTypes') {
                if (loadedData[key] === undefined) loadedData[key] = []; 
                else if (!Array.isArray(loadedData[key])) dataIsValid = false;
              } else {
                dataIsValid = false;
              }
            }
          });

          if (!dataIsValid) {
            toast({ title: "Erro ao Carregar", description: "Arquivo de backup inválido ou corrompido. Verifique a estrutura dos dados.", variant: "destructive" });
            return;
          }

          keysToLoad.forEach(key => {
            if (key === 'brokerageBalance') {
              localStorage.setItem(key, JSON.stringify(loadedData[key] || 0));
            } else {
              localStorage.setItem(key, JSON.stringify(loadedData[key] || []));
            }
          });
          
          toast({
            title: "Dados Carregados!",
            description: "Seu backup foi restaurado com sucesso. A página será recarregada.",
          });
          setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
          toast({
            title: "Erro ao Carregar",
            description: "Não foi possível ler o arquivo de backup. Verifique se o arquivo é válido.",
            variant: "destructive"
          });
        } finally {
          if(fileInputRef.current) fileInputRef.current.value = "";
        }
      };
      reader.readAsText(file);
    }
  };

  const months = Array.from({ length: 12 }, (_, i) => ({ value: i, label: new Date(0, i).toLocaleString('pt-BR', { month: 'long' }) }));
  const currentYear = new Date(getCurrentBrasiliaDateISO()).getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 overflow-x-hidden">
      <div className="container mx-auto p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 md:mb-8 text-center md:text-left"
        >
          <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
            <Home className="w-10 h-10 text-emerald-500" />
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
              FinanceFlow
            </h1>
          </div>
          <p className="text-slate-400 text-md md:text-lg">
            Controle financeiro completo e inteligente. Gerencie receitas, despesas, investimentos e metas em um só lugar.
          </p>
        </motion.div>

        <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-4 md:grid-cols-7 bg-slate-800/50 backdrop-blur-sm border border-slate-700 h-auto p-1">
            {[
              { value: "dashboard", label: "Dashboard", icon: BarChart3 },
              { value: "transactions", label: "Transações", icon: Wallet },
              { value: "investments", label: "Investim.", icon: TrendingUp },
              { value: "goals", label: "Metas", icon: Target },
              { value: "budgets", label: "Orçamentos", icon: ShieldCheck },
              { value: "reports", label: "Relatórios", icon: DollarSign },
              { value: "education", label: "Educação", icon: BookOpen },
            ].map(tab => (
              <TabsTrigger 
                key={tab.value}
                value={tab.value} 
                className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white text-slate-300 hover:bg-slate-700/80 py-2 px-1 text-xs sm:text-sm h-full"
              >
                <tab.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {[
            { value: "dashboard", component: Dashboard },
            { value: "transactions", component: Transactions },
            { value: "investments", component: Investments },
            { value: "goals", component: Goals },
            { value: "budgets", component: Budgets },
            { value: "reports", component: Reports },
            { value: "education", component: Education },
          ].map(tab => (
            <TabsContent key={tab.value} value={tab.value} className="focus-visible:ring-0 focus-visible:ring-offset-0">
              <tab.component 
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                onMonthChange={setSelectedMonth}
                onYearChange={setSelectedYear}
              />
            </TabsContent>
          ))}
        </Tabs>
        
        <footer className="mt-12 text-center py-6 border-t border-slate-700">
          <div className="flex flex-col items-center justify-center gap-2 mb-3">
            <Home className="w-7 h-7 text-emerald-500" />
            <span className="text-slate-400 font-semibold">FinanceFlow</span>
          </div>
          <p className="text-slate-500 text-xs mb-3">
            Transformando sua relação com o dinheiro através de tecnologia e inteligência financeira.
          </p>
          <div className="flex justify-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSaveData} className="border-blue-600 text-blue-400 hover:bg-blue-600/20">
              <Save className="w-3 h-3 mr-1.5" />
              Salvar Dados
            </Button>
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="border-green-600 text-green-400 hover:bg-green-600/20">
              <Upload className="w-3 h-3 mr-1.5" />
              Carregar Dados
            </Button>
            <Input type="file" ref={fileInputRef} onChange={handleLoadData} accept=".json" className="hidden" />
            <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
              <DialogTrigger asChild>
                <Button variant="destructive" size="sm" className="bg-red-700 hover:bg-red-800">
                  <RefreshCcw className="w-3 h-3 mr-1.5" />
                  Resetar Dados
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Confirmar Reset de Dados</DialogTitle>
                  <DialogDescription className="text-slate-400">
                    Esta ação é irreversível. Selecione o período para resetar.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="resetPeriod" className="text-slate-300 mb-1 block">Período</Label>
                    <ShadSelect value={resetPeriod} onValueChange={setResetPeriod}>
                      <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Selecione o período" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-700 border-slate-600 text-white max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50">
                        <ShadSelectItem value="all" className="hover:bg-slate-600 focus:bg-slate-600">Todos os Dados</ShadSelectItem>
                        <ShadSelectItem value="month" className="hover:bg-slate-600 focus:bg-slate-600">Mês Específico</ShadSelectItem>
                      </SelectContent>
                    </ShadSelect>
                  </div>
                  {resetPeriod === 'month' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="resetMonth" className="text-slate-300 mb-1 block">Mês</Label>
                        <ShadSelect value={resetTargetMonth.toString()} onValueChange={(val) => setResetTargetMonth(parseInt(val))}>
                          <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-white">
                            <SelectValue placeholder="Selecione o mês" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-700 border-slate-600 text-white max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50">
                            {months.map(m => <ShadSelectItem key={m.value} value={m.value.toString()} className="hover:bg-slate-600 focus:bg-slate-600">{m.label}</ShadSelectItem>)}
                          </SelectContent>
                        </ShadSelect>
                      </div>
                      <div>
                        <Label htmlFor="resetYear" className="text-slate-300 mb-1 block">Ano</Label>
                         <ShadSelect value={resetTargetYear.toString()} onValueChange={(val) => setResetTargetYear(parseInt(val))}>
                          <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-white">
                            <SelectValue placeholder="Selecione o ano" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-700 border-slate-600 text-white max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50">
                            {years.map(y => <ShadSelectItem key={y} value={y.toString()} className="hover:bg-slate-600 focus:bg-slate-600">{y}</ShadSelectItem>)}
                          </SelectContent>
                        </ShadSelect>
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowResetDialog(false)} className="border-slate-600 text-slate-300 hover:bg-slate-700">
                    Cancelar
                  </Button>
                  <Button variant="destructive" onClick={handleResetAllData} className="bg-red-600 hover:bg-red-700">
                    Confirmar Reset
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <p className="text-slate-600 text-xs mt-3">
            © {new Date(getCurrentBrasiliaDateISO()).getFullYear()} FinanceFlow. Todos os direitos reservados.
          </p>
        </footer>
      </div>
      <Toaster />
    </div>
  );
}

export default App;

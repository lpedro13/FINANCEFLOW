
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line, CartesianGrid } from 'recharts';
import { Download, TrendingUp, TrendingDown, DollarSign, PiggyBank, LineChart as LineChartIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { exportToPdf } from '@/lib/exportToPdf';
import { formatDateToBrasilia, getCurrentBrasiliaDateISO } from '@/lib/dateUtils';

const CustomTooltip = ({ active, payload, label, formatCurrency }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-700/80 p-3 rounded-lg border border-slate-600 shadow-lg">
        <p className="label text-slate-300 text-sm font-bold">{`${label}`}</p>
        {payload.map((entry, index) => (
          <p key={`item-${index}`} style={{ color: entry.color }} className="text-xs">
            {`${entry.name} : ${formatCurrency(entry.value)}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Reports = () => {
  const { toast } = useToast();
  const [filterType, setFilterType] = useState('monthly');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date(getCurrentBrasiliaDateISO()).getFullYear(), new Date(getCurrentBrasiliaDateISO()).getMonth(), 1).toISOString().split('T')[0],
    end: new Date(new Date(getCurrentBrasiliaDateISO()).getFullYear(), new Date(getCurrentBrasiliaDateISO()).getMonth() + 1, 0).toISOString().split('T')[0]
  });
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [allData, setAllData] = useState({ transactions: [], investments: [], categories: [], goals: [], investmentHistory: [] });

  useEffect(() => {
    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const investments = JSON.parse(localStorage.getItem('investments') || '[]');
    const categories = JSON.parse(localStorage.getItem('categories') || '[]');
    const goals = JSON.parse(localStorage.getItem('goals') || '[]');
    const investmentHistory = JSON.parse(localStorage.getItem('investmentHistory') || '[]');
    setAllData({ transactions, investments, categories, goals, investmentHistory });
  }, []);
  
  const handleFilterChange = (type) => {
    setFilterType(type);
    const today = new Date(getCurrentBrasiliaDateISO());
    if (type === 'monthly') {
      setDateRange({
        start: new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0],
        end: new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0]
      });
    }
  };

  const filteredData = useMemo(() => {
    const start = new Date(formatDateToBrasilia(dateRange.start));
    start.setHours(0, 0, 0, 0);
    const end = new Date(formatDateToBrasilia(dateRange.end));
    end.setHours(23, 59, 59, 999);

    return allData.transactions.filter(t => {
      const transactionDate = new Date(formatDateToBrasilia(t.date));
      const categoryMatch = selectedCategory === 'all' || t.category === selectedCategory;
      return transactionDate >= start && transactionDate <= end && categoryMatch;
    });
  }, [allData.transactions, dateRange, selectedCategory]);

  const summaryData = useMemo(() => {
    const revenue = filteredData.filter(t => t.type === 'receita').reduce((sum, t) => sum + t.amount, 0);
    const expenses = filteredData.filter(t => t.type === 'despesa').reduce((sum, t) => sum + t.amount, 0);
    const balance = revenue - expenses;
    const savingRate = revenue > 0 ? (balance / revenue) * 100 : 0;
    return { revenue, expenses, balance, savingRate };
  }, [filteredData]);
  
  const chartData = useMemo(() => {
    const dataMap = new Map();
    filteredData.forEach(t => {
        const date = formatDateToBrasilia(t.date).split('T')[0];
        if (!dataMap.has(date)) {
            dataMap.set(date, { Receitas: 0, Despesas: 0 });
        }
        const dayData = dataMap.get(date);
        if (t.type === 'receita') dayData.Receitas += t.amount;
        if (t.type === 'despesa') dayData.Despesas += t.amount;
    });
    
    const sortedData = Array.from(dataMap.entries()).sort((a,b) => new Date(a[0]) - new Date(b[0]));

    let cumulativeBalance = 0;
    return sortedData.map(([date, values]) => {
        cumulativeBalance += values.Receitas - values.Despesas;
        return {
            name: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
            ...values,
            Saldo: cumulativeBalance
        };
    });
  }, [filteredData]);

  const investmentEvolutionData = useMemo(() => {
    return allData.investmentHistory.map(entry => ({
      date: new Date(entry.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      'Valor Total': entry.totalValue
    })).sort((a,b) => {
      const dateA = a.date.split('/').reverse().join('-');
      const dateB = b.date.split('/').reverse().join('-');
      return new Date(dateA) - new Date(dateB);
    });
  }, [allData.investmentHistory]);

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

  const handleExport = () => {
    toast({ title: 'Exportando Relatório...', description: 'Seu PDF estará pronto em breve.' });
    const reportTitle = `Relatório de ${new Date(dateRange.start).toLocaleDateString('pt-BR')} a ${new Date(dateRange.end).toLocaleDateString('pt-BR')}`;
    
    const categoriesSpending = filteredData
      .filter(t => t.type === 'despesa')
      .reduce((acc, t) => {
        const categoryName = t.category || 'Outros';
        acc[categoryName] = (acc[categoryName] || 0) + t.amount;
        return acc;
      }, {});

    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(new Date(dateRange.end).getFullYear(), new Date(dateRange.end).getMonth() - i, 1);
      const month = date.getMonth();
      const year = date.getFullYear();
      
      const monthTransactions = allData.transactions.filter(t => {
        const tDate = new Date(formatDateToBrasilia(t.date));
        return tDate.getMonth() === month && tDate.getFullYear() === year;
      });
      const receitas = monthTransactions.filter(t => t.type === 'receita').reduce((sum, t) => sum + t.amount, 0);
      const despesas = monthTransactions.filter(t => t.type === 'despesa').reduce((sum, t) => sum + t.amount, 0);
      monthlyTrend.push({
        month: date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
        receitas,
        despesas,
        saldo: receitas - despesas
      });
    }

    const dataToExport = {
      summary: summaryData,
      chartData,
      transactions: filteredData,
      categoriesSpending,
      monthlyTrend,
      investments: allData.investments,
      goals: allData.goals,
    };
    exportToPdf(dataToExport, reportTitle, formatCurrency);
  };
  
  const summaryCards = [
    { title: "Receitas", value: summaryData.revenue, icon: TrendingUp, color: "text-green-500" },
    { title: "Despesas", value: summaryData.expenses, icon: TrendingDown, color: "text-red-500" },
    { title: "Saldo", value: summaryData.balance, icon: DollarSign, color: summaryData.balance >= 0 ? "text-green-500" : "text-red-500" },
    { title: "Taxa de Poupança", value: `${summaryData.savingRate.toFixed(2)}%`, icon: PiggyBank, color: "text-blue-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Relatórios Avançados</h2>
          <p className="text-slate-400">Análise detalhada para decisões inteligentes.</p>
        </div>
        <Button onClick={handleExport} variant="outline" className="border-slate-600 text-slate-300 w-full sm:w-auto self-start md:self-center">
          <Download className="w-4 h-4 mr-2" /> Exportar PDF
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
        <div className="flex-1">
          <Label className="text-slate-300">Período</Label>
          <div className="flex gap-2 mt-1">
            <Button onClick={() => handleFilterChange('monthly')} variant={filterType === 'monthly' ? 'default' : 'outline'} className="flex-1 data-[state=active]:bg-green-600">Mensal</Button>
            <Button onClick={() => handleFilterChange('custom')} variant={filterType === 'custom' ? 'default' : 'outline'} className="flex-1 data-[state=active]:bg-green-600">Personalizado</Button>
          </div>
        </div>
        {filterType === 'custom' && (
          <>
            <div className="flex-1"><Label htmlFor="startDate" className="text-slate-300">Data Inicial</Label><Input id="startDate" type="date" value={dateRange.start} onChange={e => setDateRange(prev => ({...prev, start: e.target.value}))} className="bg-slate-700 border-slate-600 text-white w-full mt-1"/></div>
            <div className="flex-1"><Label htmlFor="endDate" className="text-slate-300">Data Final</Label><Input id="endDate" type="date" value={dateRange.end} onChange={e => setDateRange(prev => ({...prev, end: e.target.value}))} className="bg-slate-700 border-slate-600 text-white w-full mt-1"/></div>
          </>
        )}
        <div className="flex-1">
          <Label htmlFor="categoryFilter" className="text-slate-300">Categoria</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full bg-slate-700 border-slate-600 text-white mt-1"><SelectValue/></SelectTrigger>
            <SelectContent className="bg-slate-700 border-slate-600 text-white max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-700/50">
              <SelectItem value="all">Todas as Categorias</SelectItem>
              {allData.categories.map(cat => <SelectItem key={cat.id || cat.name} value={cat.name}>{cat.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card, i) => (
          <motion.div key={card.title} initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} transition={{delay: i * 0.1}}>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">{card.title}</CardTitle>
                <card.icon className={`w-4 h-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${card.color}`}>{typeof card.value === 'number' ? formatCurrency(card.value) : card.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader><CardTitle className="text-white">Receitas vs. Despesas</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => formatCurrency(value).replace('R$', '').trim()} />
                <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} cursor={{ fill: 'rgba(100, 116, 139, 0.1)' }} />
                <Legend wrapperStyle={{ fontSize: '10px', color: '#94a3b8', paddingTop: '10px' }} />
                <Bar dataKey="Receitas" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={10} />
                <Bar dataKey="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={10} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader><CardTitle className="text-white">Evolução do Saldo</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => formatCurrency(value).replace('R$', '').trim()} />
                <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
                <defs>
                    <linearGradient id="colorSaldo" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <Area type="monotone" dataKey="Saldo" stroke="#3b82f6" strokeWidth={2} fill="url(#colorSaldo)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

       <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader><CardTitle className="text-white flex items-center gap-2"><LineChartIcon className="w-5 h-5 text-purple-500" />Evolução dos Investimentos</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={investmentEvolutionData}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => formatCurrency(value).replace('R$', '').trim()} />
                <Tooltip content={<CustomTooltip formatCurrency={formatCurrency} />} />
                <Legend wrapperStyle={{ fontSize: '10px', color: '#94a3b8', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="Valor Total" stroke="#8b5cf6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
    </div>
  );
};

export default Reports;

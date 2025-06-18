import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, ListChecks, CalendarDays, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { formatDateToBrasilia, getCurrentBrasiliaDateISO, getFormattedBrasiliaDate } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';

const AccountsPayable = ({ selectedMonth, selectedYear, categories }) => {
  const { toast } = useToast();
  const [bills, setBills] = useState([]);
  const [showBillForm, setShowBillForm] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [billData, setBillData] = useState({
    description: '',
    amount: '',
    dueDate: getCurrentBrasiliaDateISO().split('T')[0],
    category: '',
    paid: false,
    recurring: 'no', 
    installments: '', 
    currentInstallment: '',
  });

  useEffect(() => {
    loadBills();
  }, [selectedMonth, selectedYear]);

  const loadBills = () => {
    const stored = JSON.parse(localStorage.getItem('bills') || '[]');
    setBills(stored);
  };

  const saveBill = () => {
    const allBills = JSON.parse(localStorage.getItem('bills') || '[]');
    const billAmount = parseFloat(billData.amount) || 0;
    const totalInstallments = parseInt(billData.installments) || 1;

    let updatedBills;

    if (editingBill) {
      const bill = {
        id: editingBill.id,
        ...billData,
        description: billData.description || "Conta sem descrição",
        amount: billAmount,
        dueDate: formatDateToBrasilia(billData.dueDate),
      };
      updatedBills = allBills.map(b => b.id === editingBill.id ? bill : b);
    } else {
      const newBillsToAdd = [];
      if (billData.recurring === 'monthly' || totalInstallments > 1) {
        const baseDueDate = new Date(formatDateToBrasilia(billData.dueDate));
        for (let i = 0; i < (billData.recurring === 'monthly' ? 12 : totalInstallments); i++) {
          const installmentDueDate = new Date(baseDueDate);
          installmentDueDate.setMonth(baseDueDate.getMonth() + i);
          
          newBillsToAdd.push({
            id: `${Date.now().toString()}-${i}`,
            ...billData,
            description: billData.description || "Conta sem descrição",
            amount: billAmount,
            dueDate: formatDateToBrasilia(installmentDueDate.toISOString().split('T')[0]),
            originalDueDate: formatDateToBrasilia(billData.dueDate), 
            currentInstallment: totalInstallments > 1 ? i + 1 : null,
            totalInstallments: totalInstallments > 1 ? totalInstallments : null,
            paid: false,
          });
        }
      } else {
        newBillsToAdd.push({
          id: Date.now().toString(),
          ...billData,
          description: billData.description || "Conta sem descrição",
          amount: billAmount,
          dueDate: formatDateToBrasilia(billData.dueDate),
          paid: false,
        });
      }
      updatedBills = [...allBills, ...newBillsToAdd];
    }

    localStorage.setItem('bills', JSON.stringify(updatedBills));
    loadBills();
    resetBillForm();
    toast({ title: editingBill ? "Conta atualizada!" : "Conta(s) criada(s)!", description: "Sua conta a pagar foi salva." });
    window.dispatchEvent(new Event('storage'));
  };

  const deleteBill = (id) => {
    const allBills = JSON.parse(localStorage.getItem('bills') || '[]');
    const billToDelete = allBills.find(b => b.id === id);

    let updatedBills = allBills.filter(b => b.id !== id);

    if (billToDelete?.paid) {
        let transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
        const paymentTransactionId = `payment-${billToDelete.id}`;
        transactions = transactions.filter(t => !t.id.startsWith(paymentTransactionId));
        localStorage.setItem('transactions', JSON.stringify(transactions));
    }
    
    localStorage.setItem('bills', JSON.stringify(updatedBills));
    loadBills();
    toast({ title: "Conta excluída!", description: "A conta e a transação de pagamento associada (se houver) foram removidas." });
    window.dispatchEvent(new Event('storage'));
  };

  const togglePaidStatus = (id, forcePaid = true) => {
    let transactionCreatedOrRemoved = false;
    const updatedBills = bills.map(bill => {
      if (bill.id === id && bill.paid !== forcePaid) {
        if (forcePaid) {
          const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
          const paymentTransaction = {
            id: `payment-${bill.id}-${Date.now()}`,
            description: `Pagamento: ${bill.description}`,
            amount: bill.amount,
            type: 'despesa',
            category: bill.category || 'Contas',
            date: getCurrentBrasiliaDateISO(),
            source: { type: 'bill', id: bill.id }
          };
          transactions.push(paymentTransaction);
          localStorage.setItem('transactions', JSON.stringify(transactions));
          toast({ title: "Conta Paga!", description: `Transação de pagamento para "${bill.description}" criada.`});
          transactionCreatedOrRemoved = true;
        } else {
          let transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
          const paymentTransactionId = `payment-${bill.id}`;
          transactions = transactions.filter(t => !t.id.startsWith(paymentTransactionId));
          localStorage.setItem('transactions', JSON.stringify(transactions));
          toast({ title: "Conta Marcada como Não Paga", description: `"${bill.description}" marcada como pendente e transação de pagamento removida.`});
          transactionCreatedOrRemoved = true;
        }
        return { ...bill, paid: forcePaid };
      }
      return bill;
    });
    
    if (transactionCreatedOrRemoved) {
        window.dispatchEvent(new Event('storage'));
    }

    localStorage.setItem('bills', JSON.stringify(updatedBills));
    loadBills();
  };

  const resetBillForm = () => {
    setBillData({ description: '', amount: '', dueDate: getCurrentBrasiliaDateISO().split('T')[0], category: '', paid: false, recurring: 'no', installments: '', currentInstallment: '' });
    setEditingBill(null);
    setShowBillForm(false);
  };

  const editBill = (bill) => {
    setBillData({
      description: bill.description,
      amount: bill.amount.toString(),
      dueDate: formatDateToBrasilia(bill.dueDate).split('T')[0],
      category: bill.category || '',
      paid: bill.paid,
      recurring: bill.recurring || 'no',
      installments: bill.totalInstallments ? bill.totalInstallments.toString() : '',
      currentInstallment: bill.currentInstallment ? bill.currentInstallment.toString() : '',
    });
    setEditingBill(bill);
    setShowBillForm(true);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
  };

  const pendingBills = bills.filter(b => !b.paid && new Date(formatDateToBrasilia(b.dueDate)).getMonth() === selectedMonth && new Date(formatDateToBrasilia(b.dueDate)).getFullYear() === selectedYear);
  const paidBillsThisMonth = bills.filter(b => {
    const billDueDate = new Date(formatDateToBrasilia(b.dueDate));
    return b.paid && billDueDate.getMonth() === selectedMonth && billDueDate.getFullYear() === selectedYear;
  });
  const totalPendingAmountThisMonth = pendingBills.reduce((sum, b) => sum + b.amount, 0);

  const getBillCardClass = (dueDateStr) => {
    const dueDate = new Date(formatDateToBrasilia(dueDateStr));
    const today = new Date(getCurrentBrasiliaDateISO());
    today.setHours(0,0,0,0);
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'bg-red-700/20 border-red-600/30'; 
    if (diffDays <= 2) return 'bg-red-500/20 border-red-500/30';
    if (diffDays <= 4) return 'bg-orange-500/20 border-orange-500/30';
    return 'bg-slate-700/40';
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between py-4 px-5">
        <div className="flex items-center gap-2.5">
            <CalendarDays className="w-5 h-5 text-blue-400" />
            <CardTitle className="text-slate-100 text-lg">Contas a Pagar ({months[selectedMonth]})</CardTitle>
        </div>
        <div className="flex items-center gap-2.5">
            <span className="text-sm text-slate-300">Pendentes: {formatCurrency(totalPendingAmountThisMonth)}</span>
            <Dialog open={showBillForm} onOpenChange={(isOpen) => { if (!isOpen) resetBillForm(); else setShowBillForm(true); }}>
                <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="border-slate-500 text-slate-200 hover:bg-slate-700 text-xs px-2.5 py-1.5">
                    <Plus className="w-3.5 h-3.5 mr-1.5" /> Adicionar
                </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50">
                <DialogHeader><DialogTitle className="text-white">{editingBill ? 'Editar Conta' : 'Nova Conta a Pagar'}</DialogTitle></DialogHeader>
                <div className="space-y-3.5 py-2.5">
                    <div><Label htmlFor="billDescription" className="text-slate-300 text-sm">Descrição</Label><Input id="billDescription" value={billData.description} onChange={(e) => setBillData({ ...billData, description: e.target.value })} className="bg-slate-700 border-slate-600 text-white text-sm" placeholder="Ex: Conta de luz"/></div>
                    <div className="grid grid-cols-2 gap-3.5">
                    <div><Label htmlFor="billAmount" className="text-slate-300 text-sm">Valor</Label><Input id="billAmount" type="number" step="0.01" value={billData.amount} onChange={(e) => setBillData({ ...billData, amount: e.target.value })} className="bg-slate-700 border-slate-600 text-white text-sm" placeholder="0,00"/></div>
                    <div><Label htmlFor="billDueDate" className="text-slate-300 text-sm">Vencimento</Label><Input id="billDueDate" type="date" value={billData.dueDate} onChange={(e) => setBillData({ ...billData, dueDate: e.target.value })} className="bg-slate-700 border-slate-600 text-white text-sm appearance-none"/></div>
                    </div>
                    <div><Label htmlFor="billCategory" className="text-slate-300 text-sm">Categoria</Label><select id="billCategory" value={billData.category} onChange={(e) => setBillData({ ...billData, category: e.target.value })} className="w-full h-10 px-3 rounded-md bg-slate-700 border border-slate-600 text-white text-sm"><option value="">Nenhuma</option>{categories.map(cat => (<option key={cat.id || cat.name} value={cat.name}>{cat.name}</option>))}</select></div>
                    <div className="grid grid-cols-2 gap-3.5">
                        <div><Label htmlFor="billRecurring" className="text-slate-300 text-sm">Recorrência</Label><select id="billRecurring" value={billData.recurring} onChange={(e) => setBillData({ ...billData, recurring: e.target.value, installments: e.target.value !== 'no' ? billData.installments : '' })} className="w-full h-10 px-3 rounded-md bg-slate-700 border border-slate-600 text-white text-sm"><option value="no">Não Recorrente</option><option value="monthly">Mensal (Fixa)</option></select></div>
                        {billData.recurring === 'no' && <div><Label htmlFor="billInstallments" className="text-slate-300 text-sm">Nº Parcelas</Label><Input id="billInstallments" type="number" value={billData.installments} onChange={(e) => setBillData({ ...billData, installments: e.target.value })} className="bg-slate-700 border-slate-600 text-white text-sm" placeholder="Ex: 3"/></div>}
                    </div>
                    <div className="flex items-center space-x-2.5 pt-2"><Input type="checkbox" id="billPaid" checked={billData.paid} onChange={(e) => setBillData({ ...billData, paid: e.target.checked })} className="h-4 w-4 accent-green-500"/><Label htmlFor="billPaid" className="text-slate-300 text-sm">Marcar como paga</Label></div>
                    <div className="flex gap-2.5 pt-2"><Button onClick={saveBill} className="bg-green-600 hover:bg-green-700 text-sm">{editingBill ? 'Atualizar' : 'Salvar'}</Button><Button variant="outline" onClick={resetBillForm} className="border-slate-600 text-sm">Cancelar</Button></div>
                </div>
                </DialogContent>
            </Dialog>
        </div>
      </CardHeader>
      <CardContent className="pt-2.5 px-5 pb-4">
        <div className="space-y-2.5">
          <h4 className="text-sm font-medium text-slate-300 mb-1.5">Pendentes do Mês</h4>
          <div className="max-h-44 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50 space-y-2.5">
            {pendingBills.length === 0 ? (<p className="text-slate-400 text-xs text-center py-3.5">Nenhuma conta pendente para este mês.</p>) : (
              pendingBills.sort((a,b) => new Date(formatDateToBrasilia(a.dueDate)) - new Date(formatDateToBrasilia(b.dueDate))).map((bill) => {
                const dueDate = new Date(formatDateToBrasilia(bill.dueDate));
                const today = new Date(getCurrentBrasiliaDateISO()); today.setHours(0,0,0,0);
                const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                const isOverdue = diffDays < 0;
                let detailText = '';
                if (bill.recurring === 'monthly') detailText = '(Fixa)';
                else if (bill.totalInstallments) detailText = `(${bill.currentInstallment || '?'}/${bill.totalInstallments})`;

                return (
                  <motion.div 
                    key={bill.id} 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className={cn("flex items-center justify-between p-3 rounded-lg text-sm border", getBillCardClass(bill.dueDate))}
                  >
                    <div className="flex-1 flex items-center gap-2.5 overflow-hidden">
                       <div>
                        <p className="text-slate-100 font-medium truncate">{bill.description} <span className="text-slate-400 text-xs">{detailText}</span></p>
                        <p className={cn("text-xs", isOverdue ? 'text-red-300' : diffDays <= 4 ? 'text-orange-300' : 'text-slate-400')}>
                            Vence: {getFormattedBrasiliaDate(bill.dueDate)} {isOverdue ? `(${Math.abs(diffDays)}d atrás)` : diffDays <= 7 ? `(em ${diffDays}d)` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 ml-2.5">
                      <span className="font-semibold text-slate-100">{formatCurrency(bill.amount)}</span>
                      <Button size="sm" variant="ghost" onClick={() => togglePaidStatus(bill.id, true)} className="text-green-400 hover:bg-green-500/20 p-1.5 h-auto"><CheckCircle className="w-4 h-4"/></Button>
                      <Button size="sm" variant="ghost" onClick={() => editBill(bill)} className="text-slate-300 hover:text-white p-1.5 h-auto"><Edit className="w-3.5 h-3.5"/></Button>
                      <Button size="sm" variant="ghost" onClick={() => deleteBill(bill.id)} className="text-red-400 hover:text-red-300 p-1.5 h-auto"><Trash2 className="w-3.5 h-3.5"/></Button>
                    </div>
                  </motion.div>
                );
            }))}
          </div>
        </div>
        <div className="mt-3.5 space-y-2.5">
            <h4 className="text-sm font-medium text-slate-300 mb-1.5">Pagas este Mês</h4>
            <div className="max-h-36 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50 space-y-2.5">
                {paidBillsThisMonth.length === 0 ? (<p className="text-slate-400 text-xs text-center py-3.5">Nenhuma conta paga este mês.</p>) : (
                paidBillsThisMonth.map((bill) => (
                    <motion.div key={bill.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between p-3 rounded-lg bg-green-600/10 text-sm border border-green-600/20">
                    <div className="flex items-center gap-2.5">
                        <ListChecks className="w-4 h-4 text-green-400"/>
                        <div>
                            <p className="text-slate-200 font-medium">{bill.description}</p>
                            <p className="text-slate-400 text-xs">Pago em: {getFormattedBrasiliaDate(bill.dueDate)}</p>
                        </div>
                    </div>
                    <span className="font-semibold text-slate-200">{formatCurrency(bill.amount)}</span>
                    </motion.div>
                ))
                )}
            </div>
        </div>
      </CardContent>
    </Card>
  );
};

const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

export default AccountsPayable;
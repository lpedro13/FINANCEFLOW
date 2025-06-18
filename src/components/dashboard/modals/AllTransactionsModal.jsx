import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { getCurrentBrasiliaDateISO, getFormattedBrasiliaDate } from '@/lib/dateUtils';
import { TrendingUp, TrendingDown, Edit, Trash2 } from 'lucide-react';

const AllTransactionsModal = ({ open, onOpenChange, onEditTransaction, transactions, categories, onDataUpdate }) => {
  const { toast } = useToast();
  const [modalSelectedDate, setModalSelectedDate] = useState(getCurrentBrasiliaDateISO().split('T')[0]);
  const [transactionsForModal, setTransactionsForModal] = useState([]);

  useEffect(() => {
    if (open) {
      loadTransactionsForModalDate();
    }
  }, [modalSelectedDate, open, transactions]);

  const loadTransactionsForModalDate = () => {
    const filtered = transactions.filter(t => {
      const transactionDate = t.date.split('T')[0];
      return transactionDate === modalSelectedDate;
    });
    setTransactionsForModal(filtered);
  };
  
  const handleDeleteTransaction = (id) => {
    const allTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const updatedTransactions = allTransactions.filter(t => t.id !== id);
    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
    toast({ title: "Transação excluída!" });
    if(onDataUpdate) onDataUpdate();
  };

  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-white">Transações do Dia</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Label htmlFor="modalDate" className="text-slate-300">Selecionar Data</Label>
          <Input type="date" id="modalDate" value={modalSelectedDate} onChange={(e) => setModalSelectedDate(e.target.value)} className="bg-slate-700 border-slate-600 text-white mt-1" />
        </div>
        <div className="flex-grow overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50 pr-1">
          {transactionsForModal.length > 0 ? (
            transactionsForModal.map(t => (
              <div key={t.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${t.type === 'receita' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                    {t.type === 'receita' ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />}
                  </div>
                  <div>
                    <p className="text-white font-medium">{t.description}</p>
                    <p className="text-slate-400 text-xs">{categories.find(c => c.name === t.category)?.name || t.category || 'Sem Categoria'} • {getFormattedBrasiliaDate(t.date)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-semibold ${t.type === 'receita' ? 'text-green-500' : 'text-red-500'}`}>{t.type === 'receita' ? '+' : '-'}{formatCurrency(t.amount)}</span>
                  <Button size="sm" variant="ghost" onClick={() => onEditTransaction(t)} className="text-slate-400 hover:text-white"><Edit className="w-4 h-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDeleteTransaction(t.id)} className="text-red-400 hover:text-red-300"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            ))
          ) : (<p className="text-slate-400 text-center py-4">Nenhuma transação para esta data.</p>)}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AllTransactionsModal;
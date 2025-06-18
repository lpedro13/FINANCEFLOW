import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { formatDateToBrasilia, getCurrentBrasiliaDateISO } from '@/lib/dateUtils';
import CategoryManager from '@/components/CategoryManager';
import { Edit } from 'lucide-react';

const EditTransactionModal = ({ open, onOpenChange, transaction, categories, onDataUpdate }) => {
  const { toast } = useToast();
  const [form, setForm] = useState({ description: '', amount: '', type: 'despesa', category: '', date: getCurrentBrasiliaDateISO().split('T')[0] });
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  useEffect(() => {
    if (transaction) {
      setForm({
        description: transaction.description,
        amount: transaction.amount.toString(),
        type: transaction.type,
        category: transaction.category || '',
        date: transaction.date ? formatDateToBrasilia(transaction.date).split('T')[0] : getCurrentBrasiliaDateISO().split('T')[0],
      });
    } else {
      setForm({ description: '', amount: '', type: 'despesa', category: '', date: getCurrentBrasiliaDateISO().split('T')[0] });
    }
  }, [transaction]);

  const handleSave = () => {
    if (!transaction) return;

    let allTransactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    
    const updatedTransaction = {
      ...transaction,
      ...form,
      amount: parseFloat(form.amount) || 0,
      date: formatDateToBrasilia(form.date)
    };
    
    const updatedTransactions = allTransactions.map(t => t.id === transaction.id ? updatedTransaction : t);
    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
    
    toast({ title: "Transação atualizada!", description: "Suas alterações foram salvas." });
    if(onDataUpdate) onDataUpdate();
    onOpenChange(false);
  };

  const handleCategoryUpdate = () => {
    if(onDataUpdate) onDataUpdate();
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-slate-800 border-slate-700 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50">
          <DialogHeader>
            <DialogTitle className="text-white">Editar Transação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="editDesc" className="text-slate-300">Descrição</Label>
              <Input id="editDesc" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="bg-slate-700 border-slate-600 text-white" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editAmount" className="text-slate-300">Valor</Label>
                <Input id="editAmount" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="bg-slate-700 border-slate-600 text-white" />
              </div>
              <div>
                <Label htmlFor="editType" className="text-slate-300">Tipo</Label>
                <select id="editType" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full h-10 px-3 rounded-md bg-slate-700 border border-slate-600 text-white">
                  <option value="receita">Receita</option>
                  <option value="despesa">Despesa</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editCategory" className="text-slate-300">Categoria</Label>
                <div className="flex items-center gap-2">
                  <select id="editCategory" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className="w-full h-10 px-3 rounded-md bg-slate-700 border border-slate-600 text-white">
                    <option value="">Nenhuma</option>
                    {categories.map(cat => <option key={cat.id || cat.name} value={cat.name}>{cat.name}</option>)}
                  </select>
                   <Button variant="outline" size="icon" onClick={() => setShowCategoryManager(true)} className="border-slate-600 text-slate-300">
                      <Edit className="w-4 h-4"/>
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="editDate" className="text-slate-300">Data</Label>
                <Input id="editDate" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="bg-slate-700 border-slate-600 text-white" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="border-slate-600">Cancelar</Button>
            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <CategoryManager open={showCategoryManager} onOpenChange={setShowCategoryManager} onCategoriesUpdate={handleCategoryUpdate} />
    </>
  );
};

export default EditTransactionModal;
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getCurrentBrasiliaDateISO } from '@/lib/dateUtils';

const GoalForm = ({ open, onOpenChange, formData, setFormData, editingGoal, onSave, onCancel }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50">
        <DialogHeader>
          <DialogTitle className="text-white">{editingGoal ? 'Editar Meta' : 'Nova Meta'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="name" className="text-slate-300">Nome da Meta</Label>
            <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="bg-slate-700 border-slate-600 text-white" placeholder="Ex: Viagem para Europa"/>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="targetAmount" className="text-slate-300">Valor Alvo</Label>
              <Input id="targetAmount" type="number" step="0.01" value={formData.targetAmount} onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })} className="bg-slate-700 border-slate-600 text-white" placeholder="0.00"/>
            </div>
            <div>
              <Label htmlFor="currentAmount" className="text-slate-300">Valor Atual</Label>
              <Input id="currentAmount" type="number" step="0.01" value={formData.currentAmount} onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })} className="bg-slate-700 border-slate-600 text-white" placeholder="0.00"/>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
                <Label htmlFor="deadline" className="text-slate-300">Prazo</Label>
                <Input id="deadline" type="date" value={formData.deadline || getCurrentBrasiliaDateISO().split('T')[0]} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} className="bg-slate-700 border-slate-600 text-white appearance-none"/>
            </div>
            <div>
                <Label htmlFor="yieldRate" className="text-slate-300">Rendimento Anual (%)</Label>
                <Input id="yieldRate" type="number" step="0.01" value={formData.yieldRate} onChange={(e) => setFormData({ ...formData, yieldRate: e.target.value })} className="bg-slate-700 border-slate-600 text-white" placeholder="Ex: 8.5"/>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={onSave} className="bg-green-600 hover:bg-green-700">{editingGoal ? 'Atualizar' : 'Salvar'}</Button>
            <Button variant="outline" onClick={onCancel} className="border-slate-600">Cancelar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GoalForm;
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getCurrentBrasiliaDateISO } from '@/lib/dateUtils';

const InvestmentForm = ({ open, onOpenChange, formData, setFormData, editingInvestment, investmentTypes, onSave, onCancel }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50">
        <DialogHeader>
          <DialogTitle className="text-white">
            {editingInvestment ? 'Editar Investimento' : 'Novo Investimento'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="name" className="text-slate-300">Nome do Ativo</Label>
            <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="bg-slate-700 border-slate-600 text-white" placeholder="Ex: PETR4, XPML11..."/>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type" className="text-slate-300">Tipo</Label>
              <select id="type" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full h-10 px-3 rounded-md bg-slate-700 border border-slate-600 text-white">
                {investmentTypes.map(type => (<option key={type.id} value={type.id}>{type.name}</option>))}
              </select>
            </div>
            <div>
              <Label htmlFor="quantity" className="text-slate-300">Quantidade</Label>
              <Input id="quantity" type="number" step="any" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} className="bg-slate-700 border-slate-600 text-white" placeholder="0"/>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="averagePrice" className="text-slate-300">Preço Médio</Label>
              <Input id="averagePrice" type="number" step="0.01" value={formData.averagePrice} onChange={(e) => setFormData({ ...formData, averagePrice: e.target.value })} className="bg-slate-700 border-slate-600 text-white" placeholder="0.00"/>
            </div>
            <div>
              <Label htmlFor="currentPrice" className="text-slate-300">Preço Atual</Label>
              <Input id="currentPrice" type="number" step="0.01" value={formData.currentPrice} onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })} className="bg-slate-700 border-slate-600 text-white" placeholder="0.00"/>
            </div>
          </div>
          <div>
            <Label htmlFor="dividends" className="text-slate-300">Dividendos por Cota/Unid.</Label>
            <Input id="dividends" type="number" step="0.01" value={formData.dividends} onChange={(e) => setFormData({ ...formData, dividends: e.target.value })} className="bg-slate-700 border-slate-600 text-white" placeholder="0.00"/>
          </div>
          <div className="flex gap-2">
            <Button onClick={onSave} className="bg-green-600 hover:bg-green-700">{editingInvestment ? 'Atualizar' : 'Salvar'}</Button>
            <Button variant="outline" onClick={onCancel} className="border-slate-600">Cancelar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvestmentForm;
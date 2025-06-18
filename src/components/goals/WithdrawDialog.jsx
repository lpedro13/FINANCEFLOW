import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const WithdrawDialog = ({ open, onOpenChange, goalName, currentAmount, amount, setAmount, formatCurrency, onConfirm, onCancel }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50">
        <DialogHeader><DialogTitle className="text-white">Retirar da Meta: {goalName}</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="withdrawAmount" className="text-slate-300">Valor da Retirada</Label>
            <Input id="withdrawAmount" type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className="bg-slate-700 border-slate-600 text-white" placeholder="0.00" max={currentAmount || 0}/>
            <p className="text-slate-400 text-sm mt-1">Saldo disponível: {formatCurrency(currentAmount)}</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={onConfirm} className="bg-orange-600 hover:bg-orange-700">Confirmar Retirada</Button>
            <Button variant="outline" onClick={onCancel} className="border-slate-600">Cancelar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawDialog;
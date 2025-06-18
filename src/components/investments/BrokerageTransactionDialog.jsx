import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const BrokerageTransactionDialog = ({ open, onOpenChange, transactionType, setTransactionType, currentBalance, onConfirm, formatCurrency }) => {
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (open) {
      setAmount(''); 
    }
  }, [open]);

  const handleConfirm = () => {
    onConfirm(amount, transactionType);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">Movimentar Saldo da Corretora</DialogTitle>
          <DialogDescription className="text-slate-400">
            Saldo atual na corretora: {formatCurrency(currentBalance)}
          </DialogDescription>
        </DialogHeader>
        <Tabs value={transactionType} onValueChange={setTransactionType} className="w-full pt-2">
          <TabsList className="grid w-full grid-cols-2 bg-slate-700">
            <TabsTrigger value="deposit" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">Aportar</TabsTrigger>
            <TabsTrigger value="withdraw" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">Retirar</TabsTrigger>
          </TabsList>
          <TabsContent value="deposit" className="pt-4">
            <Label htmlFor="depositAmount" className="text-slate-300">Valor do Aporte</Label>
            <Input
              id="depositAmount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white mt-1"
              placeholder="0.00"
            />
          </TabsContent>
          <TabsContent value="withdraw" className="pt-4">
            <Label htmlFor="withdrawAmount" className="text-slate-300">Valor da Retirada</Label>
            <Input
              id="withdrawAmount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-slate-700 border-slate-600 text-white mt-1"
              placeholder="0.00"
            />
             {parseFloat(amount) > currentBalance && (
                <p className="text-red-500 text-xs mt-1">Valor de retirada excede o saldo disponível.</p>
            )}
          </TabsContent>
        </Tabs>
        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-slate-600">Cancelar</Button>
          <Button 
            onClick={handleConfirm} 
            className={transactionType === 'deposit' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            disabled={transactionType === 'withdraw' && parseFloat(amount) > currentBalance}
          >
            Confirmar {transactionType === 'deposit' ? 'Aporte' : 'Retirada'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BrokerageTransactionDialog;
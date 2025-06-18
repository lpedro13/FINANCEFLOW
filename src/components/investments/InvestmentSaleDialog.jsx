
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const InvestmentSaleDialog = ({ open, onOpenChange, investment, formatCurrency, onConfirm }) => {
  const { toast } = useToast();
  const [saleData, setSaleData] = useState({
    quantity: '',
    salePrice: ''
  });

  useEffect(() => {
    if (open && investment) {
      setSaleData({
        quantity: '',
        salePrice: investment.currentPrice?.toString() || ''
      });
    }
  }, [open, investment]);

  const handleConfirm = () => {
    const quantity = parseFloat(saleData.quantity) || 0;
    const salePrice = parseFloat(saleData.salePrice) || 0;

    if (quantity <= 0 || salePrice <= 0) {
      toast({ title: "Erro", description: "Quantidade e preço de venda devem ser maiores que zero.", variant: "destructive" });
      return;
    }

    if (quantity > investment.quantity) {
      toast({ title: "Erro", description: "Quantidade de venda não pode ser maior que a quantidade possuída.", variant: "destructive" });
      return;
    }

    onConfirm(investment.id, quantity, salePrice);
    setSaleData({ quantity: '', salePrice: '' });
  };

  if (!investment) return null;

  const totalSaleValue = (parseFloat(saleData.quantity) || 0) * (parseFloat(saleData.salePrice) || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">Vender Ativo: {investment.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="bg-slate-700/50 p-3 rounded-lg">
            <p className="text-slate-300 text-sm">Quantidade Possuída: <span className="text-white font-semibold">{investment.quantity}</span></p>
            <p className="text-slate-300 text-sm">Preço Médio: <span className="text-white font-semibold">{formatCurrency(investment.averagePrice)}</span></p>
            <p className="text-slate-300 text-sm">Preço Atual: <span className="text-white font-semibold">{formatCurrency(investment.currentPrice)}</span></p>
          </div>
          
          <div>
            <Label htmlFor="saleQuantity" className="text-slate-300">Quantidade a Vender</Label>
            <Input
              id="saleQuantity"
              type="number"
              step="any"
              value={saleData.quantity}
              onChange={(e) => setSaleData({...saleData, quantity: e.target.value})}
              className="bg-slate-700 border-slate-600 text-white mt-1"
              placeholder="0"
              max={investment.quantity}
            />
          </div>
          
          <div>
            <Label htmlFor="salePrice" className="text-slate-300">Preço de Venda (por unidade)</Label>
            <Input
              id="salePrice"
              type="number"
              step="0.01"
              value={saleData.salePrice}
              onChange={(e) => setSaleData({...saleData, salePrice: e.target.value})}
              className="bg-slate-700 border-slate-600 text-white mt-1"
              placeholder="0.00"
            />
          </div>

          {totalSaleValue > 0 && (
            <div className="bg-green-600/20 p-3 rounded-lg border border-green-600/30">
              <p className="text-green-400 font-semibold">Valor Total da Venda: {formatCurrency(totalSaleValue)}</p>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-slate-600">
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm} 
            className="bg-green-600 hover:bg-green-700"
            disabled={!saleData.quantity || !saleData.salePrice || parseFloat(saleData.quantity) > investment.quantity}
          >
            Confirmar Venda
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvestmentSaleDialog;

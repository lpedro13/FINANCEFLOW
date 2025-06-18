
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Edit, Trash2, TrendingDown } from 'lucide-react';
import InvestmentSaleDialog from './InvestmentSaleDialog';

const InvestmentList = ({ investments, formatCurrency, getTypeLabel, onEdit, onDelete, onSale }) => {
  const [showSaleDialog, setShowSaleDialog] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState(null);

  const handleSaleClick = (investment) => {
    setSelectedInvestment(investment);
    setShowSaleDialog(true);
  };

  const handleSaleConfirm = (investmentId, quantity, salePrice) => {
    onSale(investmentId, quantity, salePrice);
    setShowSaleDialog(false);
    setSelectedInvestment(null);
  };

  if (investments.length === 0) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-8 text-center">
          <p className="text-slate-400 text-lg">Nenhum investimento cadastrado</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader><CardTitle className="text-white">Carteira de Investimentos</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-[500px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50">
            {investments.map((investment, index) => (
              <motion.div key={investment.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="p-4 bg-slate-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-white font-semibold text-lg">{investment.name}</p>
                    <p className="text-slate-400 text-sm">{getTypeLabel(investment.type)}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => handleSaleClick(investment)} className="text-orange-400 hover:text-orange-300">
                      <TrendingDown className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => onEdit(investment)} className="text-slate-400 hover:text-white">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => onDelete(investment.id)} className="text-red-400 hover:text-red-300">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div><p className="text-slate-300">Quantidade</p><p className="text-white font-medium">{investment.quantity}</p></div>
                  <div><p className="text-slate-300">Preço Médio</p><p className="text-white font-medium">{formatCurrency(investment.averagePrice)}</p></div>
                  <div><p className="text-slate-300">Preço Atual</p><p className="text-white font-medium">{formatCurrency(investment.currentPrice)}</p></div>
                  <div><p className="text-slate-300">Valor Total</p><p className="text-white font-medium">{formatCurrency(investment.totalValue)}</p></div>
                  <div><p className="text-slate-300">Total Investido</p><p className="text-white font-medium">{formatCurrency(investment.totalInvested)}</p></div>
                  <div><p className="text-slate-300">Dividendos Recebidos</p><p className="text-purple-500 font-medium">{formatCurrency(investment.dividends)}</p></div>
                  <div className="col-span-2 md:col-span-1">
                    <p className="text-slate-300">Retorno Líquido</p>
                    <p className={`font-medium ${investment.return >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatCurrency(investment.return)} ({investment.totalInvested > 0 ? ((investment.return / investment.totalInvested) * 100).toFixed(2) : '0.00'}%)
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      <InvestmentSaleDialog
        open={showSaleDialog}
        onOpenChange={setShowSaleDialog}
        investment={selectedInvestment}
        formatCurrency={formatCurrency}
        onConfirm={handleSaleConfirm}
      />
    </>
  );
};

export default InvestmentList;

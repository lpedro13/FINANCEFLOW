import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle as ShadCardTitle } from '@/components/ui/card';
import { getFormattedBrasiliaDate } from '@/lib/dateUtils';

const MonthlyReportModal = ({ open, onOpenChange, reportData, categories }) => {
  const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-white">Relatório de {reportData.monthName}</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4 flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50 pr-1">
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-slate-700/50 border-slate-600">
              <ShadCardTitle className="text-sm font-medium text-green-400 p-4 pb-0">Total Receitas</ShadCardTitle>
              <CardContent className="p-4 pt-2"><p className="text-xl font-bold text-green-400">{formatCurrency(reportData.revenue)}</p></CardContent>
            </Card>
            <Card className="bg-slate-700/50 border-slate-600">
              <ShadCardTitle className="text-sm font-medium text-red-400 p-4 pb-0">Total Despesas</ShadCardTitle>
              <CardContent className="p-4 pt-2"><p className="text-xl font-bold text-red-400">{formatCurrency(reportData.expenses)}</p></CardContent>
            </Card>
          </div>
          <h4 className="text-slate-300 font-semibold mt-4">Transações do Mês:</h4>
          {reportData.transactions && reportData.transactions.length > 0 ? (
            reportData.transactions.map((t, index) => (
              <div key={index} className="p-3 bg-slate-700/30 rounded-lg flex justify-between items-center">
                <div>
                  <p className="text-white">{t.description}</p>
                  <p className="text-xs text-slate-400">{categories.find(c => c.name === t.category)?.name || t.category || 'Sem Categoria'} - {getFormattedBrasiliaDate(t.date)}</p>
                </div>
                <span className={`font-semibold ${t.type === 'receita' ? 'text-green-500' : 'text-red-500'}`}>
                  {t.type === 'receita' ? '+' : '-'}{formatCurrency(t.amount)}
                </span>
              </div>
            ))
          ) : <p className="text-slate-500 text-center">Nenhuma transação neste mês.</p>}
        </div>
        <DialogFooter className="mt-auto pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-slate-600">Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MonthlyReportModal;
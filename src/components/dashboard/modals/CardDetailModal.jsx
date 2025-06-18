import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getFormattedBrasiliaDate } from '@/lib/dateUtils';

const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

const getCategoryName = (catIdentifier, allCategories) => {
  if (!catIdentifier) return "Sem Categoria";
  if (typeof catIdentifier === 'object' && catIdentifier !== null && catIdentifier.name) {
      return catIdentifier.name;
  }
  if (typeof catIdentifier === 'string') {
      const found = allCategories.find(c => c.id === catIdentifier || c.name === catIdentifier);
      return found ? found.name : catIdentifier;
  }
  return 'Categoria Inválida';
};

const CardDetailModal = ({ open, onOpenChange, cardDetail, categories }) => {
  const { type, data } = cardDetail;

  const renderContent = () => {
    if (!data || data.length === 0) {
      return <p className="text-slate-400 text-center py-4">Nenhum dado para exibir.</p>;
    }

    switch (type) {
      case 'Receitas':
      case 'Despesas':
        return (
          <div className="space-y-2">
            {data.map(item => (
              <div key={item.id} className="flex justify-between items-center p-2 bg-slate-700/50 rounded">
                <div>
                  <p className="text-white">{item.description}</p>
                  <p className="text-xs text-slate-400">{getCategoryName(item.category, categories)} - {getFormattedBrasiliaDate(item.date)}</p>
                </div>
                <span className={`font-semibold ${item.type === 'receita' ? 'text-green-500' : 'text-red-500'}`}>
                  {item.type === 'receita' ? '+' : '-'}{formatCurrency(item.amount)}
                </span>
              </div>
            ))}
          </div>
        );
      case 'Investimentos':
        return (
          <div className="space-y-2">
            {data.map(item => (
              <div key={item.id} className="p-2 bg-slate-700/50 rounded">
                <div className="flex justify-between items-center">
                  <p className="text-white font-semibold">{item.name}</p>
                  <span className="text-blue-400">{formatCurrency(item.totalValue)}</span>
                </div>
                <p className="text-xs text-slate-400">
                  {item.quantity} cotas @ {formatCurrency(item.averagePrice)} (Preço Médio)
                </p>
              </div>
            ))}
          </div>
        );
      case 'Saldo Total':
         return (
          <div className="space-y-3">
            {data.map(item => (
              <div key={item.label} className="flex justify-between items-center p-3 bg-slate-700/50 rounded-lg">
                <p className="text-slate-300">{item.label}</p>
                <span className={`font-semibold ${
                  item.type === 'receita' ? 'text-green-500' : 
                  item.type === 'despesa' ? 'text-red-500' : 
                  item.type === 'saldo_final' && item.value >= 0 ? 'text-green-500' :
                  item.type === 'saldo_final' && item.value < 0 ? 'text-red-500' :
                  'text-white'
                }`}>
                  {formatCurrency(item.value)}
                </span>
              </div>
            ))}
          </div>
        );
      default:
        return <p className="text-slate-400 text-center py-4">Tipo de detalhe não reconhecido.</p>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-white">Detalhes de {type}</DialogTitle>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50 py-2 pr-1">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CardDetailModal;
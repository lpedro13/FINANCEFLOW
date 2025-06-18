import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Lightbulb } from 'lucide-react';

const tips = [
  "Revise seus gastos mensais e identifique áreas onde você pode economizar.",
  "Crie um orçamento e acompanhe seus gastos para não sair da linha.",
  "Poupe uma porcentagem da sua renda todo mês, mesmo que seja pouco.",
  "Evite dívidas de cartão de crédito pagando o valor total da fatura.",
  "Invista em conhecimento financeiro. Leia livros, artigos e faça cursos.",
  "Compare preços antes de fazer compras grandes.",
  "Tenha uma reserva de emergência para imprevistos.",
  "Defina metas financeiras claras e realistas.",
  "Automatize suas economias e investimentos.",
  "Analise seus extratos bancários e faturas regularmente."
];

const FinancialTip = ({ open, onOpenChange }) => {
  const [randomTip, setRandomTip] = React.useState('');

  React.useEffect(() => {
    if (open) {
      setRandomTip(tips[Math.floor(Math.random() * tips.length)]);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            Dica Financeira do Dia
          </DialogTitle>
        </DialogHeader>
        <div className="py-6">
          <p className="text-lg text-slate-300 leading-relaxed text-center">
            {randomTip}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FinancialTip;
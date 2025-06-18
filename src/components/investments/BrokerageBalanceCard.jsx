import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Landmark } from 'lucide-react';

const BrokerageBalanceCard = ({ balance, formatCurrency }) => {
  return (
    <Card className="bg-gradient-to-r from-sky-700 via-sky-600 to-cyan-600 border-sky-500 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold text-white">Saldo na Corretora</CardTitle>
        <Landmark className="w-6 h-6 text-sky-200" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-white">{formatCurrency(balance)}</div>
        <p className="text-xs text-sky-100 mt-1">Disponível para investir ou resgatar.</p>
      </CardContent>
    </Card>
  );
};

export default BrokerageBalanceCard;
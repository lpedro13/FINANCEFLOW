
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tag } from 'lucide-react';

const CategorySpendingCard = ({ spendingByCategory, categories, formatCurrency }) => {
  const totalCategorySpending = Object.values(spendingByCategory).reduce((sum, amount) => sum + amount, 0);

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader><CardTitle className="text-white flex items-center gap-2"><Tag className="w-5 h-5 text-yellow-500"/>Gastos por Categoria</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50">
          {Object.keys(spendingByCategory).length === 0 ? (
            <p className="text-slate-400 text-center py-8">Nenhuma despesa este mês.</p>
          ) : (
            Object.entries(spendingByCategory)
              .sort(([,a],[,b]) => b-a)
              .map(([categoryName, amount]) => {
                const categoryDetails = categories.find(c => c.name === categoryName);
                const percentage = totalCategorySpending > 0 ? (amount / totalCategorySpending) * 100 : 0;
                return (
                  <div key={categoryName} className="space-y-1.5">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        {categoryDetails?.color && <div style={{ backgroundColor: categoryDetails.color }} className="w-3 h-3 rounded-full"/>}
                        <span className="text-slate-300">{categoryName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-white font-medium">{formatCurrency(amount)}</span>
                        <span className="text-xs text-slate-400">({percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-600 rounded-full h-1.5">
                      <div style={{ width: `${percentage}%`, backgroundColor: categoryDetails?.color || '#A0AEC0' }} className="h-1.5 rounded-full"/>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CategorySpendingCard;

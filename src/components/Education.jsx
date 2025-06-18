import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { TrendingUp, ShieldCheck, ShoppingCart, Utensils, Home, PiggyBank, BookOpen } from 'lucide-react';

const educationTips = [
  {
    icon: TrendingUp,
    title: "Maior Gasto: Investimentos",
    description: "Sua principal categoria de despesa este mês é investimentos. Continue priorizando seu futuro financeiro!",
    color: "text-green-400",
    bgColor: "bg-green-500/10"
  },
  {
    icon: ShieldCheck,
    title: "Revise suas Assinaturas",
    description: "Verifique seus gastos mensais (streaming, apps, etc). Cancele aquelas que você não usa com frequência para economizar.",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10"
  },
  {
    icon: ShoppingCart,
    title: "Compare Preços Antes de Comprar",
    description: "Antes de fazer uma compra, pesquise preços em diferentes lojas ou online. Pequenas diferenças podem somar uma grande economia.",
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10"
  },
  {
    icon: Utensils,
    title: "Planeje suas Refeições",
    description: "Cozinhar em casa e planejar suas refeições da semana pode reduzir significativamente os gastos com delivery e restaurantes.",
    color: "text-orange-400",
    bgColor: "bg-orange-500/10"
  },
  {
    icon: Home,
    title: "Crie uma Reserva de Emergência",
    description: "Ter uma reserva (idealmente 3-6 meses de despesas) evita que você precise se endividar em imprevistos.",
    color: "text-purple-400",
    bgColor: "bg-purple-500/10"
  },
  {
    icon: PiggyBank,
    title: "Automatize suas Economias",
    description: "Configure transferências automáticas para sua conta de poupança ou investimentos assim que receber seu salário. 'Pague-se primeiro'.",
    color: "text-pink-400",
    bgColor: "bg-pink-500/10"
  }
];

const Education = () => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-block p-4 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full mb-4 shadow-lg"
        >
            <BookOpen className="w-12 h-12 text-white" />
        </motion.div>
        <h2 className="text-3xl font-bold text-white">Dicas Financeiras e Insights</h2>
        <p className="text-slate-400 mt-2">
          Aprenda a gerenciar melhor seu dinheiro com estas dicas e análises personalizadas.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {educationTips.map((tip, index) => {
          const IconComponent = tip.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Card className={`bg-slate-800/70 border-slate-700 hover:border-emerald-500/50 transition-all duration-300 shadow-lg hover:shadow-emerald-500/20`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${tip.bgColor}`}>
                      <IconComponent className={`w-6 h-6 ${tip.color}`} />
                    </div>
                    <CardTitle className={`text-lg font-semibold ${tip.color}`}>
                      {tip.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {tip.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Education;
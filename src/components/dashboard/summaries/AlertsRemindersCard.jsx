import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Plus, AlertTriangle, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const AlertsRemindersCard = ({ alerts, onOpenAlertsModal }) => {
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'text-green-500 bg-green-500/10 border-green-500/20';
      default: return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'warning': return AlertTriangle;
      case 'bill': return AlertTriangle;
      case 'info': return Info;
      default: return Bell;
    }
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white flex items-center gap-2">
          <Bell className="w-5 h-5 text-orange-500" />
          Alertas e Lembretes
        </CardTitle>
        <Button size="sm" variant="outline" className="border-slate-600 text-slate-300" onClick={onOpenAlertsModal}>
          <Plus className="w-4 h-4 mr-1" /> Adicionar/Ver
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[220px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50">
          {alerts && alerts.length > 0 ? (
            alerts.slice(0,3).map((alert, index) => {
              const IconComponent = getTypeIcon(alert.type);
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`p-3 rounded-lg border ${getPriorityColor(alert.priority)} cursor-pointer hover:bg-opacity-20`}
                  onClick={onOpenAlertsModal}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      <IconComponent className={`w-4 h-4 mt-0.5 ${getPriorityColor(alert.priority).split(' ')[0]}`} />
                      <div>
                        <p className="text-white font-medium text-sm truncate max-w-[150px]">{alert.title}</p>
                        <p className="text-slate-400 text-xs truncate max-w-[180px]">{alert.message}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-4">
                <Bell className="w-8 h-8 text-slate-500 mx-auto mb-2"/>
                <p className="text-slate-500 text-sm">Nenhum alerta ou lembrete ativo.</p>
                <Button variant="link" className="text-green-500 text-sm p-0 h-auto mt-1" onClick={onOpenAlertsModal}>Adicionar um lembrete</Button>
            </div>
          )}
          {alerts && alerts.length > 3 && (
            <p className="text-xs text-slate-400 text-center pt-2 hover:underline cursor-pointer" onClick={onOpenAlertsModal}>
                E mais {alerts.length - 3} alerta(s). Ver todos.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertsRemindersCard;
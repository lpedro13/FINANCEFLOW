import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Bell, AlertTriangle, Info } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const SmartAlerts = ({ open, onOpenChange, alerts, onAddAlert, onUpdateAlert, onDeleteAlert }) => {
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingAlert, setEditingAlert] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    priority: 'medium'
  });

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      type: 'info',
      priority: 'medium'
    });
    setEditingAlert(null);
    setShowForm(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.message) {
      toast({
        title: "Erro",
        description: "Título e mensagem são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    if (editingAlert) {
      onUpdateAlert(editingAlert.id, formData);
    } else {
      onAddAlert(formData);
    }
    
    resetForm();
  };

  const handleEdit = (alert) => {
    if (!alert.canEdit) {
      toast({
        title: "Não é possível editar",
        description: "Este alerta é gerado automaticamente e não pode ser editado.",
        variant: "default"
      });
      return;
    }
    
    setFormData({
      title: alert.title,
      message: alert.message,
      type: alert.type || 'info',
      priority: alert.priority || 'medium'
    });
    setEditingAlert(alert);
    setShowForm(true);
  };

  const handleDelete = (alert) => {
    if (!alert.canEdit) {
      toast({
        title: "Não é possível excluir",
        description: "Este alerta é gerado automaticamente e não pode ser excluído.",
        variant: "default"
      });
      return;
    }
    
    onDeleteAlert(alert.id);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-500 bg-red-500/10';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10';
      case 'low': return 'text-green-500 bg-green-500/10';
      default: return 'text-blue-500 bg-blue-500/10';
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50 bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-500" />
            Alertas Inteligentes
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-slate-400">
              Gerencie seus alertas personalizados e visualize notificações automáticas
            </p>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Alerta
            </Button>
          </div>

          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-slate-700/50 rounded-lg p-6 border border-slate-600"
            >
              <h3 className="text-lg font-semibold text-white mb-4">
                {editingAlert ? 'Editar Alerta' : 'Novo Alerta'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title" className="text-slate-300">Título</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="bg-slate-600 border-slate-500 text-white"
                      placeholder="Ex: Orçamento Excedido"
                    />
                  </div>
                  <div>
                    <Label htmlFor="priority" className="text-slate-300">Prioridade</Label>
                    <select
                      id="priority"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full h-10 px-3 rounded-md bg-slate-600 border border-slate-500 text-white"
                    >
                      <option value="low">Baixa</option>
                      <option value="medium">Média</option>
                      <option value="high">Alta</option>
                    </select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="message" className="text-slate-300">Mensagem</Label>
                  <Input
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="bg-slate-600 border-slate-500 text-white"
                    placeholder="Descreva o alerta..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    {editingAlert ? 'Atualizar' : 'Criar'} Alerta
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="border-slate-600 text-slate-300"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </motion.div>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Alertas Ativos</h3>
            {alerts.length === 0 ? (
              <Card className="bg-slate-700/50 border-slate-600">
                <CardContent className="p-6 text-center">
                  <Bell className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400">Nenhum alerta ativo no momento</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {alerts.map((alert, index) => {
                  const IconComponent = getTypeIcon(alert.type);
                  return (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className="bg-slate-700/50 border-slate-600">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${getPriorityColor(alert.priority)}`}>
                                <IconComponent className="w-4 h-4" />
                              </div>
                              <div>
                                <CardTitle className="text-white text-base">
                                  {alert.title}
                                </CardTitle>
                                <p className="text-slate-400 text-sm">
                                  Prioridade: {alert.priority === 'high' ? 'Alta' : 
                                             alert.priority === 'medium' ? 'Média' : 'Baixa'}
                                </p>
                              </div>
                            </div>
                            {alert.canEdit && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEdit(alert)}
                                  className="border-slate-600 text-slate-300 hover:bg-slate-600"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDelete(alert)}
                                  className="border-red-600 text-red-400 hover:bg-red-600/20"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-slate-300">{alert.message}</p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SmartAlerts;
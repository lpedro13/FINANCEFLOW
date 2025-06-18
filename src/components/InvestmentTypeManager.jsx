import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Edit, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const InvestmentTypeManager = ({ open, onOpenChange, types, onTypesUpdate }) => {
  const { toast } = useToast();
  const [investmentTypes, setInvestmentTypes] = useState([]);
  const [newTypeName, setNewTypeName] = useState('');
  const [editingType, setEditingType] = useState(null);

  useEffect(() => {
    if (open) {
      setInvestmentTypes(types);
    }
  }, [open, types]);

  const saveTypes = (updatedTypes) => {
    localStorage.setItem('investmentTypes', JSON.stringify(updatedTypes));
    setInvestmentTypes(updatedTypes);
    if (onTypesUpdate) {
      onTypesUpdate(updatedTypes);
    }
  };

  const handleAddType = () => {
    if (!newTypeName.trim()) {
      toast({ title: "Erro", description: "Nome do tipo não pode ser vazio.", variant: "destructive" });
      return;
    }
    const newTypeId = newTypeName.trim().toLowerCase().replace(/\s+/g, '-');
    if (investmentTypes.find(type => type.id === newTypeId || type.name.toLowerCase() === newTypeName.trim().toLowerCase())) {
      toast({ title: "Erro", description: "Tipo de investimento já existe.", variant: "destructive" });
      return;
    }

    const newType = { id: newTypeId, name: newTypeName.trim() };
    saveTypes([...investmentTypes, newType]);
    setNewTypeName('');
    toast({ title: "Sucesso", description: "Tipo de investimento adicionado." });
  };

  const handleEditType = (type) => {
    setEditingType(type);
    setNewTypeName(type.name);
  };

  const handleUpdateType = () => {
    if (!newTypeName.trim() || !editingType) return;
    
    const newTypeId = newTypeName.trim().toLowerCase().replace(/\s+/g, '-');
    if (investmentTypes.find(type => (type.id === newTypeId || type.name.toLowerCase() === newTypeName.trim().toLowerCase()) && type.id !== editingType.id)) {
      toast({ title: "Erro", description: "Já existe um tipo com este nome ou ID.", variant: "destructive" });
      return;
    }

    const updatedTypes = investmentTypes.map(type =>
      type.id === editingType.id ? { ...type, name: newTypeName.trim(), id: newTypeId } : type
    );
    saveTypes(updatedTypes);
    setNewTypeName('');
    setEditingType(null);
    toast({ title: "Sucesso", description: "Tipo de investimento atualizado." });
  };

  const handleDeleteType = (typeIdToDelete) => {
    const investments = JSON.parse(localStorage.getItem('investments') || '[]');
    const isTypeInUse = investments.some(inv => inv.type === typeIdToDelete);

    if (isTypeInUse) {
      toast({ title: "Erro", description: "Este tipo está em uso e não pode ser excluído.", variant: "destructive" });
      return;
    }

    const updatedTypes = investmentTypes.filter(type => type.id !== typeIdToDelete);
    saveTypes(updatedTypes);
    toast({ title: "Sucesso", description: "Tipo de investimento excluído." });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50">
        <DialogHeader>
          <DialogTitle className="text-white">Gerenciar Tipos de Investimento</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="flex gap-2 items-end">
            <div className="flex-grow">
              <Label htmlFor="newTypeName" className="text-slate-300">
                {editingType ? `Editando: ${editingType.name}` : "Novo Tipo"}
              </Label>
              <Input
                id="newTypeName"
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white mt-1"
                placeholder="Nome do Tipo (Ex: Ações BR, Renda Fixa Global)"
              />
            </div>
            <Button onClick={editingType ? handleUpdateType : handleAddType} className="bg-green-600 hover:bg-green-700">
              {editingType ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </Button>
            {editingType && (
              <Button variant="outline" onClick={() => { setEditingType(null); setNewTypeName(''); }} className="border-slate-600">
                Cancelar
              </Button>
            )}
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50 pr-2">
            {investmentTypes.map(type => (
              <div key={type.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <span className="text-white">{type.name}</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => handleEditType(type)} className="text-slate-400 hover:text-white">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDeleteType(type.id)} className="text-red-400 hover:text-red-300">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvestmentTypeManager;
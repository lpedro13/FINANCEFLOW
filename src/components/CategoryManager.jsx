import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Edit, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const generateRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const CategoryManager = ({ open, onOpenChange, onCategoriesUpdate }) => {
  const { toast } = useToast();
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    if (open) {
      loadCategories();
    }
  }, [open]);

  const loadCategories = () => {
    const stored = JSON.parse(localStorage.getItem('categories') || '[]');
    const defaultCategoryNames = ['Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Educação', 'Lazer', 'Roupas', 'Investimentos', 'Metas', 'Contas', 'Outros'];
    
    if (stored.length === 0) {
        const initialCategories = defaultCategoryNames.map(name => ({ id: name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''), name, color: generateRandomColor() }));
        localStorage.setItem('categories', JSON.stringify(initialCategories));
        setCategories(initialCategories);
    } else {
        setCategories(stored.map(cat => 
          typeof cat === 'string' 
          ? { id: cat.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''), name: cat, color: generateRandomColor() } 
          : { ...cat, color: cat.color || generateRandomColor() } 
        ));
    }
  };

  const saveCategories = (updatedCategories) => {
    localStorage.setItem('categories', JSON.stringify(updatedCategories));
    setCategories(updatedCategories);
    if (onCategoriesUpdate) {
      onCategoriesUpdate(updatedCategories);
    }
    window.dispatchEvent(new Event('storage'));
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast({ title: "Atenção", description: "Nome da categoria não pode ser vazio.", variant: "default" });
      return;
    }
    if (categories.find(cat => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase())) {
      toast({ title: "Erro", description: "Categoria já existe.", variant: "destructive" });
      return;
    }

    const newCategory = {
      id: newCategoryName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
      name: newCategoryName.trim(),
      color: generateRandomColor(),
    };
    saveCategories([...categories, newCategory]);
    setNewCategoryName('');
    toast({ title: "Sucesso", description: "Categoria adicionada." });
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setNewCategoryName(category.name);
  };

  const handleUpdateCategory = () => {
    if (!newCategoryName.trim() || !editingCategory) return;
    
    if (categories.find(cat => cat.name.toLowerCase() === newCategoryName.trim().toLowerCase() && cat.id !== editingCategory.id)) {
      toast({ title: "Erro", description: "Já existe uma categoria com este nome.", variant: "destructive" });
      return;
    }

    const updatedCategories = categories.map(cat =>
      cat.id === editingCategory.id ? { ...cat, name: newCategoryName.trim(), id: newCategoryName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') } : cat
    );
    saveCategories(updatedCategories);
    setNewCategoryName('');
    setEditingCategory(null);
    toast({ title: "Sucesso", description: "Categoria atualizada." });
  };

  const handleDeleteCategory = (categoryIdToDelete) => {
    const categoryToDelete = categories.find(cat => cat.id === categoryIdToDelete);
    if (!categoryToDelete) return;
    if (categoryToDelete.name === 'Outros') {
        toast({ title: "Atenção", description: "A categoria 'Outros' não pode ser excluída.", variant: "default" });
        return;
    }

    const transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    const budgets = JSON.parse(localStorage.getItem('budgets') || '[]');
    
    const updatedTransactions = transactions.map(t => 
        t.category === categoryToDelete.name ? { ...t, category: 'Outros' } : t
    );
    localStorage.setItem('transactions', JSON.stringify(updatedTransactions));

    const updatedBudgets = budgets.map(b =>
        b.category === categoryToDelete.name ? { ...b, category: 'Outros' } : b
    );
    localStorage.setItem('budgets', JSON.stringify(updatedBudgets));

    const updatedCategories = categories.filter(cat => cat.id !== categoryIdToDelete);
    saveCategories(updatedCategories);
    toast({ title: "Sucesso", description: `Categoria "${categoryToDelete.name}" excluída. Itens associados movidos para "Outros".` });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50">
        <DialogHeader>
          <DialogTitle className="text-white">Gerenciar Categorias</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="flex gap-2 items-end">
            <div className="flex-grow">
              <Label htmlFor="newCategoryName" className="text-slate-300">
                {editingCategory ? `Editando: ${editingCategory.name}` : "Nova Categoria"}
              </Label>
              <Input
                id="newCategoryName"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="bg-slate-700 border-slate-600 text-white mt-1"
                placeholder="Nome da Categoria"
              />
            </div>
            <Button onClick={editingCategory ? handleUpdateCategory : handleAddCategory} className="bg-green-600 hover:bg-green-700">
              {editingCategory ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </Button>
            {editingCategory && (
              <Button variant="outline" onClick={() => { setEditingCategory(null); setNewCategoryName(''); }} className="border-slate-600">
                Cancelar
              </Button>
            )}
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/50 pr-2">
            {categories.map(category => (
              <div key={category.id} className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div style={{ backgroundColor: category.color }} className="w-4 h-4 rounded-full"/>
                  <span className="text-white">{category.name}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => handleEditCategory(category)} className="text-slate-400 hover:text-white" disabled={category.name === 'Outros'}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDeleteCategory(category.id)} className="text-red-400 hover:text-red-300" disabled={category.name === 'Outros'}>
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

export default CategoryManager;
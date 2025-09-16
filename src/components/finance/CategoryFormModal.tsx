"use client";

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { showError, showSuccess } from '@/utils/toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { getTranslatedErrorMessage } from '@/utils/errorTranslations';

const categorySchema = z.object({
  name: z.string().min(1, { message: "O nome da categoria é obrigatório." }),
  type: z.enum(['income', 'expense'], { required_error: "O tipo da categoria é obrigatório." }),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;

export interface TransactionCategory {
  id: string;
  user_id: string;
  name: string;
  type: 'income' | 'expense';
  created_at: string;
}

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  category?: TransactionCategory | null;
}

const CategoryFormModal = ({ isOpen, onClose, onSave, category }: CategoryFormModalProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      type: 'expense',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (category) {
        reset({
          name: category.name,
          type: category.type,
        });
      } else {
        reset({
          name: '',
          type: 'expense',
        });
      }
    }
  }, [category, isOpen, reset]);

  const onSubmit = async (data: CategoryFormValues) => {
    if (!user) {
      showError("Você precisa estar logado para salvar uma categoria.");
      return;
    }
    setLoading(true);

    const categoryPayload = {
      user_id: user.id,
      name: data.name,
      type: data.type,
    };

    let error;
    if (category) {
      const { error: updateError } = await supabase.from('transaction_categories').update(categoryPayload).eq('id', category.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('transaction_categories').insert([categoryPayload]);
      error = insertError;
    }

    if (error) {
      // Check for unique constraint violation
      if (error.code === '23505') { // PostgreSQL unique_violation error code
        showError(`Já existe uma categoria com o nome "${data.name}" para o tipo "${data.type === 'income' ? 'Receita' : 'Despesa'}".`);
      } else {
        showError(getTranslatedErrorMessage(error.message));
      }
    } else {
      showSuccess(`Categoria ${category ? 'atualizada' : 'criada'} com sucesso!`);
      onSave();
      onClose();
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{category ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
          <DialogDescription>
            Defina o nome e o tipo da categoria.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Categoria</Label>
            <Input id="name" placeholder="Ex: Material de Escritório" {...register('name')} />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label>Tipo de Categoria</Label>
            <RadioGroup
              defaultValue={category?.type || 'expense'}
              onValueChange={(value: 'income' | 'expense') => setValue('type', value)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expense" id="category-expense" />
                <Label htmlFor="category-expense">Despesa</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="income" id="category-income" />
                <Label htmlFor="category-income">Receita</Label>
              </div>
            </RadioGroup>
            {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? 'Salvando...' : 'Salvar Categoria'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CategoryFormModal;
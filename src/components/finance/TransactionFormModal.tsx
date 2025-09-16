"use client";

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { showError, showSuccess } from '@/utils/toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { getTranslatedErrorMessage } from '@/utils/errorTranslations';

const transactionSchema = z.object({
  type: z.enum(['income', 'expense'], { required_error: "O tipo de transação é obrigatório." }),
  amount: z.coerce.number().min(0.01, { message: "O valor deve ser maior que zero." }),
  description: z.string().optional(),
  date: z.date({ required_error: "A data é obrigatória." }),
  category: z.string().min(1, { message: "A categoria é obrigatória." }),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;

export interface Transaction {
  id: string;
  user_id: string;
  created_at: string;
  type: 'income' | 'expense';
  amount: number;
  description?: string;
  date: string; // ISO string
  category?: string;
}

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  transaction?: Transaction | null;
}

const TransactionFormModal = ({ isOpen, onClose, onSave, transaction }: TransactionFormModalProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, control, reset, setValue, watch, formState: { errors } } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      amount: 0,
      description: '',
      date: new Date(),
      category: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (transaction) {
        reset({
          type: transaction.type,
          amount: transaction.amount,
          description: transaction.description || '',
          date: new Date(transaction.date),
          category: transaction.category || '',
        });
      } else {
        reset({
          type: 'expense',
          amount: 0,
          description: '',
          date: new Date(),
          category: '',
        });
      }
    }
  }, [transaction, isOpen, reset]);

  const onSubmit = async (data: TransactionFormValues) => {
    if (!user) {
      showError("Você precisa estar logado para salvar uma transação.");
      return;
    }
    setLoading(true);

    const transactionPayload = {
      user_id: user.id,
      type: data.type,
      amount: data.amount,
      description: data.description || null,
      date: format(data.date, 'yyyy-MM-dd'),
      category: data.category || null,
    };

    let error;
    if (transaction) {
      const { error: updateError } = await supabase.from('transactions').update(transactionPayload).eq('id', transaction.id);
      error = updateError;
    } else {
      const { error: insertError } = await supabase.from('transactions').insert([transactionPayload]);
      error = insertError;
    }

    if (error) {
      showError(getTranslatedErrorMessage(error.message));
    } else {
      showSuccess(`Transação ${transaction ? 'atualizada' : 'registrada'} com sucesso!`);
      onSave();
      onClose();
    }
    setLoading(false);
  };

  const expenseCategories = ['Aluguel', 'Salários', 'Material Elétrico', 'Transporte', 'Marketing', 'Software', 'Outros'];
  const incomeCategories = ['Serviços', 'Vendas', 'Consultoria', 'Reembolso', 'Outros'];

  const selectedType = watch('type');
  const categories = selectedType === 'income' ? incomeCategories : expenseCategories;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{transaction ? 'Editar Transação' : 'Nova Transação'}</DialogTitle>
          <DialogDescription>
            Preencha os detalhes da transação.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Tipo de Transação</Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="expense" id="expense" />
                    <Label htmlFor="expense">Despesa</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="income" id="income" />
                    <Label htmlFor="income">Receita</Label>
                  </div>
                </RadioGroup>
              )}
            />
            {errors.type && <p className="text-sm text-red-500">{errors.type.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor (R$)</Label>
            <Input id="amount" type="number" step="0.01" {...register('amount', { valueAsNumber: true })} />
            {errors.amount && <p className="text-sm text-red-500">{errors.amount.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Data</Label>
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? format(field.value, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.date && <p className="text-sm text-red-500">{errors.date.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (Opcional)</Label>
            <Textarea id="description" {...register('description')} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? 'Salvando...' : 'Salvar Transação'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionFormModal;
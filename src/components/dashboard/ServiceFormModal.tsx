"use client";

import { useEffect, useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const serviceSchema = z.object({
  name: z.string().min(3, { message: "O nome do serviço deve ter pelo menos 3 caracteres." }),
  description: z.string().optional(),
  price_type: z.enum(['fixed', 'hourly'], { required_error: "Você deve selecionar um tipo de preço." }),
  fixed_price: z.coerce.number().optional(),
  hourly_rate: z.coerce.number().optional(),
}).refine(data => {
  if (data.price_type === 'fixed') return data.fixed_price !== undefined && data.fixed_price > 0;
  return true;
}, {
  message: "O preço fixo deve ser maior que zero.",
  path: ['fixed_price'],
}).refine(data => {
  if (data.price_type === 'hourly') return data.hourly_rate !== undefined && data.hourly_rate > 0;
  return true;
}, {
  message: "O valor por hora deve ser maior que zero.",
  path: ['hourly_rate'],
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  service: Service | null;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  price_type: 'fixed' | 'hourly';
  fixed_price?: number;
  hourly_rate?: number;
}

const ServiceFormModal = ({ isOpen, onClose, onSave, service }: ServiceFormModalProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
  });

  const priceType = watch('price_type');

  useEffect(() => {
    if (isOpen) {
      if (service) {
        reset({
          name: service.name,
          description: service.description || '',
          price_type: service.price_type,
          fixed_price: service.fixed_price || undefined,
          hourly_rate: service.hourly_rate || undefined,
        });
      } else {
        reset({
          name: '',
          description: '',
          price_type: 'fixed',
          fixed_price: undefined,
          hourly_rate: undefined,
        });
      }
    }
  }, [service, isOpen, reset]);

  const onSubmit = async (data: ServiceFormValues) => {
    if (!user) {
      showError("Você precisa estar logado para salvar um serviço.");
      return;
    }
    setLoading(true);

    const serviceData = {
      user_id: user.id,
      name: data.name,
      description: data.description,
      price_type: data.price_type,
      fixed_price: data.price_type === 'fixed' ? data.fixed_price : null,
      hourly_rate: data.price_type === 'hourly' ? data.hourly_rate : null,
    };

    let error;
    if (service) {
      // Update existing service
      const { error: updateError } = await supabase.from('services').update(serviceData).eq('id', service.id);
      error = updateError;
    } else {
      // Insert new service
      const { error: insertError } = await supabase.from('services').insert([serviceData]);
      error = insertError;
    }

    if (error) {
      showError(error.message);
    } else {
      showSuccess(`Serviço ${service ? 'atualizado' : 'criado'} com sucesso!`);
      onSave();
      onClose();
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{service ? 'Editar Serviço' : 'Adicionar Novo Serviço'}</DialogTitle>
          <DialogDescription>
            Preencha os detalhes do serviço abaixo.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Serviço</Label>
            <Input id="name" {...register('name')} />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição (Opcional)</Label>
            <Textarea id="description" {...register('description')} />
          </div>
          <div className="space-y-2">
            <Label>Tipo de Preço</Label>
            <RadioGroup
              defaultValue={service?.price_type || 'fixed'}
              onValueChange={(value: 'fixed' | 'hourly') => setValue('price_type', value)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fixed" id="fixed" />
                <Label htmlFor="fixed">Preço Fixo</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="hourly" id="hourly" />
                <Label htmlFor="hourly">Por Hora</Label>
              </div>
            </RadioGroup>
            {errors.price_type && <p className="text-sm text-red-500">{errors.price_type.message}</p>}
          </div>

          {priceType === 'fixed' && (
            <div className="space-y-2 animate-in fade-in-0">
              <Label htmlFor="fixed_price">Valor Fixo (R$)</Label>
              <Input id="fixed_price" type="number" step="0.01" {...register('fixed_price')} />
              {errors.fixed_price && <p className="text-sm text-red-500">{errors.fixed_price.message}</p>}
            </div>
          )}

          {priceType === 'hourly' && (
            <div className="space-y-2 animate-in fade-in-0">
              <Label htmlFor="hourly_rate">Valor por Hora (R$)</Label>
              <Input id="hourly_rate" type="number" step="0.01" {...register('hourly_rate')} />
              {errors.hourly_rate && <p className="text-sm text-red-500">{errors.hourly_rate.message}</p>}
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancelar</Button>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">{loading ? 'Salvando...' : 'Salvar Serviço'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceFormModal;
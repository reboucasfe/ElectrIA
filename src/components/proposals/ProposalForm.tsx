"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import { showError, showSuccess } from '@/utils/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, PlusCircle, Loader2 } from 'lucide-react';
import InputMask from 'react-input-mask';
import ServiceFormModal, { Service } from '@/components/dashboard/ServiceFormModal';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { getTranslatedErrorMessage } from '@/utils/errorTranslations';

import ProposalPreviewModal from './ProposalPreviewModal';

// Estende a interface Service para incluir a quantidade e o total calculado no formulário
interface SelectedService extends Service {
  uniqueId: string; // Adiciona um ID único para cada instância de serviço na proposta
  quantity: number;
  calculated_total: number;
}

const proposalFormSchema = z.object({
  clientName: z.string().min(1, { message: "Nome do cliente é obrigatório." }),
  clientEmail: z.string().email({ message: "E-mail do cliente inválido." }).optional().or(z.literal('')),
  clientPhone: z.string()
    .transform((val) => val.replace(/\D/g, ''))
    .refine((val) => val.length === 11 || val.length === 0, {
      message: "O número de WhatsApp deve ter 11 dígitos ou ser deixado em branco."
    })
    .optional(),
  proposalTitle: z.string().min(1, { message: "Título da proposta é obrigatório." }),
  proposalDescription: z.string().optional(),
  selectedServices: z.array(z.object({
    uniqueId: z.string(), // Valida o novo campo uniqueId
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    price_type: z.enum(['fixed', 'hourly']),
    fixed_price: z.number().optional(),
    hourly_rate: z.number().optional(),
    total_hours: z.number().optional(),
    quantity: z.number().min(1, { message: "Quantidade deve ser no mínimo 1." }),
    calculated_total: z.number(),
  })).min(1, { message: "Adicione pelo menos um serviço à proposta." }),
  notes: z.string().optional(),
  paymentMethods: z.array(z.string()).min(1, { message: "Selecione pelo menos um método de pagamento." }),
  validityDays: z.coerce.number().min(1, { message: "Validade deve ser no mínimo 1 dia." }).default(7),
});

type ProposalFormValues = z.infer<typeof proposalFormSchema>;

const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

interface ProposalFormProps {
  initialData?: any; // Dados iniciais para edição
  proposalId?: string; // ID da proposta se estiver editando
}

const ProposalForm = ({ initialData, proposalId }: ProposalFormProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [selectedServiceToAdd, setSelectedServiceToAdd] = useState<string>('');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewData, setPreviewData] = useState<ProposalFormValues | null>(null);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);

  const navigate = useNavigate();

  const { register, handleSubmit, control, setValue, watch, reset, formState: { errors } } = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalFormSchema),
    defaultValues: {
      clientName: '',
      clientEmail: '',
      clientPhone: '',
      proposalTitle: user?.user_metadata?.company_name ? `Proposta de Serviços - ${user.user_metadata.company_name}` : 'Proposta de Serviços',
      proposalDescription: '',
      selectedServices: [],
      notes: '',
      paymentMethods: user?.user_metadata?.accepted_payment_methods || [],
      validityDays: 7,
    },
  });

  const watchedFormValues = watch();
  const watchedServices = watchedFormValues.selectedServices;
  const watchedPaymentMethods = watchedFormValues.paymentMethods;

  // Log para depuração dos erros de validação
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.error("ProposalForm: Erros de validação:", errors);
      showError("Por favor, corrija os erros no formulário.");
    }
  }, [errors]);

  const fetchAvailableServices = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      showError(getTranslatedErrorMessage(error.message));
    } else {
      setAvailableServices(data as Service[]);
    }
  }, [user]);

  useEffect(() => {
    fetchAvailableServices();
  }, [fetchAvailableServices]);

  // Preencher formulário com dados iniciais para edição
  useEffect(() => {
    if (initialData) {
      reset({
        clientName: initialData.client_name,
        clientEmail: initialData.client_email || '',
        clientPhone: initialData.client_phone || '',
        proposalTitle: initialData.proposal_title,
        proposalDescription: initialData.proposal_description || '',
        selectedServices: initialData.selected_services.map((s: any) => ({ ...s, uniqueId: s.uniqueId || crypto.randomUUID() })), // Garante uniqueId
        notes: initialData.notes || '',
        paymentMethods: initialData.payment_methods || [],
        validityDays: initialData.validity_days,
      });
    } else {
      // Reset para valores padrão ao criar nova proposta
      reset({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        proposalTitle: user?.user_metadata?.company_name ? `Proposta de Serviços - ${user.user_metadata.company_name}` : 'Proposta de Serviços',
        proposalDescription: '',
        selectedServices: [],
        notes: '',
        paymentMethods: user?.user_metadata?.accepted_payment_methods || [],
        validityDays: 7,
      });
    }
  }, [initialData, reset, user]);

  // Pre-fill payment methods from user profile if creating a new proposal
  useEffect(() => {
    if (!initialData && user?.user_metadata?.accepted_payment_methods) {
      setValue('paymentMethods', user.user_metadata.accepted_payment_methods);
    }
  }, [user, setValue, initialData]);

  const calculateServiceTotal = (service: Service, quantity: number): number => {
    if (service.price_type === 'fixed' && service.fixed_price !== undefined) {
      return service.fixed_price * quantity;
    }
    if (service.price_type === 'hourly' && service.hourly_rate !== undefined && service.total_hours !== undefined) {
      return (service.hourly_rate * service.total_hours) * quantity;
    }
    return 0;
  };

  const proposalTotal = useMemo(() => {
    return watchedServices.reduce((sum, service) => sum + service.calculated_total, 0);
  }, [watchedServices]);

  const handleAddService = () => {
    if (!selectedServiceToAdd) return;

    const serviceToAdd = availableServices.find(s => s.id === selectedServiceToAdd);
    if (serviceToAdd) {
      const newService: SelectedService = {
        ...serviceToAdd,
        uniqueId: crypto.randomUUID(),
        quantity: 1,
        calculated_total: calculateServiceTotal(serviceToAdd, 1),
      };
      setValue('selectedServices', [...watchedServices, newService]);
      setSelectedServiceToAdd('');
    }
  };

  const handleRemoveService = (uniqueId: string) => {
    const newServices = watchedServices.filter((service) => service.uniqueId !== uniqueId);
    setValue('selectedServices', newServices);
  };

  const handleQuantityChange = (uniqueId: string, newQuantity: number) => {
    const newServices = watchedServices.map((service) => {
      if (service.uniqueId === uniqueId) {
        return {
          ...service,
          quantity: newQuantity,
          calculated_total: calculateServiceTotal(service, newQuantity),
        };
      }
      return service;
    });
    setValue('selectedServices', newServices);
  };

  const saveProposalToSupabase = async (data: ProposalFormValues, newStatus: string = 'draft', pdfGenerated: boolean = false) => {
    if (!user) {
      showError("Você precisa estar logado para salvar uma proposta.");
      return null;
    }

    setLoading(true);
    console.log("saveProposalToSupabase: Iniciando salvamento/atualização da proposta...");
    console.log("saveProposalToSupabase: Dados a serem salvos:", data);


    const proposalPayload = {
      user_id: user.id,
      client_name: data.clientName,
      client_email: data.clientEmail || null,
      client_phone: data.clientPhone || null,
      proposal_title: data.proposalTitle,
      proposal_description: data.proposalDescription || null,
      selected_services: data.selectedServices,
      notes: data.notes || null,
      payment_methods: data.paymentMethods,
      validity_days: data.validityDays,
      status: newStatus,
      pdf_generated_at: pdfGenerated ? new Date().toISOString() : null,
      sent_at: newStatus === 'sent' ? new Date().toISOString() : null,
    };

    let result;
    if (proposalId) {
      console.log("saveProposalToSupabase: Atualizando proposta existente com ID:", proposalId);
      result = await supabase.from('proposals').update(proposalPayload).eq('id', proposalId).select().single();
    } else {
      console.log("saveProposalToSupabase: Inserindo nova proposta.");
      result = await supabase.from('proposals').insert([proposalPayload]).select().single();
    }

    setLoading(false);

    if (result.error) {
      console.error("saveProposalToSupabase: Erro do Supabase ao salvar proposta:", result.error);
      showError(getTranslatedErrorMessage(result.error.message));
      return null;
    } else {
      console.log("saveProposalToSupabase: Proposta salva com sucesso:", result.data);
      showSuccess(`Proposta ${proposalId ? 'atualizada' : 'salva'} com sucesso!`);
      if (!proposalId) {
        console.log("saveProposalToSupabase: Nova proposta criada, navegando para edição:", result.data.id);
        navigate(`/proposals/edit/${result.data.id}`);
      }
      return result.data;
    }
  };

  const handleSaveDraft = async (data: ProposalFormValues) => {
    console.log("handleSaveDraft: Tentando salvar rascunho com dados:", data);
    await saveProposalToSupabase(data, 'draft');
  };

  const handleOpenPreviewModal = async (data: ProposalFormValues) => {
    console.log("handleOpenPreviewModal: Validação do formulário bem-sucedida. Tentando salvar e abrir modal de pré-visualização com dados:", data);
    const savedProposal = await saveProposalToSupabase(data, proposalId ? initialData.status : 'draft');
    if (savedProposal) {
      console.log("handleOpenPreviewModal: Proposta salva, preparando dados para pré-visualização.");
      setPreviewData({
        ...data,
        id: savedProposal.id, 
        status: savedProposal.status,
      });
      setIsPreviewModalOpen(true);
    } else {
      console.error("handleOpenPreviewModal: Falha ao salvar proposta, não é possível abrir o modal de pré-visualização.");
    }
  };

  const handleServiceModalClose = () => {
    setIsServiceModalOpen(false);
  };

  const handleServiceSaved = () => {
    fetchAvailableServices();
    handleServiceModalClose();
  };

  const handleOpenServiceModal = () => { // Adicionado para abrir o modal de serviço
    setIsServiceModalOpen(true);
  };

  const handlePdfGeneratedAndSent = async (proposalId: string) => {
    setLoading(true);
    console.log("handlePdfGeneratedAndSent: Atualizando status da proposta para 'enviada' após geração de PDF.");
    const { error } = await supabase
      .from('proposals')
      .update({ status: 'sent', pdf_generated_at: new Date().toISOString(), sent_at: new Date().toISOString() })
      .eq('id', proposalId);

    if (error) {
      console.error("handlePdfGeneratedAndSent: Erro ao atualizar status da proposta:", error);
      showError(getTranslatedErrorMessage(error.message));
    } else {
      showSuccess("Status da proposta atualizado para 'Enviada'!");
    }
    setLoading(false);
    setIsPreviewModalOpen(false);
    navigate('/proposals');
  };

  return (
    <>
      <form onSubmit={handleSubmit(handleSaveDraft)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Cliente</CardTitle>
            <CardDescription>Detalhes do cliente para quem a proposta será enviada.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="clientName">Nome do Cliente</Label>
              <Input id="clientName" placeholder="Nome Completo do Cliente" {...register('clientName')} />
              {errors.clientName && <p className="text-sm text-red-500">{errors.clientName.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="clientEmail">Email do Cliente (Opcional)</Label>
              <Input id="clientEmail" type="email" placeholder="email@cliente.com" {...register('clientEmail')} />
              {errors.clientEmail && <p className="text-sm text-red-500">{errors.clientEmail.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="clientPhone">WhatsApp do Cliente (Opcional)</Label>
              <Controller
                name="clientPhone"
                control={control}
                render={({ field }) => (
                  <InputMask
                    mask="(99) 9.9999-9999"
                    maskChar="_"
                    value={field.value}
                    onChange={(e) => {
                      field.onChange(e.target.value.replace(/\D/g, ''));
                    }}
                    onBlur={field.onBlur}
                  >
                    {(inputProps: any) => (
                      <Input
                        {...inputProps}
                        id="clientPhone"
                        type="tel"
                        placeholder="(XX) X.XXXX-XXXX"
                        className={errors.clientPhone ? "border-red-500" : ""}
                      />
                    )}
                  </InputMask>
                )}
              />
              {errors.clientPhone && <p className="text-sm text-red-500">{errors.clientPhone.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detalhes da Proposta</CardTitle>
            <CardDescription>Informações gerais sobre a proposta.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="proposalTitle">Título da Proposta</Label>
              <Input id="proposalTitle" placeholder="Proposta de Serviços Elétricos" {...register('proposalTitle')} />
              {errors.proposalTitle && <p className="text-sm text-red-500">{errors.proposalTitle.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="proposalDescription">Descrição Breve (Opcional)</Label>
              <Textarea id="proposalDescription" placeholder="Instalação de sistema fotovoltaico..." {...register('proposalDescription')} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="validityDays">Validade da Proposta (dias)</Label>
              <Input id="validityDays" type="number" min="1" {...register('validityDays', { valueAsNumber: true })} />
              {errors.validityDays && <p className="text-sm text-red-500">{errors.validityDays.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Serviços Incluídos</CardTitle>
            <CardDescription>Selecione os serviços do seu catálogo para esta proposta.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end gap-2">
              <div className="grid gap-2 flex-grow">
                <Label htmlFor="serviceSelect">Adicionar serviço do catálogo</Label>
                <Select value={selectedServiceToAdd} onValueChange={setSelectedServiceToAdd}>
                  <SelectTrigger id="serviceSelect" className="w-full">
                    <SelectValue placeholder="Selecione um serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableServices.length === 0 && (
                      <SelectItem value="no-services" disabled>Nenhum serviço cadastrado.</SelectItem>
                    )}
                    {availableServices.map(service => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name} ({formatCurrency(service.fixed_price || 0)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="button" onClick={handleAddService} disabled={!selectedServiceToAdd || availableServices.length === 0} size="icon" className="h-10 w-10">
                <PlusCircle className="h-4 w-4" />
              </Button>
              <Button type="button" onClick={handleOpenServiceModal} variant="outline" className="h-10">
                <PlusCircle className="h-4 w-4 mr-2" /> Novo Serviço
              </Button>
            </div>
            {errors.selectedServices && <p className="text-sm text-red-500">{errors.selectedServices.message}</p>}

            {watchedServices.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Serviço</TableHead>
                    <TableHead className="w-[100px]">Qtd.</TableHead>
                    <TableHead className="text-right">Valor Unit.</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {watchedServices.map((service, index) => (
                    <TableRow key={service.uniqueId}>
                      <TableCell className="font-medium">{service.name}</TableCell><TableCell>
                        <Input
                          type="number"
                          min="1"
                          value={service.quantity}
                          onChange={(e) => handleQuantityChange(service.uniqueId, parseInt(e.target.value))}
                          className="w-20 text-center"
                        />
                      </TableCell><TableCell className="text-right">
                        {service.price_type === 'fixed' ? formatCurrency(service.fixed_price || 0) : `${formatCurrency(service.hourly_rate || 0)}/h`}
                      </TableCell><TableCell className="text-right">{formatCurrency(service.calculated_total)}</TableCell><TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveService(service.uniqueId)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-gray-500 py-4">Nenhum serviço adicionado.</p>
            )}
            <div className="text-right text-xl font-bold mt-4">
              Total da Proposta: {formatCurrency(proposalTotal)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notas Adicionais (Opcional)</CardTitle>
            <CardDescription>Qualquer informação extra para o cliente.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea id="notes" placeholder="Condições especiais, prazos de entrega..." {...register('notes')} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Meios de Pagamento Aceitos</CardTitle>
            <CardDescription>Selecione os métodos de pagamento que você aceita para esta proposta.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {['Cartão de Crédito', 'Boleto Bancário', 'Pix', 'Transferência Bancária'].map((method) => (
              <div key={method} className="flex items-center space-x-2">
                <Checkbox
                  id={`payment-${method.replace(/\s/g, '')}`}
                  checked={watchedPaymentMethods.includes(method)}
                  onCheckedChange={(checked) => {
                    const currentMethods = watchedPaymentMethods || [];
                    if (checked) {
                      setValue('paymentMethods', [...currentMethods, method]);
                    } else {
                      setValue('paymentMethods', currentMethods.filter((item) => item !== method));
                    }
                  }}
                />
                <Label htmlFor={`payment-${method.replace(/\s/g, '')}`}>{method}</Label>
              </div>
            ))}
            {errors.paymentMethods && <p className="text-sm text-red-500">{errors.paymentMethods.message}</p>}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="submit" variant="outline" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Salvar Rascunho
          </Button>
          <Button type="button" onClick={handleSubmit(handleOpenPreviewModal)} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Pré-visualizar e Gerar PDF
          </Button>
        </div>
      </form>

      <ProposalPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        proposalData={previewData}
        onPdfGeneratedAndSent={handlePdfGeneratedAndSent}
      />

      <ServiceFormModal
        isOpen={isServiceModalOpen}
        onClose={handleServiceModalClose}
        onSave={handleServiceSaved}
        service={null}
      />
    </>
  );
};

export default ProposalForm;
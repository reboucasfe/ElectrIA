"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import { Service } from '@/components/dashboard/ServiceFormModal';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Estende a interface Service para incluir a quantidade e o total calculado no formulário
interface SelectedService extends Service {
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

const ProposalForm = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [availableServices, setAvailableServices] = useState<Service[]>([]);
  const [selectedServiceToAdd, setSelectedServiceToAdd] = useState<string>('');

  const proposalPdfRef = useRef<HTMLDivElement>(null); // Ref para o conteúdo do PDF

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<ProposalFormValues>({
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

  const watchedFormValues = watch(); // Assiste a todos os valores do formulário
  const watchedServices = watchedFormValues.selectedServices;
  const watchedPaymentMethods = watchedFormValues.paymentMethods;

  // Fetch available services from Supabase
  useEffect(() => {
    const fetchAvailableServices = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        showError(`Erro ao carregar serviços: ${error.message}`);
      } else {
        setAvailableServices(data as Service[]);
      }
    };
    fetchAvailableServices();
  }, [user]);

  // Pre-fill payment methods from user profile
  useEffect(() => {
    if (user?.user_metadata?.accepted_payment_methods) {
      setValue('paymentMethods', user.user_metadata.accepted_payment_methods);
    }
  }, [user, setValue]);

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
        quantity: 1, // Default quantity
        calculated_total: calculateServiceTotal(serviceToAdd, 1),
      };
      setValue('selectedServices', [...watchedServices, newService]);
      setSelectedServiceToAdd('');
    }
  };

  const handleRemoveService = (index: number) => {
    const newServices = watchedServices.filter((_, i) => i !== index);
    setValue('selectedServices', newServices);
  };

  const handleQuantityChange = (index: number, newQuantity: number) => {
    const newServices = [...watchedServices];
    if (newServices[index]) {
      newServices[index].quantity = newQuantity;
      newServices[index].calculated_total = calculateServiceTotal(newServices[index], newQuantity);
      setValue('selectedServices', newServices);
    }
  };

  const handleGeneratePdf = async (data: ProposalFormValues) => {
    setLoading(true);
    if (!proposalPdfRef.current) {
      showError("Erro: Conteúdo do PDF não encontrado.");
      setLoading(false);
      return;
    }

    try {
      const canvas = await html2canvas(proposalPdfRef.current, { scale: 2 }); // Aumenta a escala para melhor qualidade
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = canvas.height * imgWidth / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`proposta-${data.clientName.replace(/\s/g, '-')}-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);
      showSuccess("PDF da proposta gerado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao gerar PDF:", error);
      showError(`Erro ao gerar PDF: ${error.message || "Verifique o console para mais detalhes."}`);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ProposalFormValues) => {
    setLoading(true);
    console.log("Dados da Proposta:", data);
    // Aqui você implementaria a lógica para salvar o rascunho ou gerar a proposta com IA
    // Por enquanto, apenas um toast de sucesso
    showSuccess("Proposta salva como rascunho (funcionalidade de IA em desenvolvimento)!");
    setLoading(false);
  };

  const companyName = user?.user_metadata?.company_name || 'Sua Empresa';
  const userFullName = user?.user_metadata?.full_name || 'Eletricista';
  const userWhatsapp = user?.user_metadata?.whatsapp || '(XX) X.XXXX-XXXX';
  const userEmail = user?.email || 'contato@empresa.com';
  const userCnpj = user?.user_metadata?.cnpj || 'XX.XXX.XXX/XXXX-XX';
  const userBankName = user?.user_metadata?.bank_name || 'Não informado';
  const userBankAccount = user?.user_metadata?.bank_account || 'Não informado';
  const userBankAgency = user?.user_metadata?.bank_agency || 'Não informado';
  const userPixKey = user?.user_metadata?.pix_key || 'Não informado';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
          <div className="flex gap-2">
            <Select value={selectedServiceToAdd} onValueChange={setSelectedServiceToAdd}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Adicionar serviço do catálogo" />
              </SelectTrigger>
              <SelectContent>
                {availableServices.length === 0 && (
                  <SelectItem value="no-services" disabled>Nenhum serviço cadastrado. Adicione em 'Meus Serviços'.</SelectItem>
                )}
                {availableServices.map(service => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name} ({formatCurrency(service.fixed_price || 0)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="button" onClick={handleAddService} disabled={!selectedServiceToAdd || availableServices.length === 0}>
              <PlusCircle className="h-4 w-4" />
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
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        value={service.quantity}
                        onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                        className="w-20 text-center"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      {service.price_type === 'fixed' ? formatCurrency(service.fixed_price || 0) : `${formatCurrency(service.hourly_rate || 0)}/h`}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(service.calculated_total)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveService(index)}>
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
        <Button type="button" onClick={handleSubmit(handleGeneratePdf)} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Gerar Proposta em PDF
        </Button>
      </div>

      {/* Hidden content for PDF generation */}
      <div ref={proposalPdfRef} className="p-8 bg-white text-gray-900 hidden" style={{ width: '210mm', minHeight: '297mm', fontFamily: 'Arial, sans-serif' }}>
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-700 mb-2">{watchedFormValues.proposalTitle}</h1>
          <p className="text-lg text-gray-700">{companyName}</p>
          {user?.user_metadata?.avatar_url && (
            <img src={user.user_metadata.avatar_url} alt="Logo da Empresa" className="h-16 mx-auto mt-4" />
          )}
        </div>

        <div className="mb-8 p-4 border rounded-lg bg-gray-50">
          <h2 className="text-xl font-semibold mb-3">Informações do Cliente</h2>
          <p><strong>Nome:</strong> {watchedFormValues.clientName}</p>
          {watchedFormValues.clientEmail && <p><strong>Email:</strong> {watchedFormValues.clientEmail}</p>}
          {watchedFormValues.clientPhone && <p><strong>WhatsApp:</strong> {watchedFormValues.clientPhone}</p>}
        </div>

        {watchedFormValues.proposalDescription && (
          <div className="mb-8 p-4 border rounded-lg">
            <h2 className="text-xl font-semibold mb-3">Descrição da Proposta</h2>
            <p>{watchedFormValues.proposalDescription}</p>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-3">Serviços Incluídos</h2>
          {watchedServices.length > 0 ? (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">Serviço</th>
                  <th className="border p-2 text-center">Qtd.</th>
                  <th className="border p-2 text-right">Valor Unit.</th>
                  <th className="border p-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {watchedServices.map((service, index) => (
                  <tr key={index}>
                    <td className="border p-2">{service.name}</td>
                    <td className="border p-2 text-center">{service.quantity}</td>
                    <td className="border p-2 text-right">
                      {service.price_type === 'fixed' ? formatCurrency(service.fixed_price || 0) : `${formatCurrency(service.hourly_rate || 0)}/h`}
                    </td>
                    <td className="border p-2 text-right">{formatCurrency(service.calculated_total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-bold">
                  <td colSpan={3} className="border p-2 text-right">Total Geral:</td>
                  <td className="border p-2 text-right">{formatCurrency(proposalTotal)}</td>
                </tr>
              </tfoot>
            </table>
          ) : (
            <p className="text-gray-500">Nenhum serviço adicionado a esta proposta.</p>
          )}
        </div>

        {watchedFormValues.notes && (
          <div className="mb-8 p-4 border rounded-lg bg-gray-50">
            <h2 className="text-xl font-semibold mb-3">Notas Adicionais</h2>
            <p>{watchedFormValues.notes}</p>
          </div>
        )}

        <div className="mb-8 p-4 border rounded-lg">
          <h2 className="text-xl font-semibold mb-3">Condições de Pagamento</h2>
          <p className="mb-2"><strong>Validade da Proposta:</strong> {watchedFormValues.validityDays} dias a partir de {new Date().toLocaleDateString('pt-BR')}</p>
          <p className="mb-2"><strong>Meios de Pagamento Aceitos:</strong></p>
          <ul className="list-disc list-inside ml-4">
            {watchedPaymentMethods.length > 0 ? (
              watchedPaymentMethods.map((method, index) => <li key={index}>{method}</li>)
            ) : (
              <li>Nenhum método de pagamento selecionado.</li>
            )}
          </ul>
          <div className="mt-4 space-y-1">
            <p><strong>Dados Bancários:</strong></p>
            <p className="ml-4">Banco: {userBankName}</p>
            <p className="ml-4">Agência: {userBankAgency}</p>
            <p className="ml-4">Conta: {userBankAccount}</p>
            <p className="ml-4">Chave Pix: {userPixKey}</p>
          </div>
        </div>

        <div className="text-center mt-12 pt-4 border-t border-gray-200">
          <p className="text-gray-700">Atenciosamente,</p>
          <p className="font-semibold text-lg">{userFullName}</p>
          <p className="text-gray-600">{companyName}</p>
          <p className="text-gray-600">WhatsApp: {userWhatsapp}</p>
          <p className="text-gray-600">Email: {userEmail}</p>
          {userCnpj && <p className="text-gray-600">CNPJ: {userCnpj}</p>}
        </div>
      </div>
    </form>
  );
};

export default ProposalForm;
"use client";

import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { showError, showSuccess } from '@/utils/toast';
import { useAuth } from '@/contexts/AuthContext';
import { Service } from '@/components/dashboard/ServiceFormModal';
import { getTranslatedErrorMessage } from '@/utils/errorTranslations'; // Importação adicionada
import { cn } from '@/lib/utils'; // Importar cn para combinar classes
import { formatProposalNumber } from '@/utils/proposalUtils'; // Importar a nova função
import { supabase } from '@/lib/supabaseClient'; // Importar supabase

interface SelectedService extends Service {
  uniqueId: string;
  quantity: number;
  calculated_total: number;
}

interface ProposalFormValues {
  id?: string;
  proposalNumber?: number; // Agora armazena o número sequencial bruto (inteiro)
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  proposalTitle: string;
  proposalDescription?: string;
  selectedServices: SelectedService[];
  notes?: string;
  paymentMethods: string[];
  validityDays: number;
  status?: string;
  created_at?: string; // Adicionado para usar na formatação
}

interface ProposalPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposalData: ProposalFormValues | null;
  onPdfGeneratedAndSent: (proposalId: string) => void;
}

const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

const ProposalPreviewModal = ({ isOpen, onClose, proposalData, onPdfGeneratedAndSent }: ProposalPreviewModalProps) => {
  console.log("ProposalPreviewModal: Component rendering. isOpen:", isOpen, "proposalData is null:", proposalData === null);
  const { user } = useAuth();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const proposalPdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      console.log("ProposalPreviewModal: Modal está aberto. Dados da proposta:", proposalData);
    }
  }, [isOpen, proposalData]);

  const proposalTotal = useMemo(() => {
    return proposalData?.selectedServices.reduce((sum, service) => sum + service.calculated_total, 0) || 0;
  }, [proposalData]);

  const companyName = user?.user_metadata?.company_name || 'Sua Empresa';
  const userFullName = user?.user_metadata?.full_name || 'Eletricista';
  const userWhatsapp = user?.user_metadata?.whatsapp || '(XX) X.XXXX-XXXX';
  const userEmail = user?.email || 'contato@empresa.com';
  const userCnpj = user?.user_metadata?.cnpj || 'XX.XXX.XXX/XXXX-XX';
  const userBankName = user?.user_metadata?.bank_name || 'Não informado';
  const userBankAccount = user?.user_metadata?.bank_account || 'Não informado';
  const userBankAgency = user?.user_metadata?.bank_agency || 'Não informado';
  const userPixKey = user?.user_metadata?.pix_key || 'Não informado';
  const userCompanyCity = user?.user_metadata?.company_city || 'Não informada'; // Nova variável para cidade da empresa

  const handleGeneratePdf = async () => {
    console.log("handleGeneratePdf: Iniciando a geração do PDF...");
    if (!proposalData) {
      showError("Nenhum dado de proposta para gerar PDF.");
      console.error("handleGeneratePdf: Nenhum dado de proposta disponível.");
      return;
    }
    if (!user) {
      showError("Você precisa estar logado para gerar e enviar uma proposta.");
      return;
    }

    setIsGeneratingPdf(true);

    try {
      let currentProposalId = proposalData.id;
      let currentProposalNumber = proposalData.proposalNumber;
      let currentCreatedAt = proposalData.created_at;

      // Step 1: Save/Update the proposal in Supabase
      const proposalPayload = {
        user_id: user.id,
        proposal_number: proposalData.proposalNumber,
        client_name: proposalData.clientName,
        client_email: proposalData.clientEmail || null,
        client_phone: proposalData.clientPhone || null,
        proposal_title: proposalData.proposalTitle,
        proposal_description: proposalData.proposalDescription || null,
        selected_services: proposalData.selectedServices,
        notes: proposalData.notes || null,
        payment_methods: proposalData.paymentMethods,
        validity_days: proposalData.validityDays,
        status: 'sent', // Always set to 'sent' when generating PDF
        pdf_generated_at: new Date().toISOString(),
        sent_at: new Date().toISOString(),
        created_at: proposalData.created_at || new Date().toISOString(), // Ensure created_at is set
      };

      let result;
      if (currentProposalId) {
        console.log("handleGeneratePdf: Atualizando proposta existente com ID:", currentProposalId);
        result = await supabase.from('proposals').update(proposalPayload).eq('id', currentProposalId).select().single();
      } else {
        console.log("handleGeneratePdf: Inserindo nova proposta.");
        result = await supabase.from('proposals').insert([proposalPayload]).select().single();
        if (result.data) {
          currentProposalId = result.data.id;
          currentProposalNumber = result.data.proposal_number;
          currentCreatedAt = result.data.created_at;
        }
      }

      if (result.error) {
        console.error("handleGeneratePdf: Erro do Supabase ao salvar/atualizar proposta:", result.error);
        showError(getTranslatedErrorMessage(result.error.message));
        setIsGeneratingPdf(false);
        return;
      }

      if (!currentProposalId) {
        showError("Erro: ID da proposta não disponível após salvar.");
        setIsGeneratingPdf(false);
        return;
      }

      // Step 2: Generate PDF
      if (!proposalPdfRef.current) {
        showError("Erro: Conteúdo do PDF não encontrado.");
        console.error("handleGeneratePdf: proposalPdfRef.current é nulo.");
        setIsGeneratingPdf(false);
        return;
      }

      console.log("handleGeneratePdf: Capturando conteúdo com html2canvas...");
      const canvas = await html2canvas(proposalPdfRef.current, { scale: 2, useCORS: true });
      console.log("handleGeneratePdf: Captura com html2canvas concluída.");
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
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

      pdf.save(`proposta-${proposalData.clientName.replace(/\s/g, '-')}-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);
      showSuccess("PDF da proposta gerado com sucesso!");
      console.log("handleGeneratePdf: PDF salvo com sucesso.");

      // Step 3: Notify parent component
      onPdfGeneratedAndSent(currentProposalId); // Pass the actual ID
    } catch (error: any) {
      console.error("handleGeneratePdf: Erro ao gerar PDF:", error);
      showError(getTranslatedErrorMessage(error.message || "Erro desconhecido ao gerar PDF."));
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (!proposalData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 border-b">
          <DialogTitle className="text-2xl">Pré-visualização da Proposta</DialogTitle>
          <DialogDescription>Revise os detalhes da proposta antes de gerar o PDF.</DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div ref={proposalPdfRef} className="bg-white p-10 shadow-lg rounded-lg text-gray-900 leading-relaxed" style={{ fontFamily: 'Arial, sans-serif' }}>
            <div className="mb-10 text-center no-page-break-inside">
              {user?.user_metadata?.avatar_url && (
                <img src={user.user_metadata.avatar_url} alt="Logo da Empresa" className="h-20 mx-auto mb-4 object-contain" />
              )}
              <h1 className="text-4xl font-bold text-blue-700 mb-2">{proposalData.proposalTitle}</h1>
              {proposalData.proposalNumber && (
                <p className="text-xl text-gray-700 mb-1">Proposta Nº: {formatProposalNumber(proposalData.proposalNumber, proposalData.created_at)}</p>
              )}
              <p className="text-xl text-gray-700">{companyName}</p>
            </div>

            <div className="mb-10 p-6 border border-gray-200 rounded-lg bg-gray-50 no-page-break-inside">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Informações do Cliente</h2>
              <p className="mb-2"><strong className="font-medium">Nome:</strong> {proposalData.clientName}</p>
              {proposalData.clientEmail && <p className="mb-2"><strong className="font-medium">Email:</strong> {proposalData.clientEmail}</p>}
              {proposalData.clientPhone && <p className="mb-2"><strong className="font-medium">WhatsApp:</strong> {proposalData.clientPhone}</p>}
            </div>

            {proposalData.proposalDescription && (
              <div className="mb-10 p-6 border border-gray-200 rounded-lg no-page-break-inside">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Descrição da Proposta</h2>
                <p className="text-gray-700">{proposalData.proposalDescription}</p>
              </div>
            )}

            <div className="mb-10">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 no-page-break-inside">Serviços Incluídos</h2>
              {proposalData.selectedServices.length > 0 ? (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-blue-50 text-blue-800">
                      <th className="border border-gray-200 p-3 text-left">Serviço</th>
                      <th className="border border-gray-200 p-3 text-center w-[80px]">Qtd.</th>
                      <th className="border border-gray-200 p-3 text-right w-[120px]">Valor Unit.</th>
                      <th className="border border-gray-200 p-3 text-right w-[120px]">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {proposalData.selectedServices.map((service, index) => (
                      <tr key={service.uniqueId} className={cn(index % 2 === 0 ? 'bg-white' : 'bg-gray-50', 'no-page-break-inside')}>
                        <td className="border border-gray-200 p-3">{service.name}</td>
                        <td className="border border-gray-200 p-3 text-center">{service.quantity}</td>
                        <td className="border border-gray-200 p-3 text-right">
                          {service.price_type === 'fixed' ? formatCurrency(service.fixed_price || 0) : `${formatCurrency(service.hourly_rate || 0)}/h`}
                        </td>
                        <td className="border border-gray-200 p-3 text-right">{formatCurrency(service.calculated_total)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-blue-100 font-bold text-blue-800 no-page-break-inside">
                      <td colSpan={3} className="border border-gray-200 p-3 text-right text-xl">Total Geral:</td>
                      <td className="border border-gray-200 p-3 text-right text-xl">{formatCurrency(proposalTotal)}</td>
                    </tr>
                  </tfoot>
                </table>
              ) : (
                <p className="text-gray-500 italic">Nenhum serviço adicionado a esta proposta.</p>
              )}
            </div>

            {proposalData.notes && (
              <div className="mb-10 p-6 border border-gray-200 rounded-lg bg-gray-50 no-page-break-inside">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Notas Adicionais</h2>
                <p className="text-gray-700">{proposalData.notes}</p>
              </div>
            )}

            <div className="mb-10 p-6 border border-gray-200 rounded-lg no-page-break-inside">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Condições de Pagamento</h2>
              <p className="mb-3"><strong className="font-medium">Validade da Proposta:</strong> {proposalData.validityDays} dias a partir de {new Date(proposalData.created_at || new Date()).toLocaleDateString('pt-BR')}</p>
              <p className="mb-2"><strong className="font-medium">Meios de Pagamento Aceitos:</strong></p>
              <ul className="list-disc list-inside ml-6 text-gray-700">
                {proposalData.paymentMethods.length > 0 ? (
                  proposalData.paymentMethods.map((method, index) => <li key={index}>{method}</li>)
                ) : (
                  <li>Nenhum método de pagamento selecionado.</li>
                )}
              </ul>
              <div className="mt-6 space-y-2">
                <p className="text-lg font-semibold text-gray-800">Dados Bancários:</p>
                <p className="ml-6 text-gray-700">Banco: {userBankName}</p>
                <p className="ml-6 text-gray-700">Agência: {userBankAgency}</p>
                <p className="ml-6 text-gray-700">Conta: {userBankAccount}</p>
                <p className="ml-6 text-gray-700">Chave Pix: {userPixKey}</p>
              </div>
            </div>

            <footer className="text-center mt-12 pt-6 border-t border-gray-200 bg-gray-50 p-4 rounded-lg no-page-break-inside">
              <p className="text-gray-700 text-lg mb-2">Atenciosamente,</p>
              <p className="font-bold text-xl text-gray-900">{userFullName}</p>
              <p className="text-gray-700">{companyName}</p>
              <p className="text-gray-700">WhatsApp: {userWhatsapp}</p>
              <p className="text-gray-700">Email: {userEmail}</p>
              {userCnpj && <p className="text-gray-700">CNPJ: {userCnpj}</p>}
              {userCompanyCity && <p className="text-gray-700">{userCompanyCity}, Brasil</p>}
            </footer>
          </div>
        </div>
        <DialogFooter className="p-6 border-t flex justify-end gap-4">
          <Button variant="outline" onClick={onClose} disabled={isGeneratingPdf}>
            Fechar
          </Button>
          <Button onClick={handleGeneratePdf} disabled={isGeneratingPdf} className="bg-blue-600 hover:bg-blue-700">
            {isGeneratingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Gerar PDF e Marcar como Enviada
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProposalPreviewModal;
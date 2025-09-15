"use client";

import React, { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client'; // Importar ReactDOM para React 18
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { showError, showSuccess } from '@/utils/toast';
import { useAuth } from '@/contexts/AuthContext';
import { Service } from '@/components/dashboard/ServiceFormModal';
import { getTranslatedErrorMessage } from '@/utils/errorTranslations';
import { cn } from '@/lib/utils';
import { formatProposalNumber } from '@/utils/proposalUtils';
import { supabase } from '@/lib/supabaseClient';

interface SelectedService extends Service {
  uniqueId: string;
  quantity: number;
  calculated_total: number;
}

interface ProposalFormValues {
  id?: string;
  proposalNumber?: number;
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
  created_at?: string;
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

// Dimensões de uma página A4 em mm
const PAGE_HEIGHT_MM = 297;
const PAGE_WIDTH_MM = 210;
const PAGE_MARGIN_MM = 20;

// Fator de conversão de mm para px (assumindo 96 DPI para renderização em tela)
const MM_TO_PX_FACTOR = 96 / 25.4;

// Altura e largura da página de pré-visualização em pixels
const PREVIEW_PAGE_HEIGHT_PX = PAGE_HEIGHT_MM * MM_TO_PX_FACTOR;
const PREVIEW_CONTENT_WIDTH_PX = (PAGE_WIDTH_MM - PAGE_MARGIN_MM * 2) * MM_TO_PX_FACTOR;
const PREVIEW_CONTENT_HEIGHT_PX = PREVIEW_PAGE_HEIGHT_PX - (PAGE_MARGIN_MM * 2 * MM_TO_PX_FACTOR);

const ProposalPreviewModal = ({ isOpen, onClose, proposalData, onPdfGeneratedAndSent }: ProposalPreviewModalProps) => {
  console.log("ProposalPreviewModal: Component rendering. isOpen:", isOpen, "proposalData is null:", proposalData === null);
  const { user } = useAuth();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [renderedPages, setRenderedPages] = useState<React.ReactNode[][]>([]);
  const pageRefs = useRef<HTMLDivElement[]>([]); // Para armazenar refs para cada div de página renderizada

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
  const userCompanyCity = user?.user_metadata?.company_city || 'Não informada';

  // Função para criar os blocos de conteúdo da proposta
  const createContentBlocks = useCallback(() => {
    if (!proposalData) return [];

    const blocks: { key: string; content: React.ReactNode; }[] = [];

    // Header
    blocks.push({
      key: "header",
      content: (
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
      ),
    });

    // Client Info
    blocks.push({
      key: "client-info",
      content: (
        <div className="mb-10 p-6 border border-gray-200 rounded-lg bg-gray-50 no-page-break-inside">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Informações do Cliente</h2>
          <p className="mb-2"><strong className="font-medium">Nome:</strong> {proposalData.clientName}</p>
          {proposalData.clientEmail && <p className="mb-2"><strong className="font-medium">Email:</strong> {proposalData.clientEmail}</p>}
          {proposalData.clientPhone && <p className="mb-2"><strong className="font-medium">WhatsApp:</strong> {proposalData.clientPhone}</p>}
        </div>
      ),
    });

    // Proposal Description
    if (proposalData.proposalDescription) {
      blocks.push({
        key: "description",
        content: (
          <div className="mb-10 p-6 border border-gray-200 rounded-lg no-page-break-inside">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Descrição da Proposta</h2>
            <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: proposalData.proposalDescription.replace(/\n/g, '<br />') }}></p>
          </div>
        ),
      });
    }

    // Services Included
    blocks.push({
      key: "services",
      content: (
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
      ),
    });

    // Notes
    if (proposalData.notes) {
      blocks.push({
        key: "notes",
        content: (
          <div className="mb-10 p-6 border border-gray-200 rounded-lg bg-gray-50 no-page-break-inside">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Notas Adicionais</h2>
            <p className="text-gray-700" dangerouslySetInnerHTML={{ __html: proposalData.notes.replace(/\n/g, '<br />') }}></p>
          </div>
        ),
      });
    }

    // Payment Conditions
    blocks.push({
      key: "payment-conditions",
      content: (
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
          ),
        });

        // Footer
        blocks.push({
          key: "footer",
          content: (
            <footer className="text-center mt-12 pt-6 border-t border-gray-200 bg-gray-50 p-4 rounded-lg no-page-break-inside">
              <p className="text-gray-700 text-lg mb-2">Atenciosamente,</p>
              <p className="font-bold text-xl text-gray-900">{userFullName}</p>
              <p className="text-gray-700">{companyName}</p>
              <p className="text-gray-700">WhatsApp: {userWhatsapp}</p>
              <p className="text-gray-700">Email: {userEmail}</p>
              {userCnpj && <p className="text-gray-700">CNPJ: {userCnpj}</p>}
              {userCompanyCity && <p className="text-gray-700">{userCompanyCity}, Brasil</p>}
            </footer>
          ),
        });

        return blocks;
      }, [proposalData, user, companyName, userFullName, userWhatsapp, userEmail, userCnpj, userBankName, userBankAccount, userBankAgency, userPixKey, userCompanyCity, proposalTotal]);

  useEffect(() => {
    const generatePages = async () => {
      if (!proposalData) {
        setRenderedPages([]);
        return;
      }

      const blocks = createContentBlocks();
      const newPages: React.ReactNode[][] = [];
      let currentPageBlocks: React.ReactNode[] = [];
      let currentPageHeight = 0;

      // Cria um div temporário para renderizar e medir a altura dos blocos
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.visibility = 'hidden';
      tempDiv.style.width = `${PREVIEW_CONTENT_WIDTH_PX}px`; // Largura do conteúdo da página em px
      tempDiv.style.padding = '0';
      tempDiv.style.margin = '0';
      tempDiv.style.boxSizing = 'border-box';
      document.body.appendChild(tempDiv);

      const measuredBlocks: { content: React.ReactNode; height: number }[] = [];

      for (const block of blocks) {
        const root = ReactDOM.createRoot(tempDiv);
        root.render(block.content);
        // Pequeno delay para garantir que o DOM foi atualizado antes de medir
        await new Promise(resolve => setTimeout(resolve, 0));
        const height = tempDiv.offsetHeight;
        measuredBlocks.push({ content: block.content, height });
        root.unmount(); // Limpa o root
      }

      document.body.removeChild(tempDiv); // Remove o div temporário

      // Distribui os blocos medidos nas páginas
      measuredBlocks.forEach(block => {
        // Adiciona um buffer para espaçamento entre blocos e margens da página
        const blockWithBufferHeight = block.height + 20; // 20px de margem inferior para cada bloco

        if (currentPageHeight + blockWithBufferHeight > PREVIEW_CONTENT_HEIGHT_PX && currentPageBlocks.length > 0) {
          newPages.push(currentPageBlocks);
          currentPageBlocks = [];
          currentPageHeight = 0;
        }
        currentPageBlocks.push(block.content);
        currentPageHeight += blockWithBufferHeight;
      });

      if (currentPageBlocks.length > 0) {
        newPages.push(currentPageBlocks);
      }

      setRenderedPages(newPages);
    };

    if (isOpen) {
      generatePages();
    } else {
      setRenderedPages([]); // Limpa as páginas quando o modal fecha
    }
  }, [proposalData, isOpen, createContentBlocks]);

  // Atualiza pageRefs após o estado renderedPages mudar
  useEffect(() => {
    if (isOpen) {
      pageRefs.current = Array.from(document.querySelectorAll('.pdf-page-content')) as HTMLDivElement[];
      console.log("Collected page refs:", pageRefs.current);
    }
  }, [renderedPages, isOpen]);


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

      // Passo 1: Salvar/Atualizar a proposta no Supabase
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
        status: 'sent', // Sempre define como 'sent' ao gerar PDF
        pdf_generated_at: new Date().toISOString(),
        sent_at: new Date().toISOString(),
        created_at: proposalData.created_at || new Date().toISOString(), // Garante que created_at seja definido
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

      // Passo 2: Gerar PDF página por página
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = PAGE_WIDTH_MM;
      const pageHeight = PAGE_HEIGHT_MM;

      for (let i = 0; i < pageRefs.current.length; i++) {
        const pageElement = pageRefs.current[i];
        if (!pageElement) {
          console.warn(`handleGeneratePdf: Elemento da página ${i} não encontrado.`);
          continue;
        }

        console.log(`handleGeneratePdf: Capturando página ${i + 1} com html2canvas...`);
        const canvas = await html2canvas(pageElement, { scale: 2, useCORS: true });
        console.log(`handleGeneratePdf: Captura da página ${i + 1} concluída.`);
        const imgData = canvas.toDataURL('image/png');
        const imgHeight = canvas.height * imgWidth / canvas.width;

        if (i > 0) {
          pdf.addPage();
        }
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      }

      pdf.save(`proposta-${proposalData.clientName.replace(/\s/g, '-')}-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`);
      showSuccess("PDF da proposta gerado com sucesso!");
      console.log("handleGeneratePdf: PDF salvo com sucesso.");

      // Passo 3: Notificar o componente pai
      onPdfGeneratedAndSent(currentProposalId); // Passa o ID real
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
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50 flex flex-col items-center space-y-6">
          {renderedPages.map((pageBlocks, index) => (
            <div
              key={`page-${index}`}
              ref={el => { if (el) pageRefs.current[index] = el; }}
              className="pdf-page-content bg-white shadow-lg rounded-lg text-gray-900 leading-relaxed relative"
              style={{
                width: `${PAGE_WIDTH_MM}mm`, // Largura A4
                minHeight: `${PAGE_HEIGHT_MM}mm`, // Altura A4
                padding: `${PAGE_MARGIN_MM}mm`, // Margens padrão A4
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div className="flex-1">
                {pageBlocks}
              </div>
              <div className="absolute bottom-4 left-0 w-full text-center text-gray-400 text-sm">
                Página {index + 1} de {renderedPages.length}
              </div>
            </div>
          ))}
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
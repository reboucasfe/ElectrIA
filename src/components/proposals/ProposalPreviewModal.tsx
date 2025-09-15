"use client";

import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { showError, showSuccess } from '@/utils/toast';
import { useAuth } from '@/contexts/AuthContext';
import { Service } from '@/components/dashboard/ServiceFormModal'; // Importa a interface Service

// Estende a interface Service para incluir a quantidade e o total calculado no formulário
interface SelectedService extends Service {
  quantity: number;
  calculated_total: number;
}

interface ProposalFormValues {
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  proposalTitle: string;
  proposalDescription?: string;
  selectedServices: SelectedService[];
  notes?: string;
  paymentMethods: string[];
  validityDays: number;
}

interface ProposalPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposalData: ProposalFormValues | null;
}

const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

const ProposalPreviewModal = ({ isOpen, onClose, proposalData }: ProposalPreviewModalProps) => {
  const { user } = useAuth();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const proposalPdfRef = useRef<HTMLDivElement>(null);

  // Adiciona um log quando o modal abre
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

  const handleGeneratePdf = async () => {
    console.log("handleGeneratePdf: Iniciando a geração do PDF...");
    if (!proposalData) {
      showError("Nenhum dado de proposta para gerar PDF.");
      console.error("handleGeneratePdf: Nenhum dado de proposta disponível.");
      return;
    }
    setIsGeneratingPdf(true);
    if (!proposalPdfRef.current) {
      showError("Erro: Conteúdo do PDF não encontrado.");
      console.error("handleGeneratePdf: proposalPdfRef.current é nulo.");
      setIsGeneratingPdf(false);
      return;
    }

    try {
      console.log("handleGeneratePdf: Capturando conteúdo com html2canvas...");
      const canvas = await html2canvas(proposalPdfRef.current, { scale: 2 });
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
      onClose(); // Fecha o modal após gerar o PDF
    } catch (error: any) {
      console.error("handleGeneratePdf: Erro ao gerar PDF:", error);
      showError(`Erro ao gerar PDF: ${error.message || "Verifique o console para mais detalhes."}`);
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
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <div ref={proposalPdfRef} className="bg-white p-8 shadow-md rounded-lg text-gray-900" style={{ fontFamily: 'Arial, sans-serif' }}>
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-blue-700 mb-2">{proposalData.proposalTitle}</h1>
              <p className="text-lg text-gray-700">{companyName}</p>
              {user?.user_metadata?.avatar_url && (
                <img src={user.user_metadata.avatar_url} alt="Logo da Empresa" className="h-16 mx-auto mt-4" />
              )}
            </div>

            <div className="mb-8 p-4 border rounded-lg bg-gray-50">
              <h2 className="text-xl font-semibold mb-3">Informações do Cliente</h2>
              <p><strong>Nome:</strong> {proposalData.clientName}</p>
              {proposalData.clientEmail && <p><strong>Email:</strong> {proposalData.clientEmail}</p>}
              {proposalData.clientPhone && <p><strong>WhatsApp:</strong> {proposalData.clientPhone}</p>}
            </div>

            {proposalData.proposalDescription && (
              <div className="mb-8 p-4 border rounded-lg">
                <h2 className="text-xl font-semibold mb-3">Descrição da Proposta</h2>
                <p>{proposalData.proposalDescription}</p>
              </div>
            )}

            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-3">Serviços Incluídos</h2>
              {proposalData.selectedServices.length > 0 ? (
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
                    {proposalData.selectedServices.map((service, index) => (
                      <tr key={service.uniqueId}>
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

            {proposalData.notes && (
              <div className="mb-8 p-4 border rounded-lg bg-gray-50">
                <h2 className="text-xl font-semibold mb-3">Notas Adicionais</h2>
                <p>{proposalData.notes}</p>
              </div>
            )}

            <div className="mb-8 p-4 border rounded-lg">
              <h2 className="text-xl font-semibold mb-3">Condições de Pagamento</h2>
              <p className="mb-2"><strong>Validade da Proposta:</strong> {proposalData.validityDays} dias a partir de {new Date().toLocaleDateString('pt-BR')}</p>
              <p className="mb-2"><strong>Meios de Pagamento Aceitos:</strong></p>
              <ul className="list-disc list-inside ml-4">
                {proposalData.paymentMethods.length > 0 ? (
                  proposalData.paymentMethods.map((method, index) => <li key={index}>{method}</li>)
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
        </div>
        <DialogFooter className="p-6 border-t flex justify-end gap-4">
          <Button variant="outline" onClick={onClose} disabled={isGeneratingPdf}>
            Fechar
          </Button>
          <Button onClick={handleGeneratePdf} disabled={isGeneratingPdf} className="bg-blue-600 hover:bg-blue-700">
            {isGeneratingPdf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Gerar PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProposalPreviewModal;
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MoreHorizontal, FileText, Trash2, CheckCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { supabase } from '@/lib/supabaseClient';
import { showError, showSuccess } from '@/utils/toast';
import { Skeleton } from '@/components/ui/skeleton';
import ProposalPreviewModal from '@/components/proposals/ProposalPreviewModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { getTranslatedErrorMessage } from '@/utils/errorTranslations';
import { formatProposalNumber } from '@/utils/proposalUtils'; // Importar a nova função

interface Proposal {
  id: string;
  proposal_number?: number; // Adicionado número da proposta
  revision_number?: number; // Adicionado número da revisão
  client_name: string;
  status: 'draft' | 'sent' | 'accepted' | 'pending' | 'rejected';
  selected_services: Array<{ calculated_total: number }>;
  created_at: string;
  pdf_generated_at?: string;
  proposal_title: string;
  proposal_description?: string;
  client_email?: string;
  client_phone?: string;
  notes?: string;
  payment_methods: string[];
  validity_days: number;
  accepted_at?: string; // Adicionado accepted_at
}

const ProposalsClosed = () => {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedProposalForPreview, setSelectedProposalForPreview] = useState<any | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [proposalToDelete, setProposalToDelete] = useState<Proposal | null>(null);

  const fetchProposals = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('proposals')
      .select('*')
      .in('status', ['accepted', 'rejected']) // Filtra por propostas fechadas
      .order('created_at', { ascending: false });

    if (error) {
      showError(getTranslatedErrorMessage(error.message));
      setProposals([]);
    } else {
      setProposals(data as Proposal[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const calculateProposalTotal = (services: Array<{ calculated_total: number }>) => {
    return services.reduce((sum, service) => sum + service.calculated_total, 0);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft':
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">Em Edição</span>;
      case 'sent':
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">Enviada</span>;
      case 'pending':
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">Pendente</span>;
      case 'accepted':
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">Aceita</span>;
      case 'rejected':
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">Rejeitada</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">Desconhecido</span>;
    }
  };

  const handleViewPdfClick = (proposal: Proposal) => {
    setSelectedProposalForPreview({
      id: proposal.id,
      proposalNumber: proposal.proposal_number, // Passa o número da proposta
      revisionNumber: proposal.revision_number, // Passa o número da revisão
      clientName: proposal.client_name,
      clientEmail: proposal.client_email,
      clientPhone: proposal.client_phone,
      proposalTitle: proposal.proposal_title,
      proposalDescription: proposal.proposal_description,
      selectedServices: proposal.selected_services,
      notes: proposal.notes,
      paymentMethods: proposal.payment_methods,
      validityDays: proposal.validity_days,
      status: proposal.status,
      created_at: proposal.created_at, // Passa a data de criação
    });
    setIsPreviewModalOpen(true);
  };

  const handlePdfGeneratedAndSent = () => {
    // Esta função é chamada após gerar o PDF, mas para propostas fechadas,
    // o status já deve estar definido. Apenas fechamos o modal e atualizamos a lista.
    setIsPreviewModalOpen(false);
    fetchProposals();
  };

  const handleDeleteClick = (proposal: Proposal) => {
    setProposalToDelete(proposal);
    setIsAlertOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!proposalToDelete) return;

    const { error } = await supabase.from('proposals').delete().eq('id', proposalToDelete.id);

    if (error) {
      showError(getTranslatedErrorMessage(error.message));
    } else {
      showSuccess('Proposta excluída com sucesso!');
      fetchProposals();
    }
    setIsAlertOpen(false);
    setProposalToDelete(null);
  };

  const handleMarkAsAccepted = async (proposalId: string) => {
    setLoading(true);
    const { error } = await supabase
      .from('proposals')
      .update({ status: 'accepted', accepted_at: new Date().toISOString() }) // Adiciona accepted_at
      .eq('id', proposalId);

    if (error) {
      showError(getTranslatedErrorMessage(error.message));
    } else {
      showSuccess('Proposta marcada como Aceita!');
      fetchProposals();
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/proposals-overview')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Propostas Fechadas</h1>
          <p className="text-gray-500">Visualize todas as propostas que foram aceitas ou recusadas.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Propostas Fechadas</CardTitle>
          <CardDescription>
            Propostas que foram aceitas ou rejeitadas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : proposals.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nº Proposta</TableHead> {/* Nova coluna */}
                  <TableHead>Cliente</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Valor Total</TableHead>
                  <TableHead>Data Criação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proposals.map((proposal) => (
                  <TableRow key={proposal.id}>
                    <TableCell className="font-medium">{formatProposalNumber(proposal.proposal_number, proposal.created_at, proposal.revision_number)}</TableCell> {/* Exibe o número da proposta formatado */}
                    <TableCell>{proposal.client_name}</TableCell>
                    <TableCell>{proposal.proposal_title}</TableCell>
                    <TableCell>{getStatusLabel(proposal.status)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(calculateProposalTotal(proposal.selected_services))}</TableCell>
                    <TableCell>{new Date(proposal.created_at).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewPdfClick(proposal)}>
                            <FileText className="mr-2 h-4 w-4" /> Ver PDF
                          </DropdownMenuItem>
                          {/* Adicionado: Marcar como Aceita (apenas se não for 'accepted' ou 'rejected') */}
                          {!['accepted', 'rejected'].includes(proposal.status) && (
                            <DropdownMenuItem onClick={() => handleMarkAsAccepted(proposal.id)}>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Marcar como Aceita
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleDeleteClick(proposal)} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-gray-500 py-8">
              Nenhuma proposta fechada no momento.
            </p>
          )}
        </CardContent>
      </Card>

      <ProposalPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        proposalData={selectedProposalForPreview}
        onPdfGeneratedAndSent={handlePdfGeneratedAndSent}
      />

      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente a proposta "{proposalToDelete?.proposal_title}" do seu catálogo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProposalsClosed;
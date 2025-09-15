"use client";

import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MoreHorizontal, Edit, FileText, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { supabase } from '@/lib/supabaseClient';
import { showError, showSuccess } from '@/utils/toast';
import { Skeleton } from '@/components/ui/skeleton';
import ProposalPreviewModal from '@/components/proposals/ProposalPreviewModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Proposal {
  id: string;
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
}

const ProposalsList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const proposalFilterStatus = new URLSearchParams(location.search).get('status');

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedProposalForPreview, setSelectedProposalForPreview] = useState<any | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [proposalToDelete, setProposalToDelete] = useState<Proposal | null>(null);

  const fetchProposals = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('proposals').select('*').order('created_at', { ascending: false });

    if (proposalFilterStatus === 'sent') {
      query = query.in('status', ['sent', 'pending']); // 'pending' pode ser considerado como 'enviada' mas aguardando resposta
    } else if (proposalFilterStatus === 'accepted') {
      query = query.eq('status', 'accepted');
    } else if (proposalFilterStatus === 'draft') {
      query = query.eq('status', 'draft');
    }

    const { data, error } = await query;

    if (error) {
      showError(error.message);
      setProposals([]);
    } else {
      setProposals(data as Proposal[]);
    }
    setLoading(false);
  }, [proposalFilterStatus]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  const getTitle = () => {
    if (proposalFilterStatus === 'sent') {
      return 'Propostas Enviadas';
    } else if (proposalFilterStatus === 'accepted') {
      return 'Propostas Aceitas';
    } else if (proposalFilterStatus === 'draft') {
      return 'Rascunhos de Propostas';
    }
    return 'Todas as Propostas';
  };

  const getDescription = () => {
    if (proposalFilterStatus === 'sent') {
      return 'Aqui você pode visualizar todas as propostas que foram enviadas aos seus clientes.';
    } else if (proposalFilterStatus === 'accepted') {
      return 'Aqui você pode visualizar as propostas que foram aceitas pelos seus clientes.';
    } else if (proposalFilterStatus === 'draft') {
      return 'Propostas que ainda não foram enviadas ou geradas em PDF.';
    }
    return 'Visualize e gerencie todas as suas propostas.';
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const calculateProposalTotal = (services: Array<{ calculated_total: number }>) => {
    return services.reduce((sum, service) => sum + service.calculated_total, 0);
  };

  const getStatusLabel = (status: string, pdfGeneratedAt: string | undefined) => {
    switch (status) {
      case 'draft':
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">Rascunho</span>;
      case 'sent':
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">Enviada</span>;
      case 'accepted':
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">Aceita</span>;
      case 'rejected':
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">Rejeitada</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">Pendente</span>;
    }
  };

  const handleEditProposal = (proposalId: string) => {
    navigate(`/proposals/edit/${proposalId}`);
  };

  const handleGeneratePdfClick = (proposal: Proposal) => {
    setSelectedProposalForPreview({
      id: proposal.id,
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
    });
    setIsPreviewModalOpen(true);
  };

  const handlePdfGeneratedAndSent = () => {
    setIsPreviewModalOpen(false);
    fetchProposals(); // Recarrega a lista para atualizar o status
  };

  const handleDeleteClick = (proposal: Proposal) => {
    setProposalToDelete(proposal);
    setIsAlertOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!proposalToDelete) return;

    const { error } = await supabase.from('proposals').delete().eq('id', proposalToDelete.id);

    if (error) {
      showError(error.message);
    } else {
      showSuccess('Proposta excluída com sucesso!');
      fetchProposals(); // Recarrega a lista
    }
    setIsAlertOpen(false);
    setProposalToDelete(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/proposals-overview')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{getTitle()}</h1>
          <p className="text-gray-500">{getDescription()}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes das Propostas</CardTitle>
          <CardDescription>
            {proposalFilterStatus === 'sent' ? 'Todas as propostas que você enviou ou estão pendentes.' :
             proposalFilterStatus === 'accepted' ? 'Todas as propostas que foram aceitas.' :
             proposalFilterStatus === 'draft' ? 'Todos os rascunhos de propostas.' :
             'Todas as suas propostas cadastradas.'}
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
                  <TableHead>ID</TableHead>
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
                    <TableCell className="font-medium">{proposal.id.substring(0, 8)}...</TableCell>
                    <TableCell>{proposal.client_name}</TableCell>
                    <TableCell>{proposal.proposal_title}</TableCell>
                    <TableCell>{getStatusLabel(proposal.status, proposal.pdf_generated_at)}</TableCell>
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
                          <DropdownMenuItem onClick={() => handleEditProposal(proposal.id)}>
                            <Edit className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleGeneratePdfClick(proposal)}>
                            <FileText className="mr-2 h-4 w-4" /> Gerar PDF
                          </DropdownMenuItem>
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
              Nenhuma proposta {proposalFilterStatus === 'sent' ? 'enviada ou pendente' :
                               proposalFilterStatus === 'accepted' ? 'aceita' :
                               proposalFilterStatus === 'draft' ? 'em rascunho' :
                               ''} encontrada.
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

export default ProposalsList;
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'; // Alterado para @hello-pangea/dnd
import { supabase } from '@/lib/supabaseClient';
import { showError, showSuccess } from '@/utils/toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Edit, FileText, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import ProposalPreviewModal from '@/components/proposals/ProposalPreviewModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { getTranslatedErrorMessage } from '@/utils/errorTranslations';
import { formatProposalNumber } from '@/utils/proposalUtils';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext'; // Importar useAuth para obter o user.id

interface Proposal {
  id: string;
  proposal_number?: number;
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
  sent_at?: string;
  accepted_at?: string;
}

interface Column {
  id: string;
  title: string;
  status: Proposal['status'][];
  color: string;
}

const columns: Column[] = [
  { id: 'column-draft', title: 'Em Edição', status: ['draft'], color: 'bg-gray-100' },
  { id: 'column-sent', title: 'Enviadas', status: ['sent', 'pending'], color: 'bg-blue-100' },
  { id: 'column-accepted', title: 'Aceitas', status: ['accepted'], color: 'bg-green-100' },
  { id: 'column-rejected', title: 'Rejeitadas', status: ['rejected'], color: 'bg-red-100' },
];

const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

const calculateProposalTotal = (services: Array<{ calculated_total: number }>) => {
  return services.reduce((sum, service) => sum + service.calculated_total, 0);
};

const ProposalsKanbanView = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Obter o usuário logado
  const [proposalsByColumn, setProposalsByColumn] = useState<{ [key: string]: Proposal[] }>({});
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
      .order('created_at', { ascending: false });

    if (error) {
      showError(getTranslatedErrorMessage(error.message));
      setProposalsByColumn({});
    } else {
      const newProposalsByColumn: { [key: string]: Proposal[] } = {};
      columns.forEach(col => {
        newProposalsByColumn[col.id] = data.filter(p => col.status.includes(p.status));
      });
      setProposalsByColumn(newProposalsByColumn);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) {
      return;
    }

    if (source.droppableId === destination.droppableId) {
      // Reordenar dentro da mesma coluna (não implementado para simplicidade, mas possível)
      return;
    }

    const sourceColumnId = source.droppableId;
    const destinationColumnId = destination.droppableId;

    const sourceColumn = proposalsByColumn[sourceColumnId];
    const destinationColumn = proposalsByColumn[destinationColumnId];

    const draggedProposal = sourceColumn.find(p => p.id === draggableId);

    if (!draggedProposal) return;

    // Determine new status based on destination column
    const newStatus = columns.find(col => col.id === destinationColumnId)?.status[0]; // Take the first status as the primary for the column

    if (!newStatus) {
      showError("Status de destino inválido.");
      return;
    }

    const oldStatus = draggedProposal.status; // Capture old status

    // Optimistic update
    const newSourceProposals = Array.from(sourceColumn);
    newSourceProposals.splice(source.index, 1);

    const newDestinationProposals = Array.from(destinationColumn);
    newDestinationProposals.splice(destination.index, 0, { ...draggedProposal, status: newStatus });

    setProposalsByColumn(prev => ({
      ...prev,
      [sourceColumnId]: newSourceProposals,
      [destinationColumnId]: newDestinationProposals,
    }));

    // Update in Supabase
    try {
      let currentRevisionNumber = (draggedProposal.revision_number || 0) + 1;

      const updatePayload: Partial<Proposal> = { 
        status: newStatus,
        revision_number: currentRevisionNumber, // Incrementa o número da revisão
      };
      if (newStatus === 'accepted') {
        updatePayload.accepted_at = new Date().toISOString();
      } else if (newStatus === 'sent' && !draggedProposal.sent_at) {
        updatePayload.sent_at = new Date().toISOString();
      }

      const { data: updatedProposal, error } = await supabase
        .from('proposals')
        .update(updatePayload)
        .eq('id', draggableId)
        .select()
        .single();

      if (error) {
        showError(getTranslatedErrorMessage(error.message));
        // Revert optimistic update on error
        setProposalsByColumn(prev => ({
          ...prev,
          [sourceColumnId]: sourceColumn,
          [destinationColumnId]: destinationColumn,
        }));
      } else {
        showSuccess(`Proposta "${draggedProposal.proposal_title}" movida para "${columns.find(col => col.id === destinationColumnId)?.title}"!`);
        
        // Registrar no histórico de revisões
        if (user && updatedProposal) {
          const changesSummary = {
            summary: `Status da proposta alterado via Kanban de '${oldStatus}' para '${newStatus}'.`,
            details: {
              status: { old: oldStatus, new: newStatus }
            }
          };
          const { error: revisionError } = await supabase.from('proposal_revisions').insert({
            proposal_id: updatedProposal.id,
            revision_number: updatedProposal.revision_number,
            user_id: user.id,
            changes: changesSummary,
          });
          if (revisionError) {
            console.error("Kanban: Erro ao salvar revisão de status:", revisionError);
            showError(getTranslatedErrorMessage(revisionError.message));
          }
        }

        // Re-fetch to ensure data consistency, especially for 'sent' status which might include 'pending'
        fetchProposals();
      }
    } catch (error: any) {
      showError(getTranslatedErrorMessage(error.message || "Erro ao atualizar status da proposta."));
      // Revert optimistic update on error
      setProposalsByColumn(prev => ({
        ...prev,
        [sourceColumnId]: sourceColumn,
        [destinationColumnId]: destinationColumn,
      }));
    }
  };

  const handleEditProposal = (proposalId: string) => {
    navigate(`/proposals/edit/${proposalId}`);
  };

  const handleGeneratePdfClick = (proposal: Proposal) => {
    setSelectedProposalForPreview({
      id: proposal.id,
      proposalNumber: proposal.proposal_number,
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
      created_at: proposal.created_at,
    });
    setIsPreviewModalOpen(true);
  };

  const handlePdfGeneratedAndSent = () => {
    setIsPreviewModalOpen(false);
    fetchProposals(); // Atualiza a lista após gerar e enviar PDF
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

  const getStatusBadge = (status: Proposal['status']) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline" className="bg-gray-500 text-white">Em Edição</Badge>;
      case 'sent':
        return <Badge className="bg-blue-600 text-white">Enviada</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 text-white">Pendente</Badge>;
      case 'accepted':
        return <Badge className="bg-green-600 text-white">Aceita</Badge>;
      case 'rejected':
        return <Badge className="bg-red-600 text-white">Rejeitada</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map(col => (
          <Card key={col.id} className="h-[400px]">
            <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-full">
        {columns.map(column => (
          <Droppable droppableId={column.id} key={column.id}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={cn(
                  "flex flex-col rounded-lg shadow-md p-4 min-h-[200px]",
                  column.color,
                  snapshot.isDraggingOver ? 'bg-opacity-75' : 'bg-opacity-50'
                )}
              >
                <h2 className="text-xl font-semibold mb-4 text-gray-800">{column.title} ({proposalsByColumn[column.id]?.length || 0})</h2>
                <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                  {proposalsByColumn[column.id]?.length === 0 && (
                    <p className="text-center text-gray-600 italic">Nenhuma proposta aqui.</p>
                  )}
                  {proposalsByColumn[column.id]?.map((proposal, index) => (
                    <Draggable key={proposal.id} draggableId={proposal.id} index={index}>
                      {(provided, snapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={cn(
                            "bg-white shadow-sm border border-gray-200",
                            snapshot.isDragging ? 'ring-2 ring-blue-500' : ''
                          )}
                        >
                          <CardHeader className="p-4 pb-2">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-lg font-semibold">{proposal.proposal_title}</CardTitle>
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
                                  {proposal.status !== 'accepted' && (
                                    <DropdownMenuItem onClick={() => onDragEnd({
                                      draggableId: proposal.id,
                                      type: 'DEFAULT',
                                      source: { droppableId: column.id, index: index },
                                      destination: { droppableId: 'column-accepted', index: 0 }
                                    })}>
                                      <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Marcar como Aceita
                                    </DropdownMenuItem>
                                  )}
                                  {proposal.status !== 'rejected' && (
                                    <DropdownMenuItem onClick={() => onDragEnd({
                                      draggableId: proposal.id,
                                      type: 'DEFAULT',
                                      source: { droppableId: column.id, index: index },
                                      destination: { droppableId: 'column-rejected', index: 0 }
                                    })}>
                                      <XCircle className="mr-2 h-4 w-4 text-red-600" /> Marcar como Rejeitada
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem onClick={() => handleDeleteClick(proposal)} className="text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4" /> Excluir
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <CardDescription className="text-sm text-gray-600">
                              {formatProposalNumber(proposal.proposal_number, proposal.created_at, proposal.revision_number)} - {proposal.client_name}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <div className="flex justify-between items-center text-sm">
                              <span className="font-medium">Total: {formatCurrency(calculateProposalTotal(proposal.selected_services))}</span>
                              {getStatusBadge(proposal.status)}
                            </div>
                            <div className="flex items-center text-xs text-gray-500 mt-2">
                              <Clock className="h-3 w-3 mr-1" /> Criada em: {new Date(proposal.created_at).toLocaleDateString('pt-BR')}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                </div>
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </div>

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
    </DragDropContext>
  );
};

export default ProposalsKanbanView;
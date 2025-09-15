"use client";

import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MoreHorizontal, Edit, FileText, Trash2, CheckCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { supabase } from '@/lib/supabaseClient';
import { showError, showSuccess } from '@/utils/toast';
import { Skeleton } from '@/components/ui/skeleton';
import ProposalPreviewModal from '@/components/proposals/ProposalPreviewModal';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { getTranslatedErrorMessage } from '@/utils/errorTranslations';
import { formatProposalNumber } from '@/utils/proposalUtils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { addDays, subDays, isWithinInterval, parseISO } from 'date-fns';

interface Proposal {
  id: string;
  proposal_number?: number;
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
  accepted_at?: string;
}

const ProposalsList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Obter o status inicial da URL, se houver
  const initialUrlStatus = new URLSearchParams(location.search).get('status');

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedProposalForPreview, setSelectedProposalForPreview] = useState<any | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [proposalToDelete, setProposalToDelete] = useState<Proposal | null>(null);

  // Estados para os novos filtros
  const [statusFilter, setStatusFilter] = useState<string>(initialUrlStatus || 'all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  // Efeito para atualizar o filtro de status interno quando o parâmetro da URL muda
  useEffect(() => {
    const urlStatus = new URLSearchParams(location.search).get('status');
    setStatusFilter(urlStatus || 'all');
  }, [location.search]);

  const fetchProposals = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('proposals').select('*').order('created_at', { ascending: false });

    // Aplicar filtro de status
    if (statusFilter !== 'all') {
      if (statusFilter === 'sent') {
        query = query.in('status', ['sent', 'pending']);
      } else {
        query = query.eq('status', statusFilter);
      }
    }

    // Aplicar filtro de período
    if (dateRange?.from && dateRange?.to) {
      query = query.gte('created_at', dateRange.from.toISOString());
      // Adicionar um dia à data 'to' para incluir o dia inteiro
      query = query.lte('created_at', addDays(dateRange.to, 1).toISOString());
    }

    const { data, error } = await query;

    if (error) {
      showError(getTranslatedErrorMessage(error.message));
      setProposals([]);
    } else {
      setProposals(data as Proposal[]);
    }
    setLoading(false);
  }, [statusFilter, dateRange]); // Depende dos estados dos filtros

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]); // Re-fetch quando fetchProposals muda (devido à mudança nos filtros)

  const getTitle = () => {
    if (statusFilter === 'sent') {
      return 'Propostas Enviadas';
    } else if (statusFilter === 'accepted') {
      return 'Propostas Aceitas';
    } else if (statusFilter === 'draft') {
      return 'Propostas Em Edição';
    } else if (statusFilter === 'rejected') {
      return 'Propostas Rejeitadas';
    }
    return 'Todas as Propostas';
  };

  const getDescription = () => {
    if (statusFilter === 'sent') {
      return 'Aqui você pode visualizar todas as propostas que foram enviadas aos seus clientes.';
    } else if (statusFilter === 'accepted') {
      return 'Aqui você pode visualizar as propostas que foram aceitas pelos seus clientes.';
    } else if (statusFilter === 'draft') {
      return 'Propostas que ainda não foram enviadas ou geradas em PDF.';
    } else if (statusFilter === 'rejected') {
      return 'Propostas que foram rejeitadas pelos seus clientes.';
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

  const handleEditProposal = (proposalId: string) => {
    navigate(`/proposals/edit/${proposalId}`);
  };

  const handleGeneratePdfClick = (proposal: Proposal) => {
    setSelectedProposalForPreview({
      id: proposal.id,
      proposalNumber: proposal.proposal_number,
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
      .update({ status: 'accepted', accepted_at: new Date().toISOString() })
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
          <h1 className="text-3xl font-bold">{getTitle()}</h1>
          <p className="text-gray-500">{getDescription()}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 justify-end">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Status:</span>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="draft">Em Edição</SelectItem>
              <SelectItem value="sent">Enviadas/Pendentes</SelectItem>
              <SelectItem value="accepted">Aceitas</SelectItem>
              <SelectItem value="rejected">Rejeitadas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Período:</span>
          <DateRangePicker date={dateRange} setDate={setDateRange} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes das Propostas</CardTitle>
          <CardDescription>
            {getDescription()}
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
                  <TableHead>Nº Proposta</TableHead>
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
                    <TableCell className="font-medium">{formatProposalNumber(proposal.proposal_number, proposal.created_at)}</TableCell>
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
                          <DropdownMenuItem onClick={() => handleEditProposal(proposal.id)}>
                            <Edit className="mr-2 h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleGeneratePdfClick(proposal)}>
                            <FileText className="mr-2 h-4 w-4" /> Gerar PDF
                          </DropdownMenuItem>
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
              Nenhuma proposta encontrada com os filtros aplicados.
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
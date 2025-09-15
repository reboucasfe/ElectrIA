"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabaseClient';
import { showError } from '@/utils/toast';
import { getTranslatedErrorMessage } from '@/utils/errorTranslations';
import { formatProposalNumber } from '@/utils/proposalUtils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Revision {
  id: string;
  proposal_id: string;
  revision_number: number;
  user_id: string;
  created_at: string;
  changes: {
    summary: string;
    details: { [key: string]: { old: any; new: any } | string };
  } | null;
}

interface RevisionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  proposalId: string;
  proposalSequentialNumber: number;
  proposalCreatedAt: string;
}

const fieldNameMap: { [key: string]: string } = {
  clientName: 'Nome do Cliente',
  clientEmail: 'Email do Cliente',
  clientPhone: 'Telefone do Cliente',
  proposalTitle: 'Título da Proposta',
  proposalDescription: 'Descrição da Proposta',
  notes: 'Notas Adicionais',
  validityDays: 'Validade (dias)',
  paymentMethods: 'Métodos de Pagamento',
  selectedServices: 'Serviços Incluídos',
};

const RevisionHistoryModal = ({ isOpen, onClose, proposalId, proposalSequentialNumber, proposalCreatedAt }: RevisionHistoryModalProps) => {
  const [revisions, setRevisions] = useState<Revision[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRevisions = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('proposal_revisions')
      .select('*')
      .eq('proposal_id', proposalId)
      .order('revision_number', { ascending: false });

    if (error) {
      showError(getTranslatedErrorMessage(error.message));
      setRevisions([]);
    } else {
      setRevisions(data as Revision[]);
    }
    setLoading(false);
  }, [proposalId]);

  useEffect(() => {
    if (isOpen) {
      fetchRevisions();
    }
  }, [isOpen, fetchRevisions]);

  const renderChangeValue = (value: any) => {
    if (value === null || value === undefined || (Array.isArray(value) && value.length === 0) || value === '') {
      return <span className="text-gray-500 italic">Não definido</span>;
    }
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    if (typeof value === 'string' && value.includes('\n')) {
      return <pre className="whitespace-pre-wrap font-sans text-sm">{value}</pre>;
    }
    return String(value);
  };

  const renderChanges = (changes: Revision['changes']) => {
    if (!changes || !changes.details) {
      return <p className="text-gray-600">Nenhum detalhe de alteração disponível.</p>;
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4 text-xs mb-4 p-2 bg-gray-100 rounded-md">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-200 border border-red-400"></span>
            <span>Versão Anterior</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-green-200 border border-green-500"></span>
            <span>Versão Atualizada</span>
          </div>
        </div>
        {Object.entries(changes.details).map(([key, value]) => (
          <div key={key} className="border-b pb-2">
            <strong className="text-gray-800">{fieldNameMap[key] || key}</strong>
            {typeof value === 'string' ? (
              <p className="text-gray-600 mt-1">{value}</p>
            ) : (
              <div className="grid grid-cols-[auto,1fr] gap-x-2 mt-1 text-sm">
                <div className="text-red-600 font-semibold">De:</div>
                <div className="p-2 rounded-md bg-red-50 border border-red-200">{renderChangeValue(value.old)}</div>
                <div className="text-green-700 font-semibold">Para:</div>
                <div className="p-2 rounded-md bg-green-50 border border-green-200">{renderChangeValue(value.new)}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">Histórico de Revisões</DialogTitle>
          <DialogDescription>
            Revisões para a proposta: <span className="font-semibold">{formatProposalNumber(proposalSequentialNumber, proposalCreatedAt)}</span>
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-4">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : revisions.length === 0 ? (
            <p className="text-center text-gray-500">Nenhuma revisão encontrada para esta proposta.</p>
          ) : (
            <Accordion type="single" collapsible className="w-full">
              {revisions.map((revision) => (
                <AccordionItem key={revision.id} value={revision.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex flex-col items-start text-left">
                      <span className="font-semibold">Revisão {String(revision.revision_number).padStart(2, '0')}</span>
                      <span className="text-sm text-gray-500 font-normal">
                        {format(new Date(revision.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </span>
                      <span className="text-sm text-gray-600 font-normal mt-1">{revision.changes?.summary || 'N/A'}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 bg-gray-50 rounded-b-lg border-t">
                    {renderChanges(revision.changes)}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose}>Fechar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RevisionHistoryModal;
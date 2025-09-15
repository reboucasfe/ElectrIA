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

  const renderChanges = (changes: Revision['changes']) => {
    if (!changes || !changes.details) {
      return <p className="text-gray-600">Nenhum detalhe de alteração disponível.</p>;
    }

    return (
      <ul className="list-disc list-inside space-y-1 text-gray-700">
        {Object.entries(changes.details).map(([key, value]) => (
          <li key={key}>
            <strong className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</strong>{' '}
            {typeof value === 'string' ? (
              value
            ) : (
              <>
                <span className="text-red-500 line-through">{value.old !== undefined ? JSON.stringify(value.old) : 'N/A'}</span>{' '}
                <span className="text-green-600">{value.new !== undefined ? JSON.stringify(value.new) : 'N/A'}</span>
              </>
            )}
          </li>
        ))}
      </ul>
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
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
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
                  <AccordionTrigger>
                    <div className="flex flex-col items-start">
                      <span className="font-semibold">Revisão {String(revision.revision_number).padStart(2, '0')}</span>
                      <span className="text-sm text-gray-500">
                        {format(new Date(revision.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="p-4 bg-gray-50 rounded-b-lg">
                    <p className="mb-2"><strong className="font-medium">Resumo:</strong> {revision.changes?.summary || 'N/A'}</p>
                    <p className="mb-2"><strong className="font-medium">Detalhes das Alterações:</strong></p>
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
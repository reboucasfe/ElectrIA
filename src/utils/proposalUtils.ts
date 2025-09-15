import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatProposalNumber = (sequentialNumber: number | undefined | null, createdAt: string | undefined, revisionNumber: number | undefined | null = 0): string => {
  if (sequentialNumber === undefined || sequentialNumber === null) {
    return 'N/A';
  }

  const date = createdAt ? new Date(createdAt) : new Date();
  const month = format(date, 'MM', { locale: ptBR });
  const year = format(date, 'yyyy', { locale: ptBR });
  const paddedSequence = String(sequentialNumber).padStart(3, '0');
  const paddedRevision = String(revisionNumber || 0).padStart(2, '0'); // Format revision as 00, 01, etc.

  return `PC-${month}-${year}-Nº${paddedSequence}-Rev.${paddedRevision}`;
};
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatProposalNumber = (sequentialNumber: number | undefined | null, createdAt: string | undefined): string => {
  if (sequentialNumber === undefined || sequentialNumber === null) {
    return 'N/A';
  }

  const date = createdAt ? new Date(createdAt) : new Date();
  const month = format(date, 'MM', { locale: ptBR });
  const year = format(date, 'yyyy', { locale: ptBR });
  const paddedSequence = String(sequentialNumber).padStart(3, '0');

  return `PC-${month}-${year}-Nº${paddedSequence}`;
};
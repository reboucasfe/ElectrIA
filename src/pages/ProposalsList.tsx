"use client";

import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Proposal {
  id: string;
  clientName: string;
  status: 'sent' | 'accepted' | 'pending' | 'rejected';
  value: number;
  dateSent: string;
  dateAccepted?: string;
}

const dummyProposals: Proposal[] = [
  {
    id: 'prop-001',
    clientName: 'Maria Silva',
    status: 'sent',
    value: 1250.00,
    dateSent: '2023-10-26',
  },
  {
    id: 'prop-002',
    clientName: 'João Santos',
    status: 'accepted',
    value: 3500.00,
    dateSent: '2023-10-20',
    dateAccepted: '2023-10-22',
  },
  {
    id: 'prop-003',
    clientName: 'Ana Costa',
    status: 'sent',
    value: 800.00,
    dateSent: '2023-10-25',
  },
  {
    id: 'prop-004',
    clientName: 'Pedro Almeida',
    status: 'pending',
    value: 2100.00,
    dateSent: '2023-10-28',
  },
  {
    id: 'prop-005',
    clientName: 'Carla Oliveira',
    status: 'accepted',
    value: 500.00,
    dateSent: '2023-10-15',
    dateAccepted: '2023-10-16',
  },
  {
    id: 'prop-006',
    clientName: 'Lucas Pereira',
    status: 'rejected',
    value: 1800.00,
    dateSent: '2023-10-23',
  },
];

const ProposalsList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const proposalStatus = new URLSearchParams(location.search).get('status');

  const filteredProposals = useMemo(() => {
    if (proposalStatus === 'sent') {
      return dummyProposals.filter(p => p.status === 'sent' || p.status === 'pending');
    } else if (proposalStatus === 'accepted') {
      return dummyProposals.filter(p => p.status === 'accepted');
    }
    return dummyProposals; // Retorna todas se nenhum filtro específico
  }, [proposalStatus]);

  const getTitle = () => {
    if (proposalStatus === 'sent') {
      return 'Propostas Enviadas';
    } else if (proposalStatus === 'accepted') {
      return 'Propostas Aceitas';
    }
    return 'Lista de Propostas';
  };

  const getDescription = () => {
    if (proposalStatus === 'sent') {
      return 'Aqui você pode visualizar todas as propostas que foram enviadas aos seus clientes.';
    } else if (proposalStatus === 'accepted') {
      return 'Aqui você pode visualizar as propostas que foram aceitas pelos seus clientes.';
    }
    return 'Visualize suas propostas.';
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/dashboard')}>
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
            {proposalStatus === 'sent' ? 'Todas as propostas que você enviou ou estão pendentes.' : 'Todas as propostas que foram aceitas.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredProposals.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Data Envio</TableHead>
                  {proposalStatus === 'accepted' && <TableHead>Data Aceite</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProposals.map((proposal) => (
                  <TableRow key={proposal.id}>
                    <TableCell className="font-medium">{proposal.id}</TableCell>
                    <TableCell>{proposal.clientName}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        proposal.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        proposal.status === 'sent' || proposal.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {proposal.status === 'sent' ? 'Enviada' :
                         proposal.status === 'accepted' ? 'Aceita' :
                         proposal.status === 'pending' ? 'Pendente' :
                         'Rejeitada'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(proposal.value)}</TableCell>
                    <TableCell>{proposal.dateSent}</TableCell>
                    {proposalStatus === 'accepted' && <TableCell>{proposal.dateAccepted}</TableCell>}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-gray-500 py-8">
              Nenhuma proposta {proposalStatus === 'sent' ? 'enviada ou pendente' : 'aceita'} encontrada.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProposalsList;
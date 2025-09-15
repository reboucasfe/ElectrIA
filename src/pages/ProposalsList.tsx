"use client";

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const ProposalsList = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const proposalType = new URLSearchParams(location.search).get('type');

  const getTitle = () => {
    if (proposalType === 'sent') {
      return 'Propostas Enviadas';
    } else if (proposalType === 'accepted') {
      return 'Propostas Aceitas';
    }
    return 'Lista de Propostas';
  };

  const getDescription = () => {
    if (proposalType === 'sent') {
      return 'Aqui você pode visualizar todas as propostas que foram enviadas aos seus clientes.';
    } else if (proposalType === 'accepted') {
      return 'Aqui você pode visualizar as propostas que foram aceitas pelos seus clientes.';
    }
    return 'Visualize suas propostas.';
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
            {proposalType === 'sent' ? 'Todas as propostas que você enviou.' : 'Todas as propostas que foram aceitas.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-8">
            A lista de propostas {proposalType === 'sent' ? 'enviadas' : 'aceitas'} aparecerá aqui em breve.
            <br />
            (Funcionalidade de listagem de dados será implementada em breve.)
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProposalsList;
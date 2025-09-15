"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const ProposalsClosed = () => {
  const navigate = useNavigate();

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
            (A lista de propostas fechadas será exibida aqui.)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-8">
            Nenhuma proposta fechada no momento.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProposalsClosed;
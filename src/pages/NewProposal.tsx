"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const NewProposal = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/proposals-overview')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Nova Proposta</h1>
          <p className="text-gray-500">Preencha os detalhes para criar uma nova proposta.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Formulário de Nova Proposta</CardTitle>
          <CardDescription>
            (O formulário para criar uma nova proposta será implementado aqui.)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-8">
            Em breve, você poderá usar a IA para gerar propostas rapidamente!
          </p>
          <Button onClick={() => alert('Funcionalidade em desenvolvimento!')}>Gerar Proposta com IA</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewProposal;
"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import ProposalForm from '@/components/proposals/ProposalForm'; // Importa o novo componente

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

      <ProposalForm /> {/* Renderiza o formulário aqui */}
    </div>
  );
};

export default NewProposal;
"use client";

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import ProposalForm from '@/components/proposals/ProposalForm';
import { supabase } from '@/lib/supabaseClient';
import { showError } from '@/utils/toast';
import { Skeleton } from '@/components/ui/skeleton';

const ProposalFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // Obtém o ID da URL
  const [initialProposalData, setInitialProposalData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProposal = async () => {
      if (id) {
        setLoading(true);
        const { data, error } = await supabase
          .from('proposals')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          showError(`Erro ao carregar proposta: ${error.message}`);
          navigate('/proposals'); // Redireciona se a proposta não for encontrada
        } else {
          setInitialProposalData(data);
        }
        setLoading(false);
      } else {
        setInitialProposalData(null); // Para novas propostas
        setLoading(false);
      }
    };

    fetchProposal();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" disabled>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-5 w-96 mt-2" />
          </div>
        </div>
        <Skeleton className="h-[300px] w-full" />
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-[150px] w-full" />
        <Skeleton className="h-[100px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/proposals')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{id ? 'Editar Proposta' : 'Nova Proposta'}</h1>
          <p className="text-gray-500">{id ? 'Atualize os detalhes da proposta existente.' : 'Preencha os detalhes para criar uma nova proposta.'}</p>
        </div>
      </div>

      <ProposalForm initialData={initialProposalData} proposalId={id} />
    </div>
  );
};

export default ProposalFormPage;
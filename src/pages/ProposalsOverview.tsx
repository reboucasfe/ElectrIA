"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, ListChecks, Clock, CheckCircle } from 'lucide-react';

const ProposalsOverview = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Gestão de Propostas</h1>
      <p className="text-gray-500">Gerencie todas as suas propostas: crie novas, acompanhe as em andamento e revise as fechadas.</p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="flex flex-col items-center text-center p-6 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate('/proposals/new')}>
          <CardHeader className="p-0 mb-4">
            <PlusCircle className="h-12 w-12 text-blue-600 mx-auto" />
            <CardTitle className="mt-4 text-xl">Nova Proposta</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-grow">
            <CardDescription>Crie uma nova proposta comercial para um cliente.</CardDescription>
          </CardContent>
          <Button className="mt-6 bg-blue-600 hover:bg-blue-700">Criar Agora</Button>
        </Card>

        <Card className="flex flex-col items-center text-center p-6 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate('/proposals/in-progress')}>
          <CardHeader className="p-0 mb-4">
            <Clock className="h-12 w-12 text-yellow-600 mx-auto" />
            <CardTitle className="mt-4 text-xl">Propostas em Andamento</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-grow">
            <CardDescription>Visualize e gerencie propostas que ainda não foram finalizadas.</CardDescription>
          </CardContent>
          <Button variant="outline" className="mt-6">Ver Andamento</Button>
        </Card>

        <Card className="flex flex-col items-center text-center p-6 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate('/proposals/closed')}>
          <CardHeader className="p-0 mb-4">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
            <CardTitle className="mt-4 text-xl">Propostas Fechadas</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-grow">
            <CardDescription>Acompanhe as propostas que foram aceitas ou recusadas.</CardDescription>
          </CardContent>
          <Button variant="outline" className="mt-6">Ver Fechadas</Button>
        </Card>
      </div>
    </div>
  );
};

export default ProposalsOverview;
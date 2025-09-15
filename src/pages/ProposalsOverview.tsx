"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, LayoutDashboard, ListChecks } from 'lucide-react';

const ProposalsOverview = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Propostas</h1>
          <p className="text-gray-500">Gerencie todas as suas propostas: crie novas, acompanhe o fluxo e revise as finalizadas.</p>
        </div>
        <Button onClick={() => navigate('/proposals/new')} className="bg-blue-600 hover:bg-blue-700">
          <PlusCircle className="mr-2 h-4 w-4" /> Nova Proposta
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="flex flex-col items-center text-center p-6 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate('/proposals/kanban')}>
          <CardHeader className="p-0 mb-4">
            <LayoutDashboard className="h-12 w-12 text-blue-600 mx-auto" />
            <CardTitle className="mt-4 text-xl">Visualização Kanban</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-grow">
            <CardDescription>Visualize e gerencie o fluxo das suas propostas em um quadro interativo.</CardDescription>
          </CardContent>
          <Button className="mt-6 bg-blue-600 hover:bg-blue-700">Ver Kanban</Button>
        </Card>

        <Card className="flex flex-col items-center text-center p-6 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate('/proposals')}> {/* Removido o filtro ?status=sent */}
          <CardHeader className="p-0 mb-4">
            <ListChecks className="h-12 w-12 text-yellow-600 mx-auto" />
            <CardTitle className="mt-4 text-xl">Lista de Propostas</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-grow">
            <CardDescription>Acompanhe todas as suas propostas em uma lista detalhada.</CardDescription>
          </CardContent>
          <Button variant="outline" className="mt-6">Ver Lista</Button>
        </Card>
      </div>
    </div>
  );
};

export default ProposalsOverview;
"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';

interface Proposal {
  id: string;
  status: 'draft' | 'sent' | 'accepted' | 'pending' | 'rejected';
  selected_services: Array<{ calculated_total: number }>;
  created_at: string;
  sent_at?: string;
  accepted_at?: string;
}

interface DashboardChartsProps {
  proposals: Proposal[];
  loading: boolean;
}

const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

const DashboardCharts = ({ proposals, loading }: DashboardChartsProps) => {

  // Funil de Conversão
  const funnelData = React.useMemo(() => {
    const draftCount = proposals.filter(p => p.status === 'draft').length;
    const sentCount = proposals.filter(p => p.status === 'sent' || p.status === 'pending').length;
    const acceptedCount = proposals.filter(p => p.status === 'accepted').length;

    return [
      { name: 'Em Edição', value: draftCount, fill: '#60A5FA' }, // blue-400
      { name: 'Enviadas/Pendentes', value: sentCount, fill: '#3B82F6' }, // blue-500
      { name: 'Aceitas', value: acceptedCount, fill: '#2563EB' }, // blue-600
    ];
  }, [proposals]);

  // Gráfico de Linha Temporal
  const timeSeriesData = React.useMemo(() => {
    const monthlyData: { [key: string]: { sent: number; accepted: number } } = {};

    proposals.forEach(p => {
      const monthYear = format(parseISO(p.created_at), 'MMM/yyyy', { locale: ptBR });
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { sent: 0, accepted: 0 };
      }
      if (p.status === 'sent' || p.status === 'pending') {
        monthlyData[monthYear].sent += 1;
      } else if (p.status === 'accepted') {
        monthlyData[monthYear].accepted += 1;
      }
    });

    // Ordenar por data
    return Object.keys(monthlyData)
      .sort((a, b) => {
        const [monthA, yearA] = a.split('/');
        const [monthB, yearB] = b.split('/');
        const dateA = new Date(parseInt(yearA), ptBR.localize.month(monthA, { width: 'abbreviated' }));
        const dateB = new Date(parseInt(yearB), ptBR.localize.month(monthB, { width: 'abbreviated' }));
        return dateA.getTime() - dateB.getTime();
      })
      .map(key => ({
        name: key,
        'Propostas Enviadas': monthlyData[key].sent,
        'Propostas Aceitas': monthlyData[key].accepted,
      }));
  }, [proposals]);

  // Breakdown por Status (Pie Chart)
  const statusBreakdownData = React.useMemo(() => {
    const statusCounts: { [key: string]: number } = {};
    proposals.forEach(p => {
      const statusKey = p.status === 'draft' ? 'Em Edição' :
                         p.status === 'sent' || p.status === 'pending' ? 'Enviadas/Pendentes' :
                         p.status === 'accepted' ? 'Aceitas' :
                         p.status === 'rejected' ? 'Rejeitadas' :
                         'Outros';
      statusCounts[statusKey] = (statusCounts[statusKey] || 0) + 1;
    });

    const COLORS = ['#60A5FA', '#3B82F6', '#10B981', '#EF4444', '#6B7280']; // blue-400, blue-500, green, red, gray

    return Object.keys(statusCounts).map((status, index) => ({
      name: status,
      value: statusCounts[status],
      color: COLORS[index % COLORS.length],
    }));
  }, [proposals]);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-[300px] w-full" />
        <Skeleton className="h-[300px] w-full" />
        <Skeleton className="h-[300px] w-full" />
        <Skeleton className="h-[350px] w-full md:col-span-2" />
        <Skeleton className="h-[350px] w-full" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Funil de Conversão */}
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Funil de Conversão</CardTitle>
          <CardDescription>Jornada das propostas: em edição, enviadas/pendentes e aceitas.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={100} />
              <Tooltip formatter={(value: number) => value.toLocaleString('pt-BR')} />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Breakdown por Status */}
      <Card className="md:col-span-1">
        <CardHeader>
          <CardTitle>Propostas por Status</CardTitle>
          <CardDescription>Distribuição das propostas por seu status atual.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={statusBreakdownData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {statusBreakdownData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => value.toLocaleString('pt-BR')} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Linha Temporal */}
      <Card className="md:col-span-3 lg:col-span-3">
        <CardHeader>
          <CardTitle>Evolução Mensal das Propostas</CardTitle>
          <CardDescription>Propostas enviadas e aceitas ao longo do tempo.</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeriesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Propostas Enviadas" stroke="#2563EB" activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="Propostas Aceitas" stroke="#10B981" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardCharts;
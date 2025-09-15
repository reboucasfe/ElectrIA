import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, ClipboardList, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { showError } from '@/utils/toast';
import { getTranslatedErrorMessage } from '@/utils/errorTranslations';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [sentCount, setSentCount] = useState<number | null>(null);
  const [acceptedCount, setAcceptedCount] = useState<number | null>(null);
  const [kpiLoading, setKpiLoading] = useState(true);

  const fetchKpiData = useCallback(async () => {
    if (!user?.id) {
      setKpiLoading(false);
      return;
    }
    setKpiLoading(true);

    // Fetch Sent/Pending Proposals Count
    const { count: sentPendingCount, error: sentError } = await supabase
      .from('proposals')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id)
      .in('status', ['sent', 'pending']);

    if (sentError) {
      showError(getTranslatedErrorMessage(sentError.message));
      setSentCount(0);
    } else {
      setSentCount(sentPendingCount);
    }

    // Fetch Accepted Proposals Count
    const { count: acceptedProposalsCount, error: acceptedError } = await supabase
      .from('proposals')
      .select('id', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('status', 'accepted');

    if (acceptedError) {
      showError(getTranslatedErrorMessage(acceptedError.message));
      setAcceptedCount(0);
    } else {
      setAcceptedCount(acceptedProposalsCount);
    }

    setKpiLoading(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchKpiData();
    }
  }, [authLoading, user, fetchKpiData]);

  const kpiData = [
    {
      title: "Propostas Enviadas",
      value: kpiLoading ? <Skeleton className="h-6 w-12" /> : (sentCount !== null ? sentCount.toString() : '0'),
      icon: ClipboardList,
      description: "Propostas enviadas ou pendentes",
      action: () => navigate('/proposals?status=sent'),
    },
    {
      title: "Propostas Aceitas",
      value: kpiLoading ? <Skeleton className="h-6 w-12" /> : (acceptedCount !== null ? acceptedCount.toString() : '0'),
      icon: CheckCircle,
      description: "Propostas aceitas pelos clientes",
      action: () => navigate('/proposals?status=accepted'),
    },
    {
      title: "Taxa de Conversão",
      value: kpiLoading ? <Skeleton className="h-6 w-12" /> : (sentCount && acceptedCount && sentCount > 0 ? `${((acceptedCount / sentCount) * 100).toFixed(1)}%` : "N/A"),
      icon: Users,
      description: "Dados em breve",
      action: null,
    },
    {
      title: "Valor Total Fechado",
      value: kpiLoading ? <Skeleton className="h-6 w-20" /> : "R$ 0,00", // Este KPI exigiria agregação de valores, mantido como placeholder
      icon: DollarSign,
      description: "Dados em breve",
      action: null,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500">Bem-vindo de volta, {user?.email}!</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((kpi) => (
          <Card
            key={kpi.title}
            className={`flex flex-col ${kpi.action ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}`}
            onClick={kpi.action || undefined}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <p className="text-xs text-muted-foreground">{kpi.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
          <CardDescription>Um resumo das suas propostas mais recentes.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-8">Gráficos e tabelas de atividade aparecerão aqui em breve.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
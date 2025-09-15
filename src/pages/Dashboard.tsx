import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, ClipboardList, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { showError } from '@/utils/toast';
import { getTranslatedErrorMessage } from '@/utils/errorTranslations';
import { Skeleton } from '@/components/ui/skeleton';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { addDays, subDays, isWithinInterval, parseISO, differenceInDays } from 'date-fns';
import DashboardCharts from '@/components/dashboard/DashboardCharts'; // Importar o novo componente de gráficos

interface Proposal {
  id: string;
  proposal_number?: number;
  client_name: string;
  status: 'draft' | 'sent' | 'accepted' | 'pending' | 'rejected';
  selected_services: Array<{ calculated_total: number }>;
  created_at: string;
  pdf_generated_at?: string;
  proposal_title: string;
  proposal_description?: string;
  client_email?: string;
  client_phone?: string;
  notes?: string;
  payment_methods: string[];
  validity_days: number;
  sent_at?: string;
  accepted_at?: string;
}

const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [allProposals, setAllProposals] = useState<Proposal[]>([]);
  const [loadingProposals, setLoadingProposals] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  const fetchAllProposals = useCallback(async () => {
    if (!user?.id) {
      setLoadingProposals(false);
      return;
    }
    setLoadingProposals(true);

    const { data, error } = await supabase
      .from('proposals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      showError(getTranslatedErrorMessage(error.message));
      setAllProposals([]);
    } else {
      setAllProposals(data as Proposal[]);
    }
    setLoadingProposals(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading && user) {
      fetchAllProposals();
    }
  }, [authLoading, user, fetchAllProposals]);

  const filteredProposals = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) {
      return allProposals;
    }
    return allProposals.filter(proposal => {
      const createdAt = parseISO(proposal.created_at);
      return isWithinInterval(createdAt, { start: dateRange.from!, end: addDays(dateRange.to!, 1) }); // Add 1 day to 'to' to include the whole day
    });
  }, [allProposals, dateRange]);

  const kpiData = useMemo(() => {
    const sentProposals = filteredProposals.filter(p => p.status === 'sent' || p.status === 'pending');
    const acceptedProposals = filteredProposals.filter(p => p.status === 'accepted');

    const totalSentCount = sentProposals.length;
    const totalAcceptedCount = acceptedProposals.length;

    const totalSentValue = sentProposals.reduce((sum, p) => sum + p.selected_services.reduce((s, svc) => s + svc.calculated_total, 0), 0);
    const totalAcceptedValue = acceptedProposals.reduce((sum, p) => sum + p.selected_services.reduce((s, svc) => s + svc.calculated_total, 0), 0);

    const conversionRate = totalSentCount > 0 ? ((totalAcceptedCount / totalSentCount) * 100).toFixed(1) : "0.0";
    const averageProposalValue = totalSentCount > 0 ? totalSentValue / totalSentCount : 0;

    let totalResponseTime = 0;
    let responseTimeCount = 0;
    acceptedProposals.forEach(p => {
      if (p.sent_at && p.accepted_at) {
        const sentDate = parseISO(p.sent_at);
        const acceptedDate = parseISO(p.accepted_at);
        const diffDays = differenceInDays(acceptedDate, sentDate);
        if (diffDays >= 0) { // Only count if accepted after or on sent date
          totalResponseTime += diffDays;
          responseTimeCount++;
        }
      }
    });
    const averageResponseTime = responseTimeCount > 0 ? (totalResponseTime / responseTimeCount).toFixed(1) : "N/A";


    return [
      {
        title: "Propostas Enviadas",
        value: totalSentCount.toString(),
        icon: ClipboardList,
        description: formatCurrency(totalSentValue),
        action: () => navigate('/proposals?status=sent'),
      },
      {
        title: "Propostas Aceitas",
        value: totalAcceptedCount.toString(),
        icon: CheckCircle,
        description: formatCurrency(totalAcceptedValue),
        action: () => navigate('/proposals?status=accepted'),
      },
      {
        title: "Taxa de Conversão",
        value: `${conversionRate}%`,
        icon: Users,
        description: "Propostas aceitas / Propostas enviadas",
        color: parseFloat(conversionRate) >= 50 ? 'text-green-600' : parseFloat(conversionRate) >= 20 ? 'text-yellow-600' : 'text-red-600',
        action: null,
      },
      {
        title: "Valor Médio da Proposta",
        value: formatCurrency(averageProposalValue),
        icon: DollarSign,
        description: "Valor total / Qtd. propostas enviadas",
        action: null,
      },
      {
        title: "Tempo Médio de Resposta",
        value: averageResponseTime !== "N/A" ? `${averageResponseTime} dias` : "N/A",
        icon: Clock,
        description: "Do envio à aceitação",
        action: null,
      },
    ];
  }, [filteredProposals, navigate]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500">Bem-vindo de volta, {user?.email}!</p>
      </div>

      {/* Filtro de Período */}
      <div className="flex justify-end">
        <DateRangePicker date={dateRange} setDate={setDateRange} />
      </div>

      {/* KPIs Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {kpiData.map((kpi, index) => (
          <Card
            key={index}
            className={`flex flex-col ${kpi.action ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}`}
            onClick={kpi.action || undefined}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingProposals ? (
                <Skeleton className="h-6 w-24" />
              ) : (
                <div className={`text-2xl font-bold ${kpi.color || ''}`}>{kpi.value}</div>
              )}
              <p className="text-xs text-muted-foreground">{kpi.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráficos */}
      <DashboardCharts proposals={filteredProposals} loading={loadingProposals} />
    </div>
  );
};

export default Dashboard;
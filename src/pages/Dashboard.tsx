import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, ClipboardList, CheckCircle } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();

  const kpiData = [
    {
      title: "Propostas Enviadas",
      value: "75",
      icon: ClipboardList,
      description: "+15% vs. mês passado",
    },
    {
      title: "Propostas Aceitas",
      value: "52",
      icon: CheckCircle,
      description: "+21% vs. mês passado",
    },
    {
      title: "Taxa de Conversão",
      value: "69.3%",
      icon: Users,
      description: "+5.2% vs. mês passado",
    },
    {
      title: "Valor Total Fechado",
      value: "R$ 12.450,00",
      icon: DollarSign,
      description: "+30% vs. mês passado",
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
          <Card key={kpi.title}>
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
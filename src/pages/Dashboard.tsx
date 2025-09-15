import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, ClipboardList, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const kpiData = [
    {
      title: "Propostas Enviadas",
      value: "0", // Alterado para 0
      icon: ClipboardList,
      description: "Dados em breve", // Descrição ajustada
      action: () => navigate('/proposals-overview?status=sent'), // Ação para navegar
    },
    {
      title: "Propostas Aceitas",
      value: "0", // Alterado para 0
      icon: CheckCircle,
      description: "Dados em breve", // Descrição ajustada
      action: () => navigate('/proposals-overview?status=accepted'), // Ação para navegar
    },
    {
      title: "Taxa de Conversão",
      value: "N/A", // Alterado para N/A
      icon: Users,
      description: "Dados em breve", // Descrição ajustada
      action: null,
    },
    {
      title: "Valor Total Fechado",
      value: "R$ 0,00", // Alterado para R$ 0,00
      icon: DollarSign,
      description: "Dados em breve", // Descrição ajustada
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
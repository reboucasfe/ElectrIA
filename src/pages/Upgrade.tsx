import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Zap, Check, HelpCircle } from "lucide-react";

const Upgrade = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [currentUserPlan, setCurrentUserPlan] = useState<'essencial' | 'professional' | 'premium'>('essencial'); // Simulação do plano atual do usuário
  const { user } = useAuth();
  const navigate = useNavigate();

  const prices = {
    annual: {
      essencial: 127,
      professional: 147,
      premium: 347,
    },
    monthly: {
      essencial: Math.round(127 * 1.25), // 25% acima do anual
      professional: Math.round(147 * 1.25), // 25% acima do anual
      premium: Math.round(347 * 1.25), // 25% acima do anual
    }
  };

  const planDetails = {
    essencial: {
      title: "Essencial",
      description: "Ideal para autônomos",
      features: [
        { text: "20 propostas/mês", tooltip: "Você pode gerar e enviar até 20 propostas comerciais para seus clientes todos os meses." },
        { text: "Integração WhatsApp", tooltip: "Conecte seu número de WhatsApp para enviar as propostas diretamente aos seus clientes." },
        { text: "Suporte via email", tooltip: "Receba ajuda e tire suas dúvidas com nossa equipe de suporte através de email." },
      ],
    },
    professional: {
      title: "Profissional",
      description: "Para quem busca crescer",
      features: [
        { text: "50 propostas/mês", tooltip: "Aumente seu volume de negócios com a capacidade de gerar e enviar até 50 propostas mensais." },
        { text: "Dashboard de Vendas", tooltip: "Acompanhe o status de todas as suas propostas (enviadas, visualizadas, aceitas) em um painel visual." },
        { text: "Relatórios Avançados", tooltip: "Obtenha insights sobre suas vendas e taxas de conversão com relatórios detalhados." },
      ],
    },
    premium: {
      title: "Premium",
      description: "Para equipes e empresas",
      features: [
        { text: "Propostas Ilimitadas", tooltip: "Sem limites! Crie e envie quantas propostas forem necessárias para escalar seu negócio." },
        { text: "Múltiplos Usuários", tooltip: "Permita que vários membros da sua equipe acessem a plataforma e gerenciem propostas." },
        { text: "Integração API", tooltip: "Conecte a EletroProposta IA com outras ferramentas que você já usa através da nossa API." },
      ],
    },
  };

  const getPlanOrder = (plan: string) => {
    const order = ['essencial', 'professional', 'premium'];
    return order.indexOf(plan);
  };

  const handlePlanActionClick = (planId: string) => {
    navigate('/payment', { state: { planId, billingCycle } });
  };

  return (
    <TooltipProvider>
      <div className="space-y-8 flex flex-col items-center text-center p-4">
        <div className="max-w-2xl">
          <Zap className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl md:text-4xl font-bold">Escolha o Plano Ideal para Seu Negócio</h1>
          <p className="text-gray-500 mt-2">
            Gerencie sua assinatura, renove seu plano atual ou faça upgrade para mais recursos.
          </p>
        </div>

        <div className="flex justify-center items-center gap-2 mb-12 bg-gray-100 p-1 rounded-full w-fit mx-auto">
          <Button
            onClick={() => setBillingCycle('monthly')}
            variant={billingCycle === 'monthly' ? 'default' : 'ghost'}
            className="rounded-full px-6"
          >
            Mensal
          </Button>
          <Button
            onClick={() => setBillingCycle('annual')}
            variant={billingCycle === 'annual' ? 'default' : 'ghost'}
            className="rounded-full px-6"
          >
            Anual <Badge className="ml-2 bg-green-500 text-white hover:bg-green-600">Economize 25%</Badge>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
          {Object.entries(planDetails).map(([planId, plan]) => {
            const displayPrice = prices[billingCycle][planId as keyof typeof prices.annual];
            const isCurrentPlan = planId === currentUserPlan;
            const isUpgrade = getPlanOrder(planId) > getPlanOrder(currentUserPlan);

            let buttonText = 'Selecionar Plano';
            if (isCurrentPlan) {
              buttonText = 'Renovar Assinatura';
            } else if (isUpgrade) {
              buttonText = 'Fazer Upgrade';
            } else {
              // Downgrade scenario, not explicitly requested, so we'll just disable for now
              buttonText = 'Plano Atual';
            }

            return (
              <Card key={planId} className={`p-8 flex flex-col shadow-lg ${isCurrentPlan ? 'border-2 border-blue-600 relative' : ''}`}>
                {isCurrentPlan && (
                  <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">SEU PLANO ATUAL</div>
                )}
                <CardHeader className="p-0 mb-6">
                  <CardTitle>{plan.title}</CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex-grow">
                  <p className="text-4xl font-bold mb-2">R$ {displayPrice}<span className="text-lg font-normal text-gray-500">/mês</span></p>
                  {billingCycle === 'annual' && <p className="text-sm text-gray-500 mb-2">Cobrado R$ {prices.annual[planId as keyof typeof prices.annual] * 12} anualmente</p>}
                  <p className="text-gray-500 mb-6">{plan.description}</p>
                  <ul className="space-y-3 text-gray-600 text-left">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center justify-between">
                        <span className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" /> {feature.text}</span>
                        <Tooltip>
                          <TooltipTrigger><HelpCircle className="h-4 w-4 text-gray-400" /></TooltipTrigger>
                          <TooltipContent><p>{feature.tooltip}</p></TooltipContent>
                        </Tooltip>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <Button
                  className={`mt-8 w-full ${isCurrentPlan || isUpgrade ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
                  onClick={() => handlePlanActionClick(planId)}
                  disabled={!isCurrentPlan && !isUpgrade} // Disable if it's a downgrade scenario
                >
                  {buttonText}
                </Button>
              </Card>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Upgrade;
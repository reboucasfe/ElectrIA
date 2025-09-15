import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom"; // Link adicionado aqui
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Zap, Bot, MessageSquare, BarChart3, ClipboardList, Users, Star, ShieldCheck, ArrowRight, Check, HelpCircle, RefreshCw, Smartphone, Clock, DollarSign, FileText } from "lucide-react";
import { Header } from "@/components/Header";

interface IndexProps {
  onOpenRegisterModal: (planId?: string, billingCycle?: 'monthly' | 'annual') => void;
  onOpenLoginModal: () => void;
}

const Index = ({ onOpenRegisterModal, onOpenLoginModal }: IndexProps) => {
  const [billingCycle, setBillingCycle] = useState<'annual' | 'monthly'>('annual');
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isPaid = useMemo(() => user?.user_metadata?.payment_status === 'paid', [user]);

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.substring(1);
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    }
  }, [location]);

  const prices = {
    monthly: {
      basico: 97,
      profissional: 197,
      enterprise: 347,
    },
    annual: {
      basico: 873, // 97 * 12 * 0.75
      profissional: 1773, // 197 * 12 * 0.75
      enterprise: 3123, // 347 * 12 * 0.75
    }
  };

  const handlePlanButtonClick = (planId: string) => {
    if (isPaid) {
      navigate('/upgrade');
    } else if (user && !isPaid) {
      navigate('/payment', { state: { planId, billingCycle } });
    } else {
      onOpenRegisterModal(planId, billingCycle);
    }
  };

  const handleHeroCTA1Click = () => {
    if (isPaid) {
      navigate('/dashboard');
    } else if (user && !isPaid) {
      navigate('/payment');
    } else {
      onOpenRegisterModal();
    }
  };

  const handleHeroCTA2Click = () => {
    // Placeholder for "Ver Demonstração" - could navigate to a demo video or section
    alert('Funcionalidade de demonstração em breve!');
  };

  const handleFinalCTAClick = () => {
    if (isPaid) {
      navigate('/upgrade');
    } else if (user && !isPaid) {
      navigate('/payment');
    } else {
      onOpenRegisterModal();
    }
  };

  const getButtonText = (planId: string) => {
    if (isPaid) return 'Fazer Upgrade';
    if (user && !isPaid) return "Finalizar Assinatura";
    return "Testar Grátis por 7 Dias";
  };

  return (
    <TooltipProvider>
    <div className="bg-white text-gray-800">
      <Header onOpenRegisterModal={onOpenRegisterModal} onOpenLoginModal={onOpenLoginModal} />

      <main>
        {/* Hero Section */}
        <section className="relative text-center md:text-left py-20 px-4 md:py-32">
          <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
                Automatize Suas Propostas no WhatsApp e Feche Mais Vendas
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-10">
                IA especializada que cria propostas profissionais para eletricistas em segundos. Integração direta com WhatsApp.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-6 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 w-full sm:w-auto"
                  onClick={handleHeroCTA1Click}
                >
                  Testar Grátis por 7 Dias <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 w-full sm:w-auto"
                  onClick={handleHeroCTA2Click}
                >
                  Ver Demonstração
                </Button>
              </div>
            </div>
            <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center">
              <p className="text-gray-400">Mockup de conversa no WhatsApp mostrando uma proposta sendo enviada</p>
            </div>
          </div>
        </section>

        {/* Seção de Problemas (Pain Points) */}
        <section className="py-20 px-4 bg-gray-100">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
              Cansado de Perder Clientes por Propostas Demoradas?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <Card className="p-6 text-left shadow-sm">
                <CardContent className="p-0">
                  <h3 className="text-xl font-semibold mb-2">Demora para criar propostas detalhadas</h3>
                  <p className="text-gray-600">Gaste menos tempo com burocracia e mais tempo com o que realmente importa.</p>
                </CardContent>
              </Card>
              <Card className="p-6 text-left shadow-sm">
                <CardContent className="p-0">
                  <h3 className="text-xl font-semibold mb-2">Perda de clientes por falta de agilidade</h3>
                  <p className="text-gray-600">Responda rapidamente e feche negócios antes da concorrência.</p>
                </CardContent>
              </Card>
              <Card className="p-6 text-left shadow-sm">
                <CardContent className="p-0">
                  <h3 className="text-xl font-semibold mb-2">Propostas mal formatadas e não profissionais</h3>
                  <p className="text-gray-600">Impressione com documentos claros, organizados e com sua marca.</p>
                </CardContent>
              </Card>
              <Card className="p-6 text-left shadow-sm">
                <CardContent className="p-0">
                  <h3 className="text-xl font-semibold mb-2">Tempo perdido calculando materiais e mão de obra</h3>
                  <p className="text-gray-600">Deixe a IA fazer os cálculos complexos em segundos.</p>
                </CardContent>
              </Card>
              <Card className="p-6 text-left shadow-sm">
                <CardContent className="p-0">
                  <h3 className="text-xl font-semibold mb-2">Dificuldade para acompanhar orçamentos enviados</h3>
                  <p className="text-gray-600">Tenha uma visão clara de todas as suas propostas em um só lugar.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Solução - Como Funciona */}
        <section id="como-funciona" className="py-20 px-4 bg-white">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Como Nossa IA Revoluciona Seu Atendimento
            </h2>
            <p className="text-lg text-gray-600 mb-16 max-w-2xl mx-auto">Nossa IA transforma solicitações em propostas fechadas em minutos, otimizando seu tempo e aumentando suas vendas.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-6">
                <div className="bg-blue-100 text-blue-600 rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold mb-6 shadow-sm">1</div>
                <h3 className="text-xl font-semibold mb-3">Recebe a Solicitação</h3>
                <p className="text-gray-600">O cliente descreve o problema ou serviço necessário diretamente no seu WhatsApp.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6">
                <div className="bg-blue-100 text-blue-600 rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold mb-6 shadow-sm">2</div>
                <h3 className="text-xl font-semibold mb-3">IA Processa e Calcula</h3>
                <p className="text-gray-600">A IA analisa o serviço, calcula custos de material e mão de obra com base no seu catálogo.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6">
                <div className="bg-blue-100 text-blue-600 rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold mb-6 shadow-sm">3</div>
                <h3 className="text-xl font-semibold mb-3">Proposta Profissional</h3>
                <p className="text-gray-600">Uma proposta completa e profissional é gerada e enviada para o cliente em segundos.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Funcionalidades Principais */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-16">
              Tudo que Você Precisa em Uma Ferramenta
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              <div className="text-left"><Bot className="h-8 w-8 text-blue-600 mb-4" /><h3 className="text-xl font-semibold mb-2">IA treinada especificamente para serviços elétricos</h3><p className="text-gray-600">Nossa inteligência artificial entende a linguagem do seu negócio.</p></div>
              <div className="text-left"><MessageSquare className="h-8 w-8 text-blue-600 mb-4" /><h3 className="text-xl font-semibold mb-2">Integração nativa com WhatsApp Business</h3><p className="text-gray-600">Envie propostas e interaja com clientes diretamente pelo WhatsApp.</p></div>
              <div className="text-left"><BarChart3 className="h-8 w-8 text-blue-600 mb-4" /><h3 className="text-xl font-semibold mb-2">Cálculo automático de materiais e custos</h3><p className="text-gray-600">Orçamentos precisos e rápidos, sem margem para erros.</p></div>
              <div className="text-left"><ClipboardList className="h-8 w-8 text-blue-600 mb-4" /><h3 className="text-xl font-semibold mb-2">Templates de proposta personalizáveis</h3><p className="text-gray-600">Crie propostas com a identidade visual da sua empresa.</p></div>
              <div className="text-left"><Users className="h-8 w-8 text-blue-600 mb-4" /><h3 className="text-xl font-semibold mb-2">Dashboard de acompanhamento de orçamentos</h3><p className="text-gray-600">Tenha controle total sobre o status de cada proposta enviada.</p></div>
              <div className="text-left"><Zap className="h-8 w-8 text-blue-600 mb-4" /><h3 className="text-xl font-semibold mb-2">Catálogo de serviços pré-configurado</h3><p className="text-gray-600">Agilize a criação de propostas com seus serviços e preços já cadastrados.</p></div>
              <div className="text-left"><RefreshCw className="h-8 w-8 text-blue-600 mb-4" /><h3 className="text-xl font-semibold mb-2">Follow-up automático com clientes</h3><p className="text-gray-600">Nunca mais perca uma oportunidade de venda com lembretes inteligentes.</p></div>
              <div className="text-left"><Smartphone className="h-8 w-8 text-blue-600 mb-4" /><h3 className="text-xl font-semibold mb-2">App mobile para gestão</h3><p className="text-gray-600">Gerencie suas propostas de qualquer lugar, na palma da sua mão.</p></div>
            </div>
          </div>
        </section>

        {/* Demonstração Visual */}
        <section className="py-20 px-4 bg-white">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
              Veja a EletroProposta IA em Ação
            </h2>
            <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center mb-8">
              <p className="text-gray-400">Vídeo ou GIF mostrando a ferramenta em ação</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center">
                <p className="text-gray-400">Screenshot da interface</p>
              </div>
              <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center">
                <p className="text-gray-400">Exemplo de proposta gerada</p>
              </div>
            </div>
          </div>
        </section>

        {/* Benefícios/Resultados */}
        <section className="py-20 px-4 bg-gray-100">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">Resultados Comprovados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
              <Card className="p-6 text-center shadow-sm">
                <CardContent className="p-0">
                  <p className="text-4xl font-bold text-blue-600 mb-2">80%</p>
                  <p className="text-gray-600">menos tempo criando propostas</p>
                </CardContent>
              </Card>
              <Card className="p-6 text-center shadow-sm">
                <CardContent className="p-0">
                  <p className="text-4xl font-bold text-blue-600 mb-2">45%</p>
                  <p className="text-gray-600">mais vendas fechadas</p>
                </CardContent>
              </Card>
              <Card className="p-6 text-center shadow-sm">
                <CardContent className="p-0">
                  <p className="text-4xl font-bold text-blue-600 mb-2">90%</p>
                  <p className="text-gray-600">dos clientes aprovam a agilidade</p>
                </CardContent>
              </Card>
              <Card className="p-6 text-center shadow-sm">
                <CardContent className="p-0">
                  <p className="text-4xl font-bold text-blue-600 mb-2">300%</p>
                  <p className="text-gray-600">ROI em 3 meses</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Depoimentos */}
        <section className="py-20 px-4 bg-white">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">O que Nossos Clientes Dizem</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="p-6 text-left shadow-lg">
                <CardContent className="p-0">
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400">{[...Array(5)].map((_, i) => <Star key={i} className="fill-current" />)}</div>
                  </div>
                  <p className="mb-4 text-gray-700">"A agilidade que ganhei é incrível. Fechei 45% mais serviços no primeiro mês! A ferramenta se pagou em uma semana."</p>
                  <p className="font-bold text-gray-900">- João Silva, Eletricista em São Paulo</p>
                </CardContent>
              </Card>
              <Card className="p-6 text-left shadow-lg">
                <CardContent className="p-0">
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400">{[...Array(5)].map((_, i) => <Star key={i} className="fill-current" />)}</div>
                  </div>
                  <p className="mb-4 text-gray-700">"Meus clientes elogiam o profissionalismo das propostas. Antes eu perdia tempo, agora foco no que importa: o serviço."</p>
                  <p className="font-bold text-gray-900">- Carlos Pereira, Eletricista no Rio de Janeiro</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Planos e Preços */}
        <section id="planos" className="py-20 px-4 bg-gray-100">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Escolha o Plano Ideal para Seu Negócio</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">Comece com um teste grátis de 7 dias. Sem compromisso.</p>
            
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card className="p-8 flex flex-col shadow-lg">
                <CardHeader className="p-0 mb-6"><CardTitle>Básico</CardTitle></CardHeader>
                <CardContent className="p-0 flex-grow">
                  <p className="text-4xl font-bold mb-2">R$ {billingCycle === 'monthly' ? prices.monthly.basico : Math.round(prices.annual.basico / 12)}<span className="text-lg font-normal text-gray-500">/mês</span></p>
                  {billingCycle === 'annual' && <p className="text-sm text-gray-500 mb-2">Cobrado R$ {prices.annual.basico} anualmente</p>}
                  <p className="text-gray-500 mb-6">Ideal para autônomos</p>
                  <ul className="space-y-3 text-gray-600 text-left">
                    <li className="flex items-center justify-between">
                      <span className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" /> 100 propostas/mês</span>
                      <Tooltip>
                        <TooltipTrigger><HelpCircle className="h-4 w-4 text-gray-400" /></TooltipTrigger>
                        <TooltipContent><p>Você pode gerar e enviar até 100 propostas comerciais para seus clientes todos os meses.</p></TooltipContent>
                      </Tooltip>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" /> Integração WhatsApp</span>
                      <Tooltip>
                        <TooltipTrigger><HelpCircle className="h-4 w-4 text-gray-400" /></TooltipTrigger>
                        <TooltipContent><p>Conecte seu número de WhatsApp para enviar as propostas diretamente aos seus clientes.</p></TooltipContent>
                      </Tooltip>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" /> Suporte via email</span>
                      <Tooltip>
                        <TooltipTrigger><HelpCircle className="h-4 w-4 text-gray-400" /></TooltipTrigger>
                        <TooltipContent><p>Receba ajuda e tire suas dúvidas com nossa equipe de suporte através de email.</p></TooltipContent>
                      </Tooltip>
                    </li>
                  </ul>
                </CardContent>
                <Button variant="outline" className="mt-8 w-full" onClick={() => handlePlanButtonClick('basico')}>
                  {getButtonText('basico')}
                </Button>
              </Card>
              <Card className="p-8 flex flex-col shadow-lg border-2 border-blue-600 relative">
                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">MAIS POPULAR</div>
                <CardHeader className="p-0 mb-6"><CardTitle>Profissional</CardTitle></CardHeader>
                <CardContent className="p-0 flex-grow">
                  <p className="text-4xl font-bold mb-2">R$ {billingCycle === 'monthly' ? prices.monthly.profissional : Math.round(prices.annual.profissional / 12)}<span className="text-lg font-normal text-gray-500">/mês</span></p>
                  {billingCycle === 'annual' && <p className="text-sm text-gray-500 mb-2">Cobrado R$ {prices.annual.profissional} anualmente</p>}
                  <p className="text-gray-500 mb-6">Para quem busca crescer</p>
                  <ul className="space-y-3 text-gray-600 text-left">
                    <li className="flex items-center justify-between">
                      <span className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" /> Propostas Ilimitadas</span>
                      <Tooltip>
                        <TooltipTrigger><HelpCircle className="h-4 w-4 text-gray-400" /></TooltipTrigger>
                        <TooltipContent><p>Crie e envie quantas propostas forem necessárias para escalar seu negócio.</p></TooltipContent>
                      </Tooltip>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" /> Dashboard de Vendas</span>
                      <Tooltip>
                        <TooltipTrigger><HelpCircle className="h-4 w-4 text-gray-400" /></TooltipTrigger>
                        <TooltipContent><p>Acompanhe o status de todas as suas propostas (enviadas, visualizadas, aceitas) em um painel visual.</p></TooltipContent>
                      </Tooltip>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" /> Relatórios Avançados</span>
                      <Tooltip>
                        <TooltipTrigger><HelpCircle className="h-4 w-4 text-gray-400" /></TooltipTrigger>
                        <TooltipContent><p>Obtenha insights sobre suas vendas e taxas de conversão com relatórios detalhados.</p></TooltipContent>
                      </Tooltip>
                    </li>
                  </ul>
                </CardContent>
                <Button className="mt-8 w-full bg-blue-600 hover:bg-blue-700" onClick={() => handlePlanButtonClick('profissional')}>
                  {getButtonText('profissional')}
                </Button>
              </Card>
              <Card className="p-8 flex flex-col shadow-lg">
                <CardHeader className="p-0 mb-6"><CardTitle>Enterprise</CardTitle></CardHeader>
                <CardContent className="p-0 flex-grow">
                  <p className="text-4xl font-bold mb-2">R$ {billingCycle === 'monthly' ? prices.monthly.enterprise : Math.round(prices.annual.enterprise / 12)}<span className="text-lg font-normal text-gray-500">/mês</span></p>
                  {billingCycle === 'annual' && <p className="text-sm text-gray-500 mb-2">Cobrado R$ {prices.annual.enterprise} anualmente</p>}
                  <p className="text-gray-500 mb-6">Para equipes e empresas</p>
                  <ul className="space-y-3 text-gray-600 text-left">
                    <li className="flex items-center justify-between">
                      <span className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" /> Propostas Ilimitadas</span>
                      <Tooltip>
                        <TooltipTrigger><HelpCircle className="h-4 w-4 text-gray-400" /></TooltipTrigger>
                        <TooltipContent><p>Sem limites! Crie e envie quantas propostas forem necessárias para escalar seu negócio.</p></TooltipContent>
                      </Tooltip>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" /> Múltiplos Usuários</span>
                      <Tooltip>
                        <TooltipTrigger><HelpCircle className="h-4 w-4 text-gray-400" /></TooltipTrigger>
                        <TooltipContent><p>Permita que vários membros da sua equipe acessem a plataforma e gerenciem propostas.</p></TooltipContent>
                      </Tooltip>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" /> Integração API</span>
                      <Tooltip>
                        <TooltipTrigger><HelpCircle className="h-4 w-4 text-gray-400" /></TooltipTrigger>
                        <TooltipContent><p>Conecte a EletroProposta IA com outras ferramentas que você já usa através da nossa API.</p></TooltipContent>
                      </Tooltip>
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" /> Consultoria Exclusiva</span>
                      <Tooltip>
                        <TooltipTrigger><HelpCircle className="h-4 w-4 text-gray-400" /></TooltipTrigger>
                        <TooltipContent><p>Receba suporte e orientação personalizada para otimizar o uso da plataforma.</p></TooltipContent>
                      </Tooltip>
                    </li>
                  </ul>
                </CardContent>
                <Button variant="outline" className="mt-8 w-full" onClick={() => handlePlanButtonClick('enterprise')}>
                  {getButtonText('enterprise')}
                </Button>
              </Card>
            </div>
            <p className="mt-8 text-lg text-gray-600">
              <span className="font-bold text-blue-600">7 dias grátis</span> para todos os planos + <span className="font-bold text-blue-600">30 dias de garantia</span> ou seu dinheiro de volta.
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 px-4 bg-white">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">Perguntas Frequentes</h2>
            <Accordion type="single" collapsible className="w-full space-y-4">
              <AccordionItem value="item-1" className="border rounded-lg px-6">
                <AccordionTrigger className="text-lg font-medium hover:no-underline">Como a IA aprende sobre meus preços?</AccordionTrigger>
                <AccordionContent className="text-gray-600">Você configura seu catálogo de serviços e preços uma única vez. A IA usa essas informações para calcular os orçamentos automaticamente, garantindo precisão em cada proposta.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="border rounded-lg px-6">
                <AccordionTrigger className="text-lg font-medium hover:no-underline">Funciona com WhatsApp normal ou só Business?</AccordionTrigger>
                <AccordionContent className="text-gray-600">Recomendamos o WhatsApp Business para uma integração completa e profissional, aproveitando todos os recursos da plataforma. No entanto, a ferramenta é compatível com o WhatsApp normal.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="border rounded-lg px-6">
                <AccordionTrigger className="text-lg font-medium hover:no-underline">Posso personalizar as propostas?</AccordionTrigger>
                <AccordionContent className="text-gray-600">Sim! Você pode personalizar os templates de proposta com sua logo, informações de contato, termos de serviço e até mesmo adicionar imagens de trabalhos anteriores.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4" className="border rounded-lg px-6">
                <AccordionTrigger className="text-lg font-medium hover:no-underline">Como funciona a integração com o WhatsApp?</AccordionTrigger>
                <AccordionContent className="text-gray-600">Nossa plataforma se conecta ao seu WhatsApp Business para enviar as propostas geradas pela IA diretamente aos seus clientes, agilizando a comunicação e o fechamento de vendas.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5" className="border rounded-lg px-6">
                <AccordionTrigger className="text-lg font-medium hover:no-underline">Tem suporte técnico?</AccordionTrigger>
                <AccordionContent className="text-gray-600">Sim, todos os planos incluem suporte via e-mail. Para planos Profissional e Enterprise, oferecemos canais de suporte prioritários e consultoria exclusiva.</AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-20 px-4 bg-blue-600 text-white text-center">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6">Pronto para Revolucionar Seu Negócio?</h2>
            <p className="text-lg md:text-xl mb-10 opacity-90">Pare de perder clientes por demora. Comece seu teste grátis de 7 dias e veja suas vendas decolarem.</p>
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-10 py-7 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
              onClick={handleFinalCTAClick}
            >
              Começar Teste Grátis
            </Button>
            <p className="mt-6 text-sm text-blue-200 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4 mr-2" /> Garantia de 30 dias e cancelamento fácil.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-gray-400">
        <div className="container mx-auto text-center">
          <p>&copy; {new Date().getFullYear()} EletroProposta IA. Todos os direitos reservados.</p>
          <div className="flex justify-center space-x-4 mt-4">
            <Link to="/privacy-policy" className="text-gray-400 hover:text-white text-sm">Política de Privacidade</Link>
            <Link to="/terms-of-service" className="text-gray-400 hover:text-white text-sm">Termos de Serviço</Link>
          </div>
        </div>
      </footer>
    </div>
    </TooltipProvider>
  );
};

export default Index;
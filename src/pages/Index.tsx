import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Zap, Bot, MessageSquare, BarChart3, ClipboardList, Users, Star, ShieldCheck, ArrowRight, Check, HelpCircle } from "lucide-react";
import { Header } from "@/components/Header";

interface IndexProps {
  onOpenRegisterModal: (planId?: string, billingCycle?: 'monthly' | 'annual') => void;
  onOpenLoginModal: () => void; // Adicionada a prop onOpenLoginModal
}

const Index = ({ onOpenRegisterModal, onOpenLoginModal }: IndexProps) => { // Recebendo a prop
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
          element.scrollIntoView({ behavior: "smooth", block: "start" }); // Correção aqui
        }, 100);
      }
    }
  }, [location]);

  const prices = {
    annual: {
      essencial: 127,
      professional: 147,
      premium: 347,
    },
    monthly: {
      essencial: Math.round(127 * 1.25),
      professional: Math.round(147 * 1.25),
      premium: Math.round(347 * 1.25),
    }
  };

  const displayPrice = prices[billingCycle];

  const handlePlanButtonClick = (planId: string) => {
    if (isPaid) {
      navigate('/upgrade');
    } else if (user && !isPaid) {
      navigate('/payment', { state: { planId, billingCycle } });
    } else {
      onOpenRegisterModal(planId, billingCycle);
    }
  };

  const handleHeroButtonClick = () => {
    if (isPaid) {
      navigate('/dashboard');
    } else if (user && !isPaid) {
      navigate('/payment');
    } else {
      onOpenRegisterModal();
    }
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

  const getButtonText = (upgradeText: string, defaultText: string) => {
    if (isPaid) return upgradeText;
    if (user && !isPaid) return "Finalizar Assinatura";
    return defaultText;
  };

  return (
    <TooltipProvider>
    <div className="bg-white text-gray-800">
      <Header onOpenRegisterModal={onOpenRegisterModal} onOpenLoginModal={onOpenLoginModal} /> {/* Passando a prop */}

      <main>
        {/* Hero Section */}
        <section className="relative text-center md:text-left py-20 px-4 md:py-32">
          <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
                Automatize Suas Propostas no WhatsApp e Feche Mais Vendas
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-10">
                Nossa IA cria propostas profissionais para eletricistas em segundos e as envia diretamente pelo WhatsApp.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-6 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 w-full sm:w-auto"
                  onClick={handleHeroButtonClick}
                >
                  {getButtonText('Ir para o Dashboard', 'Começar Agora')} <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
              <p className="mt-6 text-sm text-gray-500">Confiado por mais de 500 eletricistas em todo o Brasil.</p>
            </div>
            <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center">
              <p className="text-gray-400">Visual do Produto Aqui</p>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section id="como-funciona" className="py-20 px-4 bg-gray-50">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Crie uma Proposta em 3 Passos Simples
            </h2>
            <p className="text-lg text-gray-600 mb-16 max-w-2xl mx-auto">Nossa IA revoluciona seu atendimento, transformando solicitações em propostas fechadas em minutos.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-6">
                <div className="bg-blue-100 text-blue-600 rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold mb-6 shadow-sm">1</div>
                <h3 className="text-xl font-semibold mb-3">Receba a Solicitação</h3>
                <p className="text-gray-600">O cliente descreve o problema ou serviço necessário diretamente no seu WhatsApp.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6">
                <div className="bg-blue-100 text-blue-600 rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold mb-6 shadow-sm">2</div>
                <h3 className="text-xl font-semibold mb-3">IA Processa e Calcula</h3>
                <p className="text-gray-600">A IA analisa o serviço, calcula custos de material e mão de obra com base no seu catálogo.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6">
                <div className="bg-blue-100 text-blue-600 rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold mb-6 shadow-sm">3</div>
                <h3 className="text-xl font-semibold mb-3">Envie a Proposta</h3>
                <p className="text-gray-600">Uma proposta completa e profissional é gerada e enviada para o cliente em segundos.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-white">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-16">
              Tudo que Você Precisa em Uma Ferramenta
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              <div className="text-left"><Bot className="h-8 w-8 text-blue-600 mb-4" /><h3 className="text-xl font-semibold mb-2">IA Especializada</h3><p className="text-gray-600">Treinada para entender termos técnicos de serviços elétricos.</p></div>
              <div className="text-left"><MessageSquare className="h-8 w-8 text-blue-600 mb-4" /><h3 className="text-xl font-semibold mb-2">Integração com WhatsApp</h3><p className="text-gray-600">Conecte seu número e automatize o atendimento.</p></div>
              <div className="text-left"><BarChart3 className="h-8 w-8 text-blue-600 mb-4" /><h3 className="text-xl font-semibold mb-2">Cálculo Automático</h3><p className="text-gray-600">Calcule custos de materiais e mão de obra instantaneamente.</p></div>
              <div className="text-left"><ClipboardList className="h-8 w-8 text-blue-600 mb-4" /><h3 className="text-xl font-semibold mb-2">Templates de Proposta</h3><p className="text-gray-600">Use nossos templates ou crie os seus com sua marca.</p></div>
              <div className="text-left"><Users className="h-8 w-8 text-blue-600 mb-4" /><h3 className="text-xl font-semibold mb-2">Dashboard de Vendas</h3><p className="text-gray-600">Acompanhe o status de cada proposta enviada.</p></div>
              <div className="text-left"><Zap className="h-8 w-8 text-blue-600 mb-4" /><h3 className="text-xl font-semibold mb-2">Catálogo de Serviços</h3><p className="text-gray-600">Cadastre seus serviços e preços para agilizar os cálculos.</p></div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">O que Nossos Clientes Dizem</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="p-6 text-left shadow-lg">
                <CardContent className="p-0">
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400">{[...Array(5)].map((_, i) => <Star key={i} className="fill-current" />)}</div>
                  </div>
                  <p className="mb-4 text-gray-700">"A agilidade que ganhei é incrível. Fechei 40% mais serviços no primeiro mês! A ferramenta se pagou em uma semana."</p>
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

        {/* Pricing Section */}
        <section id="planos" className="py-20 px-4 bg-white">
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
                <CardHeader className="p-0 mb-6"><CardTitle>Essencial</CardTitle></CardHeader>
                <CardContent className="p-0 flex-grow">
                  <p className="text-4xl font-bold mb-2">R$ {displayPrice.essencial}<span className="text-lg font-normal text-gray-500">/mês</span></p>
                  {billingCycle === 'annual' && <p className="text-sm text-gray-500 mb-2">Cobrado R$ {prices.annual.essencial * 12} anualmente</p>}
                  <p className="text-gray-500 mb-6">Ideal para autônomos</p>
                  <ul className="space-y-3 text-gray-600 text-left">
                    <li className="flex items-center justify-between">
                      <span className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" /> 20 propostas/mês</span>
                      <Tooltip>
                        <TooltipTrigger><HelpCircle className="h-4 w-4 text-gray-400" /></TooltipTrigger>
                        <TooltipContent><p>Você pode gerar e enviar até 20 propostas comerciais para seus clientes todos os meses.</p></TooltipContent>
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
                <Button variant="outline" className="mt-8 w-full" onClick={() => handlePlanButtonClick('essencial')}>
                  {getButtonText('Fazer Upgrade', 'Começar Agora')}
                </Button>
              </Card>
              <Card className="p-8 flex flex-col shadow-lg border-2 border-blue-600 relative">
                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">MAIS POPULAR</div>
                <CardHeader className="p-0 mb-6"><CardTitle>Profissional</CardTitle></CardHeader>
                <CardContent className="p-0 flex-grow">
                  <p className="text-4xl font-bold mb-2">R$ {displayPrice.professional}<span className="text-lg font-normal text-gray-500">/mês</span></p>
                  {billingCycle === 'annual' && <p className="text-sm text-gray-500 mb-2">Cobrado R$ {prices.annual.professional * 12} anualmente</p>}
                  <p className="text-gray-500 mb-6">Para quem busca crescer</p>
                  <ul className="space-y-3 text-gray-600 text-left">
                    <li className="flex items-center justify-between">
                      <span className="flex items-center"><Check className="h-5 w-5 text-green-500 mr-2" /> 50 propostas/mês</span>
                      <Tooltip>
                        <TooltipTrigger><HelpCircle className="h-4 w-4 text-gray-400" /></TooltipTrigger>
                        <TooltipContent><p>Aumente seu volume de negócios com a capacidade de gerar e enviar até 50 propostas mensais.</p></TooltipContent>
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
                <Button className="mt-8 w-full bg-blue-600 hover:bg-blue-700" onClick={() => handlePlanButtonClick('professional')}>
                  {getButtonText('Fazer Upgrade', 'Começar Agora')}
                </Button>
              </Card>
              <Card className="p-8 flex flex-col shadow-lg">
                <CardHeader className="p-0 mb-6"><CardTitle>Premium</CardTitle></CardHeader>
                <CardContent className="p-0 flex-grow">
                  <p className="text-4xl font-bold mb-2">R$ {displayPrice.premium}<span className="text-lg font-normal text-gray-500">/mês</span></p>
                  {billingCycle === 'annual' && <p className="text-sm text-gray-500 mb-2">Cobrado R$ {prices.annual.premium * 12} anualmente</p>}
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
                  </ul>
                </CardContent>
                <Button variant="outline" className="mt-8 w-full" onClick={() => handlePlanButtonClick('premium')}>
                  {getButtonText('Fazer Upgrade', 'Começar Agora')}
                </Button>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 px-4 bg-gray-50">
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
            </Accordion>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 px-4 bg-blue-600 text-white text-center">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6">Pronto para Revolucionar Seu Negócio?</h2>
            <p className="text-lg md:text-xl mb-10 opacity-90">Pare de perder clientes por demora. Comece seu teste grátis de 7 dias e veja suas vendas decolarem.</p>
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-10 py-7 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
              onClick={handleFinalCTAClick}
            >
              {getButtonText('Ver Planos', 'Começar Agora')}
            </Button>
            <p className="mt-6 text-sm text-blue-200 flex items-center justify-center"><ShieldCheck className="h-4 w-4 mr-2" /> Garantia de 30 dias e cancelamento fácil.</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 px-4 bg-gray-900 text-gray-400">
        <div className="container mx-auto text-center">
          <p>&copy; {new Date().getFullYear()} EletroProposta IA. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
    </TooltipProvider>
  );
};

export default Index;
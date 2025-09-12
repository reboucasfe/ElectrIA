import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Zap, Bot, MessageSquare, CheckCircle, BarChart3, ClipboardList, Users, Star, ShieldCheck } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <Zap className="h-8 w-8 text-blue-600 mr-2" />
            <span className="text-xl font-bold text-gray-900">EletroProposta IA</span>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <a href="#como-funciona" className="text-gray-600 hover:text-blue-600">Como Funciona</a>
            <a href="#precos" className="text-gray-600 hover:text-blue-600">Preços</a>
            <a href="#faq" className="text-gray-600 hover:text-blue-600">FAQ</a>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">Começar Agora</Button>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative text-center py-20 px-4 md:py-32 bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              Automatize Suas Propostas no WhatsApp e Feche Mais Vendas
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-10">
              IA especializada que cria propostas profissionais para eletricistas em segundos. Integração direta com WhatsApp.
            </p>
            <Button
              size="lg"
              className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-6 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              Ver Demonstração
            </Button>
          </div>
        </section>

        {/* Pain Points Section */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Cansado de Perder Clientes por Propostas Demoradas?
            </h2>
            <p className="text-gray-600 mb-12">Você se identifica com algum destes problemas?</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center"><CheckCircle className="text-red-500 mr-2" /> Demora para criar propostas</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center"><CheckCircle className="text-red-500 mr-2" /> Perda de clientes por agilidade</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center"><CheckCircle className="text-red-500 mr-2" /> Propostas mal formatadas</CardTitle>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section id="como-funciona" className="py-16 px-4 bg-blue-50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
              Como Nossa IA Revoluciona Seu Atendimento
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-6">
                <div className="bg-blue-600 text-white rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold mb-6 shadow-md">1</div>
                <h3 className="text-xl font-semibold mb-3">Recebe a Solicitação</h3>
                <p className="text-gray-700">Cliente descreve o problema via WhatsApp.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6">
                <div className="bg-green-600 text-white rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold mb-6 shadow-md">2</div>
                <h3 className="text-xl font-semibold mb-3">IA Processa e Calcula</h3>
                <p className="text-gray-700">Analisa o serviço, calcula custos e mão de obra.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6">
                <div className="bg-purple-600 text-white rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold mb-6 shadow-md">3</div>
                <h3 className="text-xl font-semibold mb-3">Proposta Profissional</h3>
                <p className="text-gray-700">Envia proposta completa automaticamente.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
              Tudo que Você Precisa em Uma Ferramenta
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="p-6 text-center"><Bot className="h-10 w-10 text-blue-600 mx-auto mb-4" /><CardTitle>IA para Serviços Elétricos</CardTitle></Card>
              <Card className="p-6 text-center"><MessageSquare className="h-10 w-10 text-green-600 mx-auto mb-4" /><CardTitle>Integração com WhatsApp</CardTitle></Card>
              <Card className="p-6 text-center"><BarChart3 className="h-10 w-10 text-purple-600 mx-auto mb-4" /><CardTitle>Cálculo Automático de Custos</CardTitle></Card>
              <Card className="p-6 text-center"><ClipboardList className="h-10 w-10 text-orange-600 mx-auto mb-4" /><CardTitle>Templates de Proposta</CardTitle></Card>
              <Card className="p-6 text-center"><Users className="h-10 w-10 text-red-600 mx-auto mb-4" /><CardTitle>Dashboard de Acompanhamento</CardTitle></Card>
              <Card className="p-6 text-center"><Zap className="h-10 w-10 text-yellow-500 mx-auto mb-4" /><CardTitle>Catálogo de Serviços</CardTitle></Card>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 px-4 bg-blue-50">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">O que Nossos Clientes Dizem</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="p-6 text-left">
                <CardContent>
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400">{[...Array(5)].map((_, i) => <Star key={i} />)}</div>
                  </div>
                  <p className="mb-4">"A agilidade que ganhei é incrível. Fechei 40% mais serviços no primeiro mês!"</p>
                  <p className="font-bold">- João Silva, São Paulo</p>
                </CardContent>
              </Card>
              <Card className="p-6 text-left">
                <CardContent>
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400">{[...Array(5)].map((_, i) => <Star key={i} />)}</div>
                  </div>
                  <p className="mb-4">"Meus clientes elogiam o profissionalismo das propostas. A ferramenta se pagou em uma semana."</p>
                  <p className="font-bold">- Carlos Pereira, Rio de Janeiro</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="precos" className="py-16 px-4 bg-white">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">Escolha o Plano Ideal para Seu Negócio</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="p-8 flex flex-col">
                <CardHeader><CardTitle>Básico</CardTitle></CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-4xl font-bold mb-4">R$ 97<span className="text-lg font-normal">/mês</span></p>
                  <ul className="space-y-2 text-gray-600"><li>20 propostas/mês</li><li>Integração WhatsApp</li><li>Suporte via email</li></ul>
                </CardContent>
                <Button variant="outline" className="mt-6">Começar Teste</Button>
              </Card>
              <Card className="p-8 flex flex-col border-2 border-blue-600 relative">
                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">MAIS POPULAR</div>
                <CardHeader><CardTitle>Profissional</CardTitle></CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-4xl font-bold mb-4">R$ 197<span className="text-lg font-normal">/mês</span></p>
                  <ul className="space-y-2 text-gray-600"><li>50 propostas/mês</li><li>Dashboard de Vendas</li><li>Relatórios Avançados</li></ul>
                </CardContent>
                <Button className="mt-6 bg-blue-600 hover:bg-blue-700">Começar Teste</Button>
              </Card>
              <Card className="p-8 flex flex-col">
                <CardHeader><CardTitle>Enterprise</CardTitle></CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-4xl font-bold mb-4">R$ 347<span className="text-lg font-normal">/mês</span></p>
                  <ul className="space-y-2 text-gray-600"><li>Propostas Ilimitadas</li><li>Multi-usuários</li><li>Integração API</li></ul>
                </CardContent>
                <Button variant="outline" className="mt-6">Começar Teste</Button>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-16 px-4 bg-blue-50">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-12">Perguntas Frequentes</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Como a IA aprende sobre meus preços?</AccordionTrigger>
                <AccordionContent>Você configura seu catálogo de serviços e preços uma única vez. A IA usa essas informações para calcular os orçamentos automaticamente.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Funciona com WhatsApp normal ou só Business?</AccordionTrigger>
                <AccordionContent>Recomendamos o WhatsApp Business para uma integração completa e profissional, aproveitando todos os recursos da plataforma.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Posso personalizar as propostas?</AccordionTrigger>
                <AccordionContent>Sim! Você pode personalizar os templates de proposta com sua logo, informações de contato e termos de serviço.</AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20 px-4 bg-indigo-600 text-white text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6">Pronto para Revolucionar Seu Negócio?</h2>
            <p className="text-lg md:text-xl mb-10">Comece seu teste grátis de 7 dias. Sem compromisso, cancele quando quiser.</p>
            <Button
              size="lg"
              className="bg-white text-indigo-600 hover:bg-gray-100 text-lg px-8 py-6 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              Começar Teste Grátis
            </Button>
            <p className="mt-4 text-sm text-indigo-200 flex items-center justify-center"><ShieldCheck className="h-4 w-4 mr-2" /> Garantia de 30 dias</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 text-center text-gray-600 bg-gray-100">
        <p>&copy; {new Date().getFullYear()} EletroProposta IA. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default Index;
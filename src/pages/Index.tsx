import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, MessageSquare, DollarSign, Clock } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center py-20 px-4 md:py-32">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
            Seu Assistente de Propostas Comerciais no WhatsApp
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-10">
            Crie propostas e componha custos de forma rápida e inteligente, direto do seu WhatsApp.
            Automatize seu processo de vendas e foque no que realmente importa: seus clientes.
          </p>
          <Button
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-6 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
            asChild
          >
            <a href="https://wa.me/?text=Olá! Gostaria de saber mais sobre as propostas comerciais." target="_blank" rel="noopener noreferrer">
              <MessageSquare className="mr-3 h-6 w-6" /> Comece Agora no WhatsApp
            </a>
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
            Recursos que Vão Transformar Suas Vendas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <DollarSign className="h-10 w-10 text-blue-600 mx-auto mb-4" />
                <CardTitle className="text-xl font-semibold mb-2">Propostas Personalizadas</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Gere propostas comerciais detalhadas e adaptadas às necessidades de cada cliente em minutos.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CheckCircle className="h-10 w-10 text-green-600 mx-auto mb-4" />
                <CardTitle className="text-xl font-semibold mb-2">Composição de Custos Detalhada</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Calcule e apresente a composição de custos de forma transparente e precisa.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <Clock className="h-10 w-10 text-purple-600 mx-auto mb-4" />
                <CardTitle className="text-xl font-semibold mb-2">Agilidade e Eficiência</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Reduza o tempo gasto na criação de documentos e acelere seu ciclo de vendas.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <MessageSquare className="h-10 w-10 text-orange-600 mx-auto mb-4" />
                <CardTitle className="text-xl font-semibold mb-2">Disponibilidade 24/7</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Seu assistente está sempre pronto para ajudar, a qualquer hora, em qualquer lugar.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-16 px-4 bg-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12">
            Como Funciona? É Simples!
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6">
              <div className="bg-blue-600 text-white rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold mb-6 shadow-md">
                1
              </div>
              <h3 className="text-xl font-semibold mb-3">Envie uma Mensagem</h3>
              <p className="text-gray-700">
                Inicie uma conversa com nosso chatbot no WhatsApp.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6">
              <div className="bg-green-600 text-white rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold mb-6 shadow-md">
                2
              </div>
              <h3 className="text-xl font-semibold mb-3">Descreva sua Necessidade</h3>
              <p className="text-gray-700">
                Informe os detalhes da proposta ou os itens para composição de custos.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6">
              <div className="bg-purple-600 text-white rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold mb-6 shadow-md">
                3
              </div>
              <h3 className="text-xl font-semibold mb-3">Receba sua Proposta</h3>
              <p className="text-gray-700">
                O chatbot gera e envia a proposta ou a composição de custos pronta para uso.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 px-4 bg-indigo-600 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6">
            Pronto para Transformar Suas Vendas?
          </h2>
          <p className="text-lg md:text-xl mb-10">
            Junte-se a empresas que já estão economizando tempo e aumentando a eficiência com nosso chatbot.
          </p>
          <Button
            size="lg"
            className="bg-white text-indigo-600 hover:bg-gray-100 text-lg px-8 py-6 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
            asChild
          >
            <a href="https://wa.me/?text=Olá! Gostaria de saber mais sobre as propostas comerciais." target="_blank" rel="noopener noreferrer">
              <MessageSquare className="mr-3 h-6 w-6" /> Fale com o Chatbot Agora!
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center text-gray-600 bg-gray-100">
        <p>&copy; {new Date().getFullYear()} Chatbot Propostas. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default Index;
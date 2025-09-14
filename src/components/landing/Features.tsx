import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Calculator, MessageSquare, BrainCircuit, History } from "lucide-react";

const features = [
  {
    icon: <Calculator className="h-8 w-8 text-primary" />,
    title: "Cálculos Complexos",
    description: "De álgebra a cálculo, nossa IA resolve equações complexas em segundos.",
  },
  {
    icon: <MessageSquare className="h-8 w-8 text-primary" />,
    title: "Integração com WhatsApp",
    description: "Use a calculadora de onde estiver, sem precisar de um novo aplicativo.",
  },
  {
    icon: <BrainCircuit className="h-8 w-8 text-primary" />,
    title: "Respostas por IA",
    description: "Não apenas o resultado, mas explicações passo a passo para seus cálculos.",
  },
  {
    icon: <History className="h-8 w-8 text-primary" />,
    title: "Histórico Inteligente",
    description: "Acesse e revise todos os seus cálculos anteriores de forma organizada.",
  },
];

export const Features = () => {
  return (
    <section id="features" className="py-20 bg-muted/40">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Tudo que você precisa, em um só lugar</h2>
          <p className="max-w-2xl mx-auto text-muted-foreground mt-4">
            Nossa plataforma foi desenhada para ser poderosa e intuitiva.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <Card key={feature.title} className="text-center p-6">
              <CardHeader>
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardDescription>{feature.description}</CardDescription>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
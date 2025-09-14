import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const Hero = () => {
  return (
    <section className="py-20 md:py-32">
      <div className="container text-center">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">
          Sua Calculadora Inteligente, Direto no WhatsApp
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-8">
          Resolva cálculos complexos, obtenha respostas instantâneas e gerencie seu histórico, tudo através de uma simples conversa no WhatsApp.
        </p>
        <div className="flex justify-center gap-4">
          <Button size="lg">
            Comece Agora Gratuitamente <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button size="lg" variant="outline">
            Ver Demonstração
          </Button>
        </div>
      </div>
    </section>
  );
};
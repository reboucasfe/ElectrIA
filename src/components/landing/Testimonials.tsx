import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
  {
    quote: "Esta ferramenta transformou a maneira como faço cálculos rápidos para minha empresa. A integração com o WhatsApp é genial!",
    name: "Ana Silva",
    title: "CEO, Startup Inovadora",
    avatar: "/placeholder.svg",
  },
  {
    quote: "Como estudante de engenharia, o CalcAI me ajuda a verificar minhas respostas e entender os passos. Indispensável!",
    name: "Marcos Rocha",
    title: "Estudante de Engenharia",
    avatar: "/placeholder.svg",
  },
  {
    quote: "A simplicidade de uso é o que mais me impressiona. Envio a conta e recebo a resposta na hora. Perfeito.",
    name: "Juliana Costa",
    title: "Analista Financeira",
    avatar: "/placeholder.svg",
  },
];

export const Testimonials = () => {
  return (
    <section id="testimonials" className="py-20">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">O que nossos usuários dizem</h2>
          <p className="max-w-2xl mx-auto text-muted-foreground mt-4">
            A confiança de quem usa nossa solução todos os dias.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.name}>
              <CardContent className="pt-6">
                <p className="text-muted-foreground mb-6">"{testimonial.quote}"</p>
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
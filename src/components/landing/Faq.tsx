import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Como funciona a integração com o WhatsApp?",
    answer: "É simples! Após se cadastrar, você adiciona nosso número oficial e pode começar a enviar seus cálculos diretamente na conversa. Nossa IA irá processar e responder instantaneamente.",
  },
  {
    question: "Quais tipos de cálculos são suportados?",
    answer: "Nossa IA suporta uma vasta gama de cálculos, desde aritmética básica e álgebra até cálculo diferencial e integral, estatísticas e muito mais. Estamos constantemente expandindo nossas capacidades.",
  },
  {
    question: "Meus dados e cálculos são privados?",
    answer: "Sim, a privacidade e segurança dos seus dados são nossa maior prioridade. Todas as conversas são criptografadas e seus dados de cálculo são armazenados de forma segura, acessíveis apenas por você.",
  },
  {
    question: "Existe um plano gratuito?",
    answer: "Sim, oferecemos um plano gratuito com um número limitado de cálculos por mês para que você possa experimentar a plataforma. Para uso ilimitado e funcionalidades avançadas, temos planos pagos acessíveis.",
  },
];

export const Faq = () => {
  return (
    <section id="faq" className="py-20 bg-muted/40">
      <div className="container max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">Perguntas Frequentes</h2>
          <p className="text-muted-foreground mt-4">
            Tudo o que você precisa saber para começar.
          </p>
        </div>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};
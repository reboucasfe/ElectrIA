import { Button } from "@/components/ui/button";
import { BsWhatsapp } from "react-icons/bs";

const WhatsAppButton = () => {
  // IMPORTANTE: Substitua este número pelo seu número de WhatsApp com o código do país.
  const phoneNumber = "5511999999999"; 
  const message = "Olá! Tenho uma dúvida sobre a EletroProposta IA.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50"
      aria-label="Fale com um especialista no WhatsApp"
    >
      <Button
        size="lg"
        className="bg-green-500 hover:bg-green-600 text-white rounded-full h-16 px-6 shadow-lg flex items-center justify-center gap-3"
      >
        <BsWhatsapp className="h-6 w-6" />
        <span className="font-semibold">Fale com um especialista</span>
      </Button>
    </a>
  );
};

export default WhatsAppButton;
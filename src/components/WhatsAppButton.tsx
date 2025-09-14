import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FaWhatsapp } from "react-icons/fa";

const WhatsAppButton = () => {
  // IMPORTANTE: Substitua este número pelo seu número de WhatsApp com o código do país.
  const phoneNumber = "5511999999999"; 
  const message = "Olá! Tenho uma dúvida sobre a EletroProposta IA.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50"
          aria-label="Fale conosco no WhatsApp"
        >
          <Button
            size="icon"
            className="bg-green-500 hover:bg-green-600 text-white rounded-full h-16 w-16 shadow-lg flex items-center justify-center"
          >
            <FaWhatsapp className="h-8 w-8" />
          </Button>
        </a>
      </TooltipTrigger>
      <TooltipContent>
        <p>Dúvidas? Fale conosco!</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default WhatsAppButton;
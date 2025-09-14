import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom"; // Importar useNavigate

const Upgrade = () => {
  const navigate = useNavigate(); // Inicializar useNavigate

  const premiumFeatures = [
    "Geração ilimitada de propostas com IA",
    "Integração completa com WhatsApp Business",
    "Dashboard de vendas com métricas avançadas",
    "Personalização de templates com sua marca",
    "Suporte prioritário via WhatsApp",
  ];

  const handleUpgradeClick = () => {
    navigate('/payment'); // Redireciona para a página de pagamento simulada
  };

  return (
    <div className="space-y-8 flex flex-col items-center text-center">
      <div className="max-w-2xl">
        <Zap className="h-16 w-16 text-blue-600 mx-auto mb-4" />
        <h1 className="text-3xl md:text-4xl font-bold">Desbloqueie o Poder da EletroProposta IA</h1>
        <p className="text-gray-500 mt-2">
          Faça o upgrade para o plano Profissional e transforme a maneira como você envia propostas e fecha negócios.
        </p>
      </div>

      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Benefícios do Plano Profissional</CardTitle>
          <CardDescription>Veja o que você ganha ao fazer o upgrade:</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4 text-left">
            {premiumFeatures.map((feature, index) => (
              <li key={index} className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <Button size="lg" className="w-full mt-8 bg-blue-600 hover:bg-blue-700" onClick={handleUpgradeClick}>
            Fazer Upgrade Agora
          </Button>
          <p className="text-xs text-gray-500 mt-4">
            Você será redirecionado para nossa página de pagamentos seguros.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Upgrade;
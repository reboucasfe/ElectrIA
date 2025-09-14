"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { showError, showSuccess } from '@/utils/toast';
import { CreditCard, QrCode, CheckCircle } from 'lucide-react'; // 'Pix' foi substituído por 'QrCode'

const PaymentPage = () => {
  const [paymentMethod, setPaymentMethod] = useState('creditCard');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simula um processamento de pagamento
    setTimeout(() => {
      setLoading(false);
      showSuccess("Pagamento simulado com sucesso! Redirecionando para o dashboard.");
      navigate('/dashboard'); // Redireciona para o dashboard após a simulação
    }, 2000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Finalizar Pagamento</CardTitle>
          <CardDescription>Escolha seu método de pagamento e conclua a compra.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePaymentSubmit} className="space-y-6">
            <div className="space-y-4">
              <Label className="text-base">Método de Pagamento</Label>
              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div className="flex items-center space-x-2 border p-4 rounded-md cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="creditCard" id="creditCard" />
                  <Label htmlFor="creditCard" className="flex items-center gap-2 text-base font-normal cursor-pointer">
                    <CreditCard className="h-5 w-5" /> Cartão de Crédito
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border p-4 rounded-md cursor-pointer hover:bg-gray-50">
                  <RadioGroupItem value="pix" id="pix" />
                  <Label htmlFor="pix" className="flex items-center gap-2 text-base font-normal cursor-pointer">
                    <QrCode className="h-5 w-5" /> Pix
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {paymentMethod === 'creditCard' && (
              <div className="space-y-4 animate-in fade-in-0 slide-in-from-top-2 duration-300">
                <div className="grid gap-2">
                  <Label htmlFor="cardNumber">Número do Cartão</Label>
                  <Input id="cardNumber" placeholder="XXXX XXXX XXXX XXXX" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="expiryDate">Validade</Label>
                    <Input id="expiryDate" placeholder="MM/AA" required />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input id="cvv" placeholder="XXX" required />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="cardName">Nome no Cartão</Label>
                  <Input id="cardName" placeholder="Nome Completo" required />
                </div>
              </div>
            )}

            {paymentMethod === 'pix' && (
              <div className="space-y-4 text-center animate-in fade-in-0 slide-in-from-top-2 duration-300">
                <p className="text-gray-600">
                  Ao clicar em "Concluir Pagamento", um código Pix será gerado para você.
                  Você terá um tempo limitado para escanear o QR Code ou copiar o código e realizar o pagamento.
                </p>
                <div className="flex items-center justify-center text-green-600 font-semibold gap-2">
                  <CheckCircle className="h-5 w-5" /> Pagamento instantâneo e seguro.
                </div>
              </div>
            )}

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? 'Processando...' : 'Concluir Pagamento'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentPage;
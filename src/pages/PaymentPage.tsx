"use client";

import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { showError, showSuccess } from '@/utils/toast';
import { CreditCard, QrCode, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formatCurrency = (value: number) => {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};

const PaymentPage = () => {
  const [paymentMethod, setPaymentMethod] = useState('creditCard');
  const [loading, setLoading] = useState(false);
  const [installments, setInstallments] = useState('1');
  const navigate = useNavigate();
  const location = useLocation();
  const { planId = 'professional', billingCycle = 'annual' } = (location.state || {}) as { planId?: string, billingCycle?: string };
  const { user } = useAuth();

  console.log("PaymentPage: planId from state:", planId, "billingCycle from state:", billingCycle);

  const { totalPrice, planTitle, cycleText } = useMemo(() => {
    const prices = {
      essencial: 127,
      professional: 147,
      premium: 347,
    };
    const titles = {
      essencial: 'Plano Essencial',
      professional: 'Plano Profissional',
      premium: 'Plano Premium',
    };
    const planKey = planId as keyof typeof prices;
    const monthlyPrice = prices[planKey] || prices.professional;
    const planTitle = titles[planKey] || titles.professional;
    let totalPrice = 0;
    let cycleText = '';

    if (billingCycle === 'annual') {
      totalPrice = monthlyPrice * 12;
      cycleText = 'Anual';
    } else {
      totalPrice = Math.round(monthlyPrice * 1.25);
      cycleText = 'Mensal';
    }
    return { totalPrice, planTitle, cycleText };
  }, [planId, billingCycle]);

  const installmentOptions = useMemo(() => {
    const options = [];
    for (let i = 1; i <= 12; i++) {
      const installmentValue = formatCurrency(totalPrice / i);
      options.push(
        <SelectItem key={i} value={String(i)}>
          {i}x de {installmentValue}
        </SelectItem>
      );
    }
    return options;
  }, [totalPrice]);

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simula o processamento do pagamento

    if (user) {
      console.log("PaymentPage: User object BEFORE update:", user);
      console.log("PaymentPage: Attempting to update user metadata with planId:", planId);
      const { data: updatedUserData, error: updateError } = await supabase.auth.updateUser({
        data: {
          payment_status: 'paid',
          plan_id: planId // Adiciona o planId ao user_metadata
        }
      });

      if (updateError) {
        console.error("PaymentPage: Error updating user metadata:", updateError.message);
        showError(`Erro ao atualizar status de pagamento: ${updateError.message}`); // Mensagem de erro traduzida
        setLoading(false);
        return;
      }
      console.log("PaymentPage: User metadata update successful. Updated user data:", updatedUserData);
    } else {
      console.warn("PaymentPage: No user found to update metadata.");
    }
    
    setLoading(false);
    showSuccess("Pagamento simulado com sucesso! Redirecionando para o dashboard.");
    navigate('/dashboard');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Finalizar Pagamento</CardTitle>
          <CardDescription>
            Você está adquirindo o <span className="font-semibold">{planTitle} ({cycleText})</span>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 p-4 rounded-lg mb-6 text-center">
            <p className="text-sm text-gray-600">Valor Total</p>
            <p className="text-3xl font-bold">{formatCurrency(totalPrice)}</p>
          </div>
          <form onSubmit={handlePaymentSubmit} className="space-y-6">
            <div className="space-y-4">
              <Label className="text-base">Método de Pagamento</Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="grid gap-2">
                  <Label htmlFor="installments">Parcelas</Label>
                  <Select value={installments} onValueChange={setInstallments}>
                    <SelectTrigger id="installments">
                      <SelectValue placeholder="Selecione o número de parcelas" />
                    </SelectTrigger>
                    <SelectContent>{installmentOptions}</SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {paymentMethod === 'pix' && (
              <div className="space-y-4 text-center animate-in fade-in-0 slide-in-from-top-2 duration-300">
                <p className="text-gray-600">
                  Ao clicar em "Concluir Pagamento", um QR Code será gerado para você.
                </p>
                <div className="flex items-center justify-center text-green-600 font-semibold gap-2">
                  <CheckCircle className="h-5 w-5" /> Pagamento instantâneo e seguro.
                </div>
              </div>
            )}

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? 'Processando...' : `Pagar ${formatCurrency(totalPrice)}`}
            </Button>
            <Button type="button" variant="outline" className="w-full mt-2" onClick={() => navigate('/#planos')} disabled={loading}>
              Selecionar Outro Plano
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentPage;
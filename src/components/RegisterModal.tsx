"use client";

import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabaseClient";
import { showError, showSuccess } from "@/utils/toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff } from 'lucide-react';
import InputMask from 'react-input-mask';
import { getTranslatedErrorMessage } from '@/utils/errorTranslations';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'; // Importar Dialog components

const registerFormSchema = z.object({
  fullName: z.string().min(1, { message: "Nome completo é obrigatório." }),
  companyName: z.string().optional(),
  email: z.string().email({ message: "Por favor, insira um e-mail válido." }),
  whatsapp: z.string()
    .transform((val) => val.replace(/\D/g, ''))
    .refine((val) => val.length === 11, {
      message: "O número de WhatsApp deve ter 11 dígitos (DDD + 9XXXX-XXXX)."
    })
    .refine((val) => /^\d+$/.test(val), {
      message: "O número de WhatsApp deve conter apenas dígitos."
    }),
  password: z.string().min(8, { message: "A senha deve ter pelo menos 8 caracteres." }),
  confirmPassword: z.string(),
  howDidYouHear: z.string().min(1, { message: "Por favor, selecione uma opção." }),
  hasCoupon: z.boolean().default(false).optional(),
  couponCode: z.string().optional(),
  termsAccepted: z.boolean().refine(val => val === true, {
    message: "Você deve concordar com os Termos de Uso e Política de Privacidade.",
  }),
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlanId?: string;
  selectedBillingCycle?: 'monthly' | 'annual';
  onOpenLoginModal: () => void;
}

const RegisterModal = ({ isOpen, onClose, selectedPlanId, selectedBillingCycle, onOpenLoginModal }: RegisterModalProps) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch, control } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      fullName: "",
      companyName: "",
      email: "",
      whatsapp: "",
      password: "",
      confirmPassword: "",
      howDidYouHear: "",
      hasCoupon: false,
      couponCode: "",
      termsAccepted: false,
    },
  });

  const hasCouponValue = watch('hasCoupon');
  const termsAcceptedValue = watch('termsAccepted');

  useEffect(() => {
    if (isOpen) {
      console.log("RegisterModal opened. Props received:");
      console.log("  selectedPlanId:", selectedPlanId);
      console.log("  selectedBillingCycle:", selectedBillingCycle);
    }
  }, [isOpen, selectedPlanId, selectedBillingCycle]);

  const onSubmit = async (data: RegisterFormValues) => {
    if (data.password !== data.confirmPassword) {
      showError("As senhas não coincidem.");
      return;
    }
    if (!data.termsAccepted) {
      showError("Você deve concordar com os Termos de Uso e Política de Privacidade.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.fullName,
          company_name: data.companyName,
          whatsapp: data.whatsapp,
          how_did_you_hear: data.howDidYouHear,
          has_coupon: data.hasCoupon,
          coupon_code: data.couponCode,
          payment_status: 'pending',
        },
      },
    });

    if (error) {
      showError(getTranslatedErrorMessage(error.message));
    } else {
      showSuccess('Cadastro realizado com sucesso! Redirecionando para o pagamento...');
      reset();
      onClose();
      if (selectedPlanId && selectedBillingCycle) {
        console.log("RegisterModal: Navigating to /payment with state:", { planId: selectedPlanId, billingCycle: selectedBillingCycle });
        navigate('/payment', { state: { planId: selectedPlanId, billingCycle: selectedBillingCycle } });
      } else {
        console.log("RegisterModal: No plan selected, navigating to /upgrade.");
        navigate('/upgrade');
      }
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] flex flex-col max-h-[90vh] p-0"> {/* Adicionado flex flex-col e p-0 */}
        <DialogHeader className="p-6 pb-4"> {/* Adicionado padding ao cabeçalho */}
          <DialogTitle className="text-2xl text-center">Criar conta</DialogTitle>
          <DialogDescription className="text-center">
            Você está muito perto de dar um passo importante na profissionalização dos seus serviços. Não deixe para depois!
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6"> {/* Esta div será a área de rolagem */}
          <form onSubmit={handleSubmit(onSubmit)} className="mt-0 space-y-4"> {/* Removido mt-6, adicionado mt-0 */}
            <div className="grid gap-2">
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input
                id="fullName"
                placeholder="Seu Nome Completo"
                {...register('fullName')}
              />
              {errors.fullName && <p className="text-sm text-red-500">{errors.fullName.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="companyName">Nome da sua Empresa (opcional)</Label>
              <Input
                id="companyName"
                placeholder="Nome da Empresa"
                {...register('companyName')}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                {...register('email')}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Controller
                name="whatsapp"
                control={control}
                render={({ field }) => (
                  <InputMask
                    mask="(99) 9.9999-9999"
                    maskChar="_"
                    value={field.value}
                    onChange={(e) => {
                      field.onChange(e.target.value.replace(/\D/g, ''));
                    }}
                    onBlur={field.onBlur}
                  >
                    {(inputProps: any) => (
                      <Input
                        {...inputProps}
                        id="whatsapp"
                        type="tel"
                        placeholder="(XX) X.XXXX-XXXX"
                        className={errors.whatsapp ? "border-red-500" : ""}
                      />
                    )}
                  </InputMask>
              )}
            />
            {errors.whatsapp && <p className="text-sm text-red-500">{errors.whatsapp.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="********"
                {...register('password')}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword((prev) => !prev)}
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500">Deve ter pelo menos 8 caracteres.</p>
            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="********"
                {...register('confirmPassword')}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                disabled={loading}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-500" />
                )}
              </Button>
            </div>
            {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="howDidYouHear">Como nos conheceu?</Label>
            <Select onValueChange={(value) => setValue('howDidYouHear', value)} defaultValue="">
              <SelectTrigger id="howDidYouHear">
                <SelectValue placeholder="Escolha uma opção" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="google">Google</SelectItem>
                <SelectItem value="social_media">Redes Sociais</SelectItem>
                <SelectItem value="friend_referral">Indicação de Amigo</SelectItem>
                <SelectItem value="event">Evento</SelectItem>
                <SelectItem value="other">Outro</SelectItem>
              </SelectContent>
            </Select>
            {errors.howDidYouHear && <p className="text-sm text-red-500">{errors.howDidYouHear.message}</p>}
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasCoupon"
              checked={hasCouponValue}
              onCheckedChange={(checked) => setValue('hasCoupon', checked as boolean)}
            />
            <Label htmlFor="hasCoupon" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Tenho um cupom
            </Label>
          </div>
          
          {hasCouponValue && (
            <div className="grid gap-2 animate-in fade-in-0 slide-in-from-top-2 duration-300">
              <Input
                id="couponCode"
                placeholder="inserir cupom de desconto"
                {...register('couponCode')}
              />
            </div>
          )}

          <div className="flex items-start space-x-2">
            <Checkbox
              id="termsAccepted"
              checked={termsAcceptedValue}
              onCheckedChange={(checked) => setValue('termsAccepted', checked as boolean)}
            />
            <div className="grid gap-1.5 leading-none">
              <Label htmlFor="termsAccepted" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Ao clicar em “Criar conta”, você concorda com nossos{' '}
                <Link to="/terms-of-use" target="_blank" rel="noopener noreferrer" className="underline text-blue-600 hover:text-blue-700">
                  Termos de Uso
                </Link>{' '}
                e{' '}
                <Link to="/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline text-blue-600 hover:text-blue-700">
                  Política de Privacidade
                </Link>
                .
              </Label>
              {errors.termsAccepted && <p className="text-sm text-red-500">{errors.termsAccepted.message}</p>}
            </div>
          </div>
          </form>
        </div>
        <DialogFooter className="flex flex-col gap-4 pt-4 px-6"> {/* Adicionado padding horizontal ao rodapé */}
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
            {loading ? 'Criando Conta...' : 'Criar Conta'}
          </Button>
          <div className="mt-4 text-center text-sm">
            Já tem cadastro?{' '}
            <Link to="#" onClick={() => { onClose(); onOpenLoginModal(); }} className="underline text-blue-600 hover:text-blue-700">
              Entre com sua conta
            </Link>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterModal;
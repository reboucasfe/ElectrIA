"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabaseClient';
import { showError, showSuccess } from '@/utils/toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff } from 'lucide-react';

const registerSchema = z.object({
  fullName: z.string().min(1, { message: "Nome completo é obrigatório." }),
  companyName: z.string().optional(),
  email: z.string().email({ message: "Por favor, insira um e-mail válido." }),
  whatsapp: z.string().regex(/^\+?[1-9]\d{1,14}$/, { message: "Número de WhatsApp inválido. Use o formato internacional (ex: +5511999999999)." }).optional().or(z.literal('')),
  password: z.string().min(8, { message: "A senha deve ter pelo menos 8 caracteres." }),
  confirmPassword: z.string(),
  howDidYouHear: z.string().min(1, { message: "Por favor, selecione uma opção." }),
  hasCoupon: z.boolean().default(false),
  couponCode: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem.",
  path: ["confirmPassword"],
}).refine((data) => !data.hasCoupon || (data.hasCoupon && data.couponCode && data.couponCode.length > 0), {
  message: "Por favor, insira o código do cupom.",
  path: ["couponCode"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

interface RegisterDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const RegisterDialog: React.FC<RegisterDialogProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      companyName: '',
      email: '',
      whatsapp: '',
      password: '',
      confirmPassword: '',
      howDidYouHear: '',
      hasCoupon: false,
      couponCode: '',
    },
  });

  const hasCoupon = watch('hasCoupon');

  const onSubmit = async (data: RegisterFormValues) => {
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
          coupon_code: data.hasCoupon ? data.couponCode : null,
        },
      },
    });

    if (error) {
      showError(error.message);
    } else {
      showSuccess('Cadastro realizado com sucesso! Por favor, verifique seu e-mail para confirmar sua conta.');
      onClose();
      navigate('/login');
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white/80 backdrop-blur-lg max-w-lg p-6 rounded-lg shadow-xl border-none">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Criar Conta</DialogTitle>
          <DialogDescription className="text-center text-gray-600 mt-2">
            Você está muito perto de dar um passo importante na profissionalização dos seus serviços. Não deixe para depois!
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="grid gap-2">
            <Label htmlFor="fullName">Nome Completo</Label>
            <Input id="fullName" placeholder="Seu Nome Completo" {...register('fullName')} />
            {errors.fullName && <p className="text-sm text-red-500">{errors.fullName.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="companyName">Nome da sua Empresa (opcional)</Label>
            <Input id="companyName" placeholder="Nome da Empresa" {...register('companyName')} />
            {errors.companyName && <p className="text-sm text-red-500">{errors.companyName.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="seu@email.com" {...register('email')} />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="whatsapp">WhatsApp</Label>
            <Input id="whatsapp" placeholder="+5511999999999" {...register('whatsapp')} />
            {errors.whatsapp && <p className="text-sm text-red-500">{errors.whatsapp.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Senha</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
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
                placeholder="••••••••"
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
            <Select onValueChange={(value) => setValue('howDidYouHear', value)} {...register('howDidYouHear')}>
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
          <div className="flex items-center space-x-2 mt-4">
            <Checkbox
              id="hasCoupon"
              checked={hasCoupon}
              onCheckedChange={(checked) => setValue('hasCoupon', !!checked)}
            />
            <Label htmlFor="hasCoupon" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Tenho um cupom
            </Label>
          </div>
          {hasCoupon && (
            <div className="grid gap-2 mt-2">
              <Label htmlFor="couponCode">Código do Cupom</Label>
              <Input id="couponCode" placeholder="Seu código de cupom" {...register('couponCode')} />
              {errors.couponCode && <p className="text-sm text-red-500">{errors.couponCode.message}</p>}
            </div>
          )}
          <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterDialog;
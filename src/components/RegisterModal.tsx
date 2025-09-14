"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabaseClient";
import { showError, showSuccess } from "@/utils/toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { cn } from "@/lib/utils";

const registerFormSchema = z.object({
  fullName: z.string().min(1, { message: "Nome completo é obrigatório." }),
  companyName: z.string().optional(),
  email: z.string().email({ message: "Por favor, insira um e-mail válido." }),
  whatsapp: z.string().min(10, { message: "WhatsApp é obrigatório e deve ter pelo menos 10 dígitos." }),
  password: z.string().min(8, { message: "A senha deve ter pelo menos 8 caracteres." }),
  confirmPassword: z.string(),
  howDidYouHear: z.string().min(1, { message: "Por favor, selecione uma opção." }),
  hasCoupon: z.boolean().default(false).optional(),
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  trigger?: React.ReactNode;
}

const RegisterModal = ({ isOpen, onClose, trigger }: RegisterModalProps) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<RegisterFormValues>({
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
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    if (data.password !== data.confirmPassword) {
      showError("As senhas não coincidem.");
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
        },
      },
    });

    if (error) {
      showError(error.message);
    } else {
      showSuccess('Cadastro realizado com sucesso! Por favor, verifique seu e-mail para confirmar sua conta.');
      reset();
      onClose();
      navigate('/login'); // Optionally navigate to login after successful registration
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-sm", // Transparent overlay
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
      )}>
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl font-bold">Criar conta</DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Você está muito perto de dar um passo importante na profissionalização dos seus serviços. Não deixe para depois!
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
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
                placeholder="seu@email.com"
                {...register('email')}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                type="tel"
                placeholder="(XX) XXXXX-XXXX"
                {...register('whatsapp')}
              />
              {errors.whatsapp && <p className="text-sm text-red-500">{errors.whatsapp.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                {...register('password')}
              />
              <p className="text-xs text-gray-500">Deve ter pelo menos 8 caracteres.</p>
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="********"
                {...register('confirmPassword')}
              />
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
              <Checkbox id="hasCoupon" {...register('hasCoupon')} />
              <Label htmlFor="hasCoupon" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Tenho um cupom
              </Label>
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? 'Criando Conta...' : 'Criar Conta'}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterModal;
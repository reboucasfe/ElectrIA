"use client";

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showError, showSuccess } from '@/utils/toast';
import { FcGoogle } from 'react-icons/fc'; // Importado FcGoogle para o ícone colorido
import { Eye, EyeOff } from 'lucide-react';

interface LoginFormContentProps {
  onClose?: () => void; // Para fechar o modal após o login
  onOpenRegisterModal?: (planId?: string, billingCycle?: 'monthly' | 'annual') => void; // Para abrir o modal de registro
}

const LoginFormContent = ({ onClose, onOpenRegisterModal }: LoginFormContentProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      showError(error.message);
    } else {
      showSuccess('Login realizado com sucesso!');
      onClose?.(); // Fecha o modal se estiver em um
      navigate('/dashboard');
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/dashboard',
      },
    });

    if (error) {
      showError(error.message);
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      showError('Por favor, insira seu e-mail para redefinir a senha.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/update-password',
    });

    if (error) {
      showError(error.message);
    } else {
      showSuccess('Verifique seu e-mail para o link de redefinição de senha!');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleLogin}>
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <Button
              variant="link"
              type="button"
              onClick={handleForgotPassword}
              className="ml-auto inline-block text-sm text-blue-600 hover:text-blue-700"
              disabled={loading}
            >
              Esqueceu a senha?
            </Button>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
        </div>
        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
          {loading ? 'Entrando...' : 'Login'}
        </Button>
      </div>
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">Ou</span>
        </div>
      </div>
      <Button
        variant="outline"
        className="w-full flex items-center gap-2"
        onClick={handleGoogleLogin}
        disabled={loading}
      >
        <FcGoogle className="h-4 w-4" /> Entrar com Google
      </Button>
      <div className="mt-4 text-center text-sm">
        Não tem uma conta?{' '}
        <Link to="#" onClick={() => { onClose?.(); onOpenRegisterModal?.(); }} className="underline">
          Cadastre-se
        </Link>
      </div>
    </form>
  );
};

export default LoginFormContent;
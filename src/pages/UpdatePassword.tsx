import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showError, showSuccess } from '@/utils/toast';

const UpdatePassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      showError('As senhas não coincidem.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      showError(`Erro ao atualizar senha: ${error.message}`); // Mensagem de erro traduzida
    } else {
      showSuccess('Sua senha foi atualizada com sucesso! Você já pode fazer login.');
      navigate('/login');
    }
    setLoading(false);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Redefinir Senha</CardTitle>
        <CardDescription>Crie uma nova senha para sua conta.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpdatePassword}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="password">Nova Senha</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
              <Input
                id="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? 'Atualizando...' : 'Atualizar Senha'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default UpdatePassword;
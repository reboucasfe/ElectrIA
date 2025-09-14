import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabaseClient';
import { showError, showSuccess } from '@/utils/toast';
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const profileSchema = z.object({
  fullName: z.string().min(3, { message: "O nome completo deve ter pelo menos 3 caracteres." }),
  avatarUrl: z.string().url({ message: "Por favor, insira uma URL de imagem válida." }).or(z.literal('')),
  companyName: z.string().optional(),
  whatsapp: z.string().min(10, { message: "WhatsApp é obrigatório e deve ter pelo menos 10 dígitos." }),
  howDidYouHear: z.string().min(1, { message: "Por favor, selecione uma opção." }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.user_metadata?.full_name || '',
      avatarUrl: user?.user_metadata?.avatar_url || '',
      companyName: user?.user_metadata?.company_name || '',
      whatsapp: user?.user_metadata?.whatsapp || '',
      howDidYouHear: user?.user_metadata?.how_did_you_hear || '',
    },
  });

  const avatarUrlValue = watch('avatarUrl');

  const getInitials = (email: string | undefined) => {
    if (!email) return 'U';
    const name = user?.user_metadata?.full_name;
    if (name) {
      const parts = name.split(' ');
      if (parts.length > 1) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  const onSubmit = async (data: ProfileFormValues) => {
    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      data: {
        full_name: data.fullName,
        avatar_url: data.avatarUrl,
        company_name: data.companyName,
        whatsapp: data.whatsapp,
        how_did_you_hear: data.howDidYouHear,
      }
    });

    if (error) {
      showError(error.message);
    } else {
      showSuccess("Perfil atualizado com sucesso!");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8">
       <h1 className="text-3xl font-bold">Perfil</h1>
      <Card>
        <CardHeader>
          <CardTitle>Informações Pessoais</CardTitle>
          <CardDescription>Atualize seu nome e foto de perfil.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={avatarUrlValue || user?.user_metadata?.avatar_url} alt="User avatar" />
                <AvatarFallback>{getInitials(user?.email)}</AvatarFallback>
              </Avatar>
              <div className="w-full space-y-2">
                <Label htmlFor="avatarUrl">URL da Foto de Perfil</Label>
                <Input
                  id="avatarUrl"
                  placeholder="https://exemplo.com/sua-foto.png"
                  {...register('avatarUrl')}
                />
                {errors.avatarUrl && <p className="text-sm text-red-500">{errors.avatarUrl.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input
                id="fullName"
                placeholder="Seu Nome Completo"
                {...register('fullName')}
              />
              {errors.fullName && <p className="text-sm text-red-500">{errors.fullName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName">Nome da sua Empresa (opcional)</Label>
              <Input
                id="companyName"
                placeholder="Nome da Empresa"
                {...register('companyName')}
              />
              {errors.companyName && <p className="text-sm text-red-500">{errors.companyName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                type="tel"
                placeholder="(XX) XXXXX-XXXX"
                {...register('whatsapp')}
              />
              {errors.whatsapp && <p className="text-sm text-red-500">{errors.whatsapp.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="howDidYouHear">Como nos conheceu?</Label>
              <Select onValueChange={(value) => setValue('howDidYouHear', value)} defaultValue={user?.user_metadata?.how_did_you_hear || ''}>
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

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="cursor-not-allowed bg-gray-100"
              />
            </div>
            
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
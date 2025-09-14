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
import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload } from 'lucide-react';
import InputMask from 'react-input-mask'; // Importar InputMask

// Esquema de validação para o formulário de perfil
const profileSchema = z.object({
  fullName: z.string().min(3, { message: "O nome completo deve ter pelo menos 3 caracteres." }),
  companyName: z.string().optional(),
  whatsapp: z.string()
    .transform((val) => val.replace(/\D/g, '')) // Remove non-digits
    .refine((val) => val.length === 11, { // Validate raw length for 11 digits (DDD + 9XXXX-XXXX)
      message: "O número de WhatsApp deve ter 11 dígitos (DDD + 9XXXX-XXXX)."
    })
    .refine((val) => /^\d+$/.test(val), { // Ensure it's only digits after transform
      message: "O número de WhatsApp deve conter apenas dígitos."
    }),
  howDidYouHear: z.string().min(1, { message: "Por favor, selecione uma opção." }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.user_metadata?.avatar_url || null);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.user_metadata?.full_name || '',
      companyName: user?.user_metadata?.company_name || '',
      whatsapp: user?.user_metadata?.whatsapp || '',
      howDidYouHear: user?.user_metadata?.how_did_you_hear || '',
    },
  });

  // Efeito para limpar a URL do objeto quando a prévia do avatar muda ou o componente é desmontado
  useEffect(() => {
    return () => {
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
      const ALLOWED_TYPES = ['image/jpeg', 'image/png'];

      if (!ALLOWED_TYPES.includes(file.type)) {
        showError("Apenas arquivos JPG e PNG são permitidos.");
        setSelectedFile(null);
        setAvatarPreview(user?.user_metadata?.avatar_url || null);
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        showError("O tamanho da imagem não pode exceder 5MB.");
        setSelectedFile(null);
        setAvatarPreview(user?.user_metadata?.avatar_url || null);
        return;
      }

      setSelectedFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    } else {
      setSelectedFile(null);
      setAvatarPreview(user?.user_metadata?.avatar_url || null);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    setLoading(true);

    let newAvatarUrl = user?.user_metadata?.avatar_url || null;

    if (selectedFile && user) {
      const fileExtension = selectedFile.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExtension}`; // Caminho único para o arquivo
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars') // Nome do seu bucket no Supabase Storage
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: true, // Sobrescreve se o arquivo já existir
        });

      if (uploadError) {
        showError(`Erro ao fazer upload da imagem: ${uploadError.message}`);
        setLoading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      if (publicUrlData) {
        newAvatarUrl = publicUrlData.publicUrl;
      }
    }

    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        full_name: data.fullName,
        avatar_url: newAvatarUrl, // Atualiza com a nova URL da imagem
        company_name: data.companyName,
        whatsapp: data.whatsapp,
        how_did_you_hear: data.howDidYouHear,
      }
    });

    if (updateError) {
      showError(updateError.message);
    } else {
      showSuccess("Perfil atualizado com sucesso!");
      // O AuthContext deve capturar a mudança via onAuthStateChange
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
                <AvatarImage src={avatarPreview || user?.user_metadata?.avatar_url || undefined} alt="User avatar" />
                <AvatarFallback>{getInitials(user?.email)}</AvatarFallback>
              </Avatar>
              <div className="w-full space-y-2">
                <Label htmlFor="avatarFile">Foto de Perfil</Label>
                <div className="relative">
                  <Input
                    id="avatarFile"
                    type="file"
                    accept="image/jpeg, image/png"
                    onChange={handleFileChange}
                    disabled={loading}
                    className="pr-10" // Adiciona padding à direita para o ícone
                  />
                  <Upload className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
                <p className="text-xs text-gray-500">Apenas JPG/PNG, máximo 5MB.</p>
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
              <InputMask
                mask="(99) 9.9999-9999"
                maskChar="_"
                value={register('whatsapp').value} // Use o valor do react-hook-form
                onChange={register('whatsapp').onChange} // Use o onChange do react-hook-form
                onBlur={register('whatsapp').onBlur} // Use o onBlur do react-hook-form
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
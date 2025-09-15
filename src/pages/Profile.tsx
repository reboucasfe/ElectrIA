import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm, Controller } from 'react-hook-form';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Upload } from 'lucide-react';
import InputMask from 'react-input-mask';
import { getTranslatedErrorMessage } from '@/utils/errorTranslations'; // Importação adicionada

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
  // Novos campos para Dados da Empresa
  cnpj: z.string()
    .transform((val) => val.replace(/\D/g, '')) // Remove non-digits
    .refine((val) => val.length === 14 || val.length === 0, { // CNPJ must be 14 digits or empty
      message: "O CNPJ deve ter 14 dígitos ou ser deixado em branco."
    })
    .optional(),
  bankName: z.string().optional(),
  bankAccount: z.string().optional(),
  bankAgency: z.string().optional(),
  pixKey: z.string().optional(),
  acceptedPaymentMethods: z.array(z.string()).optional(), // Array de strings para métodos de pagamento
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.user_metadata?.avatar_url || null);

  const { register, handleSubmit, formState: { errors }, setValue, control } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.user_metadata?.full_name || '',
      companyName: user?.user_metadata?.company_name || '',
      whatsapp: user?.user_metadata?.whatsapp || '',
      howDidYouHear: user?.user_metadata?.how_did_you_hear || '',
      // Valores padrão para os novos campos
      cnpj: user?.user_metadata?.cnpj || '',
      bankName: user?.user_metadata?.bank_name || '',
      bankAccount: user?.user_metadata?.bank_account || '',
      bankAgency: user?.user_metadata?.bank_agency || '',
      pixKey: user?.user_metadata?.pix_key || '',
      acceptedPaymentMethods: user?.user_metadata?.accepted_payment_methods || [],
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
        showError(getTranslatedErrorMessage(uploadError.message)); // Usando a função de tradução
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
        // Novos campos para Dados da Empresa
        cnpj: data.cnpj,
        bank_name: data.bankName,
        bank_account: data.bankAccount,
        bank_agency: data.bankAgency,
        pix_key: data.pixKey,
        accepted_payment_methods: data.acceptedPaymentMethods,
      }
    });

    if (updateError) {
      showError(getTranslatedErrorMessage(updateError.message)); // Usando a função de tradução
    } else {
      showSuccess("Perfil atualizado com sucesso!");
      // O AuthContext deve capturar a mudança via onAuthStateChange
    }
    setLoading(false);
  };

  return (
    <div className="space-y-8">
       <h1 className="text-3xl font-bold">Perfil</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6"> {/* Formulário único */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>Atualize seu nome e foto de perfil.</CardDescription>
          </CardHeader>
          <CardContent>
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
                    className="pr-10"
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
          </CardContent>
        </Card>

        {/* Nova Seção: Dados da Empresa */}
        <Card>
          <CardHeader>
            <CardTitle>Dados da Empresa</CardTitle>
            <CardDescription>Informações da sua empresa para uso em propostas e pagamentos.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ (Opcional)</Label>
              <Controller
                name="cnpj"
                control={control}
                render={({ field }) => (
                  <InputMask
                    mask="99.999.999/9999-99"
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
                        id="cnpj"
                        type="text"
                        placeholder="XX.XXX.XXX/XXXX-XX"
                        className={errors.cnpj ? "border-red-500" : ""}
                      />
                    )}
                  </InputMask>
                )}
              />
              {errors.cnpj && <p className="text-sm text-red-500">{errors.cnpj.message}</p>}
            </div>

            <div className="space-y-4 mt-6"> {/* Adicionado mt-6 para espaçamento */}
              <h3 className="text-lg font-semibold">Dados Bancários para Pagamento</h3>
              <div className="space-y-2">
                <Label htmlFor="bankName">Nome do Banco</Label>
                <Input id="bankName" placeholder="Ex: Banco do Brasil" {...register('bankName')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bankAgency">Agência</Label>
                  <Input id="bankAgency" placeholder="Ex: 0001" {...register('bankAgency')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankAccount">Conta</Label>
                  <Input id="bankAccount" placeholder="Ex: 12345-6" {...register('bankAccount')} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pixKey">Chave Pix</Label>
                <Input id="pixKey" placeholder="Ex: seuemail@email.com ou 11999999999" {...register('pixKey')} />
              </div>
            </div>

            <div className="space-y-4 mt-6"> {/* Adicionado mt-6 para espaçamento */}
              <h3 className="text-lg font-semibold">Meios de Pagamento Aceitos</h3>
              <Controller
                name="acceptedPaymentMethods"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {['Cartão de Crédito', 'Boleto Bancário', 'Pix', 'Transferência Bancária'].map((method) => (
                      <div key={method} className="flex items-center space-x-2">
                        <Checkbox
                          id={method.replace(/\s/g, '')}
                          checked={field.value?.includes(method)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              field.onChange([...(field.value || []), method]);
                            } else {
                              field.onChange(field.value?.filter((item) => item !== method));
                            }
                          }}
                        />
                        <Label htmlFor={method.replace(/\s/g, '')}>{method}</Label>
                      </div>
                    ))}
                  </div>
                )}
              />
            </div>
          </CardContent>
        </Card>
        
        <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
          {loading ? 'Salvando...' : 'Salvar Alterações'}
        </Button>
      </form>
    </div>
  );
};

export default Profile;
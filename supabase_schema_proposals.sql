CREATE TABLE public.proposals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  client_name text NOT NULL,
  client_email text,
  client_phone text,
  proposal_title text NOT NULL,
  proposal_description text,
  selected_services jsonb NOT NULL, -- Armazena o array de serviços como JSONB
  notes text,
  payment_methods text[] NOT NULL, -- Armazena o array de métodos de pagamento
  validity_days integer NOT NULL,
  status text DEFAULT 'pending' NOT NULL, -- Ex: 'pending', 'sent', 'accepted', 'rejected'
  sent_at timestamp with time zone,
  accepted_at timestamp with time zone
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

-- Política para usuários autenticados visualizarem suas próprias propostas
CREATE POLICY "Users can view their own proposals" ON public.proposals
  FOR SELECT USING (auth.uid() = user_id);

-- Política para usuários autenticados criarem propostas
CREATE POLICY "Users can create proposals" ON public.proposals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política para usuários autenticados atualizarem suas próprias propostas
CREATE POLICY "Users can update their own proposals" ON public.proposals
  FOR UPDATE USING (auth.uid() = user_id);

-- Política para usuários autenticados deletarem suas próprias propostas
CREATE POLICY "Users can delete their own proposals" ON public.proposals
  FOR DELETE USING (auth.uid() = user_id);
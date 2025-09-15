-- Cria a tabela para armazenar o histórico de revisões das propostas
CREATE TABLE IF NOT EXISTS public.proposal_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposal_id UUID NOT NULL REFERENCES public.proposals(id) ON DELETE CASCADE,
    revision_number INT NOT NULL DEFAULT 0,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    changes JSONB
);

-- Ativa a Segurança a Nível de Linha (RLS) para a tabela de revisões
ALTER TABLE public.proposal_revisions ENABLE ROW LEVEL SECURITY;

-- Política: Permite que usuários vejam apenas as suas próprias revisões
CREATE POLICY "Allow users to view their own proposal revisions"
ON public.proposal_revisions
FOR SELECT
USING (auth.uid() = user_id);

-- Política: Permite que usuários insiram apenas as suas próprias revisões
CREATE POLICY "Allow users to insert their own proposal revisions"
ON public.proposal_revisions
FOR INSERT
WITH CHECK (auth.uid() = user_id);
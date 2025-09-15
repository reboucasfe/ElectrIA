ALTER TABLE public.proposal_revisions
ADD COLUMN change_type TEXT DEFAULT 'content_revision';

-- Opcional: Atualiza as linhas existentes para 'content_revision' se elas foram criadas antes desta coluna existir
UPDATE public.proposal_revisions
SET change_type = 'content_revision'
WHERE change_type IS NULL;

-- Opcional: Adiciona uma restrição de verificação se apenas tipos específicos são permitidos
ALTER TABLE public.proposal_revisions
ADD CONSTRAINT chk_change_type CHECK (change_type IN ('content_revision', 'status_change'));
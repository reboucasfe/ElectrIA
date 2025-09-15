ALTER TABLE public.proposals
ADD COLUMN IF NOT EXISTS revision_number INT DEFAULT 0;
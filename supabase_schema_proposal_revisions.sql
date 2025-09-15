CREATE TABLE public.proposal_revisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  proposal_id UUID REFERENCES public.proposals(id) ON DELETE CASCADE NOT NULL,
  revision_number INT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  changes JSONB, -- Stores a summary/diff of changes
  CONSTRAINT unique_proposal_revision UNIQUE (proposal_id, revision_number)
);

ALTER TABLE public.proposal_revisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own proposal revisions."
ON public.proposal_revisions FOR SELECT
USING (auth.uid() = (SELECT user_id FROM public.proposals WHERE id = proposal_id));

CREATE POLICY "Users can insert their own proposal revisions."
ON public.proposal_revisions FOR INSERT
WITH CHECK (auth.uid() = (SELECT user_id FROM public.proposals WHERE id = proposal_id));
CREATE TABLE public.proposals (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid NOT NULL,
    client_name text NOT NULL,
    client_email text,
    client_phone text,
    proposal_title text NOT NULL,
    proposal_description text,
    selected_services jsonb NOT NULL,
    notes text,
    payment_methods jsonb NOT NULL,
    validity_days integer DEFAULT 7 NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    pdf_generated_at timestamp with time zone,
    sent_at timestamp with time zone,
    CONSTRAINT proposals_pkey PRIMARY KEY (id),
    CONSTRAINT proposals_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
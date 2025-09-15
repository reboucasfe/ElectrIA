-- Permite que usuários autenticados vejam apenas suas próprias propostas
CREATE POLICY "Allow authenticated users to view their own proposals"
ON public.proposals FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Permite que usuários autenticados criem propostas para si mesmos
CREATE POLICY "Allow authenticated users to create proposals for themselves"
ON public.proposals FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Permite que usuários autenticados atualizem suas próprias propostas
CREATE POLICY "Allow authenticated users to update their own proposals"
ON public.proposals FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Permite que usuários autenticados deletem suas próprias propostas
CREATE POLICY "Allow authenticated users to delete their own proposals"
ON public.proposals FOR DELETE TO authenticated USING (auth.uid() = user_id);
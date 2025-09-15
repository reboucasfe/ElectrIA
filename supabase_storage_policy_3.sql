CREATE POLICY "Allow authenticated users to view their own avatars"
ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'avatars' AND auth.uid() = owner);
CREATE POLICY "Allow authenticated users to update their own avatars"
    ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars' AND auth.uid()::text = owner);
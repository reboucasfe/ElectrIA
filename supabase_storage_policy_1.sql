CREATE POLICY "Allow authenticated users to upload their own avatars"
    ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = owner);
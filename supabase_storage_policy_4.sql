CREATE POLICY "Allow authenticated users to delete their own avatars"
ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars' AND auth.uid() = owner);
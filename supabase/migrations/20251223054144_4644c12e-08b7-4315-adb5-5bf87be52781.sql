-- Remove the overly permissive anonymous upload policy
DROP POLICY IF EXISTS "Anyone can upload QR images" ON storage.objects;

-- Ensure authenticated users can still upload to their own folder
DROP POLICY IF EXISTS "Authenticated users can upload QR images" ON storage.objects;
CREATE POLICY "Authenticated users can upload QR images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'qr-images' 
  AND auth.uid() IS NOT NULL
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own uploaded images
DROP POLICY IF EXISTS "Users can delete their own QR images" ON storage.objects;
CREATE POLICY "Users can delete their own QR images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'qr-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Keep public read access for the bucket (images need to be viewable)
DROP POLICY IF EXISTS "Anyone can view QR images" ON storage.objects;
CREATE POLICY "Anyone can view QR images"
ON storage.objects FOR SELECT
USING (bucket_id = 'qr-images');
-- Delete RLS policies for the qr-images bucket
DROP POLICY IF EXISTS "Anyone can view QR images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload QR images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own QR images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own QR images" ON storage.objects;

-- Delete the qr-images bucket (it's not being used - QR generation is client-side only)
DELETE FROM storage.buckets WHERE id = 'qr-images';
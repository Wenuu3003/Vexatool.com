-- Create storage bucket for QR code images
INSERT INTO storage.buckets (id, name, public)
VALUES ('qr-images', 'qr-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Public can view QR images"
ON storage.objects FOR SELECT
USING (bucket_id = 'qr-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload QR images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'qr-images');

-- Allow anyone to upload (for non-authenticated users)
CREATE POLICY "Anyone can upload QR images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'qr-images');
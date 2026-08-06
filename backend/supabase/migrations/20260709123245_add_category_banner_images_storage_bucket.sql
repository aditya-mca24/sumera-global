-- Create storage bucket for category and banner images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'category-images',
  'category-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies for category-images bucket
-- Allow public read access
CREATE POLICY "category_images_public_select" ON storage.objects FOR SELECT
  TO public USING (bucket_id = 'category-images');

-- Allow authenticated admins to upload
CREATE POLICY "category_images_admin_insert" ON storage.objects FOR INSERT
  TO authenticated WITH CHECK (
    bucket_id = 'category-images' AND
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

-- Allow authenticated admins to delete
CREATE POLICY "category_images_admin_delete" ON storage.objects FOR DELETE
  TO authenticated USING (
    bucket_id = 'category-images' AND
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

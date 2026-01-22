-- Create a new bucket 'logbooks' for storing aircraft maintenance records
-- We use 'public' = true for simpler MVP access (Forensic Demo), 
-- but in production this should be false with signed URLs.

INSERT INTO storage.buckets (id, name, public)
VALUES ('logbooks', 'logbooks', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow ANONYMOUS uploads (since our demo is publicly accessible)
-- In a real app, strict RLS would be applied to 'authenticated' users.
CREATE POLICY "Allow public uploads"
ON storage.objects FOR INSERT
TO public
WITH CHECK ( bucket_id = 'logbooks' );

-- Policy: Allow public viewing of files
CREATE POLICY "Allow public downloads"
ON storage.objects FOR SELECT
TO public
USING ( bucket_id = 'logbooks' );

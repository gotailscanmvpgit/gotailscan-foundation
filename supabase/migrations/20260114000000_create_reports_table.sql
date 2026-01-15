-- Create reports table
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  tail_number TEXT NOT NULL,
  confidence_score INTEGER NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
  ntsb_data JSONB DEFAULT '{}'::jsonb,
  cadors_data JSONB DEFAULT '{}'::jsonb,
  sdr_data JSONB DEFAULT '{}'::jsonb,
  user_id UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own reports
CREATE POLICY "Users can view own reports" 
ON reports FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Users can insert their own reports (if authenticated)
CREATE POLICY "Users can insert own reports" 
ON reports FOR INSERT 
WITH CHECK (auth.uid() = user_id);

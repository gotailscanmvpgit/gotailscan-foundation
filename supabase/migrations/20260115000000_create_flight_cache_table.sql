CREATE TABLE IF NOT EXISTS flight_cache (
    tail_number TEXT PRIMARY KEY,
    total_hours_12m NUMERIC,
    last_tracked TIMESTAMP WITH TIME ZONE,
    data_source TEXT CHECK (data_source IN ('adsb', 'mlat', 'radar')),
    raw_json JSONB,
    expires_at TIMESTAMP WITH TIME ZONE,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE flight_cache ENABLE ROW LEVEL SECURITY;

-- Policy: Allow read access to authenticated users (or public if needed for the app logic)
CREATE POLICY "Allow public read access" ON flight_cache FOR SELECT USING (true);

-- Policy: Allow service role to manage everything (for Edge Functions)
-- (Implicitly service role has bypass, but good to note)

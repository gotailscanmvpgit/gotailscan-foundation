-- Create a reference table for specific aircraft serial numbers
-- This helps resolve specific Make/Models that have ambiguous or missing data in the main registry
-- e.g. mapping "17280123" -> "CESSNA 172S SKYHAWK"

CREATE TABLE IF NOT EXISTS aircraft_reference (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    serial_number TEXT UNIQUE NOT NULL,
    make_model TEXT NOT NULL,
    manufacturer TEXT,
    type_certificate TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast lookup by serial number
CREATE INDEX IF NOT EXISTS idx_aircraft_reference_serial ON aircraft_reference(serial_number);

-- Enable RLS
ALTER TABLE aircraft_reference ENABLE ROW LEVEL SECURITY;

-- Allow public read access
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'aircraft_reference' 
        AND policyname = 'Allow public read access'
    ) THEN
        CREATE POLICY "Allow public read access" ON aircraft_reference FOR SELECT USING (true);
    END IF;
END $$;

-- Initial Seed Data (from src/utils/makeModelResolver.js)
INSERT INTO aircraft_reference (serial_number, make_model, manufacturer, type_certificate) VALUES
    ('10031', 'CIRRUS SR22T', 'Cirrus Aircraft', 'A00009SC'),
    ('0062', 'CIRRUS SR20', 'Cirrus Aircraft', 'A00009SC'),
    ('17280123', 'CESSNA 172S SKYHAWK', 'Cessna', 'A00003SE'),
    ('17281234', 'CESSNA 172R SKYHAWK', 'Cessna', 'A00003SE'),
    ('18280001', 'CESSNA 182T SKYLANE', 'Cessna', 'A00003SE'),
    ('20608001', 'CESSNA 206H STATIONAIR', 'Cessna', 'A00003SE'),
    ('28-7615078', 'PIPER PA-28-181 ARCHER III', 'Piper Aircraft', 'A00001SE'),
    ('22-8008001', 'PIPER PA-28-180 CHEROKEE', 'Piper Aircraft', 'A00001SE'),
    ('4636001', 'PIPER PA-46-350P MALIBU MIRAGE', 'Piper Aircraft', 'A24CE'),
    ('40.123', 'DIAMOND DA40 STAR', 'Diamond Aircraft', 'A00010AT'),
    ('42.123', 'DIAMOND DA42 TWIN STAR', 'Diamond Aircraft', 'A00010AT'),
    ('TH-2123', 'BEECHCRAFT BONANZA F33A', 'Beechcraft', 'A-777'),
    ('BE-123', 'BEECHCRAFT BARON 58', 'Beechcraft', 'A-1246')
ON CONFLICT (serial_number) DO NOTHING;

CREATE TABLE IF NOT EXISTS manufacturer_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    make_model TEXT NOT NULL,
    manufacturer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_manufacturer_codes_code ON manufacturer_codes(code);

-- Enable RLS
ALTER TABLE manufacturer_codes ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON manufacturer_codes FOR SELECT USING (true);

-- Initial Seed Data from the hardcoded list
INSERT INTO manufacturer_codes (code, make_model, manufacturer) VALUES
    ('2073461', 'CESSNA TTX', 'Cessna'),
    ('2073303', 'CESSNA TURBO 206H STATIONAIR', 'Cessna'),
    ('2072738', 'CESSNA TURBO 182T SKYLANE', 'Cessna'),
    ('2073460', 'CESSNA TTX', 'Cessna'),
    ('2073320', 'CESSNA 400', 'Cessna'),
    ('2073418', 'CESSNA 162 SKYCATCHER', 'Cessna'),
    ('2073450', 'CESSNA CITATION M2', 'Cessna'),
    ('1152914', 'BEECHCRAFT KING AIR E90', 'Beechcraft'),
    ('1152500', 'BEECHCRAFT BONANZA G36', 'Beechcraft'),
    ('2260001', 'CIRRUS SR22', 'Cirrus Design'),
    ('2260020', 'CIRRUS SR22T', 'Cirrus Design'),
    ('05619', 'AEROCOMP COMP AIR 9', 'Aerocomp'),
    ('05620', 'AEROCOMP COMP AIR 7', 'Aerocomp')
ON CONFLICT (code) DO NOTHING;

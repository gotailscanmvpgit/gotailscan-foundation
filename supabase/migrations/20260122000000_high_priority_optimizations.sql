-- ============================================================================
-- GoTailScan Database - High Priority Optimizations
-- Migration: 20260122000000_high_priority_optimizations.sql
-- Purpose: Add critical indexes and Row Level Security policies
-- ============================================================================

-- ============================================================================
-- SECTION 1: Performance Indexes
-- ============================================================================

-- Index for NTSB accidents lookup by tail number (foreign key)
CREATE INDEX IF NOT EXISTS idx_forensic_ntsb_n_number_perf 
ON forensic_ntsb (n_number);

-- Index for NTSB accidents by date (for timeline queries)
CREATE INDEX IF NOT EXISTS idx_forensic_ntsb_event_date 
ON forensic_ntsb (event_date DESC);

-- Index for NTSB accidents by severity (for filtering)
CREATE INDEX IF NOT EXISTS idx_forensic_ntsb_severity 
ON forensic_ntsb (severity);

-- Index for SDR lookup
CREATE INDEX IF NOT EXISTS idx_forensic_sdr_n_number_perf
ON forensic_sdr (n_number);

-- Index for CADORS lookup
CREATE INDEX IF NOT EXISTS idx_forensic_cadors_n_number_perf
ON forensic_cadors (n_number);

-- Create ADS-B Flights table if it doesn't exist (Platform Enhancement)
CREATE TABLE IF NOT EXISTS adsb_flights (
    flight_id SERIAL PRIMARY KEY,
    tail_number VARCHAR NOT NULL,
    flight_date TIMESTAMP WITH TIME ZONE,
    origin VARCHAR,
    destination VARCHAR,
    flight_time INTEGER, -- minutes
    distance NUMERIC,
    altitude_max INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for ADS-B flights by tail number (foreign key)
CREATE INDEX IF NOT EXISTS idx_adsb_flights_tail_number 
ON adsb_flights (tail_number);

-- Index for ADS-B flights by date (for recent flights)
CREATE INDEX IF NOT EXISTS idx_adsb_flights_date 
ON adsb_flights (flight_date DESC);

-- Composite index for tail + date queries (most common pattern)
CREATE INDEX IF NOT EXISTS idx_adsb_flights_tail_date 
ON adsb_flights (tail_number, flight_date DESC);

-- Index for flight cache (existing table)
CREATE INDEX IF NOT EXISTS idx_flight_cache_expires 
ON flight_cache (expires_at);

-- ============================================================================
-- SECTION 2: Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE aircraft_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE forensic_ntsb ENABLE ROW LEVEL SECURITY;
ALTER TABLE forensic_sdr ENABLE ROW LEVEL SECURITY;
ALTER TABLE forensic_cadors ENABLE ROW LEVEL SECURITY;
ALTER TABLE adsb_flights ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Public Read Access Policies
-- ============================================================================

DO $$
BEGIN
    -- aircraft_registry
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'aircraft_registry' AND policyname = 'Public read access to aircraft registry') THEN
        CREATE POLICY "Public read access to aircraft registry" ON aircraft_registry FOR SELECT USING (true);
    END IF;

    -- forensic_ntsb
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'forensic_ntsb' AND policyname = 'Public read access to forensic ntsb') THEN
        CREATE POLICY "Public read access to forensic ntsb" ON forensic_ntsb FOR SELECT USING (true);
    END IF;

    -- forensic_sdr
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'forensic_sdr' AND policyname = 'Public read access to forensic sdr') THEN
        CREATE POLICY "Public read access to forensic sdr" ON forensic_sdr FOR SELECT USING (true);
    END IF;

    -- forensic_cadors
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'forensic_cadors' AND policyname = 'Public read access to forensic cadors') THEN
        CREATE POLICY "Public read access to forensic cadors" ON forensic_cadors FOR SELECT USING (true);
    END IF;
    
    -- adsb_flights
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'adsb_flights' AND policyname = 'Public read access to ADS-B flights') THEN
        CREATE POLICY "Public read access to ADS-B flights" ON adsb_flights FOR SELECT USING (true);
    END IF;
END $$;


-- ============================================================================
-- SECTION 3: Data Validation Constraints
-- ============================================================================

-- Ensure valid tail numbers (Global Format)
-- NOTE: Commented out to avoid migration failure on legacy data. 
-- Please clean data before enabling this constraint.
/*
ALTER TABLE aircraft_registry 
DROP CONSTRAINT IF EXISTS chk_n_number_format;

ALTER TABLE aircraft_registry 
DROP CONSTRAINT IF EXISTS chk_n_number_format;

ALTER TABLE aircraft_registry 
ADD CONSTRAINT chk_n_number_format 
CHECK (n_number ~ '^(N[0-9]{1,5}[A-Z]{0,2}|[A-9]{1,3}-[A-Z0-9]{1,5})$');
*/

-- Ensure event dates are not in the future
ALTER TABLE forensic_ntsb
DROP CONSTRAINT IF EXISTS chk_event_date_valid;

ALTER TABLE forensic_ntsb
ADD CONSTRAINT chk_event_date_valid
CHECK (event_date <= CURRENT_DATE);

-- ============================================================================
-- SECTION 4: Performance Statistics Update
-- ============================================================================

ANALYZE aircraft_registry;
ANALYZE forensic_ntsb;
ANALYZE forensic_sdr;
ANALYZE forensic_cadors;
ANALYZE adsb_flights;

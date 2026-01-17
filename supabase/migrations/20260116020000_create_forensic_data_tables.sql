-- Create tables for SDR and NTSB data
-- These tables will store real historical records for aircraft

-- 1. Service Difficulty Reports (SDR)
CREATE TABLE IF NOT EXISTS forensic_sdr (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    n_number TEXT NOT NULL, -- Format: N12345 (to match our standardized registry search)
    report_date DATE,
    control_number TEXT,
    part_name TEXT,
    description TEXT,
    nature_of_condition TEXT,
    precatory_action TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_forensic_sdr_n_number ON forensic_sdr(n_number);

-- 2. NTSB Safety Records
CREATE TABLE IF NOT EXISTS forensic_ntsb (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    n_number TEXT NOT NULL,
    event_date DATE,
    event_id TEXT,
    event_type TEXT, -- Accident or Incident
    location_city TEXT,
    location_state TEXT,
    aircraft_damage TEXT,
    severity TEXT,
    narrative TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_forensic_ntsb_n_number ON forensic_ntsb(n_number);

-- 3. CADORS (Canadian Occurrences)
CREATE TABLE IF NOT EXISTS forensic_cadors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    n_number TEXT NOT NULL, -- Format: C-FGHI
    occurrence_date DATE,
    cadors_number TEXT,
    region TEXT,
    occurrence_type TEXT,
    incident_category TEXT,
    summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_forensic_cadors_n_number ON forensic_cadors(n_number);

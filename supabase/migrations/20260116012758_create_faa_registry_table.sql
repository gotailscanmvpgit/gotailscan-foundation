-- Create table for FAA Aircraft Registry
-- Based on the official FAA MASTER.txt schema

CREATE TABLE IF NOT EXISTS aircraft_registry (
    n_number TEXT PRIMARY KEY, -- e.g. "12345" (Stored without the 'N' usually)
    serial_number TEXT,
    mfr_mdl_code TEXT,
    eng_mfr_mdl TEXT,
    year_mfr TEXT,
    type_registrant TEXT,
    name TEXT, -- Owner Name
    street TEXT,
    street2 TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    region TEXT,
    county TEXT,
    country TEXT,
    last_action_date TEXT,
    cert_issue_date TEXT,
    certification TEXT,
    type_aircraft TEXT,
    type_engine TEXT,
    status_code TEXT,
    mode_s_code TEXT,
    fract_owner TEXT,
    air_worth_date TEXT,
    other_names_1 TEXT,
    other_names_2 TEXT,
    other_names_3 TEXT,
    other_names_4 TEXT,
    other_names_5 TEXT,
    expiration_date TEXT,
    unique_id TEXT,
    kit_mfr TEXT,
    kit_model TEXT,
    mode_s_code_hex TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for searching by N-Number is automatic (Primary Key)
-- Add index for Owner search if needed later
CREATE INDEX IF NOT EXISTS idx_aircraft_registry_name ON aircraft_registry (name);

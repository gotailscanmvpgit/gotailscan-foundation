-- Create Parts Traceability Ledger
-- Stores digital twins of Form 8130-3 (FAA), Form 337 (Major Mods), and TCCA Form One (Canada)

CREATE TABLE IF NOT EXISTS parts_traceability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tail_number TEXT NOT NULL,
    part_name TEXT NOT NULL,
    serial_number TEXT,
    part_number TEXT,
    
    -- Regulatory Info
    jurisdiction TEXT NOT NULL, -- 'FAA' or 'TCCA'
    form_type TEXT NOT NULL, -- '8130-3', '337', 'TCCA One', 'STC', 'PDA'
    form_id TEXT, -- The document control number
    
    -- Event Info
    install_date DATE,
    technician_id TEXT, -- Optional relation to auth.users if Mechanic
    
    -- Verification
    verified_status TEXT DEFAULT 'PENDING', -- 'PENDING', 'VERIFIED', 'REJECTED'
    verification_source TEXT, -- URL to DRS/NAPA
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optimize for Dashboard retrieval
CREATE INDEX IF NOT EXISTS idx_parts_traceability_tail ON parts_traceability(tail_number);
CREATE INDEX IF NOT EXISTS idx_parts_traceability_status ON parts_traceability(verified_status);

-- RLS Policies (Enable for production)
-- ALTER TABLE parts_traceability ENABLE ROW LEVEL SECURITY;

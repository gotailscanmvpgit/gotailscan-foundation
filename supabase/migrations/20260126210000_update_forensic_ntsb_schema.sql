-- Add columns to forensic_ntsb for better ghost record identity
ALTER TABLE forensic_ntsb ADD COLUMN IF NOT EXISTS acft_make TEXT;
ALTER TABLE forensic_ntsb ADD COLUMN IF NOT EXISTS acft_model TEXT;
ALTER TABLE forensic_ntsb ADD COLUMN IF NOT EXISTS acft_year INTEGER;

-- Ensure indices exist for performance
CREATE INDEX IF NOT EXISTS idx_forensic_ntsb_n_number ON forensic_ntsb (n_number);
CREATE INDEX IF NOT EXISTS idx_forensic_sdr_n_number ON forensic_sdr (n_number);
CREATE INDEX IF NOT EXISTS idx_forensic_cadors_n_number ON forensic_cadors (n_number);

-- Simplified Optimization Migration for aircraft_registry table
-- This migration adds indexes to prevent query timeouts

-- 1. Add a functional index for uppercase n_number searches
-- This allows case-insensitive searches to use the index efficiently
CREATE INDEX IF NOT EXISTS idx_aircraft_registry_n_number_upper 
ON aircraft_registry (UPPER(n_number));

-- 2. Add index on mfr_mdl_code for faster model lookups
CREATE INDEX IF NOT EXISTS idx_aircraft_registry_mfr_mdl 
ON aircraft_registry (mfr_mdl_code);

-- 3. Add composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_aircraft_registry_search 
ON aircraft_registry (n_number, name, mfr_mdl_code);

-- 4. Update table statistics for better query planning
ANALYZE aircraft_registry;

-- 5. Add a comment explaining the optimization
COMMENT ON INDEX idx_aircraft_registry_n_number_upper IS 
'Functional index for fast case-insensitive autocomplete searches on tail numbers';

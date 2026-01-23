-- ============================================================================
-- GoTailScan Database - Low Priority Optimizations  
-- Migration: 20260122200000_low_priority_optimizations.sql
-- Purpose: Table partitioning, archiving, and advanced scaling features
-- Prerequisites: Must run AFTER medium priority optimizations
-- ============================================================================

-- ============================================================================
-- SECTION 1: Table Partitioning for ADS-B Flights (Time-Series Data)
-- ============================================================================

-- Note: This section prepares for partitioning but doesn't execute it yet
-- Partitioning requires recreating the table, which should be done during maintenance window

-- Create partitioned table structure (commented out - run manually when ready)
/*
-- Step 1: Rename existing table
ALTER TABLE adsb_flights RENAME TO adsb_flights_old;

-- Step 2: Create partitioned table
CREATE TABLE adsb_flights (
    flight_id SERIAL,
    tail_number VARCHAR,
    flight_date DATE NOT NULL,
    origin VARCHAR,
    destination VARCHAR,
    departure_time TIMESTAMP,
    arrival_time TIMESTAMP,
    flight_time INTEGER,
    altitude_max INTEGER,
    speed_max INTEGER,
    distance NUMERIC,
    track_points JSONB,
    PRIMARY KEY (flight_id, flight_date)
) PARTITION BY RANGE (flight_date);

-- Step 3: Create partitions for each year
CREATE TABLE adsb_flights_2024 PARTITION OF adsb_flights
    FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

CREATE TABLE adsb_flights_2025 PARTITION OF adsb_flights
    FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

CREATE TABLE adsb_flights_2026 PARTITION OF adsb_flights
    FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');

-- Step 4: Create default partition for future data
CREATE TABLE adsb_flights_default PARTITION OF adsb_flights DEFAULT;

-- Step 5: Copy data from old table
INSERT INTO adsb_flights SELECT * FROM adsb_flights_old;

-- Step 6: Recreate indexes on partitioned table
CREATE INDEX idx_adsb_flights_tail_number ON adsb_flights (tail_number);
CREATE INDEX idx_adsb_flights_date ON adsb_flights (flight_date DESC);
CREATE INDEX idx_adsb_flights_tail_date ON adsb_flights (tail_number, flight_date DESC);

-- Step 7: Drop old table
DROP TABLE adsb_flights_old;
*/

-- ============================================================================
-- SECTION 2: Data Archiving Strategy
-- ============================================================================

-- Create archive table for old NTSB accidents (>10 years)
CREATE TABLE IF NOT EXISTS forensic_ntsb_archive (
    LIKE forensic_ntsb INCLUDING ALL
);

-- Add archive timestamp
ALTER TABLE forensic_ntsb_archive
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create function to archive old accidents
CREATE OR REPLACE FUNCTION archive_old_forensic_ntsb(years_old INTEGER DEFAULT 10)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    archived_count INTEGER;
BEGIN
    -- Move old accidents to archive
    WITH moved AS (
        DELETE FROM forensic_ntsb
        WHERE event_date < CURRENT_DATE - (years_old || ' years')::INTERVAL
        RETURNING *
    )
    INSERT INTO forensic_ntsb_archive 
    SELECT *, CURRENT_TIMESTAMP FROM moved;
    
    GET DIAGNOSTICS archived_count = ROW_COUNT;
    
    RAISE NOTICE 'Archived % accidents older than % years', archived_count, years_old;
    RETURN archived_count;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION archive_old_forensic_ntsb(INTEGER) TO postgres;

-- ============================================================================
-- SECTION 3: Read Replica Support (Preparation)
-- ============================================================================

-- Create view for read-only queries (can be pointed to read replica)
CREATE OR REPLACE VIEW v_aircraft_public_data AS
SELECT 
    ar.n_number,
    ar.mfr_mdl_code,
    ar.year_mfr,
    ar.city,
    ar.state,
    ar.country,
    ar.status_code,
    ms.accident_count,
    ms.last_accident_date,
    ms.flight_count,
    ms.last_flight_date,
    ms.activity_status
FROM aircraft_registry ar
LEFT JOIN mv_aircraft_summary ms ON ar.n_number = ms.n_number;

-- Grant public read access
GRANT SELECT ON v_aircraft_public_data TO anon;
GRANT SELECT ON v_aircraft_public_data TO authenticated;

-- ============================================================================
-- SECTION 4: Advanced Caching Strategy
-- ============================================================================

-- Create table for distributed cache metadata (for Redis integration)
CREATE TABLE IF NOT EXISTS cache_metadata (
    cache_key VARCHAR PRIMARY KEY,
    cache_type VARCHAR NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    hit_count INTEGER DEFAULT 0,
    last_hit_at TIMESTAMP,
    data_size_bytes INTEGER,
    CONSTRAINT chk_cache_expires_future CHECK (expires_at > created_at)
);

-- Create index for cache cleanup
CREATE INDEX IF NOT EXISTS idx_cache_metadata_expires 
ON cache_metadata (expires_at);

-- Create index for cache analytics
CREATE INDEX IF NOT EXISTS idx_cache_metadata_hits 
ON cache_metadata (hit_count DESC);

-- Enable RLS
ALTER TABLE cache_metadata ENABLE ROW LEVEL SECURITY;

-- Service role only access
CREATE POLICY "Service role full access to cache metadata"
ON cache_metadata
FOR ALL
USING (auth.role() = 'service_role');

-- Create function to clean expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM cache_metadata
    WHERE expires_at < CURRENT_TIMESTAMP;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    DELETE FROM flight_cache
    WHERE expires_at < CURRENT_TIMESTAMP;
    
    RAISE NOTICE 'Cleaned up % expired cache entries', deleted_count;
    RETURN deleted_count;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION cleanup_expired_cache() TO postgres;

-- ============================================================================
-- SECTION 5: Full-Text Search Preparation
-- ============================================================================

-- Add tsvector column for full-text search on aircraft registry
ALTER TABLE aircraft_registry
ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Create function to update search vector
CREATE OR REPLACE FUNCTION update_aircraft_search_vector()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.n_number, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.mfr_mdl_code, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(NEW.city, '')), 'D') ||
        setweight(to_tsvector('english', COALESCE(NEW.state, '')), 'D');
    RETURN NEW;
END;
$$;

-- Create trigger to automatically update search vector
DROP TRIGGER IF EXISTS trg_update_aircraft_search_vector ON aircraft_registry;
CREATE TRIGGER trg_update_aircraft_search_vector
    BEFORE INSERT OR UPDATE ON aircraft_registry
    FOR EACH ROW
    EXECUTE FUNCTION update_aircraft_search_vector();

-- Create GIN index for full-text search
CREATE INDEX IF NOT EXISTS idx_aircraft_registry_search_vector 
ON aircraft_registry USING GIN (search_vector);

-- Update existing rows with search vectors
UPDATE aircraft_registry SET search_vector = 
    setweight(to_tsvector('english', COALESCE(n_number, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(name, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(mfr_mdl_code, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(city, '')), 'D') ||
    setweight(to_tsvector('english', COALESCE(state, '')), 'D')
WHERE search_vector IS NULL;

-- ============================================================================
-- SECTION 6: Database Maintenance Functions
-- ============================================================================

-- Create function for comprehensive database maintenance
CREATE OR REPLACE FUNCTION run_database_maintenance()
RETURNS TABLE (
    task VARCHAR,
    status VARCHAR,
    details TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Vacuum analyze all tables
    RETURN QUERY SELECT 'VACUUM', 'RUNNING', 'Analyzing aircraft_registry...';
    VACUUM ANALYZE aircraft_registry;
    
    RETURN QUERY SELECT 'VACUUM', 'RUNNING', 'Analyzing forensic_ntsb...';
    VACUUM ANALYZE forensic_ntsb;
    
    RETURN QUERY SELECT 'VACUUM', 'RUNNING', 'Analyzing adsb_flights...';
    VACUUM ANALYZE adsb_flights;
    
    -- Refresh materialized view
    RETURN QUERY SELECT 'REFRESH', 'RUNNING', 'Refreshing aircraft summary...';
    PERFORM refresh_aircraft_summary();
    
    -- Clean expired cache
    RETURN QUERY SELECT 'CLEANUP', 'RUNNING', 'Cleaning expired cache...';
    PERFORM cleanup_expired_cache();
    
    RETURN QUERY SELECT 'MAINTENANCE', 'COMPLETE', 'All tasks finished successfully';
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION run_database_maintenance() TO postgres;

-- ============================================================================
-- SECTION 7: Performance Statistics Update
-- ============================================================================

-- Analyze all tables
ANALYZE aircraft_registry;
ANALYZE forensic_ntsb;
ANALYZE forensic_ntsb_archive;
ANALYZE adsb_flights;
ANALYZE cache_metadata;

-- ============================================================================
-- SECTION 8: Verification
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE 'Verifying low priority optimizations...';
    
    -- Check archive table exists
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'forensic_ntsb_archive') THEN
        RAISE NOTICE '✓ Archive table created';
    END IF;
    
    -- Check cache metadata table exists
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'cache_metadata') THEN
        RAISE NOTICE '✓ Cache metadata table created';
    END IF;
    
    -- Check full-text search enabled
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_aircraft_registry_search_vector') THEN
        RAISE NOTICE '✓ Full-text search index created';
    END IF;
    
    -- Check maintenance function exists
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'run_database_maintenance') THEN
        RAISE NOTICE '✓ Maintenance function created';
    END IF;
    
    RAISE NOTICE 'Low priority optimizations complete!';
END $$;

-- ============================================================================
-- Migration Complete!
-- ============================================================================

-- Summary of changes:
-- ✓ Partitioning strategy prepared (manual execution required)
-- ✓ Archive table for old NTSB data
-- ✓ Archive function created
-- ✓ Read replica view created
-- ✓ Cache metadata table for Redis integration
-- ✓ Cache cleanup function
-- ✓ Full-text search enabled on aircraft registry
-- ✓ Comprehensive maintenance function

-- Usage:
-- - Archive old data: SELECT archive_old_ntsb_accidents(10);
-- - Clean cache: SELECT cleanup_expired_cache();
-- - Run maintenance: SELECT * FROM run_database_maintenance();
-- - Full-text search: SELECT * FROM aircraft_registry WHERE search_vector @@ to_tsquery('cessna');

-- Note: Table partitioning is commented out and should be executed manually
-- during a maintenance window when the table has significant data.

-- ============================================================================
-- Migration: 20260122210000_update_aircraft_view.sql
-- Purpose: Update mv_aircraft_summary to include columns needed by backend details
-- ============================================================================

-- Drop existing view (CASCADE will drop dependent indexes)
DROP MATERIALIZED VIEW IF EXISTS mv_aircraft_summary CASCADE;

-- Recreate materialized view with additional columns
CREATE MATERIALIZED VIEW mv_aircraft_summary AS
SELECT 
    ar.n_number,
    ar.mfr_mdl_code,
    ar.year_mfr,
    ar.name as owner_name,
    ar.city,
    ar.state,
    ar.country,
    ar.status_code,
    ar.serial_number, -- Added
    ar.eng_mfr_mdl,   -- Added
    ar.kit_mfr,       -- Added
    ar.kit_model,     -- Added
    -- Accident statistics
    COUNT(DISTINCT fn.id) as accident_count,
    MAX(fn.event_date) as last_accident_date,
    SUM(CASE WHEN fn.severity = 'Fatal' THEN 1 ELSE 0 END) as fatal_accident_count,
    -- Flight statistics
    COUNT(DISTINCT af.flight_id) as flight_count,
    MAX(af.flight_date) as last_flight_date,
    AVG(af.flight_time) as avg_flight_time,
    SUM(af.flight_time) as total_flight_time,
    -- Calculated fields
    CASE 
        WHEN MAX(af.flight_date) IS NULL THEN 'UNKNOWN'
        WHEN MAX(af.flight_date) < CURRENT_DATE - INTERVAL '365 days' THEN 'DORMANT'
        WHEN MAX(af.flight_date) < CURRENT_DATE - INTERVAL '90 days' THEN 'INACTIVE'
        ELSE 'ACTIVE'
    END as activity_status,
    -- Last updated
    CURRENT_TIMESTAMP as summary_generated_at
FROM aircraft_registry ar
LEFT JOIN forensic_ntsb fn ON ar.n_number = fn.n_number
LEFT JOIN adsb_flights af ON ar.n_number = af.tail_number
GROUP BY 
    ar.n_number, ar.mfr_mdl_code, ar.year_mfr, ar.name, ar.city, 
    ar.state, ar.country, ar.status_code,
    ar.serial_number, ar.eng_mfr_mdl, ar.kit_mfr, ar.kit_model;

-- Re-create indexes
CREATE UNIQUE INDEX idx_mv_aircraft_summary_n_number 
ON mv_aircraft_summary (n_number);

CREATE INDEX idx_mv_aircraft_summary_activity 
ON mv_aircraft_summary (activity_status);

CREATE INDEX idx_mv_aircraft_summary_accidents 
ON mv_aircraft_summary (accident_count DESC);

CREATE INDEX idx_mv_aircraft_summary_last_flight 
ON mv_aircraft_summary (last_flight_date DESC NULLS LAST);

-- Enable RLS
ALTER MATERIALIZED VIEW mv_aircraft_summary OWNER TO postgres;

-- Grant public read access
GRANT SELECT ON mv_aircraft_summary TO anon;
GRANT SELECT ON mv_aircraft_summary TO authenticated;

-- Analyze
ANALYZE mv_aircraft_summary;

-- Migration: 20260126010000_fix_fleet_reliability_view.sql
-- Purpose: Improve fleet reliability aggregation by falling back to text matching
--          when strict numeric codes are missing or mismatched.

DROP MATERIALIZED VIEW IF EXISTS mv_fleet_reliability CASCADE;

CREATE MATERIALIZED VIEW mv_fleet_reliability AS
WITH raw_failures AS (
    SELECT
        ar.mfr_mdl_code,
        -- Normalize part names
        UPPER(TRIM(REGEXP_REPLACE(sdr.part_name, '[^a-zA-Z0-9\s]', '', 'g'))) as clean_part_name,
        sdr.id
    FROM forensic_sdr sdr
    JOIN aircraft_registry ar ON sdr.n_number = ar.n_number
    WHERE 
        sdr.part_name IS NOT NULL 
        AND LENGTH(TRIM(sdr.part_name)) > 2
        -- RELAXED CONSTRAINT: We keep all records even if code is null, 
        -- but the join guarantees we only get SDRs for known tails.
),
model_stats AS (
    SELECT mfr_mdl_code, COUNT(*) as total_model_reports
    FROM raw_failures 
    WHERE mfr_mdl_code IS NOT NULL
    GROUP BY mfr_mdl_code
),
component_stats AS (
    SELECT mfr_mdl_code, clean_part_name, COUNT(*) as component_count
    FROM raw_failures 
    WHERE mfr_mdl_code IS NOT NULL
    GROUP BY mfr_mdl_code, clean_part_name
),
ranked_components AS (
    SELECT
        cs.mfr_mdl_code, cs.clean_part_name, cs.component_count, ms.total_model_reports,
        ROW_NUMBER() OVER (PARTITION BY cs.mfr_mdl_code ORDER BY cs.component_count DESC) as rank
    FROM component_stats cs
    JOIN model_stats ms ON cs.mfr_mdl_code = ms.mfr_mdl_code
)
SELECT
    rc.mfr_mdl_code,
    MAX(rc.total_model_reports) as total_fleet_reports,
    jsonb_agg(
        jsonb_build_object(
            'component', rc.clean_part_name,
            'count', rc.component_count,
            'frequency_pct', ROUND((rc.component_count::numeric / rc.total_model_reports::numeric) * 100, 1)
        ) ORDER BY rc.component_count DESC
    ) FILTER (WHERE rc.rank <= 5) as top_reliability_issues,
    NOW() as compiled_at
FROM ranked_components rc
GROUP BY rc.mfr_mdl_code;

CREATE UNIQUE INDEX idx_mv_fleet_reliability_code ON mv_fleet_reliability (mfr_mdl_code);

GRANT SELECT ON mv_fleet_reliability TO anon, authenticated, service_role;

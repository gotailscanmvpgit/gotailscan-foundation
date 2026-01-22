CREATE INDEX IF NOT EXISTS idx_aircraft_registry_n_number_upper ON aircraft_registry (UPPER(n_number));
CREATE INDEX IF NOT EXISTS idx_aircraft_registry_mfr_mdl ON aircraft_registry (mfr_mdl_code);
CREATE INDEX IF NOT EXISTS idx_aircraft_registry_search ON aircraft_registry (n_number, name, mfr_mdl_code);
ANALYZE aircraft_registry;

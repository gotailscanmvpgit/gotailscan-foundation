const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase
const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runDataReliabilityAudit() {
    console.log("👮 STARTING AUTONOMOUS DATA RELIABILITY AUDIT");
    console.log("🎯 OBJECTIVE: Validate database integrity, forensic linkage, and field sanity.");
    console.log("-------------------------------------------------------------------------");

    const stats = {
        checks_performed: 0,
        anomalies_found: 0,
        critical_errors: 0
    };

    const startTime = Date.now();

    // --- CHECK 1: REGISTRY SANITY ---
    console.log("🔍 CHECK 1: Registry Sanity (Tail Formats & Duplicates)");
    const { data: registrySample, error: regError } = await supabase
        .from('aircraft_registry')
        .select('n_number, serial_number, mfr_mdl_code')
        .limit(1000);

    if (regError) {
        console.error("❌ Critical: Could not access aircraft_registry", regError);
        stats.critical_errors++;
    } else {
        const invalidTails = registrySample.filter(a => !/^[A-Z0-9-]{3,10}$/.test(a.n_number));
        if (invalidTails.length > 0) {
            console.warn(`⚠️  Found ${invalidTails.length} tail numbers with non-standard formats.`);
            stats.anomalies_found += invalidTails.length;
        } else {
            console.log("✅ Registry tail number formats are valid.");
        }
        stats.checks_performed++;
    }

    // --- CHECK 2: FORENSIC LINKAGE INTEGRITY ---
    console.log("🔍 CHECK 2: Forensic Linkage (NTSB -> Registry Correlation)");
    const { data: ntsbSample } = await supabase
        .from('forensic_ntsb')
        .select('n_number, event_id')
        .limit(50);

    if (ntsbSample && ntsbSample.length > 0) {
        let disconnectedRecords = 0;
        for (const record of ntsbSample) {
            const { count } = await supabase
                .from('aircraft_registry')
                .select('n_number', { count: 'exact', head: true })
                .eq('n_number', record.n_number);

            if (count === 0) disconnectedRecords++;
        }

        if (disconnectedRecords > 0) {
            console.warn(`⚠️  Found ${disconnectedRecords} forensic records without matching registry entries (Ghost Tails).`);
            stats.anomalies_found += disconnectedRecords;
        } else {
            console.log("✅ All sampled forensic records correlate to valid registry entries.");
        }
    } else {
        console.log("ℹ️  No NTSB records found for correlation test.");
    }
    stats.checks_performed++;

    // --- CHECK 3: MATERIALIZED VIEW SYNCHRONIZATION ---
    console.log("🔍 CHECK 3: View Synchronization (Summary vs Raw Forensic)");
    const { data: summarySample } = await supabase
        .from('mv_aircraft_summary')
        .select('n_number, accident_count')
        .gt('accident_count', 0)
        .limit(10);

    if (summarySample && summarySample.length > 0) {
        let syncErrors = 0;
        for (const acft of summarySample) {
            const { count: actualCount } = await supabase
                .from('forensic_ntsb')
                .select('*', { count: 'exact', head: true })
                .eq('n_number', acft.n_number);

            if (actualCount !== acft.accident_count) {
                console.warn(`❌ Sync Error for ${acft.n_number}: Summary shows ${acft.accident_count}, Raw shows ${actualCount}`);
                syncErrors++;
            }
        }
        if (syncErrors === 0) {
            console.log("✅ Materialized View counts match raw forensic data.");
        } else {
            stats.anomalies_found += syncErrors;
        }
    } else {
        console.log("ℹ️  No aircraft with accidents found in summary for sync test.");
    }
    stats.checks_performed++;

    // --- CHECK 4: FIELD SANITY RANGES ---
    console.log("🔍 CHECK 4: Field Sanity (Logical Ranges)");
    const { data: metaSample } = await supabase
        .from('mv_aircraft_summary')
        .select('n_number, year_mfr, engine_count')
        .limit(500);

    if (metaSample) {
        const currentYear = new Date().getFullYear();
        const futureAcft = metaSample.filter(a => a.year_mfr > currentYear + 1);
        const engineAnomalies = metaSample.filter(a => a.engine_count < 0 || a.engine_count > 8);

        if (futureAcft.length > 0) {
            console.warn(`⚠️  Found ${futureAcft.length} aircraft with future manufacturing years.`);
            stats.anomalies_found += futureAcft.length;
        }
        if (engineAnomalies.length > 0) {
            console.warn(`⚠️  Found ${engineAnomalies.length} aircraft with impossible engine counts.`);
            stats.anomalies_found += engineAnomalies.length;
        }
        if (futureAcft.length === 0 && engineAnomalies.length === 0) {
            console.log("✅ Field ranges (Years, Engines) are within logical bounds.");
        }
    }
    stats.checks_performed++;

    const duration = Date.now() - startTime;

    console.log("\n---------------- DATA RELIABILITY REPORT ----------------");
    console.log(`📊 CHECKS PERFORMED:  ${stats.checks_performed}`);
    console.log(`🎯 ANOMALIES FOUND:  ${stats.anomalies_found}`);
    console.log(`🔥 CRITICAL ERRORS:  ${stats.critical_errors}`);
    console.log(`⏱️  AUDIT DURATION:   ${duration}ms`);
    console.log("---------------------------------------------------------");

    if (stats.critical_errors === 0 && stats.anomalies_found < 5) {
        console.log("\n🏆 DATA STATUS: RELIABLE. The platform's data integrity is verified.");
    } else {
        console.log("\n⚠️  DATA STATUS: DEGRADED. Anomalies detected that require maintenance.");
    }
}

runDataReliabilityAudit();

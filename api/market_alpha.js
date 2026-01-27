import { createClient } from '@supabase/supabase-js';

// Lazy initialization of Supabase client
let supabaseInstance = null;

const getSupabase = () => {
    if (supabaseInstance) return supabaseInstance;

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        throw new Error("Missing Supabase Variables");
    }

    supabaseInstance = createClient(supabaseUrl, supabaseKey);
    return supabaseInstance;
}

export default async (req, res) => {
    // 1. Method Validation
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return res.status(405).end('Method Not Allowed');
    }

    // 2. Input Validation
    const { tail_number, hours } = req.query; // Optional 'hours' user input
    if (!tail_number) {
        return res.status(400).json({ error: 'Missing tail_number parameter' });
    }

    const cleanTail = tail_number.toUpperCase().trim();
    let supabase;

    try {
        supabase = getSupabase();
    } catch (envError) {
        console.error('[MarketAlpha] Setup Error:', envError.message);
        return res.status(500).json({ error: 'Server Configuration Error' });
    }

    try {
        console.log(`[MarketAlpha] Calculating for ${cleanTail}...`);

        // 3. Fetch Aircraft Data & Forensic History
        const [registryRes, sdrRes, ntsbRes] = await Promise.all([
            supabase.from('aircraft_registry').select('*').eq('n_number', cleanTail).maybeSingle(),
            supabase.from('forensic_sdr').select('*').eq('n_number', cleanTail),
            supabase.from('forensic_ntsb').select('*').eq('n_number', cleanTail)
        ]);

        const aircraft = registryRes.data || {};
        const sdrCount = sdrRes.data?.length || 0;
        const ntsbCount = ntsbRes.data?.length || 0;

        // 4. Calculate Scores
        const currentYear = new Date().getFullYear();
        const yearMfr = parseInt(aircraft.year_mfr) || (currentYear - 20); // Default 20yo
        const age = currentYear - yearMfr;

        // A. Equipment Value (0-50 pts)
        // Newer planes or premium models get higher base scores
        let equipmentScore = 25; // Average baseline

        // Age Bonus/Malus
        if (age < 5) equipmentScore += 20;       // Like new
        else if (age < 15) equipmentScore += 10; // Modern
        else if (age > 40) equipmentScore -= 10; // Vintage/Legacy

        // Model Bonus (Heuristic)
        const model = (aircraft.mfr_mdl_code || aircraft.kit_model || '').toUpperCase();
        if (model.includes('CIRRUS') || model.includes('PILATUS') || model.includes('G1000')) {
            equipmentScore += 10;
        }
        equipmentScore = Math.min(50, Math.max(0, equipmentScore));

        // B. Low Hours / Usage Score (0-50 pts)
        // Formula: Compare estimated Average Fleet Hours vs Actual (or Estimated)
        // Avg Utilization: 150 hrs/year
        const avgFleetHours = age * 150;
        const actualHours = hours ? parseInt(hours) : avgFleetHours; // Use actual if provided, else neutral

        let hourScore = 25; // Neutral
        if (actualHours < avgFleetHours * 0.7) hourScore = 45; // Very Low Hours (Gem)
        else if (actualHours < avgFleetHours * 0.9) hourScore = 35; // Low Hours
        else if (actualHours > avgFleetHours * 1.5) hourScore = 10; // High Time
        else if (actualHours > avgFleetHours * 2.0) hourScore = 0; // School Plane / Usage Abuse

        // C. Incident Penalty (Deduction)
        let penalty = 0;

        // NTSB Accidents are heavy penalties
        if (ntsbCount > 0) penalty += 40;

        // SDRs are minor penalties unless frequent
        if (sdrCount > 0) penalty += (sdrCount * 5);

        // Keyword Risks (from Risk Radar logic re-check)
        // We'll perform a quick check for 'Engine Failure' in SDR descriptions if available
        const criticalKeywords = ['ENGINE FAILURE', 'STRUCTURAL'];
        const hasCriticalSDR = sdrRes.data?.some(r =>
            criticalKeywords.some(kw => (r.description || '').toUpperCase().includes(kw))
        );
        if (hasCriticalSDR) penalty += 25;


        // 5. Final Calculation
        // Score = (Equipment + Hours) - Penalty
        let totalScore = (equipmentScore + hourScore) - penalty;

        // Clamp to 1-100
        totalScore = Math.max(1, Math.min(100, totalScore));

        // 6. Verdict
        let verdict = "FAIR MARKET VALUE";
        let color = "blue";

        if (totalScore >= 80) {
            verdict = "HIDDEN GEM";
            color = "green";
        } else if (totalScore <= 40) {
            verdict = "MONEY PIT";
            color = "red";
        } else if (totalScore <= 60) {
            verdict = "USE CAUTION";
            color = "orange";
        }

        const responseData = {
            tail_number: cleanTail,
            score: totalScore,
            verdict: verdict,
            color_code: color,
            breakdown: {
                equipment_value: equipmentScore,
                usage_score: hourScore,
                incident_penalty: -penalty,
                details: {
                    age_years: age,
                    estimated_hours: actualHours,
                    accidents_found: ntsbCount,
                    sdr_defects: sdrCount
                }
            },
            calculated_at: new Date().toISOString()
        };

        return res.status(200).json(responseData);

    } catch (err) {
        console.error('[MarketAlpha] Execution Error:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

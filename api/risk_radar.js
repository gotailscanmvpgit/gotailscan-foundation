import { createClient } from '@supabase/supabase-js';

// Lazy initialization of Supabase client to ensure environment variables are loaded
let supabaseInstance = null;

const getSupabase = () => {
    if (supabaseInstance) return supabaseInstance;

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    // Prioritize Service Role Key for backend operations
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

    // Only throw if invoked
    if (!supabaseUrl || !supabaseKey) {
        throw new Error("Missing Supabase Variables in API Environment");
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
    const { tail_number } = req.query;
    if (!tail_number) {
        return res.status(400).json({ error: 'Missing tail_number parameter' });
    }

    const cleanTail = tail_number.toUpperCase().trim();
    let supabase;

    try {
        supabase = getSupabase();
    } catch (envError) {
        console.error('[RiskRadar] Setup Error:', envError.message);
        return res.status(500).json({ error: 'Server Configuration Error' });
    }

    try {
        console.log(`[RiskRadar] Analyzing ${cleanTail}...`);

        // 3. Parallel Fetch from SDR and CADORS
        const [sdrResult, cadorsResult] = await Promise.all([
            supabase.from('forensic_sdr').select('*').eq('n_number', cleanTail),
            supabase.from('forensic_cadors').select('*').eq('n_number', cleanTail)
        ]);

        const sdrData = sdrResult.data || [];
        const cadorsData = cadorsResult.data || [];

        // 4. Keyword Analysis Logic
        const keywords = ['ENGINE FAILURE', 'PROPELLER STRIKE', 'STRUCTURAL'];
        const alerts = [];

        // Check SDRs
        sdrData.forEach(record => {
            const rawText = (record.description || '') + ' ' + (record.part_name || '');
            const text = rawText.toUpperCase();

            keywords.forEach(kw => {
                if (text.includes(kw)) {
                    alerts.push({
                        source: 'SDR',
                        date: record.report_date,
                        match: kw,
                        snippet: (record.description || '').substring(0, 150)
                    });
                }
            });
        });

        // Check CADORS
        cadorsData.forEach(record => {
            const rawText = (record.narrative || '') + ' ' + (record.occurrence_type || '');
            const text = rawText.toUpperCase();

            keywords.forEach(kw => {
                if (text.includes(kw)) {
                    alerts.push({
                        source: 'CADORS',
                        date: record.occurrence_date,
                        match: kw,
                        snippet: (record.narrative || '').substring(0, 150)
                    });
                }
            });
        });

        // 5. Determine Risk Level
        const flightRules = alerts.length > 0 ? 'DANGER_RED' : 'STANDARD_RISK';

        const responseData = {
            tail_number: cleanTail,
            risk_level: flightRules,
            alert_count: alerts.length,
            triggers: alerts,
            analysis_timestamp: new Date().toISOString()
        };

        return res.status(200).json(responseData);

    } catch (err) {
        console.error('[RiskRadar] Execution Error:', err);
        return res.status(500).json({ error: 'Internal Server Error during Risk Analysis' });
    }
};

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // CORS Preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { tail_number } = await req.json()

        if (!tail_number) {
            throw new Error('Tail number is required')
        }

        // Initialize Supabase Client
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        console.log(`[Orchestrator] Scanning ${tail_number}...`)

        // ---------------------------------------------------------
        // 1. DATA AGGREGATION (Real Mode with Fallback)
        // ---------------------------------------------------------

        let aircraft = null;
        let isRealData = false;

        // Deterministic Random Generator (Used for Valuation & Sim fallback)
        const seed = tail_number.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const random = (offset = 0) => {
            const x = Math.sin(seed + offset) * 10000;
            return x - Math.floor(x);
        };

        // Normalize Search Key
        let dbSearchKey = tail_number;
        if (tail_number.startsWith('N')) {
            dbSearchKey = tail_number.substring(1); // Remove 'N' for US queries
        }
        // For 'C-', we keep it as is, matching our TC import strategy.

        // Try to fetch from Real DB
        const { data: realData } = await supabase
            .from('aircraft_registry')
            .select('*')
            .eq('n_number', dbSearchKey)
            .maybeSingle();

        if (realData) {
            console.log(`[Orchestrator] Real data found for ${tail_number}`);
            isRealData = true;
            aircraft = {
                year: parseInt(realData.year_mfr) || 1980,
                make_model: (realData.mfr_mdl_code || realData.kit_mfr || 'Unknown') + ' ' + (realData.eng_mfr_mdl || realData.kit_model || ''),
                serial: realData.serial_number,
                owner: realData.name,
                city: realData.city,
                state: realData.state || realData.province // Handle CA province
            };
        } else if (tail_number.startsWith('C-')) {
            // CANADIAN FALLBACK: LAZY LOAD SCRAPER
            console.log(`[Orchestrator] Canadian tail ${tail_number} not in DB. Invoking Scraper...`);

            try {
                // Call our internal scrape-tc function
                const { data: scrapedData, error: scrapeError } = await supabase.functions.invoke('scrape-tc', {
                    body: { tail_number }
                });

                if (scrapedData && scrapedData.found) {
                    console.log(`[Orchestrator] Scraper found data. Caching...`);
                    isRealData = true;
                    const d = scrapedData.data;

                    // Cache to DB
                    await supabase.from('aircraft_registry').insert(d);

                    aircraft = {
                        year: parseInt(d.year_mfr) || 2000,
                        make_model: `${d.mfr_mdl_code} ${d.eng_mfr_mdl}`,
                        serial: d.serial_number,
                        owner: d.name,
                        city: d.city,
                        state: d.state
                    };
                }
            } catch (err) {
                console.error("Scraper failed:", err);
            }
        }

        // If still no aircraft, fall back to Simulator
        if (!aircraft) {
            console.log(`[Orchestrator] No real data found. Using Simulator.`);
            const years = [1978, 1982, 1995, 2005, 2018, 1965];
            const models = ['CESSNA 172N', 'PIPER PA-28-161', 'BEECH A36', 'CIRRUS SR22', 'MOONEY M20J'];

            aircraft = {
                year: years[Math.floor(random(1) * years.length)],
                make_model: models[Math.floor(random(2) * models.length)],
                serial: `S-${Math.floor(random(3) * 10000)}`,
                owner: 'Simulated Owner LLC'
            };
        }

        // ---------------------------------------------------------
        // 2. MARKET VALUE ALGORITHM
        // ---------------------------------------------------------

        // Base Price based on Model
        const basePrices: Record<string, number> = {
            'CESSNA 172N': 110000,
            'PIPER PA-28-161': 95000,
            'BEECH A36': 350000,
            'CIRRUS SR22': 550000,
            'MOONEY M20J': 165000
        };

        let estimatedValue = basePrices[aircraft.make_model] || 150000;

        // Adjust for Year (Depreciation/Appreciation curve mock)
        const age = new Date().getFullYear() - aircraft.year;
        if (age < 10) estimatedValue *= 1.2; // Newer
        if (age > 40) estimatedValue *= 0.8; // Older

        // Adjust for Random Condition Factor (0.8 to 1.2)
        const conditionFactor = 0.8 + (random(4) * 0.4);
        estimatedValue *= conditionFactor;

        // Round to nearest thousand
        estimatedValue = Math.round(estimatedValue / 1000) * 1000;

        const valuation = {
            estimated_value: estimatedValue,
            currency: 'USD',
            confidence_interval: '±8%',
            market_trend: random(5) > 0.5 ? 'APPRECIATING' : 'STABLE'
        };

        // ---------------------------------------------------------
        // 3. BUILD FORENSIC REPORT (Real Data Queries)
        // ---------------------------------------------------------

        // Try to fetch real forensic records if they exist in our mirrored tables
        const { data: realNTSB } = await supabase.from('forensic_ntsb').select('*').eq('n_number', tail_number);
        const { data: realSDR } = await supabase.from('forensic_sdr').select('*').eq('n_number', tail_number);
        const { data: realCADORS } = await supabase.from('forensic_cadors').select('*').eq('n_number', tail_number);

        const report = {
            tail_number,
            aircraft_details: aircraft,
            valuation: valuation,
            generated_at: new Date().toISOString(),
            forensic_records: {
                ntsb_count: (realNTSB && realNTSB.length > 0) ? realNTSB.length : (tail_number.startsWith('N') ? (random(6) > 0.8 ? 1 : 0) : 0),
                cadors_count: (realCADORS && realCADORS.length > 0) ? realCADORS.length : (tail_number.startsWith('C-') ? (random(20) > 0.7 ? 1 : 0) : 0),
                sdr_count: (realSDR && realSDR.length > 0) ? realSDR.length : (random(7) > 0.6 ? Math.floor(random(8) * 3) + 1 : 0),
                liens_found: random(9) > 0.9,
                // Include real data snippets for the scraper to pick up
                real_ntsb: realNTSB || [],
                real_sdr: realSDR || [],
                real_cadors: realCADORS || []
            }
        };

        return new Response(JSON.stringify(report), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})

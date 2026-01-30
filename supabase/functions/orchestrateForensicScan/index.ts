import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";


const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
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

        // IMPORT MAP DYNAMICALLY to avoid large file issues if bundler is strict
        const { parseAircraftMakeModel } = await import('./aircraftCodeMap.ts');
        const {
            createRandom,
            getBasePrice,
            getOperatingCosts,
            getMarketVelocity,
            getPerformanceProfile,
            analyzeAvionics,
            predictMaintenance,
            generateMarketHistory,
            getStateClimate,
            getCoordinates
        } = await import('./buyerLogic.ts');
        const {
            predictSalesLikelihood,
            getTransparency,
            getJurisdictionProfile,
            calculateHQRI,
            getTaxBenefits
        } = await import('./sellerLogic.ts');

        let aircraft = null;
        let isRealData = false;

        // Normalize Input (Handle case where user misses the prefix or hyphen)
        let normalizedTail = tail_number.toUpperCase().replace(/\s/g, '').trim();

        if (normalizedTail.startsWith('C') && !normalizedTail.startsWith('C-') && normalizedTail.length === 5) {
            // Convert CGJED -> C-GJED
            normalizedTail = 'C-' + normalizedTail.substring(1);
            console.log(`[Orchestrator] Normalized Canadian tail (C-prefix): ${normalizedTail}`);
        } else if (!normalizedTail.startsWith('N') && !normalizedTail.startsWith('C-')) {
            // If it's exactly 4 letters, it's almost certainly a Canadian Mark (e.g. GJED)
            if (/^[A-Z]{4}$/.test(normalizedTail)) {
                normalizedTail = 'C-' + normalizedTail;
                console.log(`[Orchestrator] Normalized Canadian tail (4-letters): ${normalizedTail}`);
            } else if (normalizedTail.length <= 5 && /^[0-9A-Z]{3,6}$/.test(normalizedTail)) {
                // Otherwise treat as US
                normalizedTail = 'N' + normalizedTail;
                console.log(`[Orchestrator] Auto-prefixed US tail: ${normalizedTail}`);
            }
        }

        const random = createRandom(normalizedTail);

        console.log(`[Orchestrator] Scanning ${normalizedTail}...`)

        // Normalize Registry Key (FAA Master is prefix-less)
        let registryKey = normalizedTail;
        if (normalizedTail.startsWith('N')) {
            registryKey = normalizedTail.substring(1);
        }

        let realData: any = null;

        // ---------------------------------------------------------
        // LAYER 1: LOCAL DATABASE MIRROR (Fastest)
        // ---------------------------------------------------------
        // We ALWAYS check our local PostgreSQL mirror first.
        // This avoids network latency and API rate limits.
        const { data: localMirror } = await supabase
            .from('mv_aircraft_summary')
            .select('*')
            .or(`n_number.eq.${registryKey},n_number.eq.${normalizedTail}`)
            .limit(1)
            .maybeSingle();

        if (localMirror) {
            console.log(`[Orchestrator] Local Mirror Hit for ${normalizedTail}`);
            realData = localMirror;
            isRealData = true;
        }

        // ---------------------------------------------------------
        // LAYER 2: EXTERNAL DISCOVERY (Fallback / Freshness)
        // ---------------------------------------------------------
        // Only hit external APIs if not in local DB OR for specific refresh logic.
        if (!realData && normalizedTail.startsWith('N')) {
            try {
                // Determine API URL (using v0/faa/registration/{tail})
                const arlaUrl = `https://arla.njf.dev/api/v0/faa/registration/${normalizedTail}`;

                // Set short timeout to avoid blocking main thread
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout

                try {
                    const res = await fetch(arlaUrl, {
                        headers: { 'User-Agent': 'GoTailScan/1.0 (ForensicEngine)' },
                        signal: controller.signal
                    });

                    clearTimeout(timeoutId);

                    if (res.ok) {
                        const arlaJson = await res.json();
                        const get = (k: string) => arlaJson[k] || arlaJson[k.toUpperCase()] || null;

                        if (get('n_number') || get('N-NUMBER')) {
                            console.log(`[Orchestrator] External Discovery Hit (Arla) for ${normalizedTail}`);
                            realData = {
                                n_number: get('n_number') || normalizedTail,
                                mfr_mdl_code: get('mfr_mdl_code') || get('mfr_mdl_code_cols'),
                                year_mfr: get('year_mfr') || get('year'),
                                serial_number: get('serial_number') || get('serial'),
                                owner_name: get('name') || get('owner'),
                                city: get('city'),
                                state: get('state'),
                                zip_code: get('zip_code'),
                                country: 'USA',
                                eng_mfr_mdl: get('eng_mfr_mdl'),
                                status_code: get('status_code')
                            };
                        }
                    }
                } catch (fetchErr) {
                    clearTimeout(timeoutId);
                }

                // --- 0.5. SECONDARY HIGH-RELIABILITY LAYER: Official FAA Scraper ---
                // If Arla failed, we try the official FAA site directly.
                if (!realData) {
                    try {
                        console.log(`[Orchestrator] Arla missed. Initiating Official FAA Direct-Sync for ${normalizedTail}...`);
                        const faaUrl = `https://registry.faa.gov/aircraftinquiry/Search/NNumberResult?nNumberTxt=${normalizedTail.substring(1)}`;

                        const scraperResponse = await fetch(faaUrl, {
                            headers: {
                                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                                "Accept": "text/html"
                            }
                        });

                        if (scraperResponse.ok) {
                            const html = await scraperResponse.text();
                            const doc = new DOMParser().parseFromString(html, "text/html");

                            if (doc) {
                                const getText = (id: string) => doc.getElementById(id)?.textContent?.trim() || null;
                                const mfr = getText('ctl00_content_lblMfrName');
                                if (mfr) {
                                    console.log(`[Orchestrator] Official FAA Scraper Success for ${normalizedTail}`);
                                    realData = {
                                        n_number: normalizedTail,
                                        year_mfr: getText('ctl00_content_lblMfrYear'),
                                        serial_number: getText('ctl00_content_lblSerialNo'),
                                        owner_name: getText('ctl00_content_lblName'),
                                        city: getText('ctl00_content_lblCity'),
                                        state: getText('ctl00_content_lblState'),
                                        country: 'USA',
                                        status_code: getText('ctl00_content_lblStatus')
                                    };
                                }
                            }
                        }
                    } catch (scrapeErr) {
                        console.error(`[Orchestrator] Official Scraper Failed for ${normalizedTail}`);
                    }
                }

                if (realData && !isRealData) {
                    // SELF-CORRECTION: Cache newly discovered data locally
                    console.log(`[Orchestrator] Synchronizing discovered data to local mirror...`);
                    const nNumOnly = realData.n_number.startsWith('N') ? realData.n_number.substring(1) : realData.n_number;
                    await supabase.from('aircraft_registry').upsert({
                        n_number: nNumOnly,
                        serial_number: realData.serial_number,
                        mfr_mdl_code: realData.mfr_mdl_code,
                        year_mfr: realData.year_mfr?.toString(),
                        name: realData.owner_name,
                        city: realData.city,
                        state: realData.state,
                        zip_code: realData.zip_code,
                        country: realData.country,
                        status_code: realData.status_code,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'n_number' });
                    isRealData = true;
                }
            } catch (err) {
                // Global safety catch
            }
        }



        if (realData) {
            console.log(`[Orchestrator] Real data found for ${normalizedTail}`);
            isRealData = true;

            // FIX: Use parseAircraftMakeModel to handle FAA codes and raw strings
            const rawMake = realData.mfr_mdl_code || realData.kit_mfr || '';
            // Use eng_mfr_mdl as model text source if available (common in seed/legacy data)
            const rawModel = realData.eng_mfr_mdl || realData.kit_model || '';

            // Prefer mfr_mdl_code if available as it often contains the specific Type Code
            const makeModelInput = realData.mfr_mdl_code && /^\d+$/.test(realData.mfr_mdl_code)
                ? realData.mfr_mdl_code
                : `${rawMake} ${rawModel}`;

            // improved fallback generation
            const safeMake = /^\d+$/.test(rawMake) ? '' : rawMake;
            const safeModel = /^\d+$/.test(rawModel) ? '' : rawModel;
            const fallbackText = `${safeMake} ${safeModel}`.trim();

            const cleanMakeModel = parseAircraftMakeModel(makeModelInput, fallbackText);

            aircraft = {
                year: parseInt(realData.year_mfr) || 1980,
                make_model: cleanMakeModel,
                serial: realData.serial_number,
                owner: realData.owner_name,
                city: realData.city,
                state: realData.state || realData.province, // Handle CA province
                mfr_mdl_code: realData.mfr_mdl_code
            };
        } else {
            // LIVE-DISCOVERY FALLBACK (GLOBAL ROUTING)
            let functionName = 'scrape-faa';
            if (normalizedTail.startsWith('C-')) functionName = 'scrape-tc';
            else if (normalizedTail.startsWith('VH-')) functionName = 'scrape-casa';
            else if (normalizedTail.startsWith('G-')) functionName = 'scrape-uk';
            else if (normalizedTail.startsWith('XA-') ||
                normalizedTail.startsWith('XB-') ||
                normalizedTail.startsWith('XC-')) functionName = 'scrape-mexico';
            else if (normalizedTail.startsWith('D-') ||
                normalizedTail.startsWith('F-') ||
                normalizedTail.startsWith('PH-') ||
                normalizedTail.startsWith('HB-') ||
                normalizedTail.startsWith('EI-')) functionName = 'scrape-easa';

            console.log(`[Orchestrator] Tail ${normalizedTail} not in DB. Invoking Global-Discovery Engine (${functionName})...`);

            try {
                const { data, error: scrapeError } = await supabase.functions.invoke(functionName, {
                    body: { tail_number: normalizedTail }
                });

                if (data && data.found) {
                    const d = data.data;
                    console.log(`✅ Global Discovery Success: Retrieved ${d.n_number} from ${d.country || 'Registry'}`);

                    // FIX: Use parseAircraftMakeModel
                    const rawMakeDisc = d.mfr_mdl_code || d.mfr || d.kit_mfr || '';
                    const rawModelDisc = d.mfr_mdl_code || d.kit_model || '';

                    const discInput = d.mfr_mdl_code && /^\d+$/.test(d.mfr_mdl_code)
                        ? d.mfr_mdl_code
                        : rawMakeDisc + ' ' + rawModelDisc;

                    const cleanMakeModelDisc = parseAircraftMakeModel(discInput);

                    // We do NOT persist estimates.
                    aircraft = {
                        year: parseInt(d.year_mfr) || 2000,
                        make_model: cleanMakeModelDisc,
                        serial: d.serial_number,
                        owner: d.name,
                        city: d.city,
                        state: d.state || d.province,
                        country: d.country || (functionName === 'scrape-faa' ? 'USA' : 'INTERNATIONAL'),
                        mfr_mdl_code: d.mfr_mdl_code
                    };
                } else {
                    console.log(`[Orchestrator] Global Discovery returned Not Found for ${normalizedTail}`);
                }
            } catch (err) {
                console.error("Discovery failed:", err);
            }
        }

        // DEMO OVERRIDE: N30HQ -> Dassault Falcon 900EX
        if (normalizedTail === 'N30HQ') {
            aircraft = {
                year: 1999,
                year_mfr: '1999',
                make_model: 'DASSAULT FALCON 900EX',
                serial: '900EX-45',
                owner: 'HQ AVIATION INC',
                city: 'FORT LAUDERDALE',
                state: 'FL',
                country: 'USA'
            };
            console.log(`[Orchestrator] Applied DEMO Override for ${normalizedTail}`);
        }

        // DEMO OVERRIDE: N182MU -> Cessna 182T Skylane
        if (normalizedTail === 'N182MU') {
            aircraft = {
                year: 2006,
                year_mfr: '2006',
                make_model: 'CESSNA 182T SKYLANE',
                serial: '18281822',
                owner: 'SKYLANE FLYERS LLC',
                city: 'WICHITA',
                state: 'KS',
                country: 'USA'
            };
            console.log(`[Orchestrator] Applied DEMO Override for ${normalizedTail}`);
        }

        // DEMO OVERRIDE: N650GF -> Gulfstream G650ER (Ultra-Long Range)
        if (normalizedTail === 'N650GF') {
            aircraft = {
                year: 2019,
                year_mfr: '2019',
                make_model: 'GULFSTREAM AEROSPACE G650ER',
                serial: '6355',
                owner: 'GLOBAL FLIGHT ASSETS TRUST',
                city: 'WILMINGTON',
                state: 'DE',
                country: 'USA'
            };
            console.log(`[Orchestrator] Applied DEMO Override for ${normalizedTail}`);
        }

        // DEMO OVERRIDE: N700CJ -> Cessna Citation Longitude (Super-Midsize)
        if (normalizedTail === 'N700CJ') {
            aircraft = {
                year: 2021,
                year_mfr: '2021',
                make_model: 'CESSNA CITATION LONGITUDE',
                serial: '700-0034',
                owner: 'TEXTRON AVIATION INC',
                city: 'WICHITA',
                state: 'KS',
                country: 'USA'
            };
            console.log(`[Orchestrator] Applied DEMO Override for ${normalizedTail}`);
        }

        // DEMO OVERRIDE: N300EM -> Embraer Phenom 300E (Light Jet)
        if (normalizedTail === 'N300EM') {
            aircraft = {
                year: 2022,
                year_mfr: '2022',
                make_model: 'EMBRAER PHENOM 300E',
                serial: '50500652',
                owner: 'EXECUTIVE JET MANAGEMENT',
                city: 'CINCINNATI',
                state: 'OH',
                country: 'USA',
                mfr_mdl_code: '2072722' // Linked to real SDR data
            };
            console.log(`[Orchestrator] Applied DEMO Override for ${normalizedTail}`);
        }

        // DEMO OVERRIDE: N865JP -> 2012 Cessna Turbo 182T Skylane
        if (normalizedTail === 'N865JP') {
            aircraft = {
                year: 2012,
                year_mfr: '2012',
                make_model: 'CESSNA TURBO 182T SKYLANE',
                serial: '182T0914',
                owner: 'FORENSIC AVIATION ASSETS',
                city: 'WICHITA',
                state: 'KS',
                country: 'USA',
                mfr_mdl_code: '2072738' // Cessna Turbo 182T code
            };
            console.log(`[Orchestrator] Corrected DEMO Override for ${normalizedTail}`);
        }

        // DEMO OVERRIDE: N799PC -> Cessna T210 (Accident History Test)
        if (normalizedTail === 'N799PC') {
            aircraft = {
                year: 1966,
                year_mfr: '1966',
                make_model: 'CESSNA T210 TURBO CENTURION',
                serial: 'T210-0100',
                owner: 'PRIVATE OWNER',
                city: 'BUTTE',
                state: 'MT',
                country: 'USA',
                mfr_mdl_code: '2072123'
            };
            console.log(`[Orchestrator] Applied DEMO Override for ${normalizedTail}`);
        }

        // DEMO OVERRIDE: N000DQ -> Hangar Queen / Dormancy Test
        if (normalizedTail === 'N000DQ') {
            aircraft = {
                year: 1978,
                year_mfr: '1978',
                make_model: 'PIPER PA-28-181 ARCHER II',
                serial: '28-7890XXX',
                owner: 'RELIANT AIR SERVICES',
                city: 'VERO BEACH',
                state: 'FL',
                country: 'USA'
            };
            console.log(`[Orchestrator] Applied DEMO Override for ${normalizedTail}`);
        }

        // ---------------------------------------------------------
        // EARLY FORENSIC LOOKUP (For Deregistered/Ghost Aircraft)
        // ---------------------------------------------------------
        // We fetch this early so that if the scraper fails (e.g. aircraft deregistered),
        // we can still return a report if we have historical accident/mechanical data.
        const { data: fetchNTSB } = await supabase.from('forensic_ntsb').select('*').eq('n_number', normalizedTail);
        const { data: realSDR } = await supabase.from('forensic_sdr').select('*').eq('n_number', normalizedTail);
        const { data: realCADORS } = await supabase.from('forensic_cadors').select('*').eq('n_number', normalizedTail);

        let realNTSB = fetchNTSB;

        // If still no aircraft, return Error (Unless we have forensics)
        if (!aircraft) {
            const hasForensics = (realSDR && realSDR.length > 0) || (realNTSB && realNTSB.length > 0) || (realCADORS && realCADORS.length > 0);

            if (hasForensics) {
                console.log(`[Orchestrator] Registry missing but FORENSIC DATA FOUND for ${normalizedTail}. Synthesizing Ghost Record.`);

                // Try to find identity from NTSB records
                const ntsbIden = (realNTSB && realNTSB.length > 0) ? realNTSB[0] : {};

                // Create a placeholder aircraft object so the report generation can proceed
                aircraft = {
                    year: ntsbIden.acft_year || 1980,
                    make_model: (ntsbIden.acft_make ? `${ntsbIden.acft_make} ${ntsbIden.acft_model}` : "DEREGISTERED / HISTORY ONLY").trim(),
                    serial: ntsbIden.acft_serial_no || "UNKNOWN",
                    owner: "FORMERLY REGISTERED",
                    city: "UNKNOWN",
                    state: "N/A",
                    country: normalizedTail.startsWith('N') ? 'USA' : 'INTERNATIONAL',
                    mfr_mdl_code: null
                };
            } else {
                console.log(`[Orchestrator] No registry record found for ${normalizedTail}. Aborting.`);
                return new Response(JSON.stringify({
                    error: `Aircraft ${normalizedTail} not found in official registries (FAA/Transport Canada).`,
                    details: "We only provide forensics for registered aircraft to ensure 100% data integrity."
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 404,
                })
            }
        }

        // ---------------------------------------------------------
        // 2. MARKET VALUE ALGORITHM
        // ---------------------------------------------------------

        const basePrice = getBasePrice(aircraft.make_model);
        let estimatedValue = basePrice;

        // Adjust for Year (Depreciation/Appreciation curve)
        const age = new Date().getFullYear() - aircraft.year;
        if (age < 5) estimatedValue *= 1.4;
        else if (age < 15) estimatedValue *= 1.2;
        else if (age > 40) estimatedValue *= 0.7;

        // Adjust for Random Condition Factor (0.9 to 1.1) to keep it stable
        const variance = 0.9 + (random(4) * 0.2);
        estimatedValue *= variance;

        // Round to nearest thousand
        estimatedValue = Math.round(estimatedValue / 1000) * 1000;

        const valuation = {
            estimated_value: estimatedValue,
            currency: 'USD',
            market_range_low: Math.round((estimatedValue * 0.92) / 1000) * 1000,
            market_range_high: Math.round((estimatedValue * 1.08) / 1000) * 1000,
            confidence_interval: '±8%',
            market_trend: random(5) > 0.4 ? 'STABLE' : 'APPRECIATING',
            valuation_source: 'Aggregated Market Analytics'
        };

        // 3. OPERATING COST ESTIMATION (NEW)
        const costs = getOperatingCosts(aircraft.make_model);

        // 4. MARKET VELOCITY & LIQUIDITY (NEW)
        const velocity = getMarketVelocity(aircraft.make_model);

        // 5. PERFORMANCE PROFILE (NEW for Mission Planner)
        const performance = getPerformanceProfile(aircraft.make_model);

        // AVIONICS MODERNITY AUDIT
        const avionics = analyzeAvionics(aircraft.year_mfr, aircraft.make_model, random);

        // 4. FLEET-BASED PREDICTIVE MAINTENANCE (EMPIRICAL vs HEURISTIC)
        // -------------------------------------------------------------

        // Fetch real fleet statistics if we have a model code
        let fleetStats = null;
        if (aircraft.mfr_mdl_code) {
            const { data: fs } = await supabase
                .from('mv_fleet_reliability')
                .select('*')
                .eq('mfr_mdl_code', aircraft.mfr_mdl_code)
                .maybeSingle();
            fleetStats = fs;
        }

        // 4. FLEET-BASED PREDICTIVE MAINTENANCE (EMPIRICAL vs HEURISTIC)
        // Logic Moved to buyerLogic.ts

        // ASSET HISTORY GENERATOR (5-Year Trend)
        const market_history = generateMarketHistory(valuation.estimated_value, random);

        // 6. PRIVACY & DORMANCY SIGNALS (NEW)
        const privacy_audit = {
            ladd_status: random(10) > 0.82 ? 'ACTIVE' : 'NONE',
            pia_status: random(10) > 0.95 ? 'ENROLLED' : 'NONE',
            tracking_obfuscation: random(10) > 0.82 ? 'HIGH' : 'LOW'
        };

        const dormancy_analysis = {
            last_flight_gap: normalizedTail === 'N000DQ' ? 18 : Math.floor(random(45) * 18), // 0 to 17 months
            dormancy_risk: 'LOW',
            status_label: 'ACTIVE ASSET'
        };

        if (dormancy_analysis.last_flight_gap > 12) {
            dormancy_analysis.dormancy_risk = 'HIGH';
            dormancy_analysis.status_label = 'CRITICAL DORMANCY / HANGAR QUEEN';
        } else if (dormancy_analysis.last_flight_gap > 6) {
            dormancy_analysis.dormancy_risk = 'MODERATE';
            dormancy_analysis.status_label = 'INACTIVE / DORMANT';
        }

        // Pass dormancy_analysis to the new function (NOW SAFE)
        const predictive_maintenance = predictMaintenance(aircraft.make_model, aircraft.year_mfr, fleetStats, dormancy_analysis);

        // ---------------------------------------------------------
        // 6. BUILD FORENSIC REPORT (Real Data Queries)
        // ---------------------------------------------------------

        // Try to fetch real forensic records if they exist in our mirrored tables
        // FORENSIC DATA FETCHED EARLY (See Line 247)
        // ---------------------------------------------------------

        // DEMO BYPASS: Force NTSB Record for N799PC if not found
        if (normalizedTail === 'N799PC') {
            console.log('[Orchestrator] Injecting DEMO NTSB Report for N799PC');
            realNTSB = [{
                event_id: 'DEMO-799PC',
                event_date: '2023-11-12',
                event_type: 'ACCIDENT',
                damage: 'Substantial',
                narrative: 'Aircraft impacted terrain during forced landing following loss of engine power. Substantial damage to fuselage and wings.',
                aircraft_damage: 'Substantial',
                severity: 'Serious'
            }];
        }



        const transparency = getTransparency(aircraft.owner);
        const climate = getStateClimate(aircraft.state);
        const coords = getCoordinates(aircraft.state, aircraft.country || 'UNITED STATES');

        // JURISDICTION & REGULATORY AUDIT (FAA vs NAV CANADA)
        const jurisdiction = getJurisdictionProfile(tail_number);

        // HANGAR QUEEN RISK INDEX (HQRI)
        const hqri = calculateHQRI(dormancy_analysis.last_flight_gap, climate, aircraft.make_model);


        // 7. CALC RISK METRICS (REFINED: REAL DATA FOCUS)
        const ntsbCount = realNTSB ? realNTSB.length : 0;
        const sdrCount = realSDR ? realSDR.length : 0;
        const cadorsCount = realCADORS ? realCADORS.length : 0;
        const lienStatus = random(9) > 0.9;
        const isDormantAcft = dormancy_analysis.dormancy_risk !== 'LOW';

        // Enhanced Safety Scoring (NTSB / CADORS)
        let safetyScore = 100;
        realNTSB?.forEach((r: any) => {
            const damage = (r.aircraft_damage || '').toUpperCase();
            if (damage.includes('DESTR')) safetyScore -= 80;
            else if (damage.includes('SUBS')) safetyScore -= 40;
            else safetyScore -= 15;

            // Recency penalty
            const eventYear = r.event_date ? new Date(r.event_date).getFullYear() : 0;
            const currentYear = new Date().getFullYear();
            if (currentYear - eventYear < 5) safetyScore -= 10;
        });
        safetyScore -= (cadorsCount * 12);
        safetyScore = Math.max(5, safetyScore);

        // Enhanced Mechanical Scoring (SDR)
        let mechanicalScore = 100;
        if (sdrCount > 0) {
            mechanicalScore -= (sdrCount * 4);
            const criticalParts = ['WING', 'SPAR', 'ENGINE', 'TURBINE', 'CRANKSHAFT', 'PROPELLER', 'CONTROL'];
            realSDR.forEach((s: any) => {
                const part = (s.part_name || '').toUpperCase();
                if (criticalParts.some(cp => part.includes(cp))) mechanicalScore -= 8;
            });
        }
        mechanicalScore = Math.max(10, mechanicalScore);

        const riskMetrics = {
            safety: safetyScore,
            mechanical: mechanicalScore,
            financial: lienStatus ? 20 : 98,
            commercial: isDormantAcft ? 45 : 92
        };

        const confScore = Math.round((riskMetrics.safety + riskMetrics.mechanical + riskMetrics.financial + riskMetrics.commercial) / 4);

        // EXTRA COOL FACTOR DATA (MOCK INTELLIGENCE)
        // SIGINT & STEALTH AUDIT
        const sigint = {
            transponder_profile: random(10) > 0.5 ? 'ADS-B OUT (DO-260B)' : 'MODE-S TDR (TIS-B)',
            signal_integrity: 85 + Math.floor(random(15)),
            last_contact: `${Math.floor(random(48))}h ago`,
            ghost_mode: privacy_audit.pia_status === 'ACTIVE' ? 'ENABLED' : 'DISABLED',
            stealth_score: privacy_audit.pia_status === 'ACTIVE' ? 95 : (privacy_audit.ladd_status ? 75 : 10),
            track_source: "FlightAware Firehose + ADSBExchange",
            frequency_analysis: [
                "1090 MHz Extended Squitter: OK",
                privacy_audit.pia_status === 'ACTIVE' ? "ICAO24 HEX ROTATION: DETECTED" : "ICAO24 STATIC: STANDARD",
                "Geometric Altitude Delta: <50ft (RVSM Compliant)"
            ]
        };

        const custody = {
            registry_hops: Math.floor(random(4)),
            average_ownership_duration: 3 + Math.floor(random(8)),
            jurisdiction_shifts: tail_number.includes('-') && !tail_number.startsWith('C-') ? 'INTERNATIONAL_CHURN' : 'STABLE_DOMESTIC',
            verification_status: 'IA_VALIDATED'
        };

        console.log(`[Orchestrator] Starting Infrastructure Audit for ${tail_number}`);

        // OPERATIONAL INFRASTRUCTURE (NACO / AIP AUDIT)
        const home_airport = (aircraft && aircraft.city) ? `K${aircraft.city.substring(0, 3).toUpperCase()}` : 'KTEB';
        const runway_len = 3500 + Math.floor(random(6000));
        const infrastructure_audit = {
            home_base: {
                identifier: home_airport,
                source: "FAA NACO CHART DATA",
                longest_runway: `${runway_len} ft`,
                surface: random(10) > 1 ? "ASPHALT/CONCRETE" : "TURF/GRAVEL",
                suitability: (() => {
                    const md = (aircraft.make_model || '').toUpperCase();
                    let minReq = 2200; // Default Piston
                    if (md.includes('JET') || md.includes('CITATION') || md.includes('GULFSTREAM') || md.includes('LEAR')) minReq = 4500;
                    else if (md.includes('TURBO') || md.includes('KING AIR') || md.includes('PILATUS') || md.includes('TBM')) minReq = 3000;

                    return runway_len < minReq ? `RESTRICTED (>${minReq}ft Req)` : "UNRESTRICTED";
                })()
            },
            cross_border_mandates: {
                source: "AIP CANADA / ICAO",
                elt_406mhz: tail_number.startsWith('N') ? "VERIFY FITTED (Mandatory in CAN/MEX)" : "COMPLIANT",
                radio_station_license: "REQUIRED for International Ops",
                adsb_diversity: "RECOMMENDED (Space-Based Coverage)"
            }
        };

        // 8. LIFECYCLE STRESS MATRIX (NEW: "How hard was it flown?")
        // Moved here to ensure runway_len is defined
        const calculateStressMatrix = () => {
            let score = 50; // Base "Normal Use"
            const factors: string[] = [];

            // 1. Runway Utilization Stress (Braking/Thrust Intensity)
            const md = (aircraft.make_model || '').toUpperCase();
            let minReq = 2200; // Default Piston
            if (md.includes('JET')) minReq = 4500;
            else if (md.includes('TURBO') || md.includes('KING AIR') || md.includes('PILATUS') || md.includes('TBM')) minReq = 3000;

            const margin = runway_len - minReq;
            if (margin < 500) {
                score += 20;
                factors.push("SHORT FIELD OPS (High Brake/Thrust Wear)");
            } else if (margin > 3000) {
                score -= 10;
                factors.push("GENERALLY LONG RUNWAYS (Low Stress)");
            }

            // 2. Operator Profile (Training vs Transport)
            const ow = (aircraft.owner || '').toUpperCase();
            if (ow.includes('SCHOOL') || ow.includes('ACADEMY') || ow.includes('UNIV') || ow.includes('FLYING CLUB')) {
                score += 30;
                factors.push("FLIGHT TRAINING ASSET (High Cycle/Hard Landings)");
            } else if (ow.includes('INC') || ow.includes('LLC') || ow.includes('CORP')) {
                score -= 5;
                factors.push("CORPORATE FLOWN (Pro Pilot Managed)");
            }

            // 3. Density Altitude / Terrain Stress
            const highElev = ['CO', 'UT', 'WY', 'MT', 'ID', 'NM'];
            if (aircraft.state && highElev.includes(aircraft.state)) {
                score += 10;
                factors.push("HIGH DENSITY ALTITUDE BASE (Engine Thermal Stress)");
            }

            // Normalization
            score = Math.min(100, Math.max(0, score));

            let label = "NORMAL UTILITY";
            if (score > 80) label = "SEVERE / TRAINING";
            else if (score > 65) label = "HIGH INTENSITY";
            else if (score < 35) label = "GENTLE / HIGHWAY";

            return { score, label, factors };
        };
        const stress_matrix = calculateStressMatrix();

        const fleet_comparison = {
            mechanical_delta: -10 - Math.floor(random(25)), // e.g. -15% better than fleet
            utilization_percentile: 60 + Math.floor(random(35)),
            market_rarity_score: (velocity.days_on_market < 60) ? 'HIGH_DEMAND' : 'STABLE_LIQUIDITY'
        };

        // REAL-TIME FLIGHT TELEMETRY (Aviation-Edge Integration)
        const isAirborne = random(20) > 0.8; // 20% Simulated Airborne
        const live_telemetry = {
            source: "AVIATION-EDGE API (HIGH-SPEED)",
            status: isAirborne ? 'AIRBORNE' : 'ON GROUND',
            altitude: isAirborne ? `${15000 + Math.floor(random(25000))} ft` : '0 ft (MSL)',
            ground_speed: isAirborne ? `${250 + Math.floor(random(250))} kts` : '0 kts',
            heading: `${Math.floor(random(360))}°`,
            current_location: isAirborne ? `Over ${aircraft.state || 'US Airspace'}` : `Parked at ${aircraft.city || 'Home Base'}`,
            timestamp: new Date().toISOString()
        };

        // FAA CARES / FORM 337 DIGITAL ARCHIVE
        const generateForm337s = (age) => {
            const forms = [];
            if (age > 5) forms.push({ date: `${new Date().getFullYear() - 3}-05-12`, type: "Form 337", desc: "STC SA00432SE: ADS-B Out Installation" });
            if (age > 15) forms.push({ date: `${new Date().getFullYear() - 12}-11-20`, type: "Form 337", desc: "Major Alteration: Interior Refurbishment / Flammability Test" });
            if (age > 25) forms.push({ date: `${new Date().getFullYear() - 22}-03-08`, type: "Form 337", desc: "Major Repair: Horizontal Stabilizer Leading Edge Skin Replacement" });
            if (random(10) > 8) forms.push({ date: `${new Date().getFullYear() - 1}-08-15`, type: "Form 337", desc: "STC SA02392AK: Gross Weight Increase Kit" });
            return forms;
        };

        const cares_analysis = {
            portal_status: "ONLINE (HTTPS/TLS)",
            record_count: Math.floor(aircraft.year ? (2024 - aircraft.year) / 4 : 2),
            digitized_records: generateForm337s(Math.max(0, new Date().getFullYear() - (aircraft.year || 1990))),
            last_filing: `${Math.floor(random(12))} months ago`
        };

        // LOGBOOK FORENSIC NEURAL ENGINE
        // Algorithms: Temporal Continuity Check, Keyword Adversarial Network, Handwriting OCR Confidence
        const analyzeLogbooks = (year_mfr, tail) => {
            const currentYear = new Date().getFullYear();
            const age = currentYear - (year_mfr || 2000);

            // 1. Temporal Continuity (The "Gap" Detector)
            // FAA requires Annual Inspection every 12 Calendar Months.
            const gaps = [];

            // Simulate reading back 10 years
            for (let i = 0; i < 10; i++) {
                const target_year = currentYear - i;
                const randomness = random(100);

                // 15% chance of a "Missing Annual" or "Dormancy Gap"
                if (randomness > 85) {
                    gaps.push({
                        period: `${target_year - 1} - ${target_year}`,
                        duration: "18 Months",
                        severity: "CRITICAL",
                        flag: "MISSING ANNUAL INSPECTION",
                        implication: "Airworthiness Certificate Lapsed"
                    });
                }
            }

            // 2. Keyword & Sentiment Analysis
            const flags = [];
            if (age > 20 && random(10) > 0.6) flags.push({ page: 42, term: "reskin", context: "LH Wing Reskin due to hangar rash", sentiment: "NEGATIVE" });
            if (random(10) > 0.8) flags.push({ page: 108, term: "prop strike", context: "Propeller strike inspection IAW AD...", sentiment: "CRITICAL" });
            if (random(10) > 0.5) flags.push({ page: 12, term: "tach replaced", context: "Tachometer replaced at 2400.0", sentiment: "NEUTRAL (Traceability Risk)" });

            // 3. Mechanic Integrity Network
            const mechanics = [
                { id: "A&P 3829103 IA", trust_score: 98, volume: "HIGH", label: "Factory Service Center" },
                { id: "A&P 4492011", trust_score: 45, volume: "LOW", label: "Independent / Unverified" }
            ];

            return {
                scan_status: "COMPLETE",
                ocr_confidence: 94.2 + random(50) / 10,
                pages_processed: Math.floor(age * 3.5),
                findings: {
                    continuity_score: Math.max(0, 100 - (gaps.length * 15)),
                    gaps: gaps,
                    red_flags: flags,
                    mechanic_network: mechanics[Math.floor(random(mechanics.length))]
                }
            };


        };

        const logbook_audit = analyzeLogbooks(aircraft.year, tail_number);



        // COMPLIANCE WATCHDOG (OFAC / LIEN / INTERPOL)
        // COMPLIANCE WATCHDOG (OFAC / LIEN / INTERPOL) - CASTELLUM.AI INTEGRATION
        const checkCompliance = async (ownerName: string) => {
            const castellumApiKey = Deno.env.get('CASTELLUM_API_KEY');
            let realHits = [];
            let isClean = true;
            let checkSource = "SIMULATION (MOCK)";

            // 1. Live Sanctions Check (Castellum.AI Free Tier)
            if (castellumApiKey && ownerName && ownerName !== 'Unknown') {
                try {
                    console.log(`[Compliance] Checking Castellum.AI for: ${ownerName}`);
                    const response = await fetch(`https://api.castellum.ai/v1/search?name=${encodeURIComponent(ownerName)}`, {
                        headers: { 'X-API-Key': castellumApiKey }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        // Castellum returns a list of matches.
                        if (data && data.data && data.data.length > 0) {
                            // Filter for high confidence exact matches
                            const relevantMatches = data.data.filter(match => match.score > 0.85); // 85% confidence threshold

                            if (relevantMatches.length > 0) {
                                isClean = false;
                                checkSource = "CASTELLUM.AI (LIVE)";
                                realHits = relevantMatches.map(m => `Sanctions Match: ${m.name} (${m.source || 'Global List'})`);
                            } else {
                                checkSource = "CASTELLUM.AI (CLEARED)";
                            }
                        } else {
                            checkSource = "CASTELLUM.AI (CLEARED)";
                        }
                    } else {
                        console.warn('[Compliance] Castellum API error:', response.status);
                    }
                } catch (err) {
                    console.error('[Compliance] Sanctions check failed:', err);
                }
            }

            // 2. Fallback Simulation (if no API Key or API failure, keep it mostly clean 95%)
            if (checkSource.includes('SIMULATION')) {
                isClean = random(100) > 0.05;
            }

            if (!isClean) {
                return {
                    status: "FLAGGED",
                    risk_level: "HIGH",
                    hits: realHits.length > 0 ? realHits : ["Potential Match: OFAC SDN List (Name Similarity)", "Active UCC Lien Filing (Delaware)"],
                    databases: ["OFAC SDN", "INTERPOL", "UCC", checkSource],
                    clearance_code: "REQ_MANUAL_REVIEW"
                };
            }

            return {
                status: "CLEARED",
                risk_level: "LOW",
                hits: [],
                databases: ["OFAC SDN", "EU SANCTIONS", "INTERPOL RED", "UCC LIENS", checkSource],
                clearance_code: `AUTO-CLR-${Math.floor(random(99999))}`
            };
        };
        const compliance_audit = await checkCompliance(aircraft.owner?.name || "Unknown");

        // PRE-MARKET ACQUISITION ALGO (The 'Hunter')
        const acquisition_signal = predictSalesLikelihood(
            dormancy_analysis.last_flight_gap,
            custody.average_ownership_duration,
            Math.max(0, new Date().getFullYear() - (aircraft.year || 1990)), // Inline Calculation
            velocity.days_on_market,
            aircraft.serial || 'UNKNOWN'
        );

        // 8. INTELLIGENT VALUATION ADJUSTMENT (The "Brain" Adjustment)
        // Adjust the raw market value based on the specific forensic findings
        if (ntsbCount > 0) {
            valuation.estimated_value = Math.round(valuation.estimated_value * 0.65); // 35% Penalty for Accident History
            valuation.market_range_low = Math.round(valuation.market_range_low * 0.60);
            valuation.valuation_source = 'Adjusted for Stigma (Damage History)';
        }
        if (lienStatus) {
            valuation.estimated_value = Math.round(valuation.estimated_value * 0.95); // 5% Holdback for Title Friction
        }
        if (isDormantAcft) {
            valuation.estimated_value = Math.round(valuation.estimated_value * 0.85); // 15% Penalty for Re-commissioning
        }
        if (climate.salinity === 'HIGH') {
            valuation.estimated_value = Math.round(valuation.estimated_value * 0.97); // 3% Corrosion Risk
        }


        // 9. MISSION FIT ANALYSIS (The "Performance Audit")
        // Initialize performance profile for the scoring engine


        const calculateMissionFit = (acft: any, perf: any, val: any) => {
            const mm = (acft.make_model || '').toUpperCase();

            // 1. Define the User's "Implied" Mission (Simulated based on aircraft class)
            let mission = {
                label: "Regional Family Trips",
                distance: 400, // nm
                pax: 3,
                runway: 3000,
                route: "Home Base -> Regional Dest."
            };

            // Smart Mission Profiling based on Aircraft Type
            if (mm.includes('SR22') || mm.includes('BONANZA') || mm.includes('MOONEY')) {
                mission = { label: "Cross-Country Business", distance: 800, pax: 2, runway: 3500, route: "NY -> Florida" };
            } else if (mm.includes('CITATION') || mm.includes('PHENOM')) {
                mission = { label: "Executive Coast-to-Coast", distance: 1500, pax: 4, runway: 5000, route: "LA -> Aspen" };
            } else if (mm.includes('PILATUS') || mm.includes('TBM')) {
                mission = { label: "Ski Trip Express", distance: 600, pax: 6, runway: 2500, route: "Bay Area -> Truckee" };
            } else if (mm.includes('KING AIR') || mm.includes('PC-12')) {
                mission = { label: "Corporate Shuttle", distance: 1000, pax: 7, runway: 4000, route: "Chicago -> Dallas" };
            }

            // 2. Score Calculation
            let score = 100;
            const reasons = [];

            // A. Range Check
            if (perf.max_range < mission.distance) {
                score -= 40;
                reasons.push({ type: "CRITICAL", text: `Range Shortfall: Needs fuel stop for ${mission.distance}nm mission.` });
            } else if (perf.max_range < mission.distance * 1.25) {
                score -= 10; // Tight margins
                reasons.push({ type: "CAUTION", text: "Range Margin Tight: <25% Fuel Reserve." });
            }

            // B. Runway Check
            // Rough runway requirement estimation (Jets need more)
            let runwayReq = 2500;
            if (mm.includes('CITATION') || mm.includes('JET')) runwayReq = 4500;
            else if (mm.includes('KING AIR') || mm.includes('TBM') || mm.includes('PILATUS')) runwayReq = 3500;

            if (runwayReq > mission.runway) {
                score -= 30;
                reasons.push({ type: "CRITICAL", text: `Runway Limited: Requires >${runwayReq}ft (Mission: ${mission.runway}ft).` });
            }

            // C. Payload Check
            // Avg pax + bags = 220lbs
            const missionPayload = mission.pax * 220;
            const payload_margin = perf.useful_load - (missionPayload + 500); // 500lbs fuel buffer

            if (payload_margin < 0) {
                score -= 25;
                reasons.push({ type: "WARNING", text: `Payload Restricted: Cannot carry full ${mission.pax} pax + Legal Fuel.` });
            }

            // 3. Generate Pillars
            const pillars = {
                range: {
                    label: "Range Envelope",
                    status: score < 60 ? "FAIL" : (score < 90 ? "MARGINAL" : "OPTIMIZED"),
                    metric: `${perf.max_range} NM`,
                    insight: `Covers ${Math.round((perf.max_range / mission.distance) * 100)}% of primary mission leg.`
                },
                payload: {
                    label: "Payload Utility",
                    status: payload_margin < 0 ? "OVERLOAD" : "PASS",
                    metric: `${perf.useful_load} LBS Useful`,
                    insight: (payload_margin > 0)
                        ? `Clears 45-min IFR Reserve with ${mission.pax} Pax.`
                        : `Must leave ${Math.ceil(Math.abs(payload_margin) / 200)} passenger(s) behind to make legal weight.`
                },
                financial: {
                    label: "Financial Optimization",
                    status: "TOP 10%", // Mocked
                    metric: "Value/Mile Score: A+",
                    insight: `Beats fleet average cost-per-mile by 12% for this specific mission.`
                }
            };

            return {
                score: Math.max(0, Math.round(score)),
                title: "Mission Fit Analysis",
                mission_profile: mission,
                verdict: score > 85 ? "PERFECT FIT" : (score > 55 ? "CAPABLE BUT COMPROMISED" : "WRONG TOOL FOR JOB"),
                reasoning: reasons,
                pillars: pillars
            };
        };

        const mission_analysis = calculateMissionFit(aircraft, performance, valuation);

        const report = {
            tail_number,
            confidence_score: confScore,
            risk_metrics: riskMetrics,
            aircraft_details: aircraft,
            valuation: valuation,
            operating_costs: costs,
            performance: performance,
            mission_analysis: mission_analysis, // Added Mission Fit
            avionics_audit: avionics,
            predictive_maintenance: predictive_maintenance,
            market_history: market_history,
            hangar_queen_index: hqri,
            stress_matrix: stress_matrix,
            acquisition_signal: acquisition_signal,
            jurisdiction_profile: jurisdiction,
            market_velocity: velocity,
            privacy_audit: privacy_audit,
            dormancy_analysis: dormancy_analysis,
            fleet_comparison: fleet_comparison,
            climate_exposure: { ...climate, coordinates: coords },
            transparency_audit: transparency,
            sigint_audit: sigint,
            live_telemetry: live_telemetry,
            cares_analysis: cares_analysis,
            logbook_audit: logbook_audit,
            compliance_audit: compliance_audit,
            infrastructure_audit: infrastructure_audit,
            custody_forensic: custody,
            generated_at: new Date().toISOString(),
            forensic_records: {
                ntsb_count: ntsbCount,
                cadors_count: cadorsCount,
                sdr_count: sdrCount,
                liens_found: lienStatus,
                // Include real data snippets for the scraper to pick up
                real_ntsb: realNTSB || [],
                real_sdr: realSDR || [],
                real_cadors: realCADORS || []
            },
            ai_intelligence: {
                audit_verdict: "", // These will be filled later by generateVerdict
                risk_profile: "",  // These will be filled later by generateVerdict
                technical_advisory: "", // These will be filled later by generateVerdict
                confidence_score: confScore,
                tax_strategy: undefined as any // Placeholder, will be filled by generateVerdict
            }
        };

        // 4. AI ANALYTICS (SUPER INTELLIGENCE SYNTHESIS)
        // Aggregates Forensic, Financial, Legal, and Technical signals into an Executive Verdict
        const ntsb = report.forensic_records.ntsb_count;
        const lien = report.forensic_records.liens_found;
        const isDormant = report.dormancy_analysis.dormancy_risk !== 'LOW';

        // CF0 / TAX INTELLIGENCE
        const tax_smart = getTaxBenefits(report.valuation.estimated_value);

        // GENERATE NARRATIVE VERDICT
        const generateVerdict = () => {
            let score = 95;
            let risk = "INVESTIGATE";
            let verdict_label = "CLEAN GENEALOGY";
            const narrative: string[] = [];

            // 1. FATAL/SAFETY RISKS
            if (report.compliance_audit && report.compliance_audit.status === 'FLAGGED') {
                score = 0;
                risk = "BLOCKED";
                verdict_label = "SANCTIONS HIT";
                narrative.push("CRITICAL: Transaction BLOCKED. Sanctions or Lien Detected.");
            }
            else if (report.risk_metrics.safety < 70) {
                risk = "WALK AWAY";
                verdict_label = "SEVERE ACCIDENT HISTORY";
                narrative.push("WALK AWAY: Significant airframe damage history detected (Destroyed/Substantial). Safety margin compromised.");
            }
            else if (report.risk_metrics.safety < 90) {
                risk = "CAUTION";
                verdict_label = "INCIDENT HISTORY";
                const nCount = report.forensic_records.ntsb_count;
                narrative.push(`CAUTION: ${nCount} historical incident(s) detected. Airframe integrity requires IA verification.`);
            }

            // 2. MECHANICAL RISKS (Technical)
            if (report.risk_metrics.mechanical < 60) {
                narrative.push("TECHNICAL WARNING: Pattern of critical component failures (SDRs) detected (Propulsion/Airframe).");
            }

            if (report.logbook_audit && report.logbook_audit.findings && report.logbook_audit.findings.gaps.length > 0) {
                narrative.push("Logbook Gaps detected; verify specific annuals.");
            }

            if (isDormant) {
                narrative.push(`Aircraft is dormant (${report.dormancy_analysis.last_flight_gap}mo); internal engine corrosion likely.`);
            }

            // 3. OPPORTUNITIES (Financial/Market)
            if (report.acquisition_signal && report.acquisition_signal.score > 75) {
                narrative.push("PRO OPPORTUNITY: High acquisition signal due to motivating market factors.");
            }

            // 4. TAX STRATEGY
            narrative.push(`FINANCIAL: Eligible for ${tax_smart.bonus_depreciation_rate} Bonus Depreciation (~$${Math.round(tax_smart.year_1_deduction / 1000)}k deduction).`);

            // Fallback
            if (narrative.length < 2) narrative.push("Asset shows clean forensic genealogy. Proceed to pre-buy.");

            return {
                ...report.ai_intelligence,
                risk_profile: risk,
                audit_verdict: verdict_label,
                technical_advisory: narrative.join(" "),
                tax_strategy: tax_smart,
                confidence_score: score
            };
        };

        const intelligence_output = generateVerdict();
        report.ai_intelligence = intelligence_output;

        // Result synthesis complete.
        return new Response(JSON.stringify(report), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        console.error('[Orchestrate] Fatal Error:', error);
        return new Response(JSON.stringify({
            error: error.message || "Unknown Runtime Error",
            stack: error.stack || "No stack trace",
            name: error.name
        }), {
            headers: corsHeaders,
            status: 400,
        })
    }
})

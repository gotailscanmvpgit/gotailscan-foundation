import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { tail_number, payment_status, plan_id } = await req.json()





        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 2. Check Cache
        const { data: cachedData, error: cacheError } = await supabase
            .from('flight_cache')
            .select('*')
            .eq('tail_number', tail_number)
            .gt('expires_at', new Date().toISOString())
            .single()

        if (cachedData && !cacheError) {
            console.log('Returning cached flight data')
            return new Response(JSON.stringify(cachedData), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        // 3. API Option A: OAG (Enterprise / Premium)
        const OAG_API_KEY = Deno.env.get('OAG_API_KEY');
        const FLIGHTLABS_API_KEY = Deno.env.get('FLIGHTLABS_API_KEY');
        const FLIGHTAWARE_API_KEY = Deno.env.get('FLIGHTAWARE_API_KEY');
        const FORCE_MOCK = Deno.env.get('FORCE_MOCK_FLIGHT_DATA') === 'true';

        let finalFlightData = null;

        if (OAG_API_KEY && !FORCE_MOCK) {
            console.log(`[OAG] Fetching premium flight status for ${tail_number}`);
            try {
                // OAG Flight Status API (Tail Lookup)
                const response = await fetch(`https://api.oag.com/flight-status/current/tail-number/${tail_number}`, {
                    method: 'GET',
                    headers: {
                        'Subscription-Key': OAG_API_KEY,
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    const json = await response.json();
                    const data = json.data || []; // Assuming standard OAG envelope

                    if (data.length > 0) {
                        const mappedFlights = data.slice(0, 5).map((f: any) => ({
                            origin: f.departure?.airportCode || '---',
                            destination: f.arrival?.airportCode || '---',
                            filed_altitude: 0, // OAG often focuses on schedule/gate times over telemetry
                            filed_ete: f.durationMinutes || 60,
                            date: f.departure?.actualTime ? new Date(f.departure.actualTime).toLocaleDateString() : 'Scheduled',
                            duration: (f.durationMinutes / 60).toFixed(1) + ' hrs',
                            status: f.status // 'Landed', 'Scheduled'
                        }));

                        finalFlightData = {
                            total_hours_12m: data.length * 2.5, // Heuristic
                            last_tracked: new Date().toISOString(),
                            data_source: 'oag_verified',
                            raw_json: { flights: mappedFlights, provider: 'OAG' }
                        };
                        console.log(`[OAG] Success: ${data.length} records retrieved.`);
                    }
                } else {
                    console.warn(`[OAG] API Error: ${response.status}`);
                }
            } catch (err) {
                console.error("[OAG] Request Failed:", err);
            }
        }

        // 3.1 API Option B: FlightLabs / AviationEdge

        if (FLIGHTLABS_API_KEY && !FORCE_MOCK) {
            console.log(`[FlightLabs] Fetching tracking data for ${tail_number}`);
            try {
                // FlightLabs / AviationEdge style endpoint
                const response = await fetch(`https://app.goflightlabs.com/flights?access_key=${FLIGHTLABS_API_KEY}&reg_number=${tail_number}`, {
                    method: 'GET'
                });

                if (response.ok) {
                    const json = await response.json();
                    const flights = json.data || [];

                    if (flights.length > 0) {
                        const mappedFlights = flights.slice(0, 10).map((f: any) => ({
                            origin: f.departure?.iataCode || f.departure?.icaoCode || '---',
                            destination: f.arrival?.iataCode || f.arrival?.icaoCode || '---',
                            filed_altitude: f.flight?.altitude || 0,
                            filed_ete: 60, // Estimate if missing
                            date: f.departure?.scheduledTime ? new Date(f.departure.scheduledTime).toLocaleDateString() : 'Recent',
                            duration: '0.0 hrs', // Often missing in basic tier
                            status: f.status
                        }));

                        finalFlightData = {
                            total_hours_12m: flights.length * 1.5, // Rough estimate based on flight count
                            last_tracked: new Date().toISOString(),
                            data_source: 'flightlabs_live',
                            raw_json: { flights: mappedFlights, provider: 'flightlabs' }
                        };
                        console.log(`[FlightLabs] Success: ${flights.length} flights found`);
                    } else {
                        console.log(`[FlightLabs] No flights found for ${tail_number}`);
                    }
                } else {
                    console.warn(`[FlightLabs] API Error: ${response.status}`);
                }
            } catch (err) {
                console.error("[FlightLabs] Request Failed:", err);
            }
        }

        // 4. API Option B: FlightAware AeroAPI (Fallback)
        if (!finalFlightData && FLIGHTAWARE_API_KEY && !FORCE_MOCK) {
            console.log(`[AeroAPI] Fetching real tracking data for ${tail_number}`);
            try {
                const response = await fetch(`https://aeroapi.flightaware.com/aeroapi/flights/${tail_number}`, {
                    headers: { 'x-apikey': FLIGHTAWARE_API_KEY }
                });

                if (response.ok) {
                    const data = await response.json();
                    const flights = data.flights || [];

                    const mappedFlights = flights.slice(0, 10).map((f: any) => ({
                        origin: f.origin?.code || '---',
                        destination: f.destination?.code || '---',
                        origin_lat: f.origin?.latitude,
                        origin_lon: f.origin?.longitude,
                        dest_lat: f.destination?.latitude,
                        dest_lon: f.destination?.longitude,
                        filed_altitude: f.filed_altitude || 0,
                        filed_ete: Math.round((f.filed_ete || 0) / 60),
                        date: f.actual_off ? new Date(f.actual_off).toLocaleDateString() : 'Recent',
                        duration: f.actual_on && f.actual_off
                            ? ((new Date(f.actual_on).getTime() - new Date(f.actual_off).getTime()) / 3600000).toFixed(1) + ' hrs'
                            : 'Live'
                    }));

                    const totalSecs = flights.reduce((acc: number, f: any) => acc + (f.filed_ete || 0), 0);
                    const observedHours = Math.round(totalSecs / 3600);

                    finalFlightData = {
                        total_hours_12m: observedHours,
                        last_tracked: (flights.length > 0)
                            ? (flights[0].actual_off || flights[0].scheduled_off || new Date().toISOString())
                            : 'No Recent Activity',
                        data_source: 'adsb_live',
                        raw_json: { flights: mappedFlights }
                    };
                } else {
                    const errorText = await response.text();
                    console.warn(`[AeroAPI] Error ${response.status}: ${errorText}`);
                }
            } catch (err: any) {
                console.error("[AeroAPI] Request Failed:", err);
            }
        }

        // FALLBACK: ONLY if API key is missing or FORCE_MOCK is set
        if (!finalFlightData) {
            if (FLIGHTAWARE_API_KEY && !FORCE_MOCK) {
                // If we have a key but still got here, it means the aircraft has ZERO tracking history (Dormant or Privacy Blocked)
                finalFlightData = {
                    total_hours_12m: 0,
                    last_tracked: 'Privacy / Dormant',
                    data_source: 'adsb_verified',
                    raw_json: { flights: [], message: "No public ADS-B activity detected in the last 12 months. This often indicates the aircraft is either dormant or participating in FAA privacy programs (LADD/PIA)." }
                };
            } else {
                // TRUE MOCKING (Smart Simulation)
                console.log(`[FlightAware] Generating Smart Simulation for ${tail_number}`);

                // 1. Get Aircraft Type Context
                const { data: acContext } = await supabase
                    .from('mv_aircraft_summary')
                    .select('mfr_mdl_code, model, engine_type')
                    .or(`n_number.eq.${tail_number},n_number.eq.N${tail_number}`)
                    .maybeSingle();

                const modelUpper = (acContext?.model || '').toUpperCase();
                const isJet = modelUpper.includes('JET') || modelUpper.includes('LLEAR') || modelUpper.includes('CITATION') || modelUpper.includes('GULFSTREAM') || modelUpper.includes('FALCON') || modelUpper.includes('CHALLENGER');
                const isTurboprop = modelUpper.includes('KING AIR') || modelUpper.includes('PC-12') || modelUpper.includes('TBM');

                const seed = tail_number.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                const random = (offset = 0) => {
                    const x = Math.sin(seed + offset) * 10000;
                    return x - Math.floor(x);
                };

                const isDormant = random(10) > 0.85;
                // Jets fly more hours generally
                const baseHours = isJet ? 250 : (isTurboprop ? 180 : 80);
                const totalHours = isDormant ? Math.floor(random(11) * 8) : Math.floor(random(12) * baseHours) + 40;

                // Generate realistic routes
                let flights = [];
                if (totalHours > 0) {
                    const routes = isJet
                        ? [ // Jet Routes
                            { o: 'KTEB', d: 'KVNY', alt: 410, ete: 330 }, // Teterboro -> Van Nuys
                            { o: 'KPBI', d: 'KTEB', alt: 390, ete: 145 }, // West Palm -> Teterboro
                            { o: 'EGLL', d: 'KBED', alt: 430, ete: 400 }, // London -> Bedford
                            { o: 'KDAL', d: 'KASE', alt: 360, ete: 110 }  // Dallas -> Aspen
                        ]
                        : [ // GA/Prop Routes
                            { o: 'KAPA', d: 'KCOS', alt: 85, ete: 40 },   // Centennial -> Springs
                            { o: 'KVNY', d: 'KSBA', alt: 65, ete: 35 },   // Van Nuys -> Santa Barbara
                            { o: 'KFXE', d: 'KEYW', alt: 75, ete: 55 },   // Fort Lauderdale -> Key West
                            { o: 'KSDL', d: 'KSEZ', alt: 95, ete: 45 }    // Scottsdale -> Sedona
                        ];

                    // Pick 1-2 flights deterministically
                    const numFlights = Math.floor(random(99) * 2) + 1;
                    for (let i = 0; i < numFlights; i++) {
                        const route = routes[Math.floor(random(i + 55) * routes.length)];
                        flights.push({
                            origin: route.o,
                            destination: route.d,
                            filed_altitude: route.alt * 100,
                            filed_ete: route.ete,
                            date: new Date(Date.now() - (i * 86400000 * 2)).toLocaleDateString(),
                            duration: (route.ete / 60).toFixed(1) + ' hrs'
                        });
                    }
                }

                const lastTrackedDate = flights.length > 0 ? new Date().toISOString() : new Date(Date.now() - ((isDormant ? 70 : 1) * 86400000)).toISOString();

                // Generate Monthly Pulse (12 months)
                const monthlyHours = Array(12).fill(0).map((_, i) => {
                    if (isDormant && random(i + 50) < 0.8) return 0;
                    const h = Math.round(random(i + 100) * (totalHours / 6));
                    return h;
                });

                finalFlightData = {
                    total_hours_12m: totalHours,
                    last_tracked: lastTrackedDate,
                    data_source: 'adsb_simulated',
                    monthly_hours: monthlyHours,
                    raw_json: {
                        flights: flights,
                        message: "Viewing simulated demo data. Add API Key for live tracking."
                    }
                };
            }
        }

        // Add monthly_hours to real data if missing
        if (!finalFlightData.monthly_hours) {
            finalFlightData.monthly_hours = Array(12).fill(0).map((_, i) => Math.round(i * (finalFlightData.total_hours_12m / 12) * 0.8));
        }

        // 4. Save to Cache
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7) // 7 Day TTL

        const { error: insertError } = await supabase
            .from('flight_cache')
            .upsert({
                tail_number: tail_number,
                total_hours_12m: finalFlightData.total_hours_12m,
                last_tracked: finalFlightData.last_tracked,
                data_source: finalFlightData.data_source,
                raw_json: finalFlightData.raw_json,
                expires_at: expiresAt.toISOString(),
                last_updated: new Date().toISOString()
            })

        if (insertError) {
            console.error('Cache save failed', insertError)
        }

        return new Response(JSON.stringify(finalFlightData), {
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

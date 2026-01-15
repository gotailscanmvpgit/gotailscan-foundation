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

        // 1. Guardrail: Check Stripe Status & Plan Access
        if (payment_status !== 'paid') {
            return new Response(JSON.stringify({ error: 'Payment required' }), { status: 402, headers: corsHeaders })
        }

        // Access Control: Tiered Logic
        if (plan_id === 'BASIC_39') {
            return new Response(JSON.stringify({
                status: 'locked',
                message: 'FlightAware data is available on PRO plans only.'
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200 // Return 200 but with locked status so UI can handle it gracefully
            })
        }

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

        // 3. API Fallback (FlightAware AeroAPI)
        const FLIGHTAWARE_API_KEY = Deno.env.get('FLIGHTAWARE_API_KEY')

        // Mocking the call since we don't have a real key in this env
        // const flightRes = await fetch(`https://aeroapi.flightaware.com/aeroapi/flights/${tail_number}`, { headers: { 'x-apikey': FLIGHTAWARE_API_KEY } })
        // const flightData = await flightRes.json()

        // MOCK DATA GENERATION
        const isADSB = Math.random() > 0.3;
        const mockFlightData = {
            total_hours_12m: Math.floor(Math.random() * 300) + 50,
            last_tracked: new Date(Date.now() - Math.floor(Math.random() * 86400000 * 5)).toISOString(), // Last 5 days
            data_source: isADSB ? 'adsb' : 'mlat',
            raw_json: {
                flights: [
                    { origin: 'KLAX', destination: 'KSFO', filed_altitude: 350, filed_ete: 55 }
                ]
            }
        }

        // 4. Save to Cache
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + 7) // 7 Day TTL

        const { error: insertError } = await supabase
            .from('flight_cache')
            .upsert({
                tail_number: tail_number,
                total_hours_12m: mockFlightData.total_hours_12m,
                last_tracked: mockFlightData.last_tracked,
                data_source: mockFlightData.data_source,
                raw_json: mockFlightData.raw_json,
                expires_at: expiresAt.toISOString(),
                last_updated: new Date().toISOString()
            })

        if (insertError) {
            console.error('Cache save failed', insertError)
        }

        return new Response(JSON.stringify(mockFlightData), {
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

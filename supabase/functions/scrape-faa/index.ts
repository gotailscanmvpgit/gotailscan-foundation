
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * PHASE 2: FORENSIC PATTERN DISCOVERY
 * Uses specialized registry blocks to identify aircraft accurately.
 */
serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { tail_number } = await req.json()
        console.log(`🇺🇸 Phase 2 Discovery Triggered: ${tail_number}`);

        const mark = tail_number.toUpperCase().startsWith('N') ? tail_number.substring(1) : tail_number;

        // Deterministic Seed
        const seed = mark.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const random = (offset = 0) => {
            const x = Math.sin(seed + offset) * 10000;
            return x - Math.floor(x);
        };

        // STRATEGIC CHANGE: AI Pattern Matching Disabled for Data Reliability
        // We now strictly return 'found: false' if the aircraft is not in our known database.
        // This prevents "mismatched" or "hallucinated" data from being shown to users.

        console.log(`[Strict Mode] Pattern matcher bypassed for ${tail_number}. Returning Not Found.`);

        return new Response(JSON.stringify({
            found: false,
            message: "Strict reliability mode active. Estimated data disabled."
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        console.error("Discovery error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})


import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight request
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { email, intent } = await req.json()

        // In a real production app, this would trigger:
        // 1. An email via Resend/SendGrid to sales@gotailscan.com
        // 2. An entry in a 'leads' database table

        // For MVP, we simulate the lead capture delay
        console.log(`[Lead Capture] New Broker Request: ${email} for intent: ${intent}`);
        await new Promise(resolve => setTimeout(resolve, 800));

        return new Response(
            JSON.stringify({ success: true, message: "Request queued for white-glove onboarding." }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            },
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            },
        )
    }
})

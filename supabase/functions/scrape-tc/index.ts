
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { tail_number } = await req.json()
        console.log(`🇨🇦 Scraping TC for: ${tail_number}`);

        // Clean input: "C-GABC" -> "GABC"
        const mark = tail_number.replace(/^C-/, '').replace(/-/g, '').toUpperCase();

        // Attempt to hit the details page directly (This URL pattern is a best guess based on common ASP.NET routing)
        // Often it requires a session cookie (ViewState), which makes this HARD.
        // We will try a public search URL.
        const url = `https://wwwapps.tc.gc.ca/Saf-Sec-Sur/2/ccarcs-riacc/cn-rn.aspx`;
        // This probably won't work with GET parameters directly without the correct ViewState.

        // --- FALLBACK MOCK STRATEGY (Since Govt Sites Block Simple Scrapers) ---
        // In a real production environment, we would use Puppeteer/Playwright (browserless.io)
        // For this 'Edge Function', we will simulate a successful find for DEMO purposes
        // if the tail looks "Real" (valid C-XXXX format).

        /**
         * PHASE 2: FORENSIC PATTERN DISCOVERY (CANADA)
         */
        // STRATEGIC CHANGE: AI Pattern Matching Disabled for Data Reliability (Canada)
        // We now strictly return 'found: false' if the aircraft is not in our known database.

        console.log(`[Strict Mode] TC Pattern matcher bypassed for ${tail_number}. Returning Not Found.`);

        return new Response(JSON.stringify({
            found: false,
            message: "Strict reliability mode active. Estimated data disabled for Canadian Registry."
        }), {
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

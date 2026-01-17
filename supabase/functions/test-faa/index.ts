import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { n_number } = await req.json()
    if (!n_number) throw new Error('n_number required')

    console.log(`[Test-FAA] Scraping ${n_number}...`)
    const url = `https://registry.faa.gov/aircraftinquiry/Search/NNumberResult?nNumberTxt=${n_number}`

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      }
    })
    const html = await response.text()

    const doc = new DOMParser().parseFromString(html, "text/html")

    if (!doc) throw new Error("Failed to parse FAA HTML")

    // Helper to safely get text content
    const getText = (id: string) => doc.getElementById(id)?.textContent?.trim() || 'Unknown'

    // SMART SCRAPE STRATEGY: Find labels, then get next element
    const getValueByLabel = (labelText: string) => {
      // Find all label elements (usually span or td with class 'labels')
      const labels = doc.getElementsByClassName('labels');
      for (const label of labels) {
        if (label.textContent.includes(labelText)) {
          // The value is usually in the NEXT sibling element or a span with 'content' class nearby
          // In FAA registry, it's often: <span class="labels">Label</span> <span class="content">Value</span>
          // OR <td>Label</td> <td>Value</td>

          // Try next sibling
          let next = label.nextElementSibling;
          if (next && next.textContent.trim()) return next.textContent.trim();

          // Try parent's next sibling (if it's a table structure: td -> td)
          if (label.parentElement && label.parentElement.nextElementSibling) {
            return label.parentElement.nextElementSibling.textContent.trim();
          }
        }
      }
      return 'Unknown';
    };

    const data = {
      make: getValueByLabel('Manufacturer Name') || getText('ctl00_content_lblMfrName'), // Fallback to ID
      model: getValueByLabel('Model Name') || getText('ctl00_content_lblModelName'),
      year: getValueByLabel('Mfr Year') || getText('ctl00_content_lblMfrYear'),
      serial: getValueByLabel('Serial Number') || getText('ctl00_content_lblSerialNo'),
      owner: getValueByLabel('Name') || getText('ctl00_content_lblName'),
      status: getValueByLabel('Status') || getText('ctl00_content_lblStatus'),
      debug_html: html.substring(0, 200) // Keep it short
    }

    console.log("[Test-FAA] Success:", data)

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

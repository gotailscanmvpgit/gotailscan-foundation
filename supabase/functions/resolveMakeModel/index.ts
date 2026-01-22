// Supabase Edge Function: resolveMakeModel
// Uses AI to intelligently resolve aircraft make/model from context

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { tail_number, serial, year, raw_make_model } = await req.json()

        // Create Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        const supabase = createClient(supabaseUrl, supabaseKey)

        // Build AI prompt with context
        const prompt = `You are an aviation database expert. Resolve the aircraft make and model from the following information:

Tail Number: ${tail_number || 'Unknown'}
Serial Number: ${serial || 'Unknown'}
Year: ${year || 'Unknown'}
Registry Data: ${raw_make_model || 'Unknown'}

The registry data may contain FAA codes like "ACFT-CODE" or "SERIES-CONFIRMED". Your task is to:
1. Identify the actual aircraft manufacturer and model
2. Use the serial number pattern to determine the aircraft type
3. Cross-reference with known aircraft databases
4. Return the result in this exact JSON format:

{
  "make_model": "CESSNA 172S SKYHAWK",
  "manufacturer": "Cessna",
  "confidence": "high|medium|low",
  "reasoning": "Brief explanation of how you determined this"
}

If you cannot determine the make/model with confidence, return:
{
  "make_model": null,
  "confidence": "none",
  "reasoning": "Insufficient data"
}

Respond ONLY with valid JSON, no additional text.`

        // Call OpenAI API (or your preferred AI service)
        const openaiKey = Deno.env.get('OPENAI_API_KEY')

        if (!openaiKey) {
            console.warn('OpenAI API key not configured, using fallback logic')
            return new Response(
                JSON.stringify({
                    make_model: null,
                    confidence: 'none',
                    reasoning: 'AI service not configured'
                }),
                {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 200
                }
            )
        }

        const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${openaiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert aviation database analyst specializing in aircraft identification.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 300
            })
        })

        if (!aiResponse.ok) {
            throw new Error(`OpenAI API error: ${aiResponse.statusText}`)
        }

        const aiData = await aiResponse.json()
        const aiResult = JSON.parse(aiData.choices[0].message.content)

        // Log the resolution for analytics
        await supabase.from('make_model_resolutions').insert({
            tail_number,
            serial_number: serial,
            raw_make_model,
            resolved_make_model: aiResult.make_model,
            confidence: aiResult.confidence,
            reasoning: aiResult.reasoning,
            resolved_at: new Date().toISOString()
        }).catch(err => console.warn('Failed to log resolution:', err))

        return new Response(
            JSON.stringify(aiResult),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            }
        )

    } catch (error) {
        console.error('Error in resolveMakeModel:', error)
        return new Response(
            JSON.stringify({
                error: error.message,
                make_model: null,
                confidence: 'none'
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500
            }
        )
    }
})

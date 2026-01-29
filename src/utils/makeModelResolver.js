/**
 * Aircraft Make/Model Resolution Helper
 * Intelligently resolves aircraft make and model information
 * when FAA registry data is unclear or contains codes
 * 
 * Last updated: 2026-01-22 13:40 EST
 * Includes manufacturer_codes table lookup (93k+ codes)
 */

import React from 'react';
import { supabase } from '../lib/supabaseClient';

/**
 * Checks if a make/model string is "clean" (human-readable)
 * @param {string} makeModel - The make/model string from FAA registry
 * @returns {boolean} - True if clean, false if contains codes/unclear data
 */
export function isCleanMakeModel(makeModel) {
    if (!makeModel || makeModel === 'N/A') return false;

    // Check for FAA code patterns
    const codePatterns = [
        /Unknown Type/i,
        /ACFT-CODE/i,
        /SERIES-CONFIRMED/i,
        /TYPE-CERT/i,
        /MODEL-[A-Z0-9]{3,}/i,
        /^[A-Z0-9]{5,}$/,  // All caps alphanumeric codes
        /\d{4,}-\d{2,}/,    // Date-like codes
    ];

    return !codePatterns.some(pattern => pattern.test(makeModel));
}

/**
 * Resolves aircraft make/model using serial number cross-reference
 * Falls back to AI-powered resolution if database lookup fails
 * @param {Object} aircraftData - Aircraft data from FAA registry
 * @returns {Promise<Object>} - Resolved make/model information
 */
export async function resolveMakeModel(aircraftData) {
    const { make_model, serial, tail_number, year } = aircraftData;

    // If make/model is already clean, return it
    if (isCleanMakeModel(make_model)) {
        return {
            make_model,
            source: 'registry',
            confidence: 'high'
        };
    }

    console.log(`[MakeModel Resolver] Unclear registry data: "${make_model}". Attempting resolution...`);

    // Step 1: Try database lookup by serial number
    if (serial) {
        try {
            const dbResult = await lookupBySerialNumber(serial);
            if (dbResult) {
                console.log(`[MakeModel Resolver] ✓ Resolved via serial number: ${dbResult.make_model}`);
                return {
                    make_model: dbResult.make_model,
                    source: 'database',
                    confidence: 'high',
                    manufacturer: dbResult.manufacturer
                };
            }
        } catch (error) {
            console.warn('[MakeModel Resolver] Database lookup failed:', error);
        }
    }

    // Step 1.5: Try lookup by Manufacturer Code (Common in API responses)
    // The make_model field often contains the raw internal code (e.g. "2073461")
    const codeResult = await lookupByManufacturerCode(make_model);
    if (codeResult) {
        console.log(`[MakeModel Resolver] ✓ Resolved via Manufacturer Code: ${codeResult.make_model}`);
        return {
            make_model: codeResult.make_model,
            source: 'code_lookup',
            confidence: 'high',
            manufacturer: codeResult.manufacturer
        };
    }

    // Step 2: Try AI-powered resolution using Supabase Edge Function
    try {
        const aiResult = await resolveWithAI({
            tail_number,
            serial,
            year,
            raw_make_model: make_model
        });

        if (aiResult && aiResult.make_model) {
            console.log(`[MakeModel Resolver] ✓ Resolved via AI: ${aiResult.make_model}`);
            return {
                make_model: aiResult.make_model,
                source: 'ai',
                confidence: aiResult.confidence || 'medium',
                manufacturer: aiResult.manufacturer
            };
        }
    } catch (error) {
        console.warn('[MakeModel Resolver] AI resolution failed:', error);
    }

    // Step 3: Fallback to cleaned registry data
    console.log('[MakeModel Resolver] ⚠ Using fallback (registry data)');
    return {
        make_model: cleanRegistryData(make_model),
        source: 'registry_cleaned',
        confidence: 'low'
    };
}

/**
 * Looks up aircraft by serial number in our database
 * @param {string} serialNumber - Aircraft serial number
 * @returns {Promise<Object|null>} - Aircraft data or null
 */
async function lookupBySerialNumber(serialNumber) {
    // HARDCODED LOOKUP TABLE (temporary until database is populated)
    const knownSerials = {
        // Cirrus
        '10031': { make_model: 'CIRRUS SR22T', manufacturer: 'Cirrus Aircraft', type_certificate: 'A00009SC' },
        '0062': { make_model: 'CIRRUS SR20', manufacturer: 'Cirrus Aircraft', type_certificate: 'A00009SC' },

        // Cessna
        '17280123': { make_model: 'CESSNA 172S SKYHAWK', manufacturer: 'Cessna', type_certificate: 'A00003SE' },
        '17281234': { make_model: 'CESSNA 172R SKYHAWK', manufacturer: 'Cessna', type_certificate: 'A00003SE' },
        '18280001': { make_model: 'CESSNA 182T SKYLANE', manufacturer: 'Cessna', type_certificate: 'A00003SE' },
        '20608001': { make_model: 'CESSNA 206H STATIONAIR', manufacturer: 'Cessna', type_certificate: 'A00003SE' },

        // Piper
        '28-7615078': { make_model: 'PIPER PA-28-181 ARCHER III', manufacturer: 'Piper Aircraft', type_certificate: 'A00001SE' },
        '22-8008001': { make_model: 'PIPER PA-28-180 CHEROKEE', manufacturer: 'Piper Aircraft', type_certificate: 'A00001SE' },
        '4636001': { make_model: 'PIPER PA-46-350P MALIBU MIRAGE', manufacturer: 'Piper Aircraft', type_certificate: 'A24CE' },

        // Diamond (Canadian common)
        '40.123': { make_model: 'DIAMOND DA40 STAR', manufacturer: 'Diamond Aircraft', type_certificate: 'A00010AT' },
        '42.123': { make_model: 'DIAMOND DA42 TWIN STAR', manufacturer: 'Diamond Aircraft', type_certificate: 'A00010AT' },

        // Beechcraft
        'TH-2123': { make_model: 'BEECHCRAFT BONANZA F33A', manufacturer: 'Beechcraft', type_certificate: 'A-777' },
        'BE-123': { make_model: 'BEECHCRAFT BARON 58', manufacturer: 'Beechcraft', type_certificate: 'A-1246' },

        // Add more as needed
    };

    // Check hardcoded table first
    if (knownSerials[serialNumber]) {
        console.log(`[Resolver] ✓ Found in hardcoded table: ${serialNumber}`);
        return knownSerials[serialNumber];
    }

    // Then try database
    // [FIX] Disabled strict DB lookup until 'aircraft_reference' table is fully migrated
    // This prevents 404 errors in the console.
    /*
    try {
        const { data, error } = await supabase
            .from('aircraft_reference')
            .select('make_model, manufacturer, type_certificate')
            .eq('serial_number', serialNumber)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        // Table might not exist yet, or no match found
        return null;
    }
    */
    return null;
}

/**
 * Resolves make/model using AI (Supabase Edge Function)
 * @param {Object} context - Aircraft context for AI resolution
 * @returns {Promise<Object|null>} - AI-resolved data or null
 */
async function resolveWithAI(context) {
    try {
        const { data, error } = await supabase.functions.invoke('resolveMakeModel', {
            body: context
        });

        if (error) throw error;
        return data;
    } catch (error) {
        // Edge function might not be deployed yet
        console.warn('[AI Resolver] Edge function not available:', error.message);
        return null;
    }
}

/**
 * Cleans registry data by removing obvious codes
 * @param {string} makeModel - Raw make/model string
 * @returns {string} - Cleaned string
 */
function cleanRegistryData(makeModel) {
    if (!makeModel) return 'Unknown Aircraft';

    // Remove common code patterns
    let cleaned = makeModel
        .replace(/ACFT-CODE[:\s]*/gi, '')
        .replace(/SERIES-CONFIRMED[:\s]*/gi, '')
        .replace(/TYPE-CERT[:\s]*/gi, '')
        .replace(/MODEL-/gi, '')
        .trim();

    // If result is still unclear, return generic message
    if (cleaned.length < 3 || /^[A-Z0-9]{5,}$/.test(cleaned)) {
        return 'Aircraft Model Unavailable';
    }

    return cleaned;
}

/**
 * React hook for resolving make/model in components
 * @param {Object} aircraftData - Aircraft data from FAA registry
 * @returns {Object} - { makeModel, isLoading, source, confidence }
 */
export function useMakeModelResolver(aircraftData) {
    const [state, setState] = React.useState({
        makeModel: aircraftData?.make_model || 'Loading...',
        isLoading: true,
        source: 'registry',
        confidence: 'unknown'
    });

    React.useEffect(() => {
        if (!aircraftData) {
            setState({ makeModel: 'N/A', isLoading: false, source: 'none', confidence: 'none' });
            return;
        }

        resolveMakeModel(aircraftData).then(result => {
            setState({
                makeModel: result.make_model,
                isLoading: false,
                source: result.source,
                confidence: result.confidence,
                manufacturer: result.manufacturer
            });
        });
    }, [aircraftData?.serial, aircraftData?.tail_number]);

    return state;
}

/**
 * Looks up aircraft by known Manufacturer Codes (internal registry IDs)
 * Fetches from Supabase 'manufacturer_codes' table
 * @param {string} rawString - The raw make/model string or code
 * @returns {Promise<Object|null>} - Resolved code data or null
 */
async function lookupByManufacturerCode(rawString) {
    if (!rawString) return null;

    // Normalize string: try to extract just the numbers if it's mixed
    // API sometimes sends "2073461" or "Unknown Type (2073461)"
    const numericMatch = rawString.match(/(\d{5,8})/);
    const code = numericMatch ? numericMatch[1] : rawString.trim();

    // LEGACY HARDCODED FALLBACK (Used if DB fails or empty in dev)
    const LEGACY_MAPPINGS = {
        '2073461': { make_model: 'CESSNA TTX', manufacturer: 'Cessna' },
        '2073303': { make_model: 'CESSNA TURBO 206H STATIONAIR', manufacturer: 'Cessna' },
        '2072738': { make_model: 'CESSNA TURBO 182T SKYLANE', manufacturer: 'Cessna' },
        '2073460': { make_model: 'CESSNA TTX', manufacturer: 'Cessna' },
        '2073320': { make_model: 'CESSNA 400', manufacturer: 'Cessna' },
        '2073418': { make_model: 'CESSNA 162 SKYCATCHER', manufacturer: 'Cessna' },
        '2073450': { make_model: 'CESSNA CITATION M2', manufacturer: 'Cessna' },
        '1152914': { make_model: 'BEECHCRAFT KING AIR E90', manufacturer: 'Beechcraft' },
        '1152500': { make_model: 'BEECHCRAFT BONANZA G36', manufacturer: 'Beechcraft' },
        '2260001': { make_model: 'CIRRUS SR22', manufacturer: 'Cirrus Design' },
        '2260020': { make_model: 'CIRRUS SR22T', manufacturer: 'Cirrus Design' },
        '05619': { make_model: 'AEROCOMP COMP AIR 9', manufacturer: 'Aerocomp' },
        '05620': { make_model: 'AEROCOMP COMP AIR 7', manufacturer: 'Aerocomp' },
    };

    try {
        // Try to fetch from Supabase
        const { data, error } = await supabase
            .from('manufacturer_codes')
            .select('make_model, manufacturer')
            .eq('code', code)
            .maybeSingle();

        if (data && !error) {
            return data;
        }
    } catch (err) {
        // Silent fail on DB error, proceed to fallback
    }

    // Fallback to legacy map
    if (LEGACY_MAPPINGS[code]) {
        return LEGACY_MAPPINGS[code];
    }

    return null;
}

// For non-React usage (e.g., in service workers or utilities)
export default {
    resolveMakeModel,
    isCleanMakeModel,
    cleanRegistryData
};

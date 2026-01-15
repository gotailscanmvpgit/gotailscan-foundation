import { calculateConfidenceScore } from '../utils/scoring';
import { supabase } from '../lib/supabaseClient';

/**
 * Orchestrates data aggregation from FAA SDRS, NTSB, and CADORS.
 */
export const scraperService = {
    scanTailNumber: async (nNumber, paymentStatus = 'unpaid', planId = null) => {
        console.log(`[Scraper] Initializing forensic scan for: ${nNumber}`);

        // MOCK DATA (Forensic Sources - Keep generated locally for now)
        const rawData = {
            ntsb_data: [
                { id: 'WPR18LA121', year: 2018, type: 'Incident', severity: 'Substantial Damage', deduction: 35, reason: 'NTSB Incident (2018)' }
            ],
            cadors_data: [],
            sdr_data: [
                { id: 'SDR-54321', date: '2022-05-12', part: 'Wing Spar', deduction: 0, reason: 'Mechanical SDR' }
            ],
            churn_data: { owners: 3, months: 24, deduction: 5, reason: 'Ownership Churn (3 in 24mo)' }
        };

        const score = calculateConfidenceScore(rawData);

        // Map to UI format
        const deductions = [];
        if (rawData.ntsb_data.length > 0) {
            rawData.ntsb_data.forEach(d => deductions.push({ reason: d.reason, points: `-${d.deduction}` }));
        }
        if (rawData.cadors_data.length > 0) {
            deductions.push({ reason: 'CADORS Safety Record Found', points: `-${rawData.cadors_data.length * 20}` });
        }
        if (rawData.sdr_data.length > 0) {
            deductions.push({ reason: 'SDR Mechanical Defect Found', points: '-15' }); // Assuming 15 per previous logic
        }
        if (rawData.churn_data) {
            deductions.push({ reason: rawData.churn_data.reason, points: `-${rawData.churn_data.deduction}` });
        }

        // Call Supabase Edge Function for Flight Data
        let flightData = null;
        try {
            console.log(`[Scraper] Invoking 'fetchFlightData' for ${nNumber}...`);
            // We proceed even if network fails, ensuring the forensic report (main value) is still delivered.
            const { data, error } = await supabase.functions.invoke('fetchFlightData', {
                body: {
                    tail_number: nNumber,
                    payment_status: paymentStatus,
                    plan_id: planId
                }
            });

            if (error) {
                // Common case: 402 Payment Required
                console.warn('[Scraper] fetchFlightData returned error:', error);
            } else {
                flightData = data;
            }

        } catch (err) {
            console.error('[Scraper] Network error invoking edge function:', err);
        }

        return {
            tail_number: nNumber,
            confidence_score: score,
            deductions: deductions,
            flight_data: flightData,
            source_data: {
                ntsb: rawData.ntsb_data,
                cadors: rawData.cadors_data,
                sdr: rawData.sdr_data
            }
        };
    }
};

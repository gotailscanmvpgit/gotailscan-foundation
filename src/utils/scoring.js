/**
 * Calculates the forensic confidence score based on aircraft data.
 * Base score: 100
 * Accidents: -40 pts
 * CADORS Incidents: -20 pts
 * Mechanical SDRs: -15 pts
 * Floor: 0
 * 
 * @param {Object} data - Aggregated data from NTSB, CADORS, and SDRS
 * @returns {number} Calculated score between 0 and 100
 */
export const calculateConfidenceScore = (data) => {
    let score = 100;

    if (data.ntsb_data && Array.isArray(data.ntsb_data)) {
        data.ntsb_data.forEach(item => {
            score -= item.deduction || 0;
        });
    }

    if (data.cadors_data && Array.isArray(data.cadors_data)) {
        score -= data.cadors_data.length * 20;
    }

    if (data.sdr_data && Array.isArray(data.sdr_data)) {
        score -= data.sdr_data.length * 15;
    }

    if (data.churn_data) {
        score -= data.churn_data.deduction || 0;
    }

    if (data.liens_found) {
        score -= 20;
    }

    return Math.max(0, score);
};

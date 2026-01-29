
// Logic Engine for Seller Role & Asset Analysis

// 1. SALES LIKELIHOOD ALGORITHM (The 'Hunter')
export const predictSalesLikelihood = (dormancyMonths: number, ownershipYears: number, acftAge: number, daysOnMarket: number, serial: string) => {
    let score = 15; // Baseline churn
    let signals: string[] = [];
    let label = "HOLDING";

    // 1. Owner Disengagement (Strongest Signal)
    if (dormancyMonths >= 6) {
        score += 45;
        signals.push("Owner Disengagement (Dormant >6mo)");
    } else if (dormancyMonths >= 3) {
        score += 20;
        signals.push("Usage Decline");
    }

    // 2. Lifecycle Events
    if (ownershipYears > 20) {
        score += 25;
        signals.push("Generational Exit (20yr+ Owner)");
    } else if (ownershipYears < 1) {
        score += 15;
        signals.push("Potential Flip / Bridge");
    }

    // 3. Market Pressure
    if (daysOnMarket < 45) { // Hot market
        score += 10;
        signals.push("High Market Demand");
    }

    // Cap and Label
    score = Math.min(99, Math.round(score));

    if (score > 75) label = "LIKELY LISTING SOON";
    else if (score > 50) label = "POSSIBLE CHURN";
    else label = "LONG TERM HOLD";

    const channel = {
        method: score > 60 ? "DIRECT_TO_OWNER" : "BROKER_PROXY",
        status: "ACTIVE_CHANNEL",
        proxy_email: `acquisitions+${serial}@gotailscan.com`,
        unlock_fee: score > 80 ? "$450.00" : "$0.00 (Standard)",
        blind_offer_allowed: score > 70
    };

    return { score, label, signals, channel };
};

// 2. TRANSPARENCY SCORE
export const getTransparency = (owner: string) => {
    const ow = (owner || '').toUpperCase();
    if (ow.includes('TRUST')) return { score: 30, label: 'BLACK BOX', desc: 'Trustee-owned. Beneficial owner identity is legally shielded.' };
    if (ow.includes('LLC') || ow.includes('HOLDINGS') || ow.includes('Pty')) return { score: 65, label: 'TINTED BOX', desc: 'Corporate entity. Ownership is layered through shell structuring.' };
    return { score: 95, label: 'GLASS BOX', desc: 'Individual/Direct ownership. High transparency profile.' };
};

// 3. JURISDICTION & REGULATORY PROFILE
export const getJurisdictionProfile = (tail: string) => {
    if (tail.startsWith('C-')) {
        return {
            authority: "TRANSPORT CANADA / NAV CANADA",
            flag: "🇨🇦",
            rules: "CARs (Canadian Aviation Regulations)",
            advisories: [
                "CROSS-BORDER: Import to US requires De-registration & Export CoA.",
                "TAX WARNING: GST/HST (5-15%) applies on Canadian transaction values.",
                "LIEN SEARCH: FAA Title Search does NOT cover Canada. Use Provincial PPSA search."
            ],
            link_status: "NAVCANADA DATA LINK: ACTIVE"
        };
    }
    return {
        authority: "FAA (USA)",
        flag: "🇺🇸",
        rules: "FARs (Federal Aviation Regulations)",
        advisories: [
            "DOMESTIC: Standard FAA Title 14 rules apply.",
            "TAX: State Sales Tax applies based on hangar location."
        ],
        link_status: "FAA REGISTRY: ACTIVE"
    };
};

// 4. HANGAR QUEEN RISK INDEX (HQRI)
export const calculateHQRI = (dormancyMonths: number, climateData: any, makeModel: string) => {
    let score = 0; // 0 = Pristine, 100 = Rotted
    let triggers: string[] = [];
    let riskLevel = "LOW";

    // Base Dormancy Factor
    if (dormancyMonths > 1) score += 10;
    if (dormancyMonths > 3) score += 25;
    if (dormancyMonths > 6) score += 40;
    if (dormancyMonths > 12) score += 80;

    // Environmental Multiplier
    if (climateData.salinity === 'HIGH') {
        score = Math.min(100, score * 1.5);
        if (dormancyMonths > 2) triggers.push("SALT AIR CORROSION");
    }
    if (climateData.uv_index === 'INTENSE') {
        score += 5; // Paint/Interior fade
        triggers.push("UV EXPOSURE");
    }

    // Engine Susceptibility
    const mm = (makeModel || '').toUpperCase();
    const isTurbine = mm.includes('JET') || mm.includes('CITATION') || mm.includes('KING AIR');

    if (!isTurbine && dormancyMonths > 4) {
        score += 15; // Pistons rot faster (camshafts)
        triggers.push("CAMSHAFT RUST RISK");
    } else if (isTurbine && dormancyMonths > 12) {
        score += 10; // Seal drying
        triggers.push("SEAL DRY ROT");
    }

    // Normalize
    score = Math.min(100, Math.round(score));

    if (score > 80) riskLevel = "CRITICAL";
    else if (score > 50) riskLevel = "HIGH";
    else if (score > 20) riskLevel = "MODERATE";

    return { score, level: riskLevel, triggers };
};

// 5. TAX INTELLIGENCE
export const getTaxBenefits = (price: number) => {
    const currentYear = new Date().getFullYear();
    const rate = currentYear === 2025 ? 0.40 : (currentYear === 2026 ? 0.20 : 0.0);
    const deduction = price * rate;
    return {
        bonus_depreciation_rate: `${(rate * 100).toFixed(0)}%`,
        year_1_deduction: deduction,
        strategy: "Part 135 Leaseback Program"
    };
};

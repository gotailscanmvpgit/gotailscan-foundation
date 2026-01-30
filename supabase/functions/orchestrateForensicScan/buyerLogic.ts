
// Logic Engine for Buyer Role Calculations

// Helper for deterministic randomness based on tail number
export const createRandom = (seedInput: string) => {
    const seed = seedInput.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return (offset = 0) => {
        const x = Math.sin(seed + offset) * 10000;
        return x - Math.floor(x);
    };
};

export const getBasePrice = (makeModel: string) => {
    const mm = makeModel.toUpperCase();
    // Pistons
    if (mm.includes('172')) return 185000;
    if (mm.includes('182')) return 225000;
    if (mm.includes('206')) return 450000;
    if (mm.includes('210')) return 350000;
    if (mm.includes('SR22')) return 650000;
    if (mm.includes('SR20')) return 400000;
    if (mm.includes('BONANZA') || mm.includes('A36')) return 380000;
    if (mm.includes('BARON')) return 420000;
    if (mm.includes('PA-46') || mm.includes('MALIBU') || mm.includes('MERIDIAN')) return 1200000;
    if (mm.includes('MOONEY')) return 220000;
    if (mm.includes('DIAMOND') && mm.includes('62')) return 950000;
    if (mm.includes('DIAMOND') && mm.includes('42')) return 650000;

    // Turboprops
    if (mm.includes('KING AIR 350')) return 3500000;
    if (mm.includes('KING AIR 200') || mm.includes('B200')) return 2200000;
    if (mm.includes('KING AIR 90') || mm.includes('C90')) return 1500000;
    if (mm.includes('KING AIR')) return 2000000; // Fallback
    if (mm.includes('PILATUS') || mm.includes('PC-12')) return 4500000;
    if (mm.includes('TBM')) return 3800000;
    if (mm.includes('CARAVAN')) return 2200000;

    // Jets
    if (mm.includes('CITATION X') || mm.includes('TEN')) return 8000000;
    if (mm.includes('CITATION SOVEREIGN')) return 6500000;
    if (mm.includes('CITATION EXCEL') || mm.includes('XLS')) return 5500000;
    if (mm.includes('CITATION CJ')) return 4500000;
    if (mm.includes('CITATION')) return 3500000; // Fallback
    if (mm.includes('PHENOM 300')) return 9500000;
    if (mm.includes('PHENOM 100')) return 3500000;
    if (mm.includes('CHALLENGER 3')) return 12000000;
    if (mm.includes('CHALLENGER 6')) return 8000000;
    if (mm.includes('GULFSTREAM')) return 15000000;
    if (mm.includes('GLOBAL')) return 25000000;

    return 250000; // Generic GA average
};

export const getOperatingCosts = (makeModel: string) => {
    const mm = makeModel.toUpperCase();
    let gph = 10;
    let fuelType = 'Avgas';
    let maintPerHour = 45;
    let reservePerHour = 35;
    let annualFixed = 12000;

    if (mm.includes('CITATION') || mm.includes('CHALLENGER')) {
        gph = 250; fuelType = 'Jet-A'; maintPerHour = 450; reservePerHour = 600; annualFixed = 85000;
    } else if (mm.includes('KING AIR') || mm.includes('B200') || mm.includes('B300') || mm.includes('MERIDIAN')) {
        gph = 100; fuelType = 'Jet-A'; maintPerHour = 250; reservePerHour = 300; annualFixed = 45000;
    } else if (mm.includes('BARON') || mm.includes('310')) {
        gph = 28; fuelType = 'Avgas'; maintPerHour = 95; reservePerHour = 80; annualFixed = 22000;
    } else if (mm.includes('SR22') || mm.includes('210') || mm.includes('BONANZA') || mm.includes('SARATOGA')) {
        gph = 16; fuelType = 'Avgas'; maintPerHour = 65; reservePerHour = 55; annualFixed = 15000;
    } else if (mm.includes('172') || mm.includes('ARCHER') || mm.includes('MOONEY')) {
        gph = 9; fuelType = 'Avgas'; maintPerHour = 40; reservePerHour = 30; annualFixed = 9000;
    }

    const fuelPrice = fuelType === 'Jet-A' ? 6.50 : 7.25;
    const hourlyFuel = Math.round(gph * fuelPrice);
    const totalHourly = hourlyFuel + maintPerHour + reservePerHour;

    return {
        hourly_fuel: hourlyFuel,
        hourly_maintenance: maintPerHour,
        hourly_reserve: reservePerHour,
        total_hourly_direct: totalHourly,
        annual_fixed_est: annualFixed,
        fuel_type: fuelType,
        gph_est: gph
    };
};

export const getMarketVelocity = (model: string) => {
    const mm = model.toUpperCase();
    if (mm.includes('172') || mm.includes('SR22') || mm.includes('PHENOM') || mm.includes('PC-12')) {
        return { days_on_market: 22, liquidity: 'HIGH', demand_index: 88 };
    }
    if (mm.includes('CITATION') || mm.includes('KING AIR') || mm.includes('TBM')) {
        return { days_on_market: 45, liquidity: 'MODERATE', demand_index: 65 };
    }
    if (mm.includes('GULFSTREAM') || mm.includes('GLOBAL') || mm.includes('CHALLENGER')) {
        return { days_on_market: 55, liquidity: 'STABLE', demand_index: 52 };
    }
    return { days_on_market: 75, liquidity: 'STABLE', demand_index: 45 };
};

export const getPerformanceProfile = (model: string) => {
    const mm = model.toUpperCase();
    // Defaults
    let speed = 140; // kts
    let range = 600; // nm
    let useful_load = 800; // lbs

    if (mm.includes('CIRRUS') || mm.includes('SR22')) { speed = 175; range = 900; useful_load = 1000; }
    else if (mm.includes('SR20')) { speed = 150; range = 700; useful_load = 850; }
    else if (mm.includes('172')) { speed = 120; range = 500; useful_load = 800; }
    else if (mm.includes('182')) { speed = 140; range = 800; useful_load = 1100; }
    else if (mm.includes('BONANZA') || mm.includes('A36')) { speed = 165; range = 850; useful_load = 1200; }
    else if (mm.includes('BARON')) { speed = 190; range = 1000; useful_load = 1600; }
    else if (mm.includes('MOONEY')) { speed = 160; range = 1000; useful_load = 900; }
    else if (mm.includes('PA-46') || mm.includes('MALIBU') || mm.includes('MERIDIAN')) { speed = 260; range = 1000; useful_load = 1500; }
    else if (mm.includes('KING AIR 350')) { speed = 310; range = 1500; useful_load = 3500; }
    else if (mm.includes('KING AIR')) { speed = 270; range = 1200; useful_load = 2500; }
    else if (mm.includes('PILATUS') || mm.includes('PC-12')) { speed = 280; range = 1600; useful_load = 2800; }
    else if (mm.includes('CITATION') || mm.includes('CJ')) { speed = 380; range = 1300; useful_load = 3000; }
    else if (mm.includes('CITATION X')) { speed = 525; range = 3000; useful_load = 5000; }
    else if (mm.includes('GULFSTREAM')) { speed = 480; range = 4000; useful_load = 6000; }
    else if (mm.includes('ROBINSON')) { speed = 110; range = 300; useful_load = 700; }

    return { cruise_speed: speed, max_range: range, useful_load: useful_load };
};

export const analyzeAvionics = (yearStr: any, makeModel: string, random: (offset?: number) => number) => {
    const year = parseInt(yearStr) || 1980;
    const mm = (makeModel || '').toUpperCase();
    let score = 30; // Base score for legacy
    let type = "STEAM GAUGES";
    let features = ["Analog Six-Pack", "Standard Radio"];
    let verdict = "OBSOLETE";

    // const age = 2026 - year; // Not used

    if (year >= 2018) {
        score = 98; type = "TOUCHSCREEN GLASS"; features = ["Synthetic Vision", "Auto-Land Capable", "Connected Cockpit"]; verdict = "FUTURE-PROOF";
    } else if (year >= 2011) {
        score = 88; type = "INTEGRATED GLASS"; features = ["WAAS GPS", "ADS-B In/Out", "Digital Autopilot"]; verdict = "MODERN";
    } else if (year >= 2004) {
        score = 70; type = "EARLY GLASS"; features = ["Multi-Function Display", "GPS Navigation", "Traffic Advisory"]; verdict = "LEGACY GLASS";
    } else if (year >= 1996) {
        score = 55; type = "HYBRID PANEL"; features = ["Digital HSI", "Moving Map GPS", "Digital Engine Monitor"]; verdict = "TRANSITIONAL";
    }

    // Model Specific Intelligence
    if (mm.includes('SR22') || mm.includes('SR20')) {
        if (year >= 2003 && year < 2008) { type = "AVIDYNE ENTEGRA"; score = 72; features = ["Dual PFD/MFD", "Dual Garmin 430"]; verdict = "LEGACY GLASS"; }
        if (year >= 2008) { type = "GARMIN PERSPECTIVE"; score = 94; features.push("Blue Button LvL", "Synthetic Vision"); verdict = "MARKET LEADER"; }
    }
    if (mm.includes('CITATION') || mm.includes('CJ')) {
        if (score < 60) { type = "EFIS TUBE / FMS"; features = ["Honeywell SPZ", "Universal FMS"]; verdict = "DATED"; }
    }
    if (mm.includes('PILATUS')) {
        if (year >= 2014) { type = "HONEYWELL APEX"; score = 96; verdict = "AIRLINER TECH"; }
    }
    if (mm.includes('ROBINSON')) {
        if (year >= 2018) { type = "GARMIN HELI-GLASS"; features.push("Heli-SAS Autopilot"); }
    }

    // ADS-B Check (Simulated high probability for active aircraft)
    if (random(25) > 0.1 || year > 2000) {
        features.push("ADS-B Out Compliant");
    }

    return { score, type, features, verdict };
};

export const predictMaintenance = (makeModel: string, yearStr: any, fleetData: any, dormancyAnalysis: any) => {
    // console.log(`[Orchestrator] Initializing C3 AI / PAG Predictive Module for ${makeModel}`);

    const mm = (makeModel || '').toUpperCase();
    const year = parseInt(yearStr) || 1990;
    const age = new Date().getFullYear() - year;
    const isTurbine = mm.includes('CITATION') || mm.includes('KING AIR') || mm.includes('PILATUS') || mm.includes('TBM') || mm.includes('JET')
        || mm.includes('PHENOM') || mm.includes('EMBRAER') || mm.includes('GULFSTREAM') || mm.includes('CHALLENGER')
        || mm.includes('FALCON') || mm.includes('LEAR') || mm.includes('GLOBAL') || mm.includes('HONDA') || mm.includes('PREMIER');

    // 1. COMPONENT LIBRARY (MTBF & CRITICALITY)
    const partsLibrary = {
        PISTON: [
            { name: "Vacuum Pump", mtbf: 600, cost: 800, beta: 3.5 }, // wear-out failure info
            { name: "Alternator", mtbf: 1500, cost: 1200, beta: 2.0 },
            { name: "Magnetos", mtbf: 500, cost: 1500, beta: 4.0 },
            { name: "Fuel Servo", mtbf: 2000, cost: 2500, beta: 1.5 },
            { name: "Starter", mtbf: 1800, cost: 900, beta: 2.5 },
            { name: "Exhaust Risers", mtbf: 1200, cost: 3000, beta: 3.0 },
            { name: "Cylinder Head", mtbf: 2000, cost: 3500, beta: 2.5 }
        ],
        TURBINE: [
            { name: "Starter Generator", mtbf: 1200, cost: 8000, beta: 2.5 },
            { name: "FCU (Fuel Control)", mtbf: 3000, cost: 18000, beta: 1.8 },
            { name: "Igniters", mtbf: 800, cost: 2500, beta: 3.0 },
            { name: "Bleed Valve", mtbf: 2000, cost: 6500, beta: 2.2 },
            { name: "Flow Divider", mtbf: 2500, cost: 5500, beta: 2.0 }
        ]
    };

    const pool = isTurbine ? partsLibrary.TURBINE : partsLibrary.PISTON;

    // 2. WEIBULL DEGRADATION SIMULATION
    // Estimate Total Airframe Hours (Approx 150hrs/yr for GA, 300hrs/yr for Corp)
    const avgAnnualUsage = isTurbine ? 350 : 125;
    const totalHours = age * avgAnnualUsage;

    const timeline: any[] = [];

    pool.forEach((part, i) => {
        // Simulate "Time Since Overhaul" (TSO) using pseudorandom hash of tail+part
        // This makes the prediction deterministic but "random" per aircraft
        const hash = (makeModel.length + part.name.length + year + i) * 12345;
        const estimatedTSO = (totalHours + hash) % part.mtbf; // Where are we in the lifecycle?

        // Weibull Reliability Function: R(t) = e^(-(t/eta)^beta)
        // We approximate eta as MTBF for simplicity here
        // Health % = Probability of survival at current TSO
        const degradation = Math.pow((estimatedTSO / part.mtbf), part.beta);
        const health = Math.max(0, Math.min(100, (1 - degradation) * 100));

        let limit = "GREEN";
        let risk_label = "HEALTHY";

        if (health < 20) {
            limit = "URGENT"; // < 20% Life Remaining
            risk_label = "DEGRADATION DETECTED";
        } else if (health < 45) {
            limit = "NEAR_TERM";
            risk_label = "WEAR SIGNATURE";
        } else if (dormancyAnalysis && dormancyAnalysis.last_flight_gap > 3 && i < 2) {
            // Dormancy penalty for moving parts
            limit = "NEAR_TERM";
            risk_label = "DORMANCY RISK";
        }

        if (limit !== "GREEN" || (estimatedTSO > part.mtbf * 0.7)) {
            timeline.push({
                part: part.name,
                status: limit,
                health_pct: Math.floor(health),
                est_hours_remaining: Math.floor(part.mtbf - estimatedTSO),
                est_cost: part.cost,
                label: risk_label,
                // C3/PAG Style Metadata
                analytics: {
                    tso_est: estimatedTSO,
                    mtbf_model: part.mtbf,
                    degradation_index: degradation.toFixed(2)
                }
            });
        }
    });

    // Add real fleet data if available (augmenting the simulation)
    if (fleetData && fleetData.top_reliability_issues) {
        fleetData.top_reliability_issues.forEach((issue: any) => {
            if (issue.frequency_pct > 0.15) { // Significant fleet issue
                timeline.push({
                    part: issue.component,
                    status: "NEAR_TERM",
                    health_pct: 65, // Genetic defect assumption
                    est_hours_remaining: 0,
                    est_cost: 0,
                    label: "FLEET DEFECT ALERT",
                    source: "C3_FLEET_CORRELATION"
                });
            }
        });
    }

    timeline.sort((a, b) => a.health_pct - b.health_pct);

    // 3. PAG (PROBABILITY OF AIRCRAFT GROUNDING) SCORE
    // PAG = 1 - (Product of Reliability of all Critical Systems)
    // Simplified: Heavily weighted by the worst component and dormancy
    let maxRisk = 0;
    timeline.forEach(item => {
        if (item.status === 'URGENT') maxRisk += 35;
        else if (item.status === 'NEAR_TERM') maxRisk += 15;
    });

    // Age Penalty
    if (age > 30) maxRisk += 10;
    if (age > 50) maxRisk += 15;

    // Dormancy Factor (C3 "Sit-Rot" Algorithm)
    if (dormancyAnalysis.last_flight_gap > 2) maxRisk += (dormancyAnalysis.last_flight_gap * 5);

    const pag_score = Math.min(99, Math.max(5, maxRisk));

    let advisory = "SYSTEMS NOMINAL";
    if (pag_score > 80) advisory = "C3: CRITICAL READINESS RISK";
    else if (pag_score > 50) advisory = "C3: DEGRADED READINESS";
    else if (pag_score > 25) advisory = "C3: MAINTENANCE PREDICTED";

    return {
        system_type: `PAG-AI (${isTurbine ? 'TURBINE' : 'RECIPROCATING'})`,
        forecast: timeline.slice(0, 5),
        pag_score: pag_score,
        advisory: advisory,
        model_version: "C3-PAG v2.1"
    };
};

export const generateMarketHistory = (currentValuation: number, random: (offset?: number) => number) => {
    const history: any[] = [];
    const basePrice = currentValuation || 500000;
    const currentYear = new Date().getFullYear(); // 2026

    const trendMap = [
        { year: currentYear, factor: 1.0 },
        { year: currentYear - 1, factor: 0.98 }, // 2025
        { year: currentYear - 2, factor: 1.05 }, // 2024
        { year: currentYear - 3, factor: 1.15 }, // 2023
        { year: currentYear - 4, factor: 0.85 }, // 2022
        { year: currentYear - 5, factor: 0.70 }, // 2021
    ];

    trendMap.reverse().forEach(point => {
        const noise = 1 + ((random(point.year) - 0.5) * 0.05);
        const historicPrice = Math.round(basePrice * point.factor * noise);
        history.push({ year: point.year, price: historicPrice });
    });

    return history;
};

export const getStateClimate = (state: string) => {
    const coastal = ['FL', 'CA', 'TX', 'NC', 'SC', 'GA', 'NY', 'WA', 'BC', 'NSW', 'QLD'];
    const southern = ['FL', 'TX', 'AZ', 'NM', 'QC', 'NSW', 'WA', 'MEXICO', 'AUSTRALIA'];
    const st = (state || '').toUpperCase();
    return {
        salinity: coastal.some(c => st.includes(c)) ? 'HIGH' : 'LOW',
        uv_index: southern.some(s => st.includes(s)) ? 'INTENSE' : 'MODERATE'
    };
};

export const getCoordinates = (state: string, country: string) => {
    const st = (state || '').toUpperCase();
    // const ct = (country || '').toUpperCase(); // Not used currently
    const coordMap: Record<string, { lat: number; lng: number }> = {
        'FL': { lat: 27.8, lng: -81.5 },
        'CA': { lat: 36.1, lng: -119.6 },
        'TX': { lat: 31.0, lng: -100.0 },
        'AZ': { lat: 34.0, lng: -111.6 },
        'NY': { lat: 43.0, lng: -75.0 },
        'WA': { lat: 47.7, lng: -120.7 },
        'BC': { lat: 53.7, lng: -127.6 },
        'NSW': { lat: -31.2, lng: 146.9 },
        'QLD': { lat: -20.9, lng: 142.7 },
        'UNITED STATES': { lat: 39.8, lng: -98.6 },
        'CANADA': { lat: 56.1, lng: -106.3 },
    };
    return coordMap[st] || { lat: 39.8, lng: -98.6 }; // Default US Center
};

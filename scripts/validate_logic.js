
// VERIFICATION SCRIPT FOR AIRCRAFT LOGIC
// This script simulates the backend logic to verify that tail numbers resolve to correct aircraft types.

// --- 1. THE MAP (Copied from aircraftCodeMap.ts for verification) ---
const AIRCRAFT_CODE_MAP = {
    // === PIPER ===
    '2730013': 'CESSNA 172 SKYHAWK', // Corrected from Piper Aerostar
    '7106014': 'PIPER PA-60-602P AEROSTAR',
    '3010001': 'PIPER PA-28 CHEROKEE',

    // === CESSNA ===
    '2072701': 'CESSNA 206 STATIONAIR',

    // === BUSINESS JETS ===
    '2600001': 'GULFSTREAM G-IV',
    '2600005': 'GULFSTREAM G650',
    '2500002': 'EMBRAER PHENOM 300',
    '2340002': 'DASSAULT FALCON 900',
    '1700001': 'BOMBARDIER CHALLENGER 300'
};

// --- 2. THE LOGIC ---
function parseAircraftMakeModel(rawMakeModel) {
    if (!rawMakeModel) return 'Unknown Aircraft';

    // Check if it contains an aircraft code
    const codeMatch = rawMakeModel.match(/ACFT-CODE:\s*(\d+)/i) || rawMakeModel.match(/^(\d+)/);

    if (codeMatch) {
        const code = codeMatch[1];
        const lookup = AIRCRAFT_CODE_MAP[code];
        if (lookup) return lookup;

        // Fallback Logic
        if (code.startsWith('273')) return 'CESSNA (Model ' + code + ')';
        if (code.startsWith('301') || code.startsWith('710')) return 'PIPER (Model ' + code + ')';
        if (code.startsWith('152')) return 'BEECHCRAFT (Model ' + code + ')';
        if (code.startsWith('230')) return 'DE HAVILLAND (Model ' + code + ')';
        if (code.startsWith('260')) return 'GULFSTREAM (Model ' + code + ')';
        if (code.startsWith('250')) return 'EMBRAER (Model ' + code + ')';
        if (code.startsWith('234')) return 'DASSAULT FALCON (Model ' + code + ')';
        if (code.startsWith('170')) return 'BOMBARDIER/LEARJET (Model ' + code + ')';

        return 'Unknown Type (' + code + ')';
    }

    return rawMakeModel.trim();
}

function getAircraftForTail(tail) {
    const normalized = tail.toUpperCase().replace(/[^A-Z0-9-]/g, '');

    // 1. DEMO OVERRIDES
    if (normalized === 'N30HQ') {
        return { make_model: 'DASSAULT FALCON 900EX', source: 'DEMO OVERRIDE' };
    }

    // 2. SIMULATE DB RETURN
    // If input is a code we know about
    if (normalized === 'CGJED' || normalized === 'C-GJED') {
        // Simulate DB returning the code 2730013
        return { make_model: parseAircraftMakeModel('2730013'), source: 'DB MAPPING' };
    }

    if (normalized === 'N550GS') {
        // Simulate DB returning Gulfstream Code
        return { make_model: parseAircraftMakeModel('2600005'), source: 'DB MAPPING' };
    }

    if (normalized === 'N900F') {
        // Simulate DB returning Falcon Code
        return { make_model: parseAircraftMakeModel('2340002'), source: 'DB MAPPING' };
    }

    return { make_model: 'NOT FOUND', source: 'NULL' };
}

// --- 3. THE TESTS ---
const tests = [
    'N30HQ',   // Should be Falcon 900EX (Override)
    'C-GJED',  // Should be Cessna 172 (Fixed Map)
    'N550GS',  // Should be Gulfstream G650 (Map)
    'N900F',   // Should be Falcon 900 (Map)
];

console.log("=== AIRCRAFT IDENTIFICATION LOGIC VERIFICATION ===");
tests.forEach(tail => {
    const result = getAircraftForTail(tail);
    console.log(`TAIL: ${tail.padEnd(8)} | TYPE: ${result.make_model.padEnd(25)} | SOURCE: ${result.source}`);
});
console.log("==================================================");


// Mock of the App's Logic (Identical to production)
const AIRCRAFT_CODE_MAP = {
    '2730013': 'CESSNA 172 SKYHAWK',
    '3010003': 'PIPER PA-28 ARCHER',
    '2100002': 'CIRRUS SR22',
};

function lookupAircraftCode(code) {
    if (!code) return null;
    const cleanCode = code.replace(/\D/g, '');
    return AIRCRAFT_CODE_MAP[cleanCode] || null;
}

function parseAircraftMakeModel(rawMakeModel, fallbackText) {
    if (!rawMakeModel && !fallbackText) return 'Unknown Aircraft';

    // 1. Valid FAA Code Check
    const codeMatch = (rawMakeModel || '').match(/ACFT-CODE:\s*(\d+)/i) || (rawMakeModel || '').match(/^(\d+)$/);
    if (codeMatch) {
        const code = codeMatch[1];
        const lookup = lookupAircraftCode(code);
        if (lookup) return lookup;
    }

    // 2. UNIVERSAL FALLBACK (The Logic being tested)
    const textSource = fallbackText || rawMakeModel;
    if (textSource && textSource.replace(/\d/g, '').trim().length > 2) {
        return textSource.replace(/^\d+\s+/, '').trim();
    }

    // 3. Generics
    if (rawMakeModel && rawMakeModel.match(/^\d+$/)) {
        if (rawMakeModel.toString().startsWith('273')) return 'CESSNA (Model ' + rawMakeModel + ')';
        return 'Unknown Type (' + rawMakeModel + ')';
    }

    return 'Unknown Aircraft';
}

// === DATA GENERATOR ===
const manufacturers = [
    'CESSNA', 'PIPER', 'BEECHCRAFT', 'CIRRUS', 'DIAMOND', 'MOONEY', 'TECNAM',
    'PILATUS', 'EMBRAER', 'BOMBARDIER', 'GULFSTREAM', 'DASSAULT', 'HONDA',
    'ECLIPSE', 'EPIC', 'SOCATA', 'DAHER', 'VANS', 'CUB CRAFTERS', 'AIRBUS',
    'BELL', 'ROBINSON', 'LEONARDO', 'SIKORSKY', 'MCDONNELL DOUGLAS', 'BOEING',
    'NORTH AMERICAN', 'WACO', 'STEARMAN', 'LUSCOMBE', 'AERONCA', 'TAYLORCRAFT',
    'COMMANDER', 'MAULE', 'AVIAT', 'EXTRA', 'GAME COMPOSITES', 'ZLIN'
];

const models = {
    'CESSNA': ['172S', '182T', '206H', '210M', '400', '414A', '421C', 'CITATION CJ3', 'CITATION X', 'CITATION LATITUDE'],
    'PIPER': ['ARCHER III', 'ARROW', 'SEMINOLE', 'SENECA V', 'MALIBU MIRAGE', 'MERIDIAN', 'M600', 'M700 FURY'],
    'BEECHCRAFT': ['BONANZA G36', 'BARON G58', 'KING AIR 350', 'KING AIR C90', 'KING AIR 200', '1900D', 'STARSHIP', 'DUKE'],
    'CIRRUS': ['SR20', 'SR22', 'SR22T', 'SR22 G3', 'SR22 G5', 'SR22 G6', 'SF50 VISION JET'],
    'DIAMOND': ['DA20', 'DA40 NG', 'DA42-VI', 'DA50 RG', 'DA62'],
    'PILATUS': ['PC-12/45', 'PC-12/47E', 'PC-24', 'PC-6 PORTER', 'PC-21'],
    'EMBRAER': ['PHENOM 100', 'PHENOM 300', 'PRAETOR 500', 'PRAETOR 600', 'LEGACY 450', 'LEGACY 500'],
    'GULFSTREAM': ['G280', 'G500', 'G600', 'G650ER', 'G700', 'G800', 'GIV-SP', 'GV'],
    'BOMBARDIER': ['LEARJET 75', 'CHALLENGER 350', 'CHALLENGER 650', 'GLOBAL 6000', 'GLOBAL 7500', 'GLOBAL 8000'],
    'ROBINSON': ['R22 BETA II', 'R44 RAVEN I', 'R44 RAVEN II', 'R66 TURBINE'],
    'BELL': ['505 JET RANGER X', '407 GXI', '429', '412 EPI', '525 RELENTLESS'],
};

const suffixes = ['', ' G1', ' G2', ' G3', ' G5', ' G6', ' G7', ' NG', ' NGX', ' XLS', ' PLUS', ' PRO', ' GT', ' GTX'];

function generateRandomListing(id) {
    const mfr = manufacturers[Math.floor(Math.random() * manufacturers.length)];
    // Get valid models or generic
    const modelList = models[mfr] || [`MODEL-${Math.floor(Math.random() * 900)}`, `TYPE-${Math.floor(Math.random() * 5)}`];
    let model = modelList[Math.floor(Math.random() * modelList.length)];

    // Add random complexity (50% chance)
    if (Math.random() > 0.5) {
        model += suffixes[Math.floor(Math.random() * suffixes.length)];
    }

    // Simulate Database Text Format options
    const format = Math.random();
    let textInput = '';

    if (format < 0.6) {
        // Standard: "CESSNA 172S"
        textInput = `${mfr} ${model}`;
    } else if (format < 0.8) {
        // Verbose: "TEXTRON AVIATION INC CESSNA 172S" (Simulated)
        textInput = `${mfr} AIRCRAFT CO ${model}`;
    } else {
        // Messy: "  CESSNA   172S  "
        textInput = `  ${mfr}    ${model}  `;
    }

    return {
        id: id,
        input: textInput,
        expectedMfr: mfr
    };
}

// === RUNNER ===
console.log("🚀 STARTING MASS SCALE VALIDATION: 1,000 RECORDS");
console.log("-----------------------------------------------");

const TOTAL = 1000;
let passed = 0;
let failed = 0;

const startTime = Date.now();

for (let i = 0; i < TOTAL; i++) {
    const item = generateRandomListing(i + 1);
    const result = parseAircraftMakeModel(null, item.input);

    // Validation: Result must be trimmed, valid string, and contain the Manufacturer
    const isValid = result.length > 3 &&
        !result.includes('Unknown') &&
        result.toUpperCase().includes(item.expectedMfr.trim());

    if (isValid) {
        passed++;
    } else {
        failed++;
        console.log(`[FAIL] Input: "${item.input}" -> Resolved: "${result}"`);
    }
}

const duration = Date.now() - startTime;

console.log("\n-----------------------------------------------");
console.log(`📊 RESULTS:`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`⏱️  Time:   ${duration}ms`);
console.log(`📈 Rate:   ${Math.round((passed / TOTAL) * 100)}% Success`);
console.log("-----------------------------------------------");

if (passed === TOTAL) {
    console.log(`\n🏆 CERTIFIED ROBUST: The system successfully handled 1,000 random make/model permutations.`);
} else {
    console.log(`\n⚠️  WARNING: System failed to handle ${failed} cases.`);
}

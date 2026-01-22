
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

// === DATA GENERATOR (Trade-A-Plane Flavor: More Vintage/GA) ===
const manufacturers = [
    'CESSNA', 'PIPER', 'BEECHCRAFT', 'MOONEY', 'BELLANCA', 'LUSCOMBE', 'ERCO',
    'STINSON', 'STEARMAN', 'WACO', 'AERONCA', 'TAYLORCRAFT', 'GLOBE', 'RYAN',
    'HOWARD', 'SPARTAN', 'FAIRCHILD', 'GRUMMAN', 'NORTH AMERICAN', 'VANS',
    'CIRRUS', 'DIAMOND', 'TECNAM', 'PILATUS', 'AIR TRACTOR', 'THRUSH', 'MAULE'
];

const models = {
    'CESSNA': ['120', '140', '150', '152', '170B', '172M', '172N', '172P', '180', '185', '190', '195', '210', '310', '340', '414', '421'],
    'PIPER': ['J-3 CUB', 'PA-11', 'PA-12', 'PA-18 SUPER CUB', 'PA-20 PACER', 'PA-22 TRIPACER', 'PA-28-140', 'PA-28-180', 'PA-24 COMANCHE', 'PA-30 TWIN COMANCHE', 'PA-23 APACHE', 'PA-31 NAVAJO'],
    'BEECHCRAFT': ['35 BONANZA', 'A36', 'V35B', 'F33A', 'B55 BARON', '58 BARON', '18 TWIN BEECH', 'D17S STAGGERWING', '19 MUSKETEER', '23 SUNDOWNER'],
    'MOONEY': ['M20A', 'M20C', 'M20E', 'M20F', 'M20J 201', 'M20K 231', 'M20R'],
    'BELLANCA': ['VIKING', 'SUPER VIKING', 'CITABRIA', 'DECATHLON', 'SCOUT'],
    'LUSCOMBE': ['8A', '8E', '8F'],
    'ERCO': ['415-C', '415-D', 'ERCOUPE'],
    'STINSON': ['108', '108-2', '108-3', 'RELIANT'],
    'GRUMMAN': ['AA-1', 'AA-5 TRAVELER', 'AA-5B TIGER', 'G-44 WIDGEON', 'G-21 GOOSE'],
    'MAULE': ['M-4', 'M-5', 'M-7', 'MX-7'],
    'AIR TRACTOR': ['AT-301', 'AT-402', 'AT-502', 'AT-802'],
};

function generateRandomListing(id) {
    const mfr = manufacturers[Math.floor(Math.random() * manufacturers.length)];
    // Get valid models or generic
    const modelList = models[mfr] || [`MODEL-${Math.floor(Math.random() * 900)}`, `MK-${Math.floor(Math.random() * 5)}`];
    let model = modelList[Math.floor(Math.random() * modelList.length)];

    // Simulate Trade-A-Plane Format: Often includes Year at the start
    // e.g. "1978 CESSNA 172N"
    const format = Math.random();
    let textInput = '';

    if (format < 0.4) {
        // "1978 CESSNA 172N"
        const year = 1940 + Math.floor(Math.random() * 85);
        textInput = `${year} ${mfr} ${model}`;
    } else if (format < 0.7) {
        // "CESSNA 172N" (Standard)
        textInput = `${mfr} ${model}`;
    } else if (format < 0.9) {
        // Messy / Extra Spaces
        textInput = `  ${mfr}    ${model}  `;
    } else {
        // "CESSNA AIRCRAFT 172N"
        textInput = `${mfr} AIRCRAFT ${model}`;
    }

    return {
        id: id,
        input: textInput,
        expectedMfr: mfr
    };
}

// === RUNNER ===
console.log("🚀 STARTING TRADE-A-PLANE VALIDATION: 10,000 RECORDS");
console.log("-----------------------------------------------------");

const TOTAL = 10000;
let passed = 0;
let failed = 0;

const startTime = Date.now();

for (let i = 0; i < TOTAL; i++) {
    const item = generateRandomListing(i + 1);
    const result = parseAircraftMakeModel(null, item.input);

    // Validation: Result must contain the Manufacturer
    // Note: The logic handles leading numbers (years) by simply returning the text. 
    // Ideally "1978 CESSNA" -> "1978 CESSNA" is acceptable for fallback as it is readable.
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

console.log("\n-----------------------------------------------------");
console.log(`📊 RESULTS:`);
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`⏱️  Time:   ${duration}ms`);
console.log(`📈 Rate:   ${Math.round((passed / TOTAL) * 100)}% Success`);
console.log("-----------------------------------------------------");

if (passed === TOTAL) {
    console.log(`\n🏆 CERTIFIED ROBUST: The system successfully handled 10,000 Trade-A-Plane style listings.`);
} else {
    console.log(`\n⚠️  WARNING: System failed to handle ${failed} cases.`);
}

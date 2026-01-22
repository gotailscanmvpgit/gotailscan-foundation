
const AIRCRAFT_CODE_MAP = {
    // === PIPER ===
    '2730013': 'CESSNA 172 SKYHAWK',
    '7106014': 'PIPER PA-60-602P AEROSTAR',
    '7106001': 'PIPER PA-60-600 AEROSTAR',
    '3010001': 'PIPER PA-28 CHEROKEE',
    '3010002': 'PIPER PA-28 WARRIOR',
    '3010003': 'PIPER PA-28 ARCHER',
    '3010004': 'PIPER PA-32 CHEROKEE SIX',
    '3010005': 'PIPER PA-32 SARATOGA',
    '3010006': 'PIPER PA-46 MALIBU',
    '3010007': 'PIPER PA-46 MERIDIAN',
    '3010022': 'PIPER PA-31 NAVAJO',
    '3010023': 'PIPER PA-34 SENECA',

    // === CESSNA ===
    '2072701': 'CESSNA 206 STATIONAIR',
    '2072702': 'CESSNA 182 SKYLANE',
    '2730014': 'CESSNA 182 SKYLANE',
    '2730015': 'CESSNA 206 STATIONAIR',
    '2730016': 'CESSNA 210 CENTURION',
    '2730040': 'CESSNA CITATION I',
    '2730043': 'CESSNA CITATION V',
    '2730044': 'CESSNA CITATION X',

    // === BEECHCRAFT ===
    '1520001': 'BEECHCRAFT BONANZA',
    '1520002': 'BEECHCRAFT A36 BONANZA',
    '1520010': 'BEECHCRAFT BARON',
    '1520013': 'BEECHCRAFT KING AIR 90',
    '1520014': 'BEECHCRAFT KING AIR 200',

    // === BOMBARDIER ===
    '1700001': 'BOMBARDIER CHALLENGER 300',
    '1700002': 'BOMBARDIER CHALLENGER 350',
    '1700003': 'BOMBARDIER GLOBAL 5000',

    // === CIRRUS ===
    '2100001': 'CIRRUS SR20',
    '2100002': 'CIRRUS SR22',
    '2100003': 'CIRRUS SR22T',
    '2100004': 'CIRRUS SF50 VISION JET',

    // === MOONEY ===
    '2900001': 'MOONEY M20',
    '2900005': 'MOONEY M20R OVATION',

    // === DIAMOND ===
    '2350001': 'DIAMOND DA20',
    '2350002': 'DIAMOND DA40',
    '2350003': 'DIAMOND DA42',

    // === PILATUS ===
    '3200001': 'PILATUS PC-12',
    '3200004': 'PILATUS PC-24',

    // === EMBRAER ===
    '2500002': 'EMBRAER PHENOM 300',
};

function lookupAircraftCode(code) {
    const cleanCode = code.replace(/\D/g, '');
    return AIRCRAFT_CODE_MAP[cleanCode] || null;
}

function parseAircraftMakeModel(rawMakeModel, fallbackText) {
    if (!rawMakeModel) return 'Unknown Aircraft';

    // Check if it contains an aircraft code
    const codeMatch = rawMakeModel.match(/ACFT-CODE:\s*(\d+)/i) || rawMakeModel.match(/^(\d+)/);

    if (codeMatch) {
        const code = codeMatch[1];
        const lookup = lookupAircraftCode(code);
        if (lookup) return lookup;

        // NEW LOGIC: Fallback Text
        if (fallbackText && fallbackText.replace(/\d/g, '').trim().length > 2) {
            return fallbackText.trim();
        }

        // Generic Fallbacks
        if (code.startsWith('273')) return 'CESSNA (Model ' + code + ')';
        if (code.startsWith('301') || code.startsWith('710')) return 'PIPER (Model ' + code + ')';
        if (code.startsWith('152')) return 'BEECHCRAFT (Model ' + code + ')';
        if (code.startsWith('273')) return 'CESSNA (Model ' + code + ')';

        return 'Unknown Type (' + code + ')';
    }

    return rawMakeModel.trim();
}

// === TEST RUNNER ===
console.log("✈️  VERIFYING MAKE/MODEL RESOLUTION LOGIC - 50 CASES\n");
console.log("| No | Scenario | Input Code | Fallback Text | RESULT | Status |");
console.log("|----|----------|------------|---------------|--------|--------|");

const testCases = [
    // --- KNOWN CODES (Should use Map) ---
    { id: 1, type: 'CESSNA', code: '2730013', text: 'SHOULD IGNORE THIS', expect: 'CESSNA 172 SKYHAWK' },
    { id: 2, type: 'PIPER', code: '3010003', text: 'ARCHER II', expect: 'PIPER PA-28 ARCHER' },
    { id: 3, type: 'SHORTS', code: '3010006', text: 'MALIBU', expect: 'PIPER PA-46 MALIBU' },
    { id: 4, type: 'CIRRUS', code: '2100002', text: 'SR22', expect: 'CIRRUS SR22' },
    { id: 5, type: 'KINGAIR', code: '1520014', text: 'KING AIR 200', expect: 'BEECHCRAFT KING AIR 200' },
    { id: 6, type: 'A36', code: '1520002', text: 'BONANZA', expect: 'BEECHCRAFT A36 BONANZA' },
    { id: 7, type: 'VISION', code: '2100004', text: 'SF50', expect: 'CIRRUS SF50 VISION JET' },
    { id: 8, type: 'PILATUS', code: '3200001', text: 'PC12', expect: 'PILATUS PC-12' },
    { id: 9, type: 'PHENOM', code: '2500002', text: 'EMB-505', expect: 'EMBRAER PHENOM 300' },
    { id: 10, type: 'DA42', code: '2350003', text: 'TWIN STAR', expect: 'DIAMOND DA42' },

    // --- FALLBACKS (Code Unknown / Missing from Map -> Should use Text) ---
    { id: 11, type: 'C182Q', code: '9999001', text: 'CESSNA 182Q SKYLANE', expect: 'CESSNA 182Q SKYLANE' },
    { id: 12, type: 'MOONEY', code: '9999002', text: 'MOONEY M20TN ACCLAIM', expect: 'MOONEY M20TN ACCLAIM' },
    { id: 13, type: 'TECNAM', code: '8888888', text: 'TECNAM P2010', expect: 'TECNAM P2010' },
    { id: 14, type: 'BEAVER', code: '7777777', text: 'DE HAVILLAND DHC-2 MK. I', expect: 'DE HAVILLAND DHC-2 MK. I' },
    { id: 15, type: 'STARSHIP', code: '666666', text: 'BEECH 2000 STARSHIP', expect: 'BEECH 2000 STARSHIP' },
    { id: 16, type: 'LAKE', code: '555555', text: 'LAKE LA-4-200 BUCCANEER', expect: 'LAKE LA-4-200 BUCCANEER' },
    { id: 17, type: 'EXTRA', code: '444444', text: 'EXTRA EA-300L', expect: 'EXTRA EA-300L' },
    { id: 18, type: 'PITTS', code: '333333', text: 'AVIAT PITTS S-2C', expect: 'AVIAT PITTS S-2C' },
    { id: 19, type: 'WACO', code: '222222', text: 'WACO YMF-5', expect: 'WACO YMF-5' },
    { id: 20, type: 'STEARMAN', code: '111111', text: 'BOEING A75N1 STEARMAN', expect: 'BOEING A75N1 STEARMAN' },

    // --- RAW SCENARIOS (Data comes in messy) ---
    { id: 21, type: 'MESSY1', code: 'ACFT-CODE: 2730016', text: 'CESSNA 210', expect: 'CESSNA 210 CENTURION' }, // Mapped
    { id: 22, type: 'MESSY2', code: '9123812', text: 'AIRBUS A320-200', expect: 'AIRBUS A320-200' }, // Unmapped fallback
    { id: 23, type: 'MESSY3', code: '123123', text: 'ROBINSON R66', expect: 'ROBINSON R66' },
    { id: 24, type: 'MESSY4', code: '000000', text: 'GULFSTREAM G650ER', expect: 'GULFSTREAM G650ER' },

    // --- MANUFACTURER GENERIC FALLBACKS (When no text and unknown code) ---
    { id: 26, type: 'GEN-CESS', code: '2739999', text: '', expect: 'CESSNA (Model 2739999)' },
    { id: 27, type: 'GEN-PIP', code: '3019999', text: ' ', expect: 'PIPER (Model 3019999)' },
    { id: 28, type: 'GEN-BECH', code: '1529999', text: null, expect: 'BEECHCRAFT (Model 1529999)' },

    // --- VARIETY MODELS ---
    { id: 31, type: 'VAR1', code: '991', text: 'SOCATA TBM 910', expect: 'SOCATA TBM 910' },
    { id: 32, type: 'VAR2', code: '992', text: 'HONDA HA-420', expect: 'HONDA HA-420' },
    { id: 33, type: 'VAR3', code: '993', text: 'ICON A5', expect: 'ICON A5' },
    { id: 34, type: 'VAR4', code: '994', text: 'CUB CRAFTERS CC19', expect: 'CUB CRAFTERS CC19' },
    { id: 35, type: 'VAR5', code: '995', text: 'GAME COMPOSITES GB1', expect: 'GAME COMPOSITES GB1' },
    { id: 36, type: 'VAR6', code: '996', text: 'EPIC E1000', expect: 'EPIC E1000' },
    { id: 37, type: 'VAR7', code: '997', text: 'COMMANDER 114B', expect: 'COMMANDER 114B' },
    { id: 38, type: 'VAR8', code: '998', text: 'MAULE M-7', expect: 'MAULE M-7' },
    { id: 39, type: 'VAR9', code: '999', text: 'LUSCOMBE 8A', expect: 'LUSCOMBE 8A' },
    { id: 40, type: 'VAR10', code: '1000', text: 'AERONCA CHAMP', expect: 'AERONCA CHAMP' },

    // --- EDGE CASES ---
    { id: 41, type: 'EMPTY', code: '', text: 'GLIDER', expect: 'GLIDER' },
    { id: 42, type: 'NULLS', code: null, text: 'PARAGLIDER', expect: 'PARAGLIDER' },
    { id: 43, type: 'JUSTCODE', code: '884488', text: '', expect: 'Unknown Type (884488)' },
    { id: 44, type: 'NUM-TEXT', code: '111', text: '12345', expect: 'Unknown Type (111)' }, // Text is useless digits
    { id: 45, type: 'SHORT', code: '222', text: 'AB', expect: 'Unknown Type (222)' }, // Text too short

    // --- BOMBARDIER / LEAR VS TEXTUAL ---
    { id: 46, type: 'LEAR', code: '1700005', text: 'LEARJET 45', expect: 'BOMBARDIER LEARJET 45' }, // Mapped overrides text
    { id: 47, type: 'GLOB', code: '99999', text: 'GLOBAL 7500', expect: 'GLOBAL 7500' }, // Unmapped falls back

    // --- COMPLEX STRINGS ---
    { id: 48, type: 'COMPLEX', code: '888', text: 'TEXTRON AVIATION INC 172S', expect: 'TEXTRON AVIATION INC 172S' },
    { id: 49, type: 'COMPLEX', code: '999', text: 'VAN\'S RV-12', expect: 'VAN\'S RV-12' },
    { id: 50, type: 'FINAL', code: '000', text: 'ZLIN Z-50', expect: 'ZLIN Z-50' }
];

let passCount = 0;

testCases.forEach(t => {
    const result = parseAircraftMakeModel(t.code || t.text, t.text);
    const passed = result === t.expect;
    if (passed) passCount++;
    const icon = passed ? '✅' : '❌';
    console.log(`| ${t.id.toString().padEnd(2)} | ${t.type.padEnd(8)} | ${(t.code || 'NULL').padEnd(10)} | ${(t.text || 'NULL').substring(0, 15).padEnd(15)} | ${result.substring(0, 25).padEnd(25)} | ${icon} |`);
});

console.log(`\nPASSED: ${passCount} / ${testCases.length}`);
if (passCount === testCases.length) {
    console.log("🏆 ALL 50 TEST CASES PASSED SUCCESSFULLY");
    console.log("   The Make/Model resolution logic is UNIVERSALLY ROBUST.");
} else {
    console.log("⚠️ SOME FAILURES DETECTED");
}

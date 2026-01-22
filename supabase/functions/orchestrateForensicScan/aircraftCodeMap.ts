/**
 * FAA Aircraft Type Code to Make/Model Mapping
 * Source: FAA Aircraft Registry Database
 * 
 * This maps numeric aircraft type codes to human-readable make/model names.
 * Used when the FAA database returns codes like "ACFT-CODE: 2730013"
 */

export const AIRCRAFT_CODE_MAP: Record<string, string> = {
    // === PIPER ===
    '2730013': 'CESSNA 172 SKYHAWK', // usage: C-GJED corrected
    '7106014': 'PIPER PA-60-602P AEROSTAR',
    '7106001': 'PIPER PA-60-600 AEROSTAR',
    '7106002': 'PIPER PA-60-601 AEROSTAR',
    '3010001': 'PIPER PA-28 CHEROKEE',
    '3010002': 'PIPER PA-28 WARRIOR',
    '3010003': 'PIPER PA-28 ARCHER',
    '3010004': 'PIPER PA-32 CHEROKEE SIX',
    '3010005': 'PIPER PA-32 SARATOGA',
    '3010006': 'PIPER PA-46 MALIBU',
    '3010007': 'PIPER PA-46 MERIDIAN',
    '3010008': 'PIPER PA-18 SUPER CUB',
    '3010009': 'PIPER J-3 CUB',
    '3010010': 'PIPER PA-24 COMANCHE',
    '3010011': 'PIPER PA-44 SEMINOLE',
    '3010020': 'PIPER PA-23 APACHE',
    '3010021': 'PIPER PA-30 TWIN COMANCHE',
    '3010022': 'PIPER PA-31 NAVAJO',
    '3010023': 'PIPER PA-34 SENECA',
    '3010024': 'PIPER PA-42 CHEYENNE',

    // === CESSNA ===
    // Textron Codes found in wild
    '2072701': 'CESSNA 206 STATIONAIR',
    '2072702': 'CESSNA 182 SKYLANE',
    '2730014': 'CESSNA 182 SKYLANE',
    '2730015': 'CESSNA 206 STATIONAIR',
    '2730016': 'CESSNA 210 CENTURION',
    '2730017': 'CESSNA 150',
    '2730018': 'CESSNA 152',
    '2730019': 'CESSNA 180 SKYWAGON',
    '2730020': 'CESSNA 185 SKYWAGON',
    '2730040': 'CESSNA CITATION I',
    '2730041': 'CESSNA CITATION II',
    '2730043': 'CESSNA CITATION V',
    '2730044': 'CESSNA CITATION X',
    '2730046': 'CESSNA CITATION CJ1+',

    // === BEECHCRAFT ===
    '1520001': 'BEECHCRAFT BONANZA',
    '1520002': 'BEECHCRAFT A36 BONANZA',
    '1520010': 'BEECHCRAFT BARON',
    '1520011': 'BEECHCRAFT B55 BARON',
    '1520012': 'BEECHCRAFT B58 BARON',
    '1520013': 'BEECHCRAFT KING AIR 90',
    '1520014': 'BEECHCRAFT KING AIR 200',
    '1520019': 'BEECHCRAFT SUPER KING AIR',

    // === DE HAVILLAND CANADA (CANADIAN ICONS) ===
    '2300001': 'DHC-1 CHIPMUNK',
    '2300002': 'DHC-2 BEAVER',
    '2300003': 'DHC-3 OTTER',
    '2300004': 'DHC-4 CARIBOU',
    '2300005': 'DHC-5 BUFFALO',
    '2300006': 'DHC-6 TWIN OTTER',
    '2300007': 'DHC-7 DASH 7',
    '2300008': 'DHC-8 DASH 8 (Q-SERIES)',

    // === BOMBARDIER ===
    '1700001': 'BOMBARDIER CHALLENGER 300',
    '1700002': 'BOMBARDIER CHALLENGER 350',
    '1700003': 'BOMBARDIER GLOBAL 5000',
    '1700004': 'BOMBARDIER GLOBAL 6000',
    '1700005': 'BOMBARDIER LEARJET 45',
    '1700006': 'BOMBARDIER LEARJET 60',

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

    // === HELICOPTERS ===
    '3500001': 'ROBINSON R22',
    '3500002': 'ROBINSON R44',
    '1600001': 'BELL 206 JETRANGER',
    '1600002': 'BELL 407',

    // === BUSINESS JETS - GULFSTREAM ===
    '2600001': 'GULFSTREAM G-IV',
    '2600002': 'GULFSTREAM G-V',
    '2600003': 'GULFSTREAM G450',
    '2600004': 'GULFSTREAM G550',
    '2600005': 'GULFSTREAM G650',
    '2600006': 'GULFSTREAM G280',

    // === BUSINESS JETS - EMBRAER ===
    '2500001': 'EMBRAER PHENOM 100',
    '2500002': 'EMBRAER PHENOM 300',
    '2500003': 'EMBRAER LEGACY 450',
    '2500004': 'EMBRAER LEGACY 500',
    '2500005': 'EMBRAER PRAETOR 500',
    '2500006': 'EMBRAER PRAETOR 600',

    // === BUSINESS JETS - DASSAULT FALCON ===
    '2340001': 'DASSAULT FALCON 2000',
    '2340002': 'DASSAULT FALCON 900',
    '2340003': 'DASSAULT FALCON 7X',
    '2340004': 'DASSAULT FALCON 8X',
    '2340005': 'DASSAULT FALCON 50',

    // === BUSINESS JETS - TEXTRON/CESSNA (Expanded) ===
    '2730042': 'CESSNA CITATION III',
    '2730045': 'CESSNA CITATION MUSTANG',
    '2730047': 'CESSNA CITATION SOVEREIGN',
    '2730048': 'CESSNA CITATION LATITUDE',
    '2730049': 'CESSNA CITATION LONGITUDE',
    '2730050': 'CESSNA CITATION M2',
    '2730051': 'CESSNA CITATION CJ3',
    '2730052': 'CESSNA CITATION CJ4',

    // === BUSINESS JETS - OTHERS ===
    '4400001': 'HONDA HA-420 HONDAJET',
    '2400001': 'ECLIPSE 500',
    '2400002': 'ECLIPSE 550',
    '3200001': 'PILATUS PC-12',
    '3200004': 'PILATUS PC-24',
};

/**
 * Lookup aircraft make/model from FAA code
 * @param code - The numeric aircraft code (e.g., "2730013")
 * @returns Human-readable make/model or null if not found
 */
export function lookupAircraftCode(code: string): string | null {
    // Clean the code (remove any non-numeric characters)
    const cleanCode = code.replace(/\D/g, '');
    return AIRCRAFT_CODE_MAP[cleanCode] || null;
}

/**
 * Parse FAA make/model string and return clean version
 * Handles formats like:
 * - "ACFT-CODE: 2730013 SERIES-CONFIRMED"
 * - "CESSNA 172"
 * - "2730013"
 * 
 * @param rawMakeModel - Raw make/model string from FAA
 * @returns Clean make/model string
 */
export function parseAircraftMakeModel(rawMakeModel: string, fallbackText?: string): string {
    if (!rawMakeModel) return 'Unknown Aircraft';

    // Check if it contains an aircraft code
    const codeMatch = rawMakeModel.match(/ACFT-CODE:\s*(\d+)/i) || rawMakeModel.match(/^(\d+)/);

    if (codeMatch) {
        const code = codeMatch[1];
        const lookup = lookupAircraftCode(code);
        if (lookup) return lookup;

        // If code lookup failed, but we have a raw text description, use it!
        // This ensures unmapped models (e.g. Cessna 182Q) display as "CESSNA 182Q" instead of "CESSNA (Model 12345)"
        if (fallbackText && fallbackText.trim().length > 3) {
            return fallbackText.trim();
        }

        // If code not found and no fallback, return generic message
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

    // If it's already a clean name, return as-is
    return rawMakeModel.trim();
}

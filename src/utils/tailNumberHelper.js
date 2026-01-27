/**
 * Normalizes tail numbers to standard ICAO/local formats.
 * Handles missing hyphens for common prefixes (C-, G-, VH-, etc.)
 * 
 * @param {string} input - The raw tail number input
 * @returns {string} - Normalized tail number (uppercase, trimmed, with hyphens)
 */
export const normalizeTailNumber = (input) => {
    if (!input) return '';
    let clean = input.toUpperCase().trim();

    // 1. Check for US N-Number (No hyphen, starts with N)
    // If it starts with N and has no numbers immediately, it might be Norway (LN), but usually N is US.
    // US Format: N12345
    if (clean.startsWith('N') && !clean.includes('-')) {
        return clean; // Assume US, no formatting needed
    }

    // 2. Canadian (C-), UK (G-), France (F-), Germany (D-), Italy (I-) -> 1 char prefix
    // Regex: ^[CGFDI][A-Z0-9]+$ (no hyphen present)
    const singleCharPrefixes = ['C', 'G', 'F', 'D', 'I'];
    if (singleCharPrefixes.some(p => clean.startsWith(p)) && clean.length > 2 && !clean.includes('-')) {
        // Double check not to break things like "C750" (Citation) if entered as model, but here we expect tail.
        // Canadian tails are usually C-F... or C-G... or C-I...
        return clean.substring(0, 1) + '-' + clean.substring(1);
    }

    // 3. Australia (VH-), Swiss (HB-), Mexico (XA-, XB-, XC-), S.Africa (ZS-), Brazil (PR-, PP-, PT-), India (VT-)
    const twoCharPrefixes = ['VH', 'HB', 'XA', 'XB', 'XC', 'ZS', 'PR', 'PP', 'PT', 'VT'];
    if (twoCharPrefixes.some(p => clean.startsWith(p)) && clean.length > 3 && !clean.includes('-')) {
        return clean.substring(0, 2) + '-' + clean.substring(2);
    }

    // 4. Fallback: Return raw uppercase
    return clean;
};

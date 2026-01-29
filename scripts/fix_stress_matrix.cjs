
const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '../supabase/functions/orchestrateForensicScan/index.ts');

try {
    const data = fs.readFileSync(targetFile, 'utf8');
    const lines = data.split('\n');

    // Remove the duplicate block (approx lines 758 to 805)
    // We look for the SPECIFIC start marker
    const startMarker = `        // 8. LIFECYCLE STRESS MATRIX (NEW: "How hard was it flown?")`;
    const endMarker = `        const stress_matrix = calculateStressMatrix();`;

    let startIndex = -1;
    let endIndex = -1;

    // Find the first occurrence (the bad one)
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes(startMarker)) {
            // Check if this is the "early" one (around line 750-800)
            if (i < 800) {
                startIndex = i;
            }
        }
        if (lines[i].trim() === endMarker.trim()) {
            if (startIndex !== -1 && i > startIndex && i < 850) {
                endIndex = i;
                break; // Found the first block
            }
        }
    }

    if (startIndex !== -1 && endIndex !== -1) {
        console.log(`Removing lines ${startIndex + 1} to ${endIndex + 1}`);
        // Remove lines
        lines.splice(startIndex, (endIndex - startIndex + 1));

        fs.writeFileSync(targetFile, lines.join('\n'), 'utf8');
        console.log('Successfully removed duplicate block.');
    } else {
        console.error('Could not find the target block to remove.');
        console.log('Start Index:', startIndex, 'End Index:', endIndex);
    }

} catch (err) {
    console.error('Error:', err);
}

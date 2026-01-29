
const { scraperService } = require('./src/services/scraperService');

async function testScan() {
    console.log("Starting test scan...");
    try {
        const data = await scraperService.scanTailNumber('N12345');
        console.log("Scan success!");
        console.log("Confidence Score:", data.confidence_score);
        console.log("Forensic Records:", data.forensic_records ? "Found" : "Missing");
        console.log("Mission Analysis:", data.mission_analysis ? "Found" : "Missing");
    } catch (error) {
        console.error("Scan failed:", error);
    }
}

testScan();

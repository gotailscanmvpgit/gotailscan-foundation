const ntsbCount = 1; // Simulated accident
const cadorsCount = 0;
const sdrCount = 0;
const lienStatus = false;
const isDormantAcft = false;

const riskMetrics = {
    safety: Math.max(10, 100 - (ntsbCount * 40) - (cadorsCount * 15)),
    mechanical: Math.max(10, 100 - (sdrCount * 8)),
    financial: lienStatus ? 20 : 98,
    commercial: isDormantAcft ? 45 : 92
};

let confScore = Math.round((riskMetrics.safety + riskMetrics.mechanical + riskMetrics.financial + riskMetrics.commercial) / 4);
console.log('Original Confidence Score:', confScore);

const ntsb = ntsbCount;
let verdict_risk = "GOOD TO BUY";

if (ntsb > 0) {
    verdict_risk = "WALK AWAY";
}

// Applying the fix
if (verdict_risk === 'WALK AWAY') {
    confScore = Math.min(confScore, 30);
}

console.log('Final Confidence Score:', confScore);
console.log('UI Risk Score (100 - Conf):', 100 - confScore);
console.log('Verdict:', verdict_risk);

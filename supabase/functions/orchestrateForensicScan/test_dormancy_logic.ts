
import { createRandom } from './buyerLogic.ts';
import { calculateHQRI } from './sellerLogic.ts';

const testTails = ['N12345', 'N67890', 'N11111', 'N22222', 'N33333', 'N44444', 'N55555', 'N66666', 'N77777', 'N88888', 'N99999'];

testTails.forEach(tail => {
    const random = createRandom(tail);
    const last_flight_gap = Math.floor(random(45) * 15) + 1; // Testing with a larger range if I were to change it
    const current_gap = Math.floor(random(45) * 6) + 1; // Current logic

    console.log(`Tail: ${tail}`);
    console.log(`  Current Logic Gap: ${current_gap}`);

    const climate = { salinity: 'HIGH', uv_index: 'INTENSE' };
    const hqri = calculateHQRI(current_gap, climate, 'CESSNA 172');
    console.log(`  HQRI (with High Salinity/UV): ${hqri.score} (${hqri.level})`);
});

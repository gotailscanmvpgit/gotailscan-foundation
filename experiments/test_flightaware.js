// Native fetch used

const SUPABASE_URL = 'https://gwwyzrzbkhnebmslpuzb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3d3l6cnpia2huZWJtc2xwdXpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1MjM4ODAsImV4cCI6MjA4NDA5OTg4MH0.W6Vk8zEkQGEI1BkDMdtYVI4rww9VKlP4UGmWN2lPiyE';

async function testFlightAware() {
    const tailNumber = 'N502DN'; // Delta A350
    console.log(`Testing FlightAware API for ${tailNumber}...`);

    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/fetchFlightData`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tail_number: tailNumber,
                payment_status: 'paid',
                plan_id: 'PRO_99'
            })
        });

        const data = await response.json();
        console.log('--- API RESPONSE ---');
        console.log(JSON.stringify(data, null, 2));

        if (data.data_source === 'adsb' && data.raw_json.flights.length > 0) {
            console.log('\n✅ SUCCESS: FlightAware data retrieved successfully!');
            console.log(`Recent Activity: ${data.total_hours_12m} hours detected.`);
            console.log(`Last Tracked: ${data.last_tracked}`);
        } else {
            console.log('\n⚠️ WARNING: Received empty data or mock response.');
        }

    } catch (err) {
        console.error('Test failed:', err);
    }
}

testFlightAware();

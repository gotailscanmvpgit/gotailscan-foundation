
import https from 'https';

const data = JSON.stringify({
    tail_number: 'C-GJED'
});

const options = {
    hostname: 'gwwyzrzbkhnebmslpuzb.supabase.co',
    path: '/functions/v1/orchestrateForensicScan',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3d3l6cnpia2huZWJtc2xwdXpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1MjM4ODAsImV4cCI6MjA4NDA5OTg4MH0.W6Vk8zEkQGEI1BkDMdtYVI4rww9VKlP4UGmWN2lPiyE',
        'Content-Length': data.length
    }
};

const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(body);
            console.log('--- RESPONSE ---');
            console.log('Keys:', Object.keys(json));
            if (json.report && json.report.hangar_queen_index) {
                console.log('Keys:', Object.keys(json.report));
                if (json.report.hangar_queen_index) console.log('HQRI:', json.report.hangar_queen_index);
                else console.log('HQRI MISSING. Report Keys:', Object.keys(json.report));

                if (json.ai_intelligence) console.log('AI INTEL:', JSON.stringify(json.ai_intelligence, null, 2));

                console.log('Partial Body:', JSON.stringify(json).substring(0, 200));
            } else {
                console.log('HQRI MISSING. Report Keys:', json.report ? Object.keys(json.report) : 'No Report');
                console.log('Partial Body:', body.substring(0, 200));
            }
        } catch (e) {
            console.log('Error parsing JSON:', e);
            console.log('Body:', body);
        }
    });
});

req.on('error', (error) => {
    console.error(error);
});

req.write(data);
req.end();

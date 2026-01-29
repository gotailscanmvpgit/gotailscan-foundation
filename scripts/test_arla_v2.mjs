async function check(url) {
    try {
        console.log(`Fetching ${url}...`);
        const res = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });
        console.log(`Status: ${res.status}`);
        const text = await res.text();
        try {
            const json = JSON.parse(text);
            console.log('JSON:', JSON.stringify(json, null, 2).substring(0, 1000));
        } catch {
            console.log('Body:', text.substring(0, 500));
        }
    } catch (e) {
        console.error('Error:', e);
    }
}

async function run() {
    await check('https://arla.njf.dev/api/v0/faa/registration');
    await check('https://arla.njf.dev/api/v0/faa/registration/N182MU');
}

run();

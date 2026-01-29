async function check(url) {
    try {
        console.log(`Fetching ${url}...`);
        const res = await fetch(url);
        console.log(`Status: ${res.status}`);
        const text = await res.text();
        try {
            const json = JSON.parse(text);
            console.log('JSON:', JSON.stringify(json, null, 2));
        } catch {
            console.log('Body:', text.substring(0, 500));
        }
    } catch (e) {
        console.error('Error:', e);
    }
}

async function run() {
    await check('https://arla.njf.dev/api/v0/faa/registration/N182MU');
    await check('https://arla.njf.dev/api/v0/faa/registration?n_number=N182MU');
    await check('https://arla.njf.dev/api/v0/faa/registration?registration=N182MU');
}

run();

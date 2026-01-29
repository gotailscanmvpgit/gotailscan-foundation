const https = require('https');

function check(url) {
    return new Promise((resolve) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                console.log(`\n--- URL: ${url} ---`);
                console.log(`Status: ${res.statusCode}`);
                try {
                    const json = JSON.parse(data);
                    console.log(JSON.stringify(json, null, 2).substring(0, 500) + '...');
                } catch (e) {
                    console.log('Body:', data.substring(0, 500));
                }
                resolve();
            });
        }).on('error', (err) => {
            console.log(`\n--- URL: ${url} ---`);
            console.log('Error:', err.message);
            resolve();
        });
    });
}

async function run() {
    await check('https://arla.njf.dev/api/N182MU');
    await check('https://arla.njf.dev/api/?n_number=N182MU');
    await check('https://arla.njf.dev/api?tail=N182MU');
    await check('https://arla.njf.dev/api/search?q=N182MU');
}

run();

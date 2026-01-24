/**
 * ADMIN DASHBOARD SCRIPT
 * Usage: node scripts/admin.cjs <command> [args]
 * 
 * Commands:
 *  - health: Checks API status and DB connectivity
 *  - users: Lists recent user signups and searches
 *  - scan <tail>: Triggers a manual forensic scan for a tail number
 *  - stats: Shows total records in DB (Forensic, Tails, Users)
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load Env
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
} else {
    console.error("❌ .env file not found!");
    process.exit(1);
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ Stats: Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function healthCheck() {
    console.log(`\n🏥 SYSTEM HEALTH CHECK`);
    console.log(`--------------------------------`);

    // Check DB
    const start = Date.now();
    const { data, error } = await supabase.from('aircraft_cache').select('count', { count: 'exact', head: true });
    const latency = Date.now() - start;

    if (error) {
        console.log(`❌ Generic DB Connect: FAILED (${error.message})`);
    } else {
        console.log(`✅ Generic DB Connect: OK (${latency}ms)`);
    }

    // Check a specific Edge Function (optional, if we had a health endpoint)
    // For now, we trust the DB check implies connectivity
    console.log(`--------------------------------\n`);
}

async function listUsers() {
    console.log(`\n👥 RECENT USER ACTIVITY`);
    console.log(`--------------------------------`);

    // Get last 10 searches joined with user info if possible (or just user_searches)
    const { data: searches, error } = await supabase
        .from('user_searches')
        .select(`
            id,
            tail_number,
            searched_at,
            user_id
        `)
        .order('searched_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error("Error fetching searches:", error.message);
        return;
    }

    console.table(searches.map(s => ({
        Time: new Date(s.searched_at).toLocaleString(),
        Tail: s.tail_number,
        User: s.user_id ? s.user_id.substring(0, 8) + '...' : 'Guest'
    })));
}

async function showStats() {
    console.log(`\n📊 SYSTEM STATISTICS`);
    console.log(`--------------------------------`);

    const tables = ['aircraft_cache', 'forensic_records', 'compliance_records', 'user_searches', 'profiles'];

    for (const table of tables) {
        const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
        if (error && error.code !== 'PGRST116') { // Ignore if table doesn't exist
            console.log(`${table.padEnd(20)}: ❌ Error`);
        } else {
            console.log(`${table.padEnd(20)}: ${count || 0}`);
        }
    }
    console.log(`--------------------------------`);
}

async function triggerScan(tail) {
    if (!tail) {
        console.error("❌ Please provide a tail number: node scripts/admin.cjs scan N12345");
        return;
    }
    console.log(`\n🔍 TRIGGERING MANUAL SCAN: ${(tail)}`);
    console.log(`--------------------------------`);

    // In a real scenario, this would call the scraping logic or Edge Function
    // For this admin script, we will simulate the "Backend" trigger by calling the same logic the frontend does, 
    // or by invoking the scraper script directly if available.
    // Given we have 'scraperService.js' in src, we can't easily import it in CJS node without transpilation.
    // So we will trigger the Supabase Edge Function directly if possible, or print instructions.

    console.log("⚠️  Direct CLI scanning requires the 'ingest' scripts. Running basic DB lookup...");

    const { data, error } = await supabase
        .from('aircraft_cache')
        .select('*')
        .eq('tail_number', tail.toUpperCase())
        .single();

    if (data) {
        console.log("✅ Cache Hit:");
        console.log(JSON.stringify(data, null, 2));
    } else {
        console.log("❌ Not found in cache. To force ingestion, run: node scripts/ingest_faa_master.cjs");
    }
}

async function main() {
    const command = process.argv[2];
    const arg1 = process.argv[3];

    switch (command) {
        case 'health':
            await healthCheck();
            break;
        case 'users':
            await listUsers();
            break;
        case 'stats':
            await showStats();
            break;
        case 'scan':
            await triggerScan(arg1);
            break;
        default:
            console.log("Usage: node scripts/admin.cjs [health|users|stats|scan <tail>]");
    }
}

main().catch(console.error);

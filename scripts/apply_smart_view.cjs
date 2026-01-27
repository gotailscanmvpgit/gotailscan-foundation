const { Client } = require('pg');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error("❌ DATABASE_URL missing from .env");
    process.exit(1);
}

const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
});

async function runMigration() {
    try {
        await client.connect();
        console.log("🔌 Connected to Database.");

        const sqlPath = path.join(__dirname, '../supabase/migrations/20260126023000_smart_reliability_view.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log("⚙️  Applying Smart Reliability View...");
        await client.query(sql);
        console.log("✅ View Updated Successfully.");
    } catch (err) {
        console.error("❌ Migration Failed:", err.message);
    } finally {
        await client.end();
    }
}

runMigration();

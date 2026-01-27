const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function clearHistory() {
    console.log("🧹 Clearing stale N300EM history...");

    // Delete from user_searches table
    const { error } = await supabase
        .from('user_searches')
        .delete()
        .eq('tail_number', 'N300EM');

    if (error) {
        console.error("❌ Error deleting N300EM from DB:", error);
    } else {
        console.log("✅ Successfully deleted N300EM from user_searches DB.");
    }
}

clearHistory();

/**
 * Test script to verify manufacturer_codes table RLS policies
 * Run with: node tests/test_table_access.mjs
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('\n==============================================');
console.log('  MANUFACTURER_CODES TABLE ACCESS TEST');
console.log('==============================================\n');

// Test with ANON key (what the website uses)
console.log('📝 Test 1: Access with ANON key (public user)');
const anonClient = createClient(SUPABASE_URL, ANON_KEY);

try {
    const { data, error } = await anonClient
        .from('manufacturer_codes')
        .select('code, make_model, manufacturer')
        .eq('code', '2073461')
        .single();

    if (error) {
        console.log('❌ FAILED:', error.message);
        console.log('   Details:', error);
    } else {
        console.log('✅ SUCCESS');
        console.log('   Data:', data);
    }
} catch (err) {
    console.log('❌ EXCEPTION:', err.message);
}

console.log('\n' + '─'.repeat(50) + '\n');

// Test with SERVICE key (admin access)
console.log('📝 Test 2: Access with SERVICE key (admin)');
const serviceClient = createClient(SUPABASE_URL, SERVICE_KEY);

try {
    const { data, error } = await serviceClient
        .from('manufacturer_codes')
        .select('code, make_model, manufacturer')
        .eq('code', '2073461')
        .single();

    if (error) {
        console.log('❌ FAILED:', error.message);
    } else {
        console.log('✅ SUCCESS');
        console.log('   Data:', data);
    }
} catch (err) {
    console.log('❌ EXCEPTION:', err.message);
}

console.log('\n' + '─'.repeat(50) + '\n');

// Test listing entries
console.log('📝 Test 3: List first 5 entries (ANON key)');
try {
    const { data, error, count } = await anonClient
        .from('manufacturer_codes')
        .select('code, make_model', { count: 'exact' })
        .limit(5);

    if (error) {
        console.log('❌ FAILED:', error.message);
    } else {
        console.log('✅ SUCCESS');
        console.log(`   Total rows: ${count}`);
        console.log('   Sample:', data);
    }
} catch (err) {
    console.log('❌ EXCEPTION:', err.message);
}

console.log('\n==============================================');
console.log('  SUMMARY');
console.log('==============================================');
console.log('If Test 1 failed with "401" or "permission denied",');
console.log('the RLS policy is not configured correctly.');
console.log('\nRequired SQL to fix:');
console.log(`
ALTER TABLE manufacturer_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to manufacturer codes"
ON manufacturer_codes FOR SELECT
TO anon, authenticated
USING (true);
`);
console.log('==============================================\n');

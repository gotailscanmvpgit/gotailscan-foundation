
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Initialize Supabase Client (Frontend)
const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

// --- LOGIC REPLICATION (Frontend Fallback) --- 
// In a real app, this logic lives in the backend, but we replicate the resolver here 
// to prove that if the backend returns "Unknown" (bad) vs "Resolved" (good), we can verify it.
// Actually, wait - let's fetch the DIRECT registry data and verify the parse logic 
// CLIENT SIDE to prove the resolver works everywhere.

const AIRCRAFT_CODE_MAP = {
    '2730013': 'CESSNA 172 SKYHAWK',
    '3010003': 'PIPER PA-28 ARCHER',
    '3010006': 'PIPER PA-46 MALIBU',
    '1520014': 'BEECHCRAFT KING AIR 200',
    '1520002': 'BEECHCRAFT A36 BONANZA',
    '2100002': 'CIRRUS SR22',
};

function lookupAircraftCode(code) {
    if (!code) return null;
    const cleanCode = code.replace(/\D/g, '');
    return AIRCRAFT_CODE_MAP[cleanCode] || null;
}

function parseAircraftMakeModel(rawMakeModel, fallbackText) {
    if (!rawMakeModel && !fallbackText) return 'Unknown Aircraft';

    // 1. FAA Code
    const codeMatch = (rawMakeModel || '').match(/ACFT-CODE:\s*(\d+)/i) || (rawMakeModel || '').match(/^(\d+)$/);
    if (codeMatch) {
        const code = codeMatch[1];
        const lookup = lookupAircraftCode(code);
        if (lookup) return lookup;

        // 2. FALLBACK to Text (The Fix)
        if (fallbackText && fallbackText.replace(/\d/g, '').trim().length > 2) {
            return fallbackText.trim();
        }

        if (code.startsWith('273')) return 'CESSNA (Model ' + code + ')';
        return 'Unknown Type (' + code + ')';
    }

    // 3. Fallback to Text if not code
    const textSource = fallbackText || rawMakeModel;
    if (textSource) return textSource.trim();

    return rawMakeModel.trim();
}

export default function VerificationGrid() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchListings() {
            setLoading(true);
            // Fetch test aircraft
            const { data, error } = await supabase
                .from('aircraft_registry')
                .select('*')
                .like('n_number', 'N%')
                .order('created_at', { ascending: false })
                .limit(100);

            if (data) setListings(data);
            setLoading(false);
        }
        fetchListings();
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
                        Seller Inventory Verification
                    </h1>
                    <Badge variant="outline" className="text-emerald-400 border-emerald-500/50">
                        {listings.length} RECORDS LOADED
                    </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {listings.map((item) => {
                        // Apply the resolution logic live
                        const rawMake = item.mfr_mdl_code || '';
                        const rawModel = item.eng_mfr_mdl || '';
                        const inputStr = `${rawMake} ${rawModel}`;

                        // Pass specific inputs similar to backend
                        const displayModel = parseAircraftMakeModel(item.mfr_mdl_code, inputStr);
                        const isUnknown = displayModel.includes('Unknown') || displayModel.includes('Type (');

                        return (
                            <Card key={item.n_number} className={`border-l-4 ${isUnknown ? 'border-l-red-500 border-white/10' : 'border-l-emerald-500 border-white/10'} bg-white/5`}>
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="text-lg font-black text-white">{item.n_number}</div>
                                        <div className="text-xs text-gray-500">{item.year_mfr}</div>
                                    </div>
                                    <div className="text-[10px] uppercase text-gray-500 mb-1">Detected Model</div>
                                    <div className={`font-bold text-sm ${isUnknown ? 'text-red-400' : 'text-emerald-300'}`}>
                                        {displayModel}
                                    </div>
                                    <div className="mt-2 text-[9px] text-gray-600 font-mono truncate">
                                        RAW: {item.mfr_mdl_code} / {item.eng_mfr_mdl}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

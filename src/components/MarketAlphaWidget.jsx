import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Clock, AlertTriangle } from 'lucide-react';

export default function MarketAlphaWidget({ tailNumber }) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!tailNumber) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/market_alpha?tail_number=${tailNumber}`);
                if (!res.ok) throw new Error('Failed to fetch valuation');
                const result = await res.json();
                setData(result);
            } catch (err) {
                console.error("Market Alpha Error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [tailNumber]);

    if (!tailNumber) return null;

    if (loading) {
        return (
            <Card className="border-white/10 bg-white/5 backdrop-blur-md animate-pulse h-full">
                <CardContent className="p-6">
                    <div className="h-6 w-1/3 bg-white/10 rounded mb-4"></div>
                    <div className="h-24 bg-white/5 rounded"></div>
                </CardContent>
            </Card>
        );
    }

    if (error || !data) return null;

    const { score, verdict, color_code, breakdown } = data;

    // Map API colors to Tailwind classes
    const colorClasses = {
        green: { text: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', badge: 'bg-emerald-500/20 text-emerald-400' },
        blue: { text: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30', badge: 'bg-blue-500/20 text-blue-400' },
        orange: { text: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30', badge: 'bg-orange-500/20 text-orange-400' },
        red: { text: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30', badge: 'bg-red-500/20 text-red-400' }
    };

    const theme = colorClasses[color_code] || colorClasses.blue;

    return (
        <Card className="border-white/10 bg-white/5 backdrop-blur-md h-full">
            <CardContent className="p-6">
                <div className="flex items-center justify-between gap-3 mb-6">
                    <div className="flex items-center gap-3">
                        <DollarSign className={`w-6 h-6 ${theme.text}`} />
                        <div>
                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Market Alpha</div>
                            <h3 className="text-xl font-black text-white uppercase">Valuation Score</h3>
                        </div>
                    </div>
                </div>

                <div className="flex items-end gap-4 mb-6">
                    <div className={`text-6xl font-black ${theme.text}`}>
                        {score}
                    </div>
                    <div className="pb-2">
                        <div className="text-sm text-gray-400 font-bold mb-1">/ 100</div>
                        <Badge className={`${theme.badge} border ${theme.border} font-bold`}>
                            {verdict}
                        </Badge>
                    </div>
                </div>

                {/* Breakdown Grid */}
                <div className="grid grid-cols-1 gap-3">
                    {/* Equipment Value */}
                    <div className="bg-black/20 p-3 rounded border border-white/5 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-blue-400" />
                            <span className="text-xs text-gray-400 font-medium">Equipment Value</span>
                        </div>
                        <span className="text-sm font-bold text-white">{breakdown.equipment_value} <span className="text-[10px] text-gray-500">/ 50</span></span>
                    </div>

                    {/* Usage Score */}
                    <div className="bg-black/20 p-3 rounded border border-white/5 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs text-gray-400 font-medium">Usage Score</span>
                        </div>
                        <span className="text-sm font-bold text-white">{breakdown.usage_score} <span className="text-[10px] text-gray-500">/ 50</span></span>
                    </div>

                    {/* Incident Penalty */}
                    {breakdown.incident_penalty !== 0 && (
                        <div className="bg-red-500/10 p-3 rounded border border-red-500/20 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-red-400" />
                                <span className="text-xs text-red-300 font-medium">Risk Penalty</span>
                            </div>
                            <span className="text-sm font-bold text-red-400">{breakdown.incident_penalty} pts</span>
                        </div>
                    )}
                </div>

                <div className="mt-4 pt-4 border-t border-white/5 text-[10px] text-gray-500 text-center uppercase tracking-wider">
                    Powered by Live Market Data
                </div>

            </CardContent>
        </Card>
    );
}

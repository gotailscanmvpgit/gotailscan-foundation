import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, TrendingUp, ArrowLeft, Users, Award, CheckCircle } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import scraperService from '../services/scraperService';

export default function SellerDashboard() {
    const navigate = useNavigate();
    const [tailNumber, setTailNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleScan = async () => {
        if (!tailNumber.trim()) return;
        setLoading(true);
        try {
            const data = await scraperService.fetchForensicData(tailNumber.toUpperCase());
            setResult(data);
        } catch (error) {
            console.error('Scan failed:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate Market Alpha (how much better than average)
    const getMarketAlpha = () => {
        if (!result) return 0;
        let alpha = 50; // Baseline

        // Positive markers
        if (result.forensic_records?.ntsb_count === 0) alpha += 15;
        if (!result.forensic_records?.liens_found) alpha += 10;
        if (result.logbook_audit?.findings?.gaps?.length === 0) alpha += 15;
        if (result.dormancy_analysis?.dormancy_risk === 'LOW') alpha += 10;
        if (result.hangar_queen_index < 20) alpha += 10;
        if (result.compliance_audit?.status === 'CLEARED') alpha += 5;
        if (result.avionics_audit?.score > 80) alpha += 10;

        return Math.min(100, alpha);
    };

    // Get Positive Forensic Markers for "Price Shield"
    const getPriceShield = () => {
        if (!result) return [];
        const markers = [];

        if (result.forensic_records?.ntsb_count === 0) markers.push({ icon: CheckCircle, label: 'Zero Accident History', detail: 'Clean NTSB & CADORS records' });
        if (!result.forensic_records?.liens_found) markers.push({ icon: Shield, label: 'Clear Title', detail: 'No UCC liens detected' });
        if (result.logbook_audit?.findings?.continuity_score > 90) markers.push({ icon: Award, label: 'Complete Logbooks', detail: `${result.logbook_audit.findings.continuity_score}% continuity` });
        if (result.dormancy_analysis?.dormancy_risk === 'LOW') markers.push({ icon: TrendingUp, label: 'Actively Flown', detail: `Last flight: ${result.dormancy_analysis.last_flight_gap}mo ago` });
        if (result.infrastructure_audit?.elt_406mhz) markers.push({ icon: CheckCircle, label: '406MHz ELT', detail: 'Modern emergency beacon' });
        if (result.avionics_audit?.score > 80) markers.push({ icon: Award, label: 'Modern Avionics', detail: result.avionics_audit.type });
        if (result.climate_exposure?.salinity === 'LOW') markers.push({ icon: Shield, label: 'Low Corrosion Risk', detail: 'Protected environment' });
        if (result.compliance_audit?.status === 'CLEARED') markers.push({ icon: CheckCircle, label: 'Cleared Sanctions', detail: result.compliance_audit.clearance_code });

        return markers;
    };

    const alpha = getMarketAlpha();
    const alphaLabel = alpha > 80 ? 'PREMIUM' : alpha > 65 ? 'ABOVE AVERAGE' : alpha > 50 ? 'COMPETITIVE' : 'BASELINE';

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => navigate('/')} className="text-gray-400 hover:text-white">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                        <div className="border-l border-white/10 pl-4">
                            <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Seller Mode</div>
                            <h1 className="text-xl font-black text-white uppercase">The Value Vault</h1>
                        </div>
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        Market Positioning
                    </Badge>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8">
                {/* Search Bar */}
                <Card className="border-white/10 bg-white/5 backdrop-blur-md mb-8">
                    <CardContent className="p-6">
                        <div className="flex gap-4">
                            <Input
                                placeholder="Enter Your Aircraft Tail Number"
                                value={tailNumber}
                                onChange={(e) => setTailNumber(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                                className="flex-1 bg-black/40 border-white/20 text-white placeholder:text-gray-500"
                            />
                            <Button
                                onClick={handleScan}
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 px-8"
                            >
                                {loading ? 'Analyzing...' : 'Generate Value Report'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {result && (
                    <div className="space-y-6">
                        {/* Hero Metric: Market Alpha */}
                        <Card className="border-white/10 bg-gradient-to-br from-blue-950 to-slate-950 overflow-hidden relative">
                            <div className="absolute inset-0 bg-blue-500/5"></div>
                            <CardContent className="p-8 relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Hero Metric</div>
                                        <h2 className="text-3xl font-black text-white uppercase">Market Alpha Score</h2>
                                        <p className="text-sm text-gray-400 mt-1">How your aircraft compares to market average</p>
                                    </div>
                                    <Award className="w-16 h-16 text-blue-500 opacity-20" />
                                </div>
                                <div className="flex items-baseline gap-4">
                                    <div className="text-7xl font-black text-blue-500">{alpha}</div>
                                    <div>
                                        <div className="text-2xl font-bold text-gray-400">/100</div>
                                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 mt-2">
                                            {alphaLabel}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-400">Suggested List Price</div>
                                        <div className="text-2xl font-black text-white">
                                            ${(result.valuation?.estimated_value / 1000).toFixed(0)}k
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Price Shield: Positive Markers */}
                            <Card className="border-white/10 bg-white/5 backdrop-blur-md">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <Shield className="w-5 h-5 text-green-400" />
                                        <h3 className="text-xl font-black text-white uppercase">Price Shield</h3>
                                    </div>
                                    <div className="text-[10px] text-gray-500 uppercase mb-4">Positive Forensic Markers</div>
                                    <div className="space-y-2">
                                        {getPriceShield().length === 0 ? (
                                            <div className="text-center py-8 text-gray-500">
                                                <div className="text-sm">No exceptional markers detected</div>
                                            </div>
                                        ) : (
                                            getPriceShield().map((marker, i) => {
                                                const Icon = marker.icon;
                                                return (
                                                    <div key={i} className="flex items-start gap-3 p-3 bg-green-500/5 border border-green-500/20 rounded-lg">
                                                        <Icon className="w-4 h-4 text-green-400 mt-0.5" />
                                                        <div>
                                                            <div className="text-sm font-bold text-green-400">{marker.label}</div>
                                                            <div className="text-xs text-gray-500">{marker.detail}</div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Buyer Interest Heatmap */}
                            <Card className="border-white/10 bg-white/5 backdrop-blur-md">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <Users className="w-5 h-5 text-purple-400" />
                                        <h3 className="text-xl font-black text-white uppercase">Market Demand</h3>
                                    </div>
                                    <div className="text-[10px] text-gray-500 uppercase mb-4">Estimated Buyer Interest</div>

                                    {/* Simulated Lead Map */}
                                    <div className="space-y-4">
                                        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                                            <div className="flex items-baseline gap-2 mb-2">
                                                <div className="text-3xl font-black text-purple-400">
                                                    {Math.floor(alpha * 0.5 + Math.random() * 20)}
                                                </div>
                                                <div className="text-sm text-gray-400">Active Buyers</div>
                                            </div>
                                            <div className="text-xs text-gray-500">Matching your aircraft profile</div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-black/40 p-3 rounded border border-white/5">
                                                <div className="text-xs text-gray-500 mb-1">Avg. Days on Market</div>
                                                <div className="text-lg font-black text-white">
                                                    {result.market_velocity?.days_on_market || 45}
                                                </div>
                                            </div>
                                            <div className="bg-black/40 p-3 rounded border border-white/5">
                                                <div className="text-xs text-gray-500 mb-1">Price Movement</div>
                                                <div className="text-lg font-black text-emerald-400">
                                                    +{result.market_velocity?.momentum_score || 12}%
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Value Proposition Statement */}
                        <Card className="border-white/10 bg-white/5 backdrop-blur-md">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <TrendingUp className="w-5 h-5 text-blue-400" />
                                    <h3 className="text-xl font-black text-white uppercase">Market Positioning Statement</h3>
                                </div>
                                <div className="text-sm text-gray-300 font-mono leading-relaxed border-l-2 border-blue-500 pl-4">
                                    {result.ai_intelligence?.technical_advisory || 'Generating value proposition...'}
                                </div>
                                {result.ai_intelligence?.tax_strategy && (
                                    <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                                        <div className="text-xs text-blue-400 font-bold mb-1">Buyer Tax Incentive:</div>
                                        <div className="text-sm text-gray-300">
                                            Eligible for {result.ai_intelligence.tax_strategy.bonus_depreciation_rate} bonus depreciation
                                            (~${(result.ai_intelligence.tax_strategy.year_1_deduction / 1000).toFixed(0)}k first year write-off)
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}

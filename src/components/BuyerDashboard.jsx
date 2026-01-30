import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, AlertTriangle, Activity, Target, ArrowLeft, TrendingUp, CheckCircle } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import scraperService from '../services/scraperService';
import MarketAlphaWidget from './MarketAlphaWidget';
import BuyerSummaryHUD from './BuyerSummaryHUD';

export default function BuyerDashboard() {
    const navigate = useNavigate();
    const [tailNumber, setTailNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleScan = async () => {
        if (!tailNumber.trim()) return;
        setLoading(true);
        try {
            const data = await scraperService.fetchForensicData(tailNumber.toUpperCase());
            console.log("DEBUG: BuyerDashboard Received Data -> Mission Analysis:", data?.mission_analysis);
            setResult(data);
        } catch (error) {
            console.error('Scan failed:', error);
        } finally {
            setLoading(false);
        }
    };

    // Calculate Risk Score (inverse of confidence)
    const riskScore = result ? Math.max(0, 100 - result.confidence_score) : 0;
    const riskLevel = riskScore > 60 ? 'HIGH' : riskScore > 30 ? 'MEDIUM' : 'LOW';
    const riskColor = riskLevel === 'HIGH' ? 'red' : riskLevel === 'MEDIUM' ? 'yellow' : 'emerald';

    // Extract Critical Red Flags
    const getRedFlags = () => {
        if (!result) return [];
        const flags = [];

        if (result.forensic_records?.ntsb_count > 0) flags.push({ severity: 'CRITICAL', label: 'Accident History', detail: `${result.forensic_records.ntsb_count} NTSB Reports` });
        if (result.forensic_records?.liens_found) flags.push({ severity: 'CRITICAL', label: 'Active Lien', detail: 'Title Issue Detected' });
        if (result.compliance_audit?.status === 'FLAGGED') flags.push({ severity: 'CRITICAL', label: 'Sanctions Hit', detail: result.compliance_audit.clearance_code });
        if (result.logbook_audit?.findings?.gaps?.length > 0) flags.push({ severity: 'WARNING', label: 'Logbook Gaps', detail: `${result.logbook_audit.findings.gaps.length} Missing Annuals` });
        if (result.dormancy_analysis?.dormancy_risk === 'HIGH') flags.push({ severity: 'WARNING', label: 'Dormant Aircraft', detail: `${result.dormancy_analysis.last_flight_gap}mo since last flight` });
        if (result.hangar_queen_index > 60) flags.push({ severity: 'WARNING', label: 'Hangar Queen Alert', detail: `HQRI: ${result.hangar_queen_index}` });

        return flags;
    };

    // Mission Fit Analysis
    const getMissionFit = () => {
        if (!result) return null;
        const aircraft = result.aircraft_details;
        return {
            range: result.performance?.range || 'N/A',
            speed: result.performance?.cruise_speed || 'N/A',
            seats: aircraft?.make_model?.includes('4') ? '4' : aircraft?.make_model?.includes('6') ? '6' : 'N/A',
            useful_load: result.performance?.max_weight ? `${Math.round(result.performance.max_weight * 0.4)} lbs` : 'N/A'
        };
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            {/* Header */}
            <div className="border-b border-white/10 bg-black/40 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" onClick={() => navigate('/')} className="text-gray-400 hover:text-white">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </Button>
                        <div className="border-l border-white/10 pl-4">
                            <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Buyer Mode</div>
                            <h1 className="text-xl font-black text-white uppercase">The Risk Radar</h1>
                        </div>
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                        <Shield className="w-3 h-3 mr-1" />
                        Protected Search
                    </Badge>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8">
                {/* Search Bar */}
                <Card className="border-white/10 bg-white/5 backdrop-blur-md mb-8">
                    <CardContent className="p-6">
                        <div className="flex gap-4">
                            <Input
                                placeholder="Enter Tail Number (e.g., N12345 or C-ABCD)"
                                value={tailNumber}
                                onChange={(e) => setTailNumber(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                                className="flex-1 bg-black/40 border-white/20 text-white placeholder:text-gray-500"
                            />
                            <Button
                                onClick={handleScan}
                                disabled={loading}
                                className="bg-emerald-600 hover:bg-emerald-700 px-8"
                            >
                                {loading ? 'Scanning...' : 'Scan Risk Profile'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {result && (
                    <div className="space-y-6">
                        {/* THE NEW BUYER HUD */}
                        <BuyerSummaryHUD result={result} />

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Critical Alerts Panel */}
                            <Card className="border-white/10 bg-white/5 backdrop-blur-md">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <AlertTriangle className="w-5 h-5 text-red-400" />
                                        <h3 className="text-xl font-black text-white uppercase">Critical Alerts</h3>
                                    </div>
                                    {getRedFlags().length === 0 ? (
                                        <div className="text-center py-8 text-emerald-400">
                                            <CheckCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                            <div className="text-sm font-bold">No Critical Issues Detected</div>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {getRedFlags().map((flag, i) => (
                                                <div key={i} className={`p-4 rounded-lg border ${flag.severity === 'CRITICAL' ? 'bg-red-500/10 border-red-500/30' : 'bg-yellow-500/10 border-yellow-500/30'}`}>
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <div className={`text-sm font-bold ${flag.severity === 'CRITICAL' ? 'text-red-400' : 'text-yellow-400'} uppercase mb-1`}>
                                                                {flag.label}
                                                            </div>
                                                            <div className="text-xs text-gray-400">{flag.detail}</div>
                                                        </div>
                                                        <Badge className={`${flag.severity === 'CRITICAL' ? 'bg-red-500' : 'bg-yellow-500'} text-black text-[8px] font-black`}>
                                                            {flag.severity}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Full Intelligence Report */}
                            <Card className="border-white/10 bg-white/5 backdrop-blur-md">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3 mb-4">
                                        <TrendingUp className="w-5 h-5 text-purple-400" />
                                        <h3 className="text-xl font-black text-white uppercase">AI Intelligence</h3>
                                    </div>
                                    <div className="space-y-4 text-sm text-gray-300 font-medium">
                                        <div className="border-l-2 border-purple-500 pl-4 italic">
                                            "{result.ai_intelligence?.technical_advisory || 'Generating advisory...'}"
                                        </div>
                                        <div className="bg-black/20 p-4 rounded border border-white/5">
                                            <div className="text-[10px] text-gray-500 font-bold uppercase mb-2">Risk Vector Analysis</div>
                                            <div className="text-xs text-gray-400 leading-relaxed font-mono">
                                                {result.ai_intelligence?.risk_profile || "Analyzing aircraft history for latent defects and ownership patterns..."}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

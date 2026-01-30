import React from 'react';
import { Shield, TrendingUp, DollarSign, Activity, AlertCircle, CheckCircle2, XCircle, Search, AlertTriangle, Layers, Navigation } from 'lucide-react';

const Card = ({ children, className = "" }) => (
    <div className={`bg-[#0b0f19] border border-[#1e293b] rounded-none overflow-hidden relative ${className}`}>
        {children}
    </div>
);

const G3000Header = ({ title, subtitle, color = "cyan" }) => (
    <div className="flex items-center justify-between px-4 py-2 border-b border-[#1e293b] bg-[#0f172a]">
        <div className="flex flex-col">
            <span className={`text-[10px] uppercase font-black tracking-[0.2em] text-${color}-400`}>{title}</span>
            {subtitle && <span className="text-[10px] text-gray-500 font-mono">{subtitle}</span>}
        </div>
        <div className={`h-1.5 w-1.5 rounded-full bg-${color}-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]`}></div>
    </div>
);

const DataField = ({ label, value, unit, color = "white", size = "lg" }) => (
    <div className="flex flex-col">
        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">{label}</span>
        <div className="flex items-baseline gap-1">
            <span className={`font-black font-mono ${size === 'xl' ? 'text-3xl' : size === 'lg' ? 'text-xl' : 'text-sm'} text-${color}`}>{value}</span>
            {unit && <span className="text-[10px] text-gray-500 font-bold">{unit}</span>}
        </div>
    </div>
);

export default function BuyerSummaryHUD({ result }) {
    if (!result) return null;

    const riskScore = Math.max(0, 100 - (result.confidence_score || 0));
    const fitScore = result.mission_analysis?.score || 0;
    const valuation = result.valuation?.estimated_value || 0;

    // G3000 Color Logic
    const riskColor = riskScore > 50 ? "red-500" : riskScore > 20 ? "amber-400" : "emerald-400";
    const riskLabel = riskScore > 50 ? "WARNING" : riskScore > 20 ? "CAUTION" : "NORMAL";

    const pillars = [
        { label: "SAFETY", score: 100 - riskScore, status: riskScore < 30 ? "PASSED" : "REVIEW", color: riskScore < 30 ? "emerald-400" : "red-400" },
        { label: "MISSION", score: fitScore, status: fitScore > 80 ? "OPTIMAL" : "OFFSET", color: fitScore > 80 ? "emerald-400" : "blue-400" },
        { label: "VALUE", score: result.alpha_score || 75, status: "STABLE", color: "emerald-400" },
    ];

    return (
        <div className="w-full font-sans">
            {/* MAIN MFD CONTAINER */}
            <div className="grid grid-cols-12 gap-1 bg-[#0b0f19] p-1 border-4 border-[#1e293b] rounded-lg shadow-2xl">

                {/* LEFT PANE: PRIMARY FLIGHT DISPLAY (RISK) */}
                <div className="col-span-12 lg:col-span-4 flex flex-col gap-1">
                    {/* RISK GAUGE BOX */}
                    <Card className="flex-1 flex flex-col">
                        <G3000Header title="SYSTEM INTEGRITY" subtitle="RISK FACTOR ANALYSIS" color="cyan" />
                        <div className="p-6 flex flex-col items-center justify-center flex-1 relative overflow-hidden">
                            {/* SVG Gauge Background */}
                            <svg className="absolute w-full h-full opacity-10" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="1" fill="none" strokeDasharray="4 4" />
                            </svg>

                            <div className="relative z-10 text-center">
                                <div className={`text-6xl font-black text-${riskColor} drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]`}>
                                    {riskScore}
                                </div>
                                <div className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-widest border-t border-gray-700 pt-1">
                                    Composite Risk
                                </div>
                            </div>

                            <div className={`mt-6 px-3 py-1 bg-${riskColor}/10 border border-${riskColor}/30 rounded text-${riskColor} text-[10px] font-black uppercase tracking-widest`}>
                                STATUS: {riskLabel}
                            </div>
                        </div>
                    </Card>

                    {/* PILLARS MINI-BOXES */}
                    <div className="grid grid-cols-3 gap-1 h-24">
                        {pillars.map((p, i) => (
                            <Card key={i} className="flex flex-col items-center justify-center p-2 bg-[#0f172a]">
                                <span className="text-[8px] text-gray-500 font-bold">{p.label}</span>
                                <span className={`text-lg font-black text-${p.color}`}>{p.status}</span>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* CENTRE PANE: MULTIFUNCTION DISPLAY (DATA) */}
                <div className="col-span-12 lg:col-span-8 flex flex-col gap-1">
                    {/* TOP ROW: VALUATION & PERF */}
                    <div className="grid grid-cols-2 gap-1 h-32">
                        <Card className="p-4 flex flex-col justify-between">
                            <G3000Header title="ASSET VALUATION" color="emerald" />
                            <div className="mt-2 flex items-end justify-between">
                                <DataField label="Est. Market Value" value={`$${(valuation / 1000).toLocaleString()}k`} unit="USD" color="white" size="xl" />
                                <div className="text-right">
                                    <div className="text-[9px] text-emerald-400 font-bold">ALPHA DETECTED</div>
                                    <div className="text-xs text-gray-400">Market Pos: Top 15%</div>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4 flex flex-col justify-between bg-[#0f172a]">
                            <G3000Header title="PERFORMANCE" color="blue" />
                            <div className="mt-2 grid grid-cols-2 gap-4">
                                <DataField label="Max Range" value={result.performance?.max_range || "---"} unit="NM" />
                                <DataField label="Cruise Speed" value={result.performance?.cruise_speed || "---"} unit="KTAS" />
                            </div>
                        </Card>
                    </div>

                    {/* BOTTOM ROW: FORENSIC LOG (The "Why") */}
                    <Card className="flex-1 p-0 overflow-hidden flex flex-col">
                        <div className="px-4 py-2 border-b border-[#1e293b] flex justify-between items-center bg-[#0f172a]">
                            <span className="text-[10px] uppercase font-black tracking-[0.2em] text-amber-400">FORENSIC AUDIT LOG</span>
                            <span className="text-[9px] font-mono text-gray-500">LIVE FEED // {result.audit_results?.length || 0} RECORDS</span>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-0.5 bg-black/20">
                            {result.audit_results?.map((audit, i) => (
                                <div key={i} className="flex items-start justify-between p-2 border-b border-white/5 hover:bg-white/5 transition-colors group">
                                    <div className="flex flex-col gap-0.5">
                                        <div className="text-gray-300 font-bold truncate pr-4 group-hover:text-white transition-colors">{audit.reason}</div>
                                        <div className="flex items-center gap-2 text-[9px] text-gray-600">
                                            <span className="bg-[#1e293b] px-1 rounded text-cyan-500">{audit.source || 'SYSTEM'}</span>
                                            <span>{audit.ref_code ? `// ${audit.ref_code}` : ''}</span>
                                        </div>
                                    </div>
                                    <span className={`font-black ml-4 ${audit.status === 'negative' || audit.status === 'critical' ? 'text-red-500' :
                                            audit.status === 'caution' ? 'text-amber-500' : 'text-emerald-500'
                                        }`}>
                                        {audit.points}
                                    </span>
                                </div>
                            ))}
                            {(!result.audit_results || result.audit_results.length === 0) && (
                                <div className="text-center py-8 text-gray-600 italic">No forensic anomalies detected. System Nominal.</div>
                            )}
                        </div>
                    </Card>
                </div>

            </div>

            {/* MFD BEZEL BUTTONS (Visual Flourish) */}
            <div className="flex justify-center gap-2 mt-1">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="w-12 h-1 bg-[#1e293b] rounded-full opacity-50"></div>
                ))}
            </div>
        </div>
    );
}

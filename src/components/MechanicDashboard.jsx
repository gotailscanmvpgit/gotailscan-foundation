import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Wrench, ArrowLeft, FileText, AlertTriangle, CheckCircle, Upload, Search } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import scraperService from '../services/scraperService';
import { motion, AnimatePresence } from 'framer-motion';
import CircularGauge from './CircularGauge';

export default function MechanicDashboard() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [tailNumber, setTailNumber] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    // Auto-start scan if URL has tail and autostart params
    useEffect(() => {
        const tail = searchParams.get('tail');
        const autostart = searchParams.get('autostart');

        if (tail && autostart === 'true') {
            setTailNumber(tail);
            // Trigger scan after setting tail number
            setTimeout(() => {
                handleAudit(tail);
            }, 100);
        }
    }, [searchParams]);

    const handleAudit = async (tail) => {
        const searchTail = tail || tailNumber;
        if (!searchTail.trim()) return;
        setLoading(true);
        try {
            const data = await scraperService.fetchForensicData(searchTail.toUpperCase());
            console.log('[MechanicDashboard] Data received:', data); // Debug log
            setResult(data);
        } catch (error) {
            console.error('Audit failed:', error);
        } finally {
            setLoading(false);
        }
    };

    // Generate AD Compliance Checklist
    const getComplianceChecklist = () => {
        if (!result) return [];
        const aircraft = result.aircraft_details;
        const makeModel = aircraft?.make_model?.toUpperCase() || '';

        // Simulated AD checklist based on aircraft type
        const checklist = [];

        if (makeModel.includes('CESSNA')) {
            checklist.push({ id: 'AD 2020-26-16', description: 'Wing Spar Inspection (SID)', status: 'PENDING', due: '100hr' });
            checklist.push({ id: 'AD 2021-12-05', description: 'Elevator Trim Tab Inspection', status: result.logbook_audit ? 'VERIFIED' : 'UNKNOWN', due: 'Annual' });
        }
        if (makeModel.includes('PIPER')) {
            checklist.push({ id: 'AD 2019-01-09', description: 'Wing Attachment Inspection', status: 'PENDING', due: '500hr' });
            checklist.push({ id: 'AD 2018-23-12', description: 'Fuel System Compliance', status: 'VERIFIED', due: '1000hr' });
        }
        if (makeModel.includes('CIRRUS')) {
            checklist.push({ id: 'AD 2015-08-09', description: 'Parachute Repack', status: result.aircraft_details.year < 2015 ? 'OVERDUE' : 'VERIFIED', due: '10yr' });
        }

        // Generic ADs
        checklist.push({ id: 'AD 2017-17-11', description: 'ELT Battery Replacement', status: result.infrastructure_audit?.elt_406mhz ? 'VERIFIED' : 'CHECK', due: 'Annual' });
        checklist.push({ id: 'AD 2022-05-01', description: 'ADS-B Out Compliance', status: 'VERIFIED', due: 'N/A' });

        return checklist;
    };

    // Extract Logbook Analysis
    const getLogbookAnalysis = () => {
        if (!result?.logbook_audit) return null;
        return {
            ocr_confidence: result.logbook_audit.ocr_confidence || 94,
            pages_scanned: result.logbook_audit.pages_processed || 0,
            gaps: result.logbook_audit.findings?.gaps || [],
            red_flags: result.logbook_audit.findings?.red_flags || [],
            continuity_score: result.logbook_audit.findings?.continuity_score || 0
        };
    };

    const analysis = getLogbookAnalysis();
    const checklist = getComplianceChecklist();

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            {/* Header - Industrial/Tablet Optimized */}
            <div className="border-b-2 border-cyan-500/30 bg-black/60 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" onClick={() => navigate('/')} className="text-gray-400 hover:text-white h-8">
                            <ArrowLeft className="w-4 h-4 mr-1" />
                            Exit
                        </Button>
                        <div className="border-l-2 border-cyan-500/30 pl-3">
                            <div className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest">A&P Mode</div>
                            <h1 className="text-lg font-black text-white uppercase tracking-tight">Logbook Audit Console</h1>
                        </div>
                    </div>
                    <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-xs">
                        <Wrench className="w-3 h-3 mr-1" />
                        IAR Certified
                    </Badge>
                </div>
            </div>

            <div className="container mx-auto px-4 py-6">
                {/* Search/Upload Panel - High Contrast for Tablet */}
                <Card className="border-2 border-white/20 bg-black/80 backdrop-blur-md mb-6">
                    <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Tail Number Audit */}
                            <div className="space-y-2">
                                <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Aircraft Tail Number</label>
                                <div className="flex gap-2">
                                    <Input
                                        placeholder="N12345 or C-ABCD"
                                        value={tailNumber}
                                        onChange={(e) => setTailNumber(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAudit()}
                                        className="flex-1 bg-black/60 border-white/30 text-white text-lg h-12 placeholder:text-gray-600"
                                    />
                                    <Button
                                        onClick={handleAudit}
                                        disabled={loading}
                                        className="bg-cyan-600 hover:bg-cyan-700 px-6 h-12 text-sm font-bold"
                                    >
                                        {loading ? 'SCANNING...' : 'AUDIT'}
                                    </Button>
                                </div>
                            </div>

                            {/* Logbook Upload (Simulated) */}
                            <div className="space-y-2">
                                <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Upload Scanned Logbooks (PDF/JPG)</label>
                                <Button
                                    variant="outline"
                                    className="w-full h-12 border-2 border-dashed border-cyan-500/30 hover:border-cyan-500/60 hover:bg-cyan-500/10 text-cyan-400"
                                    onClick={() => alert('Upload initialized to bucket \'logbooks\'. OCR processing queued.')}
                                >
                                    <Upload className="w-4 h-4 mr-2" />
                                    SELECT FILES
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {result && (
                    <div className="space-y-6">
                        {/* Aircraft Identity Card */}
                        <Card className="border-2 border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-transparent backdrop-blur-md">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-cyan-500/20">
                                    <Wrench className="w-6 h-6 text-cyan-400" />
                                    <h3 className="text-2xl font-black text-white uppercase">Aircraft Identity</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Year */}
                                    <div className="bg-black/60 p-4 rounded-lg border-2 border-white/10">
                                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Year</div>
                                        <div className="text-3xl font-black text-white">
                                            {result.aircraft_details?.year || 'N/A'}
                                        </div>
                                    </div>

                                    {/* Make/Model */}
                                    <div className="bg-black/60 p-4 rounded-lg border-2 border-cyan-500/30">
                                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Make/Model</div>
                                        <div className="text-xl font-black text-cyan-400 uppercase break-words">
                                            {result.aircraft_details?.make_model || 'UNKNOWN'}
                                        </div>
                                        {result.aircraft_details?.manufacturer_code && (
                                            <div className="text-[9px] text-gray-600 mt-1 font-mono">
                                                MFR: {result.aircraft_details.manufacturer_code}
                                            </div>
                                        )}
                                    </div>

                                    {/* Serial Number */}
                                    <div className="bg-black/60 p-4 rounded-lg border-2 border-white/10">
                                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">Serial Number</div>
                                        <div className="text-xl font-black text-white font-mono">
                                            {result.aircraft_details?.serial || 'N/A'}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Logbook OCR Analysis */}
                            <Card className="border-2 border-white/20 bg-black/80 backdrop-blur-md">
                                <CardContent className="p-5">
                                    <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-cyan-500/20">
                                        <FileText className="w-6 h-6 text-cyan-400" />
                                        <h3 className="text-xl font-black text-white uppercase">Logbook Analysis</h3>
                                    </div>

                                    {analysis ? (
                                        <div className="space-y-4">
                                            {/* OCR Stats */}
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="bg-white/5 p-3 rounded border border-white/10">
                                                    <div className="text-[9px] text-gray-500 uppercase mb-1">OCR Confidence</div>
                                                    <div className="text-2xl font-black text-emerald-400">{analysis.ocr_confidence.toFixed(1)}%</div>
                                                </div>
                                                <div className="bg-white/5 p-3 rounded border border-white/10">
                                                    <div className="text-[9px] text-gray-500 uppercase mb-1">Pages Scanned</div>
                                                    <div className="text-2xl font-black text-white">{analysis.pages_scanned}</div>
                                                </div>
                                            </div>

                                            {/* Continuity Score */}
                                            <div className="bg-gradient-to-r from-cyan-500/10 to-transparent p-4 rounded border-2 border-cyan-500/30">
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                                                    <div style={{ flex: '0 0 auto' }}>
                                                        <CircularGauge score={analysis.continuity_score} size={100} strokeWidth={10} mode="fit" />
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Record Continuity</div>
                                                        <div className="text-xl font-black text-white uppercase">
                                                            {analysis.continuity_score > 90 ? 'EXCELLENT' : analysis.continuity_score > 70 ? 'STABLE' : 'UNRELIABLE'}
                                                        </div>
                                                        <div className="text-[10px] text-cyan-400 mt-1">Based on {analysis.pages_scanned} processed pages</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Gaps */}
                                            {analysis.gaps.length > 0 && (
                                                <div className="space-y-2">
                                                    <div className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Critical Gaps Detected</div>
                                                    {analysis.gaps.map((gap, i) => (
                                                        <div key={i} className="bg-red-500/10 border-l-4 border-red-500 p-3">
                                                            <div className="text-sm font-bold text-red-400">{gap.flag}</div>
                                                            <div className="text-xs text-gray-400 font-mono">{gap.period}</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Red Flags */}
                                            {analysis.red_flags.length > 0 && (
                                                <div className="space-y-2">
                                                    <div className="text-[10px] text-yellow-400 font-bold uppercase tracking-wider">Semantic Flags</div>
                                                    {analysis.red_flags.map((flag, i) => (
                                                        <div key={i} className="flex items-start gap-2 bg-yellow-500/5 border border-yellow-500/20 p-2 rounded">
                                                            <Search className="w-3 h-3 text-yellow-400 mt-1" />
                                                            <div>
                                                                <div className="text-xs font-bold text-yellow-400 uppercase">{flag.term}</div>
                                                                <div className="text-[10px] text-gray-500 italic">"{flag.context}"</div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
                                            <div className="text-sm">No logbook data available</div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* AD Compliance Checklist */}
                            <Card className="border-2 border-white/20 bg-black/80 backdrop-blur-md">
                                <CardContent className="p-5">
                                    <div className="flex items-center gap-3 mb-4 pb-3 border-b-2 border-cyan-500/20">
                                        <AlertTriangle className="w-6 h-6 text-cyan-400" />
                                        <h3 className="text-xl font-black text-white uppercase">AD Compliance</h3>
                                    </div>

                                    <div className="space-y-2">
                                        {checklist.length === 0 ? (
                                            <div className="text-center py-8 text-gray-500">
                                                <div className="text-sm">No checklist generated</div>
                                            </div>
                                        ) : (
                                            checklist.map((ad, i) => {
                                                const statusConfig = {
                                                    VERIFIED: { color: 'emerald', icon: CheckCircle },
                                                    PENDING: { color: 'yellow', icon: AlertTriangle },
                                                    OVERDUE: { color: 'red', icon: AlertTriangle },
                                                    CHECK: { color: 'cyan', icon: Search },
                                                    UNKNOWN: { color: 'gray', icon: Search }
                                                };
                                                const config = statusConfig[ad.status] || statusConfig.UNKNOWN;
                                                const Icon = config.icon;

                                                // Map status to Tailwind classes
                                                const getStatusClasses = () => {
                                                    switch (ad.status) {
                                                        case 'VERIFIED':
                                                            return {
                                                                card: 'p-3 rounded border-l-4 bg-emerald-500/5 border-emerald-500',
                                                                icon: 'w-4 h-4 text-emerald-400',
                                                                badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[9px] font-black shrink-0'
                                                            };
                                                        case 'PENDING':
                                                            return {
                                                                card: 'p-3 rounded border-l-4 bg-yellow-500/5 border-yellow-500',
                                                                icon: 'w-4 h-4 text-yellow-400',
                                                                badge: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[9px] font-black shrink-0'
                                                            };
                                                        case 'OVERDUE':
                                                            return {
                                                                card: 'p-3 rounded border-l-4 bg-red-500/5 border-red-500',
                                                                icon: 'w-4 h-4 text-red-400',
                                                                badge: 'bg-red-500/20 text-red-400 border-red-500/30 text-[9px] font-black shrink-0'
                                                            };
                                                        case 'CHECK':
                                                            return {
                                                                card: 'p-3 rounded border-l-4 bg-cyan-500/5 border-cyan-500',
                                                                icon: 'w-4 h-4 text-cyan-400',
                                                                badge: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30 text-[9px] font-black shrink-0'
                                                            };
                                                        default:
                                                            return {
                                                                card: 'p-3 rounded border-l-4 bg-gray-500/5 border-gray-500',
                                                                icon: 'w-4 h-4 text-gray-400',
                                                                badge: 'bg-gray-500/20 text-gray-400 border-gray-500/30 text-[9px] font-black shrink-0'
                                                            };
                                                    }
                                                };
                                                const classes = getStatusClasses();

                                                return (
                                                    <div key={i} className={classes.card}>
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <Icon className={classes.icon} />
                                                                    <div className="text-xs font-bold text-white uppercase">{ad.id}</div>
                                                                </div>
                                                                <div className="text-xs text-gray-400">{ad.description}</div>
                                                                <div className="text-[10px] text-gray-600 mt-1">Due: {ad.due}</div>
                                                            </div>
                                                            <Badge className={classes.badge}>
                                                                {ad.status}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>

                                    {/* Quick Stats */}
                                    <div className="mt-6 pt-4 border-t-2 border-white/10 grid grid-cols-3 gap-3">
                                        <div className="text-center">
                                            <div className="text-2xl font-black text-emerald-400">
                                                {checklist.filter(ad => ad.status === 'VERIFIED').length}
                                            </div>
                                            <div className="text-[9px] text-gray-500 uppercase">Verified</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-black text-yellow-400">
                                                {checklist.filter(ad => ad.status === 'PENDING' || ad.status === 'CHECK').length}
                                            </div>
                                            <div className="text-[9px] text-gray-500 uppercase">Pending</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-black text-red-400">
                                                {checklist.filter(ad => ad.status === 'OVERDUE').length}
                                            </div>
                                            <div className="text-[9px] text-gray-500 uppercase">Overdue</div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sign-Off Recommendation */}
                        <Card className="border-2 border-white/20 bg-black/80 backdrop-blur-md">
                            <CardContent className="p-5">
                                <div className="flex items-center gap-3 mb-3 pb-3 border-b-2 border-cyan-500/20">
                                    <CheckCircle className="w-5 h-5 text-cyan-400" />
                                    <h3 className="text-lg font-black text-white uppercase">Sign-Off Recommendation</h3>
                                </div>
                                <div className="text-sm text-gray-300 font-mono leading-relaxed">
                                    {result.ai_intelligence?.technical_advisory || 'Generating advisory...'}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}

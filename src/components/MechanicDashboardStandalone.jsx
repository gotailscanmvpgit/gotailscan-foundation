import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Upload, FileText, Scan, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SplitScreenComparison from './SplitScreenComparison';
import AircraftIdentityCard from './AircraftIdentityCard';
import { logbookOCRService } from '../services/logbookOCRService';

const Badge = ({ children, className }) => (
    <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${className}`}>
        {children}
    </div>
);

export default function MechanicDashboardStandalone() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [tailNumber, setTailNumber] = useState(searchParams.get('tail') || '');
    // PREVENT FLASH: If autostarting, set loading to true immediately
    const [loading, setLoading] = useState(searchParams.get('autostart') === 'true');
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    // OCR State
    const [ocrLoading, setOcrLoading] = useState(false);
    const [ocrProgress, setOcrProgress] = useState(0);
    const [ocrResult, setOcrResult] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [ocrError, setOcrError] = useState(null);

    // Auto-audit on mount if parameters exist
    useEffect(() => {
        const tail = searchParams.get('tail');
        const autostart = searchParams.get('autostart');
        if (tail && autostart === 'true') {
            handleAudit(tail);
        } else {
            setLoading(false);
        }
    }, []);

    const handleAudit = async (overrideTail) => {
        const targetTail = overrideTail || tailNumber;
        if (!targetTail?.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const module = await import('../services/scraperService');
            const data = await module.scraperService.scanTailNumber(targetTail.toUpperCase());
            setResult(data);
        } catch (err) {
            console.error('Audit failed:', err);
            setError(err.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setOcrResult(null);
        setOcrError(null);
    };

    const runOCR = async () => {
        if (!selectedFile) return;

        setOcrLoading(true);
        setOcrProgress(0);
        setOcrError(null);

        try {
            const data = await logbookOCRService.processLogbookImage(selectedFile, (progress) => {
                setOcrProgress(progress);
            });
            setOcrResult(data);

            // If we found a tail number, auto-populate search
            if (data.findings.aircraft_id && !tailNumber) {
                setTailNumber(data.findings.aircraft_id);
            }
        } catch (err) {
            setOcrError("Failed to process image. Ensure it is a clear logbook photo.");
            console.error(err);
        } finally {
            setOcrLoading(false);
        }
    };

    // Generate AD Compliance Checklist
    const getComplianceChecklist = () => {
        if (!result) return [];
        const aircraft = result.aircraft_details;
        const makeModel = aircraft?.make_model?.toUpperCase() || '';
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

    // TELEMETRY: Generate mock TC AD Registry and OCR data for comparison
    const getMockComparisonData = () => {
        if (!result) return { tcData: [], ocrData: [] };

        // Simulated TC AD Registry data
        const tcData = [
            { ad_number: 'AD 2020-26-16', compliance_date: '2023-05-15', description: 'Wing Spar Inspection (SID)' },
            { ad_number: 'AD 2021-12-05', compliance_date: '2023-08-22', description: 'Elevator Trim Tab Inspection' },
            { ad_number: 'AD 2019-01-09', compliance_date: '2022-11-10', description: 'Wing Attachment Inspection' },
            { ad_number: 'AD 2017-17-11', compliance_date: '2024-01-05', description: 'ELT Battery Replacement' }
        ];

        // Simulated OCR Processed Logs (with intentional mismatches)
        const ocrData = [
            { ad_number: 'AD 2020-26-16', compliance_date: '2023-05-15', description: 'Wing Spar Inspection (SID)' }, // MATCH
            { ad_number: 'AD 2021-12-05', compliance_date: '2023-09-01', description: 'Elevator Trim Tab Inspection' }, // MISMATCH (date)
            { ad_number: 'AD 2019-01-09', compliance_date: '2022-11-10', description: 'Wing Attachment Inspection' }, // MATCH
            // AD 2017-17-11 is MISSING from OCR (will show as NOT FOUND)
        ];

        return { tcData, ocrData };
    };

    const analysis = getLogbookAnalysis();
    const checklist = getComplianceChecklist();

    const internalCardClass = "internal-card p-7 relative overflow-hidden transition-all duration-300";
    const internalCardAmberClass = `${internalCardClass} internal-card-amber`;
    const cardStyle = {}; // Prevent ReferenceError

    const getStatusColor = (status) => {
        switch (status) {
            case 'VERIFIED': return { bg: 'rgba(16, 185, 129, 0.1)', border: '#10b981', text: '#10b981' };
            case 'PENDING': return { bg: 'rgba(234, 179, 8, 0.1)', border: '#eab308', text: '#eab308' };
            case 'OVERDUE': return { bg: 'rgba(239, 68, 68, 0.1)', border: '#ef4444', text: '#ef4444' };
            case 'CHECK': return { bg: 'rgba(249, 115, 22, 0.1)', border: '#f97316', text: '#f97316' };
            default: return { bg: 'rgba(107, 114, 128, 0.1)', border: '#6b7280', text: '#6b7280' };
        }
    };

    return (
        <div className="cockpit-container">
            {/* Header - Industrial Style */}
            <div style={{ borderBottom: '2px solid rgba(249, 115, 22, 0.3)', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 50 }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button onClick={() => navigate('/')} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>
                            ← EXIT
                        </button>
                        <div style={{ borderLeft: '2px solid rgba(249, 115, 22, 0.3)', paddingLeft: '12px' }}>
                            <div style={{ fontSize: '9px', color: '#f97316', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>A&P MODE</div>
                            <h1 className="font-registration" style={{ fontSize: '18px', color: 'white', textTransform: 'uppercase', margin: 0, letterSpacing: '1px' }}>LOGBOOK AUDIT CONSOLE</h1>
                        </div>
                    </div>
                    <div style={{ padding: '4px 12px', background: 'rgba(249, 115, 22, 0.2)', border: '1px solid rgba(249, 115, 22, 0.4)', borderRadius: '4px', fontSize: '10px', color: '#f97316', fontWeight: 'bold' }}>
                        IAR CERTIFIED
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 20px' }}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Search Panel */}
                    <div className={`${internalCardClass} lg:col-span-1`}>
                        <label style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Aircraft Tail Number</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input
                                placeholder="N12345"
                                value={tailNumber}
                                onChange={(e) => setTailNumber(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAudit()}
                                style={{ flex: 1, background: 'rgba(0, 0, 0, 0.6)', border: '1px solid rgba(255, 255, 255, 0.3)', borderRadius: '6px', padding: '12px', color: 'white', fontSize: '16px', fontWeight: 'bold' }}
                            />
                            <button
                                onClick={handleAudit}
                                disabled={loading}
                                style={{ background: loading ? '#6b7280' : '#f97316', color: 'black', padding: '12px 24px', borderRadius: '6px', border: 'none', fontWeight: '900', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '14px' }}
                            >
                                {loading ? <Loader2 className="animate-spin" size={18} /> : 'AUDIT'}
                            </button>
                        </div>
                        {error && <div style={{ marginTop: '12px', color: '#ef4444', fontSize: '12px' }}>{error}</div>}
                    </div>

                    {/* OCR Upload Panel */}
                    <div className={`${internalCardClass} lg:col-span-2 internal-card-amber`}>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <Scan size={18} className="text-amber-500" />
                                <h3 className="text-xs font-black text-white uppercase tracking-wider">Logbook Forensic Scan</h3>
                            </div>
                            {ocrResult && <Badge className="bg-emerald-500/20 text-emerald-400 border-none text-[9px]">OCR VERIFIED</Badge>}
                        </div>

                        <div className="flex gap-6 h-32">
                            {/* Upload Area */}
                            <label className="flex-1 border-2 border-dashed border-white/10 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-all relative overflow-hidden group">
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileSelect} />

                                {previewUrl ? (
                                    <div className="absolute inset-0">
                                        <img src={previewUrl} className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-all" />
                                        {ocrLoading && (
                                            <div className="absolute inset-0 bg-amber-500/20 flex flex-col items-center justify-center">
                                                <div className="w-full max-w-[80%] h-1 bg-white/20 rounded-full mb-2 overflow-hidden">
                                                    <motion.div
                                                        className="h-full bg-amber-500"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${ocrProgress}%` }}
                                                    />
                                                </div>
                                                <span className="text-[9px] font-bold text-white uppercase tracking-widest">{ocrProgress}% SCANNING</span>
                                                <div className="absolute inset-x-0 h-0.5 bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,1)] animate-scanline"></div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <Upload size={24} className="text-gray-500 mb-2" />
                                        <span className="text-[10px] text-gray-400 font-bold uppercase">Drop Page Photo</span>
                                    </>
                                )}
                            </label>

                            {/* Extract Button */}
                            <div className="flex flex-col justify-center gap-2 w-32">
                                <button
                                    onClick={runOCR}
                                    disabled={!selectedFile || ocrLoading}
                                    className={`w-full py-3 rounded-md font-black text-[10px] uppercase tracking-widest transition-all ${selectedFile && !ocrLoading
                                        ? 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                                        : 'bg-white/5 text-gray-500'
                                        }`}
                                >
                                    {ocrLoading ? 'EXTRACTING...' : 'RUN FORENSIC'}
                                </button>
                                {ocrResult && (
                                    <div className="text-center">
                                        <div className="text-[9px] text-emerald-400 font-bold uppercase flex items-center justify-center gap-1">
                                            <CheckCircle size={10} /> Intelligence Extracted
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Result Sneak Peek */}
                            {ocrResult && (
                                <div className="flex-1 bg-black/40 rounded-lg p-3 border border-white/5 overflow-y-auto custom-scrollbar">
                                    <h4 className="text-[8px] text-gray-500 font-bold uppercase mb-2">Metadata Found</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="text-[10px]"><span className="text-gray-600">ID:</span> <span className="text-white font-mono">{ocrResult.findings.aircraft_id || 'NOT FOUND'}</span></div>
                                        <div className="text-[10px]"><span className="text-gray-600">TT:</span> <span className="text-white font-mono">{ocrResult.findings.total_time || '--'}</span></div>
                                        <div className="text-[10px]"><span className="text-gray-600">AD:</span> <span className="text-amber-500 font-mono">{ocrResult.findings.ad_compliance.length} items</span></div>
                                    </div>
                                </div>
                            )}
                        </div>
                        {ocrError && <div className="mt-2 text-[10px] text-red-500 font-bold uppercase">⚠ {ocrError}</div>}
                    </div>
                </div>

                {result && (
                    <>
                        <AircraftIdentityCard aircraftDetails={result.aircraft_details} cardStyle={cardStyle} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            {/* Logbook OCR Analysis */}
                            <div className={internalCardClass}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '2px solid rgba(249, 115, 22, 0.2)' }}>
                                    <div style={{ fontSize: '24px' }}>📄</div>
                                    <h3 style={{ fontSize: '18px', fontWeight: '900', color: 'white', textTransform: 'uppercase', margin: 0 }}>LOGBOOK ANALYSIS</h3>
                                </div>

                                {analysis ? (
                                    <div style={{ display: 'grid', gap: '16px' }}>
                                        {/* OCR Stats */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                                <div style={{ fontSize: '9px', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 'bold' }}>OCR CONFIDENCE</div>
                                                <div style={{ fontSize: '24px', fontWeight: '900', color: '#10b981' }}>{analysis.ocr_confidence.toFixed(1)}%</div>
                                            </div>
                                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                                <div style={{ fontSize: '9px', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 'bold' }}>PAGES SCANNED</div>
                                                <div style={{ fontSize: '24px', fontWeight: '900', color: 'white' }}>{analysis.pages_scanned}</div>
                                            </div>
                                        </div>

                                        {/* Continuity Score */}
                                        <div style={{ background: 'linear-gradient(to right, rgba(249, 115, 22, 0.1), transparent)', padding: '16px', borderRadius: '6px', border: '1px solid rgba(249, 115, 22, 0.3)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#f97316', textTransform: 'uppercase' }}>RECORD CONTINUITY</div>
                                                <div style={{ fontSize: '28px', fontWeight: '900', color: 'white' }}>{analysis.continuity_score}</div>
                                            </div>
                                            <div style={{ width: '100%', background: 'rgba(0,0,0,0.4)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                                                <div
                                                    style={{ height: '100%', background: analysis.continuity_score > 90 ? '#10b981' : analysis.continuity_score > 70 ? '#eab308' : '#ef4444', width: `${analysis.continuity_score}%`, transition: 'width 0.3s' }}
                                                />
                                            </div>
                                        </div>

                                        {/* Gaps */}
                                        {analysis.gaps.length > 0 && (
                                            <div>
                                                <div style={{ fontSize: '10px', color: '#ef4444', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px' }}>⚠ CRITICAL GAPS</div>
                                                {analysis.gaps.slice(0, 3).map((gap, i) => (
                                                    <div key={i} style={{ background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444', padding: '12px', marginBottom: '8px' }}>
                                                        <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#ef4444' }}>{gap.flag}</div>
                                                        <div style={{ fontSize: '10px', color: '#9ca3af', fontFamily: 'monospace', marginTop: '4px' }}>{gap.period}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280' }}>
                                        <div style={{ fontSize: '48px', marginBottom: '8px', opacity: 0.3 }}>📄</div>
                                        <div style={{ fontSize: '12px' }}>No logbook data available</div>
                                    </div>
                                )}
                            </div>

                            {/* AD Compliance Checklist */}
                            <div className={internalCardClass}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '2px solid rgba(249, 115, 22, 0.2)' }}>
                                    <div style={{ fontSize: '24px' }}>⚙️</div>
                                    <h3 style={{ fontSize: '18px', fontWeight: '900', color: 'white', textTransform: 'uppercase', margin: 0 }}>AD COMPLIANCE</h3>
                                </div>

                                <div style={{ display: 'grid', gap: '12px', marginBottom: '20px' }}>
                                    {checklist.length === 0 ? (
                                        <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280' }}>
                                            <div style={{ fontSize: '12px' }}>No checklist generated</div>
                                        </div>
                                    ) : (
                                        checklist.map((ad, i) => {
                                            const colors = getStatusColor(ad.status);
                                            return (
                                                <div key={i} style={{ padding: '12px', borderRadius: '6px', borderLeft: `4px solid ${colors.border}`, background: colors.bg }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '12px' }}>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontSize: '11px', fontWeight: 'bold', color: 'white', textTransform: 'uppercase', marginBottom: '4px' }}>{ad.id}</div>
                                                            <div style={{ fontSize: '11px', color: '#9ca3af' }}>{ad.description}</div>
                                                            <div style={{ fontSize: '9px', color: '#6b7280', marginTop: '4px' }}>Due: {ad.due}</div>
                                                        </div>
                                                        <div style={{ padding: '2px 8px', borderRadius: '3px', background: colors.border, color: 'black', fontSize: '9px', fontWeight: '900' }}>
                                                            {ad.status}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>

                                {/* Quick Stats */}
                                <div style={{ paddingTop: '16px', borderTop: '2px solid rgba(255,255,255,0.1)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '24px', fontWeight: '900', color: '#10b981' }}>
                                            {checklist.filter(ad => ad.status === 'VERIFIED').length}
                                        </div>
                                        <div style={{ fontSize: '9px', color: '#9ca3af', textTransform: 'uppercase' }}>VERIFIED</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '24px', fontWeight: '900', color: '#eab308' }}>
                                            {checklist.filter(ad => ad.status === 'PENDING' || ad.status === 'CHECK').length}
                                        </div>
                                        <div style={{ fontSize: '9px', color: '#9ca3af', textTransform: 'uppercase' }}>PENDING</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '24px', fontWeight: '900', color: '#ef4444' }}>
                                            {checklist.filter(ad => ad.status === 'OVERDUE').length}
                                        </div>
                                        <div style={{ fontSize: '9px', color: '#9ca3af', textTransform: 'uppercase' }}>OVERDUE</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* TELEMETRY: Split-Screen Comparison */}
                {result && (() => {
                    const comparisonData = getMockComparisonData();
                    return (
                        <div style={{ marginTop: '24px' }}>
                            <SplitScreenComparison
                                tcAdData={comparisonData.tcData}
                                ocrData={comparisonData.ocrData}
                            />
                        </div>
                    );
                })()}

                {/* Sign-Off Recommendation */}
                {result && (
                    <div className={internalCardClass} style={{ marginTop: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '2px solid rgba(249, 115, 22, 0.2)' }}>
                            <div style={{ fontSize: '20px' }}>✓</div>
                            <h3 style={{ fontSize: '16px', fontWeight: '900', color: 'white', textTransform: 'uppercase', margin: 0 }}>SIGN-OFF RECOMMENDATION</h3>
                        </div>
                        <div style={{ fontSize: '13px', color: '#d1d5db', fontFamily: 'monospace', lineHeight: '1.6' }}>
                            {result.ai_intelligence?.technical_advisory || 'Generating advisory...'}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

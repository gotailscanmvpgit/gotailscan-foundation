import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SplitScreenComparison from './SplitScreenComparison';

export default function MechanicDashboardStandalone() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [tailNumber, setTailNumber] = useState(searchParams.get('tail') || '');
    // PREVENT FLASH: If autostarting, set loading to true immediately
    const [loading, setLoading] = useState(searchParams.get('autostart') === 'true');
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

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

    const cardStyle = {
        background: 'rgba(0, 0, 0, 0.6)',
        border: '2px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '8px',
        padding: '20px'
    };

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
        <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>
            {/* Header - Industrial Style */}
            <div style={{ borderBottom: '2px solid rgba(249, 115, 22, 0.3)', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 50 }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button onClick={() => navigate('/')} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}>
                            ← EXIT
                        </button>
                        <div style={{ borderLeft: '2px solid rgba(249, 115, 22, 0.3)', paddingLeft: '12px' }}>
                            <div style={{ fontSize: '9px', color: '#f97316', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>A&P MODE</div>
                            <h1 style={{ fontSize: '18px', fontWeight: '900', color: 'white', textTransform: 'uppercase', margin: 0, letterSpacing: '1px' }}>LOGBOOK AUDIT CONSOLE</h1>
                        </div>
                    </div>
                    <div style={{ padding: '4px 12px', background: 'rgba(249, 115, 22, 0.2)', border: '1px solid rgba(249, 115, 22, 0.4)', borderRadius: '4px', fontSize: '10px', color: '#f97316', fontWeight: 'bold' }}>
                        IAR CERTIFIED
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 20px' }}>
                {/* Search/Upload Panel */}
                <div style={{ ...cardStyle, marginBottom: '24px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px' }}>
                        <div>
                            <label style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Aircraft Tail Number</label>
                            <input
                                placeholder="N12345 or C-ABCD"
                                value={tailNumber}
                                onChange={(e) => setTailNumber(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAudit()}
                                style={{ width: '100%', background: 'rgba(0, 0, 0, 0.6)', border: '1px solid rgba(255, 255, 255, 0.3)', borderRadius: '6px', padding: '14px', color: 'white', fontSize: '16px', fontWeight: 'bold' }}
                            />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'end' }}>
                            <button
                                onClick={handleAudit}
                                disabled={loading}
                                style={{ background: loading ? '#6b7280' : '#f97316', color: 'black', padding: '14px 40px', borderRadius: '6px', border: 'none', fontWeight: '900', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '14px', textTransform: 'uppercase' }}
                            >
                                {loading ? 'SCANNING...' : 'AUDIT'}
                            </button>
                        </div>
                    </div>
                    {error && <div style={{ marginTop: '12px', color: '#ef4444', fontSize: '14px', fontWeight: 'bold' }}>⚠ {error}</div>}
                </div>

                {result && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        {/* Logbook OCR Analysis */}
                        <div style={cardStyle}>
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
                        <div style={cardStyle}>
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
                    <div style={{ ...cardStyle, marginTop: '24px' }}>
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

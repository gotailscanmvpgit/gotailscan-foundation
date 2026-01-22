import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resolveMakeModel, isCleanMakeModel } from '../utils/makeModelResolver';

export default function MinimalBuyerTest() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [tailNumber, setTailNumber] = useState(searchParams.get('tail') || '');
    // PREVENT FLASH: If autostarting, set loading to true immediately
    const [loading, setLoading] = useState(searchParams.get('autostart') === 'true');
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [resolvedMakeModel, setResolvedMakeModel] = useState(null);

    // Auto-scan on mount if parameters exist
    useEffect(() => {
        const tail = searchParams.get('tail');
        const autostart = searchParams.get('autostart');
        if (tail && autostart === 'true') {
            handleScan(tail);
        } else {
            setLoading(false); // Reset if not valid
        }
    }, []);

    const handleScan = async (overrideTail) => {
        const targetTail = overrideTail || tailNumber;
        if (!targetTail?.trim()) return;

        setLoading(true);
        setError(null);

        try {
            // Dynamic import - scraperService is a named export
            const module = await import('../services/scraperService');
            const data = await module.scraperService.scanTailNumber(targetTail.toUpperCase());
            setResult(data);
        } catch (err) {
            console.error('Scan failed:', err);
            setError(err.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const riskScore = result ? Math.max(0, 100 - result.confidence_score) : 0;
    const riskLevel = riskScore > 60 ? 'HIGH' : riskScore > 30 ? 'MEDIUM' : 'LOW';

    // Intelligent Make/Model Resolution
    useEffect(() => {
        if (!result?.aircraft_details) {
            setResolvedMakeModel(null);
            return;
        }

        const aircraftData = result.aircraft_details;

        // Check if resolution is needed
        if (!isCleanMakeModel(aircraftData.make_model)) {
            console.log('[Buyer Dashboard] Resolving unclear make/model:', aircraftData.make_model);

            resolveMakeModel(aircraftData).then(resolved => {
                console.log('[Buyer Dashboard] ✓ Resolved:', resolved);
                setResolvedMakeModel(resolved);
            }).catch(err => {
                console.error('[Buyer Dashboard] Resolution failed:', err);
                setResolvedMakeModel({
                    make_model: cleanFallback(aircraftData.make_model),
                    source: 'fallback',
                    confidence: 'low'
                });
            });
        } else {
            // Already clean
            setResolvedMakeModel({
                make_model: aircraftData.make_model,
                source: 'registry',
                confidence: 'high'
            });
        }
    }, [result]);

    // Fallback cleaning function
    const cleanFallback = (makeModel) => {
        if (!makeModel) return 'Unknown Aircraft';

        // Remove common patterns
        let cleaned = makeModel
            .replace(/Unknown Type \(\d+\)/gi, 'Aircraft Model Unavailable')
            .replace(/ACFT-CODE[:\s]*/gi, '')
            .replace(/SERIES-CONFIRMED[:\s]*/gi, '')
            .trim();

        return cleaned || 'Aircraft Model Unavailable';
    };

    // Get display make/model
    const getCleanMakeModel = () => {
        if (!resolvedMakeModel) return 'Loading...';
        return resolvedMakeModel.make_model;
    };

    const getRedFlags = () => {
        if (!result) return [];
        const flags = [];
        if (result.forensic_records?.ntsb_count > 0) flags.push({ severity: 'CRITICAL', label: 'Accident History', detail: `${result.forensic_records.ntsb_count} NTSB Reports` });
        if (result.forensic_records?.liens_found) flags.push({ severity: 'CRITICAL', label: 'Active Lien', detail: 'Title Issue' });
        if (result.compliance_audit?.status === 'FLAGGED') flags.push({ severity: 'CRITICAL', label: 'Sanctions Hit', detail: result.compliance_audit.clearance_code });
        if (result.logbook_audit?.findings?.gaps?.length > 0) flags.push({ severity: 'WARNING', label: 'Logbook Gaps', detail: `${result.logbook_audit.findings.gaps.length} gaps` });
        if (result.dormancy_analysis?.dormancy_risk === 'HIGH') flags.push({ severity: 'WARNING', label: 'Dormant Aircraft', detail: `${result.dormancy_analysis.last_flight_gap}mo idle` });
        return flags;
    };

    // TELEMETRY: SalinityIndex - Coastal exposure risk
    const getSalinityIndex = () => {
        if (!result?.aircraft_details) return { score: 0, risk: 'UNKNOWN' };

        // Coastal geofence mapping (simulated based on registration state/city)
        const coastalStates = ['FL', 'CA', 'HI', 'TX', 'LA', 'SC', 'NC', 'MA', 'NY', 'WA', 'OR'];
        const state = result.aircraft_details.state || '';
        const city = result.aircraft_details.city || '';

        let score = 0;
        if (coastalStates.includes(state)) score += 40;
        if (city.toLowerCase().includes('beach') || city.toLowerCase().includes('coast')) score += 30;
        if (result.aircraft_details.year && result.aircraft_details.year < 2000) score += 20; // Older aircraft more susceptible
        if (result.hangar_queen_index && result.hangar_queen_index > 50) score += 10; // Outdoor storage likely

        const risk = score > 60 ? 'HIGH' : score > 30 ? 'MODERATE' : 'LOW';
        return { score, risk, state, isCoastal: coastalStates.includes(state) };
    };

    // TELEMETRY: Dormancy Caution
    const getDormancyCaution = () => {
        if (!result?.dormancy_analysis) return null;

        const lastFlightGap = result.dormancy_analysis.last_flight_gap || 0;
        const daysSinceLastFlight = lastFlightGap * 30; // Convert months to days (approximate)

        if (daysSinceLastFlight > 45) {
            return {
                show: true,
                days: daysSinceLastFlight,
                severity: daysSinceLastFlight > 180 ? 'CRITICAL' : 'CAUTION',
                message: daysSinceLastFlight > 180
                    ? `Aircraft dormant for ${Math.floor(daysSinceLastFlight / 30)} months - Expect significant recommissioning costs`
                    : `${daysSinceLastFlight} days since last flight - Pre-purchase inspection critical`
            };
        }
        return null;
    };

    const salinityData = getSalinityIndex();
    const dormancyAlert = getDormancyCaution();

    const cardStyle = {
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '24px'
    };

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #020617, #0f172a, #020617)' }}>
            {/* Header */}
            <div style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 50 }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button onClick={() => navigate('/')} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '14px' }}>
                            ← Back
                        </button>
                        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '16px' }}>
                            <div style={{ fontSize: '10px', color: '#10b981', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>Buyer Mode</div>
                            <h1 style={{ fontSize: '20px', fontWeight: '900', color: 'white', textTransform: 'uppercase', margin: 0 }}>The Risk Radar</h1>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
                {/* Search Bar */}
                <div style={{ ...cardStyle, marginBottom: '32px' }}>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <input
                            placeholder="Enter Tail Number (e.g., N12345 or C-GJED)"
                            value={tailNumber}
                            onChange={(e) => setTailNumber(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                            style={{ flex: 1, minWidth: '250px', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '8px', padding: '12px 16px', color: 'white', fontSize: '16px' }}
                        />
                        <button
                            onClick={handleScan}
                            disabled={loading}
                            style={{ background: loading ? '#6b7280' : '#10b981', color: 'white', padding: '12px 32px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '14px' }}
                        >
                            {loading ? 'Scanning...' : 'Scan Risk Profile'}
                        </button>
                    </div>
                    {error && <div style={{ marginTop: '12px', color: '#ef4444', fontSize: '14px' }}>Error: {error}</div>}
                </div>

                {result && (
                    <div style={{ display: 'grid', gap: '24px' }}>
                        {/* Hero Metric */}
                        <div style={{ ...cardStyle, background: riskLevel === 'HIGH' ? 'rgba(239, 68, 68, 0.1)' : riskLevel === 'MEDIUM' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(16, 185, 129, 0.1)' }}>
                            <div style={{ marginBottom: '24px' }}>
                                <div style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>Hero Metric</div>
                                <h2 style={{ fontSize: '30px', fontWeight: '900', color: 'white', textTransform: 'uppercase', margin: 0 }}>Risk Assessment</h2>
                                {/* Aircraft Details */}
                                <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', fontSize: '12px' }}>
                                        <div>
                                            <div style={{ color: '#6b7280', fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}>Year</div>
                                            <div style={{ color: 'white', fontWeight: 'bold' }}>{result.aircraft_details?.year || 'N/A'}</div>
                                        </div>
                                        <div>
                                            <div style={{ color: '#6b7280', fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}>Make/Model</div>
                                            <div style={{ color: 'white', fontWeight: 'bold' }}>{getCleanMakeModel()}</div>
                                        </div>
                                        <div>
                                            <div style={{ color: '#6b7280', fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px' }}>Serial #</div>
                                            <div style={{ color: 'white', fontWeight: 'bold' }}>{result.aircraft_details?.serial || 'N/A'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
                                <div style={{ fontSize: '72px', fontWeight: '900', color: riskLevel === 'HIGH' ? '#ef4444' : riskLevel === 'MEDIUM' ? '#eab308' : '#10b981' }}>{riskScore}</div>
                                <div>
                                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#9ca3af' }}>/100</div>
                                    <div style={{ marginTop: '8px', padding: '4px 12px', borderRadius: '4px', background: riskLevel === 'HIGH' ? 'rgba(239, 68, 68, 0.2)' : riskLevel === 'MEDIUM' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(16, 185, 129, 0.2)', color: riskLevel === 'HIGH' ? '#ef4444' : riskLevel === 'MEDIUM' ? '#eab308' : '#10b981', fontSize: '12px', fontWeight: 'bold' }}>
                                        {riskLevel} RISK
                                    </div>
                                </div>
                            </div>
                            <div style={{ fontSize: '14px', color: '#9ca3af' }}>
                                {result.ai_intelligence?.risk_profile || result.ai_intelligence?.audit_verdict || 'Analysis complete'}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                            {/* Red Flags */}
                            <div style={cardStyle}>
                                <h3 style={{ fontSize: '20px', fontWeight: '900', color: 'white', textTransform: 'uppercase', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span>⚠️</span> Critical Alerts
                                </h3>
                                {getRedFlags().length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '32px 0', color: '#10b981' }}>
                                        <div style={{ fontSize: '48px', marginBottom: '8px' }}>✓</div>
                                        <div style={{ fontSize: '14px', fontWeight: 'bold' }}>No Critical Issues Detected</div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gap: '12px' }}>
                                        {getRedFlags().map((flag, i) => (
                                            <div key={i} style={{ padding: '16px', borderRadius: '8px', border: `1px solid ${flag.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(234, 179, 8, 0.3)'}`, background: flag.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(234, 179, 8, 0.1)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '12px' }}>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ fontSize: '14px', fontWeight: 'bold', color: flag.severity === 'CRITICAL' ? '#ef4444' : '#eab308', textTransform: 'uppercase', marginBottom: '4px' }}>
                                                            {flag.label}
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: '#9ca3af' }}>{flag.detail}</div>
                                                    </div>
                                                    <div style={{ padding: '2px 8px', borderRadius: '4px', background: flag.severity === 'CRITICAL' ? '#ef4444' : '#eab308', color: 'black', fontSize: '9px', fontWeight: '900' }}>
                                                        {flag.severity}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* TELEMETRY: Salinity Index */}
                            <div style={cardStyle}>
                                <h3 style={{ fontSize: '20px', fontWeight: '900', color: 'white', textTransform: 'uppercase', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span>🌊</span> Salinity Index
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div style={{ padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <div style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '8px' }}>Corrosion Risk</div>
                                        <div style={{ fontSize: '36px', fontWeight: '900', color: salinityData.risk === 'HIGH' ? '#ef4444' : salinityData.risk === 'MODERATE' ? '#eab308' : '#10b981' }}>
                                            {salinityData.score}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>{salinityData.risk} EXPOSURE</div>
                                    </div>
                                    <div style={{ padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <div style={{ fontSize: '10px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '8px' }}>Location Analysis</div>
                                        <div style={{ fontSize: '14px', color: 'white', fontWeight: 'bold', marginBottom: '8px' }}>
                                            {salinityData.state || 'Unknown'}
                                        </div>
                                        <div style={{ fontSize: '11px', color: salinityData.isCoastal ? '#eab308' : '#10b981', fontWeight: 'bold' }}>
                                            {salinityData.isCoastal ? '⚠ COASTAL STATE' : '✓ INLAND STATE'}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '11px', color: '#60a5fa', lineHeight: '1.6' }}>
                                        <strong>Advisory:</strong> Coastal aircraft require enhanced corrosion inspection. Check wing spars, control cables, and engine mounts for salt damage.
                                    </div>
                                </div>
                            </div>

                            {/* TELEMETRY: Dormancy Caution */}
                            {dormancyAlert && (
                                <div style={{ ...cardStyle, background: dormancyAlert.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(234, 179, 8, 0.1)', border: `2px solid ${dormancyAlert.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(234, 179, 8, 0.3)'}` }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                                        <div style={{ fontSize: '48px' }}>⏸️</div>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ fontSize: '20px', fontWeight: '900', color: dormancyAlert.severity === 'CRITICAL' ? '#ef4444' : '#eab308', textTransform: 'uppercase', margin: 0 }}>
                                                DORMANCY CAUTION
                                            </h3>
                                            <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                                                {dormancyAlert.days} days since last flight
                                            </div>
                                        </div>
                                        <div style={{ padding: '8px 16px', borderRadius: '6px', background: dormancyAlert.severity === 'CRITICAL' ? '#ef4444' : '#eab308', color: 'black', fontSize: '11px', fontWeight: '900' }}>
                                            {dormancyAlert.severity}
                                        </div>
                                    </div>
                                    <div style={{ padding: '16px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', fontSize: '13px', color: 'white', lineHeight: '1.6' }}>
                                        {dormancyAlert.message}
                                    </div>
                                </div>
                            )}

                            {/* Mission Fit */}
                            <div style={cardStyle}>
                                <h3 style={{ fontSize: '20px', fontWeight: '900', color: 'white', textTransform: 'uppercase', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span>📊</span> Mission Fit
                                </h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div style={{ background: 'rgba(0,0,0,0.4)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ fontSize: '9px', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '4px' }}>Value</div>
                                        <div style={{ fontSize: '20px', fontWeight: '900', color: 'white' }}>${(result.valuation?.estimated_value / 1000).toFixed(0)}k</div>
                                    </div>
                                    <div style={{ background: 'rgba(0,0,0,0.4)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ fontSize: '9px', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '4px' }}>Year</div>
                                        <div style={{ fontSize: '20px', fontWeight: '900', color: 'white' }}>{result.aircraft_details?.year || 'N/A'}</div>
                                    </div>
                                </div>
                                {result.ai_intelligence?.tax_strategy && (
                                    <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '10px', color: '#10b981', fontWeight: 'bold', marginBottom: '4px' }}>TAX BENEFIT</div>
                                        <div style={{ fontSize: '14px', color: 'white', fontWeight: 'bold' }}>
                                            {result.ai_intelligence.tax_strategy.bonus_depreciation_rate} Write-off
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                                            ~${(result.ai_intelligence.tax_strategy.year_1_deduction / 1000).toFixed(0)}k Year 1
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* AI Advisory */}
                        {result.ai_intelligence?.technical_advisory && (
                            <div style={cardStyle}>
                                <h3 style={{ fontSize: '20px', fontWeight: '900', color: 'white', textTransform: 'uppercase', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span>🧠</span> AI Advisory
                                </h3>
                                <div style={{ fontSize: '14px', color: '#d1d5db', fontFamily: 'monospace', lineHeight: '1.6', borderLeft: '2px solid #a855f7', paddingLeft: '16px' }}>
                                    {result.ai_intelligence.technical_advisory}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

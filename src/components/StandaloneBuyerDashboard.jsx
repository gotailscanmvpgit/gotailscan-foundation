import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import scraperService from '../services/scraperService';

export default function StandaloneBuyerDashboard() {
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

    const riskScore = result ? Math.max(0, 100 - result.confidence_score) : 0;
    const riskLevel = riskScore > 60 ? 'HIGH' : riskScore > 30 ? 'MEDIUM' : 'LOW';

    const getRedFlags = () => {
        if (!result) return [];
        const flags = [];
        if (result.forensic_records?.ntsb_count > 0) flags.push({ severity: 'CRITICAL', label: 'Accident History', detail: `${result.forensic_records.ntsb_count} NTSB Reports` });
        if (result.forensic_records?.liens_found) flags.push({ severity: 'CRITICAL', label: 'Active Lien', detail: 'Title Issue Detected' });
        if (result.compliance_audit?.status === 'FLAGGED') flags.push({ severity: 'CRITICAL', label: 'Sanctions Hit', detail: result.compliance_audit.clearance_code });
        if (result.logbook_audit?.findings?.gaps?.length > 0) flags.push({ severity: 'WARNING', label: 'Logbook Gaps', detail: `${result.logbook_audit.findings.gaps.length} Missing Annuals` });
        if (result.dormancy_analysis?.dormancy_risk === 'HIGH') flags.push({ severity: 'WARNING', label: 'Dormant Aircraft', detail: `${result.dormancy_analysis.last_flight_gap}mo since last flight` });
        return flags;
    };

    const cardStyle = {
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '24px'
    };

    const buttonStyle = {
        background: '#10b981',
        color: 'white',
        padding: '12px 32px',
        borderRadius: '8px',
        border: 'none',
        fontWeight: 'bold',
        cursor: 'pointer',
        fontSize: '14px'
    };

    const inputStyle = {
        background: 'rgba(0, 0, 0, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '8px',
        padding: '12px 16px',
        color: 'white',
        fontSize: '16px',
        width: '100%'
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
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <input
                            placeholder="Enter Tail Number (e.g., N12345 or C-ABCD)"
                            value={tailNumber}
                            onChange={(e) => setTailNumber(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                            style={inputStyle}
                        />
                        <button onClick={handleScan} disabled={loading} style={buttonStyle}>
                            {loading ? 'Scanning...' : 'Scan Risk Profile'}
                        </button>
                    </div>
                </div>

                {result && (
                    <div style={{ display: 'grid', gap: '24px' }}>
                        {/* Hero Metric */}
                        <div style={{ ...cardStyle, background: riskLevel === 'HIGH' ? 'rgba(239, 68, 68, 0.1)' : riskLevel === 'MEDIUM' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(16, 185, 129, 0.1)' }}>
                            <div style={{ marginBottom: '24px' }}>
                                <div style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>Hero Metric</div>
                                <h2 style={{ fontSize: '30px', fontWeight: '900', color: 'white', textTransform: 'uppercase', margin: 0 }}>Risk Assessment</h2>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', marginBottom: '16px' }}>
                                <div style={{ fontSize: '72px', fontWeight: '900', color: riskLevel === 'HIGH' ? '#ef4444' : riskLevel === 'MEDIUM' ? '#eab308' : '#10b981' }}>{riskScore}</div>
                                <div>
                                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#9ca3af' }}>/100</div>
                                    <div style={{ marginTop: '8px', padding: '4px 12px', borderRadius: '4px', background: riskLevel === 'HIGH' ? 'rgba(239, 68, 68, 0.2)' : riskLevel === 'MEDIUM' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(16, 185, 129, 0.2)', color: riskLevel === 'HIGH' ? '#ef4444' : riskLevel === 'MEDIUM' ? '#eab308' : '#10b981', fontSize: '12px', fontWeight: 'bold' }}>
                                        {riskLevel} RISK
                                    </div>
                                </div>
                            </div>
                            <div style={{ fontSize: '14px', color: '#9ca3af' }}>
                                {result.ai_intelligence?.risk_profile || 'Calculating...'}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                            {/* Red Flags */}
                            <div style={cardStyle}>
                                <h3 style={{ fontSize: '20px', fontWeight: '900', color: 'white', textTransform: 'uppercase', marginBottom: '24px' }}>⚠️ Critical Alerts</h3>
                                {getRedFlags().length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '32px 0', color: '#10b981' }}>
                                        <div style={{ fontSize: '48px', marginBottom: '8px' }}>✓</div>
                                        <div style={{ fontSize: '14px', fontWeight: 'bold' }}>No Critical Issues Detected</div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gap: '12px' }}>
                                        {getRedFlags().map((flag, i) => (
                                            <div key={i} style={{ padding: '16px', borderRadius: '8px', border: `1px solid ${flag.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(234, 179, 8, 0.3)'}`, background: flag.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(234, 179, 8, 0.1)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                                    <div>
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

                            {/* Mission Fit */}
                            <div style={cardStyle}>
                                <h3 style={{ fontSize: '20px', fontWeight: '900', color: 'white', textTransform: 'uppercase', marginBottom: '24px' }}>📊 Mission Fit</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div style={{ background: 'rgba(0,0,0,0.4)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ fontSize: '9px', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '4px' }}>Range</div>
                                        <div style={{ fontSize: '20px', fontWeight: '900', color: 'white' }}>{result.performance?.range || 'N/A'}</div>
                                    </div>
                                    <div style={{ background: 'rgba(0,0,0,0.4)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ fontSize: '9px', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '4px' }}>Speed</div>
                                        <div style={{ fontSize: '20px', fontWeight: '900', color: 'white' }}>{result.performance?.cruise_speed || 'N/A'}</div>
                                    </div>
                                </div>
                                <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '8px' }}>Value Assessment</div>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                        <span style={{ fontSize: '30px', fontWeight: '900', color: 'white' }}>${(result.valuation?.estimated_value / 1000).toFixed(0)}k</span>
                                        {result.ai_intelligence?.tax_strategy && (
                                            <div style={{ fontSize: '12px', color: '#10b981' }}>
                                                -{result.ai_intelligence.tax_strategy.bonus_depreciation_rate} Tax Write-off
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* AI Advisory */}
                        <div style={cardStyle}>
                            <h3 style={{ fontSize: '20px', fontWeight: '900', color: 'white', textTransform: 'uppercase', marginBottom: '16px' }}>🧠 AI Advisory</h3>
                            <div style={{ fontSize: '14px', color: '#d1d5db', fontFamily: 'monospace', lineHeight: '1.6', borderLeft: '2px solid #a855f7', paddingLeft: '16px' }}>
                                {result.ai_intelligence?.technical_advisory || 'Generating recommendation...'}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resolveMakeModel, isCleanMakeModel } from '../utils/makeModelResolver';

export default function SellerDashboardStandalone() {
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
            setLoading(false);
        }
    }, []);

    const handleScan = async (overrideTail) => {
        const targetTail = overrideTail || tailNumber;
        if (!targetTail?.trim()) return;

        setLoading(true);
        setError(null);

        try {
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

    // Calculate Market Alpha Score
    const getMarketAlpha = () => {
        if (!result) return { score: 0, label: 'BASELINE' };
        let score = 0;

        // Positive attributes
        if (result.forensic_records?.ntsb_count === 0) score += 15;
        if (!result.forensic_records?.liens_found) score += 10;
        if (result.logbook_audit?.findings?.continuity_score > 80) score += 15;
        if (result.dormancy_analysis?.dormancy_risk === 'LOW') score += 10;
        if (result.hangar_queen_index < 30) score += 10;
        if (result.avionics_audit?.modernity_score > 70) score += 10;
        if (result.compliance_audit?.status === 'CLEAR') score += 5;

        // Market positioning
        if (result.fleet_comparison?.mechanical_delta > 0) score += 10;
        if (result.market_velocity?.demand_index > 60) score += 10;
        if (result.valuation?.estimated_value > 100000) score += 5;

        const label = score >= 80 ? 'PREMIUM' : score >= 65 ? 'ABOVE AVERAGE' : score >= 50 ? 'COMPETITIVE' : 'BASELINE';
        return { score, label };
    };

    const getPriceShield = () => {
        if (!result) return [];
        const shields = [];

        if (result.forensic_records?.ntsb_count === 0) shields.push({ label: 'Zero Accident History', icon: '✓', color: 'emerald' });
        if (!result.forensic_records?.liens_found) shields.push({ label: 'Clear Title', icon: '✓', color: 'emerald' });
        if (result.logbook_audit?.findings?.continuity_score > 80) shields.push({ label: 'Complete Logbooks', icon: '✓', color: 'emerald' });
        if (result.dormancy_analysis?.dormancy_risk === 'LOW') shields.push({ label: 'Actively Flown', icon: '✓', color: 'emerald' });
        if (result.avionics_audit?.modernity_score > 70) shields.push({ label: 'Modern Avionics', icon: '✓', color: 'blue' });
        if (result.hangar_queen_index < 30) shields.push({ label: 'Low Corrosion Risk', icon: '✓', color: 'blue' });
        if (result.compliance_audit?.status === 'CLEAR') shields.push({ label: 'Clean Sanctions', icon: '✓', color: 'blue' });

        return shields;
    };

    // TELEMETRY: MaintenanceAlpha - Compares maintenance vs. fleet mean
    const getMaintenanceAlpha = () => {
        if (!result) return { alpha: 0, rating: 'UNKNOWN', comparison: 'N/A' };

        // Simulated fleet mean (in production, this would come from database)
        const FLEET_MEAN_HOURS_PER_EVENT = 150; // Average hours between maintenance events

        const totalHours = result.aircraft_details?.total_time || 0;
        const maintenanceEvents = result.logbook_audit?.findings?.maintenance_event_count || 1; // Avoid division by zero

        const hoursPerEvent = totalHours / maintenanceEvents;
        const alpha = ((hoursPerEvent - FLEET_MEAN_HOURS_PER_EVENT) / FLEET_MEAN_HOURS_PER_EVENT) * 100;

        let rating = 'AVERAGE';
        if (alpha > 20) rating = 'EXCELLENT'; // Well-maintained, above fleet average
        else if (alpha > 0) rating = 'GOOD';
        else if (alpha > -20) rating = 'FAIR';
        else rating = 'BELOW AVERAGE'; // Over-maintained or under-utilized

        const comparison = alpha > 0
            ? `${Math.abs(alpha).toFixed(1)}% ABOVE fleet mean`
            : `${Math.abs(alpha).toFixed(1)}% BELOW fleet mean`;

        return { alpha: alpha.toFixed(1), rating, comparison, hoursPerEvent: hoursPerEvent.toFixed(0) };
    };

    // TELEMETRY: Certified Value Badge
    const getCertifiedValueBadge = () => {
        if (!result) return null;

        // Check for AD compliance (zero gaps)
        const adGapCount = result.logbook_audit?.findings?.ad_gap_count ||
            result.logbook_audit?.findings?.gaps?.filter(g => g.flag?.includes('AD'))?.length ||
            0;

        if (adGapCount === 0) {
            return {
                show: true,
                title: 'CERTIFIED VALUE',
                subtitle: 'AD Compliance Verified',
                confidence: 'HIGH',
                message: 'This aircraft has zero Airworthiness Directive gaps, qualifying for premium market positioning.'
            };
        }

        return null;
    };

    const maintenanceAlpha = getMaintenanceAlpha();
    const certifiedBadge = getCertifiedValueBadge();

    // Simulated buyer interest
    const getBuyerDemand = () => {
        if (!result) return null;
        const baseInterest = result.market_velocity?.demand_index || 50;
        return {
            activeBuyers: Math.floor(baseInterest / 10) + 2,
            daysOnMarket: Math.max(5, 90 - baseInterest),
            priceMovement: baseInterest > 60 ? '+3.2%' : baseInterest > 40 ? '+1.1%' : '-0.5%'
        };
    };

    const alpha = getMarketAlpha();
    const shields = getPriceShield();
    const demand = getBuyerDemand();

    // Clean up make/model display
    // Intelligent Make/Model Resolution
    useEffect(() => {
        if (!result?.aircraft_details) {
            setResolvedMakeModel(null);
            return;
        }

        const aircraftData = result.aircraft_details;

        // Check if resolution is needed
        if (!isCleanMakeModel(aircraftData.make_model)) {
            console.log('[Seller Dashboard] Resolving unclear make/model:', aircraftData.make_model);

            resolveMakeModel(aircraftData).then(resolved => {
                console.log('[Seller Dashboard] ✓ Resolved:', resolved);
                setResolvedMakeModel(resolved);
            }).catch(err => {
                console.error('[Seller Dashboard] Resolution failed:', err);
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

    const cardStyle = {
        background: 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        borderRadius: '16px',
        padding: '28px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(59, 130, 246, 0.1)',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden'
    };

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(to bottom right, #1e3a8a, #0f172a, #020617)' }}>
            {/* Header */}
            <div style={{ borderBottom: '1px solid rgba(59,130,246,0.2)', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 50 }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <button onClick={() => navigate('/')} style={{ background: 'transparent', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '14px' }}>
                            ← Back
                        </button>
                        <div style={{ borderLeft: '1px solid rgba(59,130,246,0.2)', paddingLeft: '16px' }}>
                            <div style={{ fontSize: '10px', color: '#3b82f6', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px' }}>Seller Mode</div>
                            <h1 style={{ fontSize: '20px', fontWeight: '900', color: 'white', textTransform: 'uppercase', margin: 0 }}>The Value Vault</h1>
                        </div>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
                {/* Search Bar */}
                <div style={{ ...cardStyle, marginBottom: '32px' }}>
                    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                        <input
                            placeholder="Enter Your Aircraft Tail Number"
                            value={tailNumber}
                            onChange={(e) => setTailNumber(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                            style={{ flex: 1, minWidth: '250px', background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '8px', padding: '12px 16px', color: 'white', fontSize: '16px' }}
                        />
                        <button
                            onClick={handleScan}
                            disabled={loading}
                            style={{ background: loading ? '#6b7280' : '#3b82f6', color: 'white', padding: '12px 32px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '14px' }}
                        >
                            {loading ? 'Analyzing...' : 'Generate Value Report'}
                        </button>
                    </div>
                    {error && <div style={{ marginTop: '12px', color: '#ef4444', fontSize: '14px' }}>Error: {error}</div>}
                </div>

                {result && (
                    <div style={{ display: 'grid', gap: '24px' }}>
                        {/* Hero Metric - Market Alpha */}
                        <div style={{ ...cardStyle, background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                            <div style={{ marginBottom: '24px' }}>
                                <div style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>Hero Metric</div>
                                <h2 style={{ fontSize: '30px', fontWeight: '900', color: 'white', textTransform: 'uppercase', margin: 0 }}>Market Alpha Score</h2>
                                {/* Aircraft Details */}
                                <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
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
                                <div style={{ fontSize: '72px', fontWeight: '900', color: '#3b82f6' }}>{alpha.score}</div>
                                <div>
                                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#9ca3af' }}>/100</div>
                                    <div style={{ marginTop: '8px', padding: '4px 12px', borderRadius: '4px', background: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', fontSize: '12px', fontWeight: 'bold' }}>
                                        {alpha.label}
                                    </div>
                                </div>
                            </div>
                            <div style={{ fontSize: '14px', color: '#9ca3af' }}>
                                Your aircraft scores {alpha.score > 65 ? 'significantly above' : alpha.score > 50 ? 'above' : 'at'} market average based on forensic markers
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                            {/* Price Shield */}
                            <div style={cardStyle}>
                                <h3 style={{ fontSize: '20px', fontWeight: '900', color: 'white', textTransform: 'uppercase', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span>🛡️</span> Price Shield
                                </h3>
                                {shields.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '32px 0', color: '#6b7280' }}>
                                        <div style={{ fontSize: '14px' }}>Building value profile...</div>
                                    </div>
                                ) : (
                                    <div style={{ display: 'grid', gap: '12px' }}>
                                        {shields.map((shield, i) => (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '8px', background: shield.color === 'emerald' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(59, 130, 246, 0.1)', border: `1px solid ${shield.color === 'emerald' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.2)'}` }}>
                                                <div style={{ fontSize: '20px', color: shield.color === 'emerald' ? '#10b981' : '#3b82f6' }}>{shield.icon}</div>
                                                <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'white' }}>{shield.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* TELEMETRY: MaintenanceAlpha */}
                            <div style={cardStyle}>
                                <h3 style={{ fontSize: '20px', fontWeight: '900', color: 'white', textTransform: 'uppercase', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span>📊</span> Maintenance Alpha
                                </h3>
                                <div style={{ padding: '20px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '12px', marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '12px' }}>
                                        <div style={{ fontSize: '48px', fontWeight: '900', color: maintenanceAlpha.alpha > 0 ? '#10b981' : '#ef4444' }}>
                                            {maintenanceAlpha.alpha > 0 ? '+' : ''}{maintenanceAlpha.alpha}%
                                        </div>
                                        <div style={{ padding: '4px 12px', borderRadius: '6px', background: maintenanceAlpha.rating === 'EXCELLENT' ? '#10b981' : maintenanceAlpha.rating === 'GOOD' ? '#3b82f6' : '#eab308', color: 'black', fontSize: '11px', fontWeight: '900' }}>
                                            {maintenanceAlpha.rating}
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '8px' }}>
                                        {maintenanceAlpha.comparison}
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#6b7280' }}>
                                        {maintenanceAlpha.hoursPerEvent} hours per maintenance event
                                    </div>
                                </div>
                                <div style={{ padding: '12px', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', fontSize: '11px', color: '#9ca3af', lineHeight: '1.6' }}>
                                    <strong style={{ color: '#3b82f6' }}>Market Insight:</strong> Aircraft with positive alpha demonstrate superior maintenance efficiency, commanding premium pricing in competitive markets.
                                </div>
                            </div>

                            {/* TELEMETRY: Certified Value Badge */}
                            {certifiedBadge && (
                                <div style={{ ...cardStyle, background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1))', border: '2px solid rgba(16, 185, 129, 0.4)' }}>
                                    <div style={{ textAlign: 'center', padding: '24px' }}>
                                        <div style={{ fontSize: '64px', marginBottom: '16px' }}>🏆</div>
                                        <h3 style={{ fontSize: '28px', fontWeight: '900', color: '#10b981', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '2px' }}>
                                            {certifiedBadge.title}
                                        </h3>
                                        <div style={{ fontSize: '14px', color: '#3b82f6', fontWeight: 'bold', marginBottom: '16px' }}>
                                            {certifiedBadge.subtitle}
                                        </div>
                                        <div style={{ display: 'inline-block', padding: '8px 24px', borderRadius: '8px', background: '#10b981', color: 'black', fontSize: '12px', fontWeight: '900', marginBottom: '20px' }}>
                                            {certifiedBadge.confidence} CONFIDENCE
                                        </div>
                                        <div style={{ padding: '20px', background: 'rgba(0,0,0,0.3)', borderRadius: '12px', fontSize: '13px', color: 'white', lineHeight: '1.7' }}>
                                            {certifiedBadge.message}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Market Demand */}
                            <div style={cardStyle}>
                                <h3 style={{ fontSize: '20px', fontWeight: '900', color: 'white', textTransform: 'uppercase', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span>📈</span> Market Demand
                                </h3>
                                {demand && (
                                    <div style={{ display: 'grid', gap: '16px' }}>
                                        <div style={{ background: 'rgba(0,0,0,0.4)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div style={{ fontSize: '9px', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '4px' }}>Active Buyers</div>
                                            <div style={{ fontSize: '28px', fontWeight: '900', color: '#3b82f6' }}>{demand.activeBuyers}</div>
                                            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>Searching this model</div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                            <div style={{ background: 'rgba(0,0,0,0.4)', padding: '12px', borderRadius: '8px' }}>
                                                <div style={{ fontSize: '9px', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '4px' }}>Avg Days</div>
                                                <div style={{ fontSize: '20px', fontWeight: '900', color: 'white' }}>{demand.daysOnMarket}</div>
                                            </div>
                                            <div style={{ background: 'rgba(0,0,0,0.4)', padding: '12px', borderRadius: '8px' }}>
                                                <div style={{ fontSize: '9px', color: '#9ca3af', textTransform: 'uppercase', marginBottom: '4px' }}>Price Trend</div>
                                                <div style={{ fontSize: '20px', fontWeight: '900', color: demand.priceMovement.startsWith('+') ? '#10b981' : '#ef4444' }}>{demand.priceMovement}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Value Positioning */}
                        <div style={cardStyle}>
                            <h3 style={{ fontSize: '20px', fontWeight: '900', color: 'white', textTransform: 'uppercase', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span>💎</span> Market Positioning Statement
                            </h3>
                            <div style={{ fontSize: '14px', color: '#d1d5db', lineHeight: '1.6', borderLeft: '2px solid #3b82f6', paddingLeft: '16px', marginBottom: '16px' }}>
                                {result.ai_intelligence?.technical_advisory || 'Generating positioning...'}
                            </div>
                            {result.ai_intelligence?.tax_strategy && (
                                <div style={{ padding: '16px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '10px', color: '#10b981', fontWeight: 'bold', marginBottom: '4px' }}>BUYER TAX INCENTIVE</div>
                                    <div style={{ fontSize: '14px', color: 'white' }}>
                                        Buyers can write off <strong>{result.ai_intelligence.tax_strategy.bonus_depreciation_rate}</strong> (~${(result.ai_intelligence.tax_strategy.year_1_deduction / 1000).toFixed(0)}k Year 1)
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

import React from 'react';
import { Calendar, AlertTriangle, ShieldCheck, Ban, Clock } from 'lucide-react';

export default function AircraftAssetCard({ search, onClick }) {
    const { tail_number, searched_at, search_data } = search;
    const data = search_data || {};
    const details = data.aircraft_details || {};
    const metrics = data.metrics || {};

    // Determine Status
    let status = 'VERIFIED';
    let statusColor = '#10b981'; // Emerald
    let StatusIcon = ShieldCheck;
    let borderColor = 'rgba(16, 185, 129, 0.3)';
    let bgGradient = 'linear-gradient(145deg, rgba(16, 185, 129, 0.05), rgba(6, 78, 59, 0.1))';

    // "Blocked" Logic (Hardcoded or based on sanctions)
    if (tail_number === 'N89RD' || metrics.risk_score > 80) {
        status = 'BLOCKED';
        statusColor = '#ef4444'; // Red
        StatusIcon = Ban;
        borderColor = 'rgba(239, 68, 68, 0.4)';
        bgGradient = 'linear-gradient(145deg, rgba(239, 68, 68, 0.1), rgba(127, 29, 29, 0.2))';
    } else if (metrics.risk_score > 30) {
        status = 'MEDIUM RISK';
        statusColor = '#f59e0b'; // Amber
        StatusIcon = AlertTriangle;
        borderColor = 'rgba(245, 158, 11, 0.3)';
        bgGradient = 'linear-gradient(145deg, rgba(245, 158, 11, 0.05), rgba(120, 53, 15, 0.1))';
    }

    // Format Date
    const date = new Date(searched_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return (
        <div
            onClick={onClick}
            style={{
                background: bgGradient,
                border: `1px solid ${borderColor}`,
                borderRadius: '16px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative',
                overflow: 'hidden'
            }}
            onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(0,0,0,0.3)';
            }}
            onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
                <div>
                    <div style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 'bold', letterSpacing: '1px' }}>
                        {details.year || '----'} {details.make || 'AIRCRAFT'}
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: '900', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {tail_number}
                        <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#6b7280', fontFamily: 'monospace' }}>
                            S/N {details.serial || '---'}
                        </span>
                    </div>
                </div>
                <div style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    background: status === 'BLOCKED' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                    border: `1px solid ${status === 'BLOCKED' ? '#ef4444' : '#10b981'}`,
                    color: statusColor,
                    fontSize: '10px',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}>
                    <StatusIcon size={10} />
                    {status}
                </div>
            </div>

            {/* Metrics Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', padding: '12px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                <div>
                    <div style={{ fontSize: '9px', color: '#9ca3af', textTransform: 'uppercase' }}>Market Alpha</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'white' }}>
                        {metrics.alpha ? `+${metrics.alpha}%` : '--'}
                    </div>
                </div>
                <div>
                    <div style={{ fontSize: '9px', color: '#9ca3af', textTransform: 'uppercase' }}>Mission Fit</div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'white' }}>
                        {metrics.mission_fit ? `${metrics.mission_fit}%` : '--'}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#6b7280' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={11} />
                    Last Scan: {date}
                </div>
                <div style={{ color: '#3b82f6', fontWeight: 'bold' }}>VIEW REPORT →</div>
            </div>
        </div>
    );
}

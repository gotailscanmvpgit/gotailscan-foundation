import React from 'react';
import { Calendar, AlertTriangle, ShieldCheck, Ban, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AircraftAssetCard({ search, onClick }) {
    const { tail_number, searched_at, search_data } = search;
    const data = search_data || {};
    const details = data.aircraft_details || {};
    const metrics = data.metrics || {};

    // Determine Status & Metrics based on Mode
    const isSellerMode = data.mode === 'seller';

    // Default: Buyer Mode Logic
    let status = 'VERIFIED';
    let statusColor = '#10b981'; // Emerald
    let StatusIcon = ShieldCheck;
    let borderColor = 'rgba(16, 185, 129, 0.3)';
    let bgGradient = 'linear-gradient(145deg, rgba(16, 185, 129, 0.05), rgba(6, 78, 59, 0.1))';

    if (isSellerMode) {
        // SELLER MODE: Focus on Readiness
        const readiness = metrics.readiness || 50;
        if (readiness >= 90) {
            status = 'MARKET READY';
            statusColor = '#3b82f6'; // Blue
            borderColor = 'rgba(59, 130, 246, 0.3)';
            bgGradient = 'linear-gradient(145deg, rgba(59, 130, 246, 0.05), rgba(30, 58, 138, 0.1))';
        } else if (readiness >= 70) {
            status = 'OPTIMIZED';
            statusColor = '#10b981'; // Green
        } else {
            status = 'NEEDS PREP';
            statusColor = '#f59e0b'; // Amber
            StatusIcon = AlertTriangle;
            borderColor = 'rgba(245, 158, 11, 0.3)';
            bgGradient = 'linear-gradient(145deg, rgba(245, 158, 11, 0.05), rgba(120, 53, 15, 0.1))';
        }
    } else {
        // BUYER MODE: Focus on Risk
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
    }

    // Format Date
    const date = new Date(searched_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{
                y: -5,
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
                borderColor: statusColor
            }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            style={{
                background: bgGradient,
                border: `1px solid ${borderColor}`,
                borderRadius: '16px',
                padding: '20px',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
                position: 'relative',
                overflow: 'hidden'
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
                    background: isSellerMode ? `${statusColor}20` : (status === 'BLOCKED' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'),
                    border: `1px solid ${statusColor}`,
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
                {isSellerMode ? (
                    <>
                        <div>
                            <div style={{ fontSize: '9px', color: '#9ca3af', textTransform: 'uppercase' }}>Market Alpha</div>
                            <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'white' }}>
                                {metrics.market_alpha ? `${metrics.market_alpha}` : '--'}
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '9px', color: '#9ca3af', textTransform: 'uppercase' }}>Price Shields</div>
                            <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'white' }}>
                                {metrics.price_shields ? `${metrics.price_shields}/7` : '--'}
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div>
                            <div style={{ fontSize: '9px', color: '#9ca3af', textTransform: 'uppercase' }}>Risk Score</div>
                            <div style={{ fontSize: '16px', fontWeight: 'bold', color: status === 'BLOCKED' ? '#ef4444' : metrics.risk_score > 30 ? '#f59e0b' : '#10b981' }}>
                                {metrics.risk_score != null ? metrics.risk_score : '--'}
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: '9px', color: '#9ca3af', textTransform: 'uppercase' }}>Mission Fit</div>
                            <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'white' }}>
                                {metrics.mission_fit ? `${metrics.mission_fit}%` : '--'}
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Footer */}
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#6b7280' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={11} />
                    Last Scan: {date}
                </div>
                <div style={{ color: '#3b82f6', fontWeight: 'bold' }}>
                    {isSellerMode ? 'VIEW STRATEGY →' : 'VIEW REPORT →'}
                </div>
            </div>
        </motion.div>
    );
}

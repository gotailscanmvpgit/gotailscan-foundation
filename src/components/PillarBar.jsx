/**
 * Premium Pillar Bar Component
 * Animated horizontal bar with status indicators
 */
export default function PillarBar({ label, status, metric, delay = 0 }) {
    const getStatusColor = () => {
        switch (status?.toUpperCase()) {
            case 'PASS':
            case 'OPTIMIZED':
            case 'TOP 10%':
            case 'TOP 15%':
                return { bg: 'rgba(16, 185, 129, 0.2)', border: '#10b981', text: '#10b981', fill: 85 };
            case 'CAUTION':
            case 'MARGINAL':
                return { bg: 'rgba(251, 191, 36, 0.2)', border: '#fbbf24', text: '#fbbf24', fill: 60 };
            case 'FAIL':
            case 'IMPOSSIBLE':
            case 'CRITICAL':
                return { bg: 'rgba(239, 68, 68, 0.2)', border: '#ef4444', text: '#ef4444', fill: 25 };
            case 'INEFFICIENT':
                return { bg: 'rgba(249, 115, 22, 0.2)', border: '#f97316', text: '#f97316', fill: 50 };
            default:
                return { bg: 'rgba(139, 92, 246, 0.2)', border: '#8b5cf6', text: '#8b5cf6', fill: 70 };
        }
    };

    const colors = getStatusColor();

    return (
        <div style={{
            padding: '12px',
            background: colors.bg,
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            animation: `slideIn 0.5s ease-out ${delay}ms both`
        }}>
            <style>{`
                @keyframes slideIn {
                    from {
                        opacity: 0;
                        transform: translateX(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                @keyframes fillBar {
                    from { width: 0%; }
                    to { width: var(--fill-width); }
                }
            `}</style>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {label}
                </div>
                <div style={{ fontSize: '10px', fontWeight: 'bold', color: colors.text }}>
                    {status}
                </div>
            </div>

            {/* Progress bar */}
            <div style={{
                width: '100%',
                height: '6px',
                background: 'rgba(0,0,0,0.3)',
                borderRadius: '3px',
                overflow: 'hidden',
                marginBottom: '6px'
            }}>
                <div style={{
                    height: '100%',
                    background: `linear-gradient(90deg, ${colors.border}, ${colors.text})`,
                    borderRadius: '3px',
                    animation: `fillBar 1s ease-out ${delay + 200}ms both`,
                    '--fill-width': `${colors.fill}%`,
                    boxShadow: `0 0 10px ${colors.border}`
                }} />
            </div>

            <div style={{ fontSize: '10px', color: '#d1d5db' }}>
                {metric}
            </div>
        </div>
    );
}

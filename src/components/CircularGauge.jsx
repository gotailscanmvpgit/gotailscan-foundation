import { useEffect, useState } from 'react';

/**
 * Premium Circular Gauge Component
 * Animated SVG gauge with gradient fill and smooth transitions
 */
export default function CircularGauge({ score, size = 120, strokeWidth = 12 }) {
    const [animatedScore, setAnimatedScore] = useState(0);

    useEffect(() => {
        // Animate score from 0 to target
        const duration = 1500; // 1.5 seconds
        const steps = 60;
        const increment = score / steps;
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= score) {
                setAnimatedScore(score);
                clearInterval(timer);
            } else {
                setAnimatedScore(Math.floor(current));
            }
        }, duration / steps);

        return () => clearInterval(timer);
    }, [score]);

    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (animatedScore / 100) * circumference;

    // Color based on score
    const getColor = () => {
        if (score >= 90) return { start: '#10b981', end: '#34d399' }; // Green
        if (score >= 70) return { start: '#f59e0b', end: '#fbbf24' }; // Yellow
        if (score >= 50) return { start: '#f97316', end: '#fb923c' }; // Orange
        return { start: '#ef4444', end: '#f87171' }; // Red
    };

    const colors = getColor();
    const center = size / 2;

    return (
        <div style={{ position: 'relative', width: size, height: size }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                {/* Gradient Definition */}
                <defs>
                    <linearGradient id={`gauge-gradient-${score}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={colors.start} />
                        <stop offset="100%" stopColor={colors.end} />
                    </linearGradient>
                    {/* Glow filter */}
                    <filter id={`glow-${score}`}>
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Background circle */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={strokeWidth}
                />

                {/* Progress circle */}
                <circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={`url(#gauge-gradient-${score})`}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    filter={`url(#glow-${score})`}
                    style={{
                        transition: 'stroke-dashoffset 0.5s ease-in-out'
                    }}
                />
            </svg>

            {/* Center text */}
            <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center'
            }}>
                <div style={{
                    fontSize: `${size * 0.28}px`,
                    fontWeight: 'bold',
                    color: 'white',
                    lineHeight: 1
                }}>
                    {animatedScore}%
                </div>
                <div style={{
                    fontSize: `${size * 0.1}px`,
                    color: '#9ca3af',
                    marginTop: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                }}>
                    FIT
                </div>
            </div>
        </div>
    );
}

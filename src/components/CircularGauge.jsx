import { useEffect, useState } from 'react';
import { motion, useSpring, useTransform, animate } from 'framer-motion';

/**
 * Premium Circular Gauge Component
 * Animated SVG gauge with framer-motion and multi-mode support
 */
export default function CircularGauge({ score, size = 120, strokeWidth = 12, mode = 'fit', label }) {
    const [displayScore, setDisplayScore] = useState(0);

    useEffect(() => {
        const controls = animate(0, score, {
            duration: 1.5,
            ease: "easeOut",
            onUpdate: (value) => setDisplayScore(Math.floor(value)),
        });
        return () => controls.stop();
    }, [score]);

    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    // Color based on mode and score
    const getColor = () => {
        if (mode === 'risk') {
            if (score <= 30) return { start: '#00FF00', end: '#00DD00' }; // Green
            if (score <= 60) return { start: '#FFCC00', end: '#EEBB00' }; // Yellow
            return { start: '#FF0000', end: '#CC0000' }; // Red
        } else {
            // For Fit: High (90-100) is Green, Low (0-40) is Red
            if (score >= 90) return { start: '#00FF00', end: '#00DD00' }; // Green
            if (score >= 70) return { start: '#00FFFF', end: '#00DDDD' }; // Cyan (Standard)
            if (score >= 50) return { start: '#FFCC00', end: '#EEBB00' }; // Amber (Caution)
            return { start: '#FF0000', end: '#CC0000' }; // Red
        }
    };

    const colors = getColor();
    const center = size / 2;

    const displayLabel = label || (mode === 'risk' ? 'SCORE' : 'FIT');

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "backOut" }}
            style={{ position: 'relative', width: size, height: size }}
        >
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                {/* Gradient Definition */}
                <defs>
                    <linearGradient id={`gauge-gradient-${score}-${mode}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={colors.start} />
                        <stop offset="100%" stopColor={colors.end} />
                    </linearGradient>
                    {/* Glow filter */}
                    <filter id={`glow-${score}-${mode}`}>
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
                    stroke="rgba(255,255,255,0.05)"
                    strokeWidth={strokeWidth}
                />

                {/* Progress circle */}
                <motion.circle
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={`url(#gauge-gradient-${score}-${mode})`}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference}
                    animate={{ strokeDashoffset: circumference - (score / 100) * circumference }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round"
                    filter={`url(#glow-${score}-${mode})`}
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
                <motion.div
                    key={displayScore}
                    initial={{ y: 5, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    style={{
                        fontSize: `${size * 0.28}px`,
                        color: 'white',
                        lineHeight: 1,
                        fontFamily: '"Share Tech Mono", monospace'
                    }}
                >
                    {displayScore}
                </motion.div>
                <div style={{
                    fontSize: label ? `${size * 0.08}px` : `${size * 0.1}px`,
                    color: '#9ca3af',
                    marginTop: '4px',
                    textTransform: 'uppercase',
                    letterSpacing: '2px',
                    fontWeight: 'bold',
                    maxWidth: size * 0.7,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                }}>
                    {displayLabel}
                </div>
            </div>

            {/* Decorative Outer Ring pulse if high score/risk */}
            {(mode === 'risk' && score > 60) || (mode === 'fit' && score > 90) ? (
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.1, 0.3, 0.1]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{
                        position: 'absolute',
                        top: -10, left: -10, right: -10, bottom: -10,
                        border: `2px solid ${colors.start}`,
                        borderRadius: '50%',
                        pointerEvents: 'none'
                    }}
                />
            ) : null}
        </motion.div>
    );
}

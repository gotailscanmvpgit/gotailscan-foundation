import React from 'react';
import { motion } from 'framer-motion';

const CircularGauge = ({ score }) => {
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    const getColor = (s) => {
        if (s > 70) return '#10b981'; // Green
        if (s > 40) return '#FFBF00'; // Warning Yellow
        return '#FF5F1F'; // Accent Red/Orange
    };

    const color = getColor(score);

    return (
        <div className="relative flex items-center justify-center w-64 h-64">
            {/* Background Circle */}
            <svg className="w-full h-full transform -rotate-90">
                <circle
                    cx="128"
                    cy="128"
                    r={radius}
                    stroke="rgba(255, 255, 255, 0.05)"
                    strokeWidth="12"
                    fill="transparent"
                />
                {/* Progress Circle */}
                <motion.circle
                    cx="128"
                    cy="128"
                    r={radius}
                    stroke={color}
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round"
                    style={{ filter: `drop-shadow(0 0 8px ${color}66)` }}
                />
            </svg>
            {/* Score Text */}
            <div className="absolute flex flex-col items-center">
                <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-6xl font-black tracking-tighter"
                    style={{ color }}
                >
                    {score}
                </motion.span>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Confidence Score</span>
            </div>
        </div>
    );
};

export default CircularGauge;

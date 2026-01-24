import React from 'react';

const BrandMark = ({ className = "w-12 h-12" }) => {
    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_0_10px_rgba(255,255,255,0.15)]">
                {/* 1. The Dynamic Flight Path / Fin Stroke */}
                <path
                    d="M20 85 C35 85, 45 75, 55 45 L70 20"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                    fill="none"
                />

                {/* 2. The Return Stroke (Completing the Fin shape abstractly) */}
                <path
                    d="M70 20 L75 55 C75 70, 65 85, 45 85"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeOpacity="0.5" // Fades out slightly for speed effect
                    fill="none"
                />

                {/* 3. The "Locked Target" Triangle (Tactical Accent) */}
                <path
                    d="M70 20 L82 18 L73 30 Z"
                    fill="#FF5F1F"
                    className="animate-pulse"
                />

                {/* 4. Radar Ripples (Scanning Action) */}
                <path
                    d="M80 40 Q85 50 80 60"
                    stroke="#FF5F1F"
                    strokeWidth="2"
                    strokeLinecap="round"
                    opacity="0.8"
                >
                    <animate attributeName="opacity" values="0;1;0" duration="2s" repeatCount="indefinite" />
                </path>
                <path
                    d="M85 35 Q95 50 85 65"
                    stroke="#FF5F1F"
                    strokeWidth="2"
                    strokeLinecap="round"
                    opacity="0.4"
                >
                    <animate attributeName="opacity" values="0;1;0" duration="2s" begin="0.3s" repeatCount="indefinite" />
                </path>
            </svg>
        </div>
    );
};

export default BrandMark;

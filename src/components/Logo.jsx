import React from 'react';

const Logo = ({ className = "w-12 h-12" }) => {
    return (
        <div className={`relative flex items - center justify - center ${className} `}>
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">
                {/* Connection Lines - Straightened Tail Fin */}
                <path
                    d="M25 75 L55 20 L80 20 L75 75 L25 75"
                    stroke="white"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Internal Structural Line */}
                <path
                    d="M55 20 L75 75"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                />

                {/* Nodes (Dots) - Slightly Larger */}
                <circle cx="25" cy="75" r="3.5" fill="white" />
                <circle cx="55" cy="20" r="3.5" fill="white" />
                <circle cx="80" cy="20" r="3.5" fill="white" />
                <circle cx="75" cy="75" r="3.5" fill="white" />
            </svg>
        </div>
    );
};

export default Logo;

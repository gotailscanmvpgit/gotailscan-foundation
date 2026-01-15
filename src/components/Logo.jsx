import React from 'react';

const Logo = ({ className = "w-12 h-12" }) => {
    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
                <g transform="rotate(-15, 50, 50)">
                    {/* The Lens (Search) */}
                    <circle cx="45" cy="40" r="18" stroke="#FF5F1F" strokeWidth="6" className="text-accent" />

                    {/* The Handle / Tail Fin Morph */}
                    <path
                        d="M58 52 L75 80 L35 80"
                        stroke="#FF5F1F"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-accent"
                    />
                </g>
            </svg>
        </div>
    );
};

export default Logo;

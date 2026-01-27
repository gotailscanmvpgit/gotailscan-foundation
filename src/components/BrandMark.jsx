import React from 'react';

const BrandMark = ({ className = "w-12 h-12" }) => {
    return (
        <div className={`flex items-center justify-center ${className}`}>
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                {/* Modern Abstract Geometric Logo */}
                {/* 1. primary shape: A sleek, ascending fin/wing segment */}
                <path
                    d="M30 75L50 25L70 75H30Z"
                    className="text-white"
                    fill="currentColor"
                    fillOpacity="0.1"
                />
                <path
                    d="M30 75L50 25L70 75"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinejoin="round"
                    className="text-white"
                />

                {/* 2. The "Scan" element: A digital cut/strike through the form */}
                <path
                    d="M15 55H85"
                    stroke="#00FFFF"
                    strokeWidth="6"
                    strokeLinecap="round"
                />
            </svg>
        </div>
    );
};

export default BrandMark;

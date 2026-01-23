import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radar, TrendingUp, Wrench, ArrowRight, Camera, Shield, Zap, Target } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function RoleGateway() {
    const navigate = useNavigate();
    const [tailNumber, setTailNumber] = useState('');
    const [lens, setLens] = useState('radar');
    const [hoveredLens, setHoveredLens] = useState(null);
    const [isFocused, setIsFocused] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    // Track mouse for gradient effect
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleSearch = (e) => {
        if (e) e.preventDefault();
        let path = '/buyer';
        if (lens === 'vault') path = '/seller';
        if (lens === 'tools') path = '/mechanic';

        if (tailNumber.trim()) {
            navigate(`${path}?tail=${tailNumber.toUpperCase()}&autostart=true`);
        } else {
            navigate(path);
        }
    };

    const handleCameraOpen = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setShowCamera(true);
        } catch (err) {
            console.error('Camera access denied:', err);
            alert('Camera access is required. Please enable camera permissions.');
        }
    };

    const handleCameraClose = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        setShowCamera(false);
    };

    const handleCapture = () => {
        alert('Logbook page captured! OCR processing would start here.');
        handleCameraClose();
    };

    const lenses = [
        {
            id: 'radar',
            icon: Radar,
            label: 'Buyer',
            color: '#10b981',
            gradient: 'from-emerald-500 to-teal-600',
            description: 'Risk Detection & Due Diligence',
            features: ['Accident History', 'Maintenance Gaps', 'Value Analysis']
        },
        {
            id: 'vault',
            icon: TrendingUp,
            label: 'Seller',
            color: '#3b82f6',
            gradient: 'from-blue-500 to-indigo-600',
            description: 'Asset Equity & Market Position',
            features: ['Valuation Report', 'Market Insights', 'Listing Optimization']
        },
        {
            id: 'tools',
            icon: Wrench,
            label: 'Mechanic',
            color: '#f97316',
            gradient: 'from-orange-500 to-amber-600',
            description: 'Logbook OCR & Compliance',
            features: ['Digital Logbooks', 'AD Compliance', 'Inspection Tracking']
        }
    ];

    const activeLens = lenses.find(l => l.id === lens) || lenses[0];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center relative overflow-hidden px-4 py-8">

            {/* Premium Background Effects */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {/* Animated Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

                {/* Dynamic Gradient Orb */}
                <div
                    className="absolute w-[600px] h-[600px] rounded-full blur-3xl opacity-20 transition-all duration-1000"
                    style={{
                        background: `radial-gradient(circle, ${activeLens.color}40, transparent)`,
                        left: `${mousePosition.x - 300}px`,
                        top: `${mousePosition.y - 300}px`,
                    }}
                ></div>

                {/* Scan Line */}
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
            </div>

            {/* Camera Overlay */}
            {showCamera && (
                <div className="fixed inset-0 z-[100] bg-black">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-[90%] max-w-md aspect-[3/4] border-4 border-orange-500 rounded-lg relative">
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-orange-500"></div>
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-orange-500"></div>
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-orange-500"></div>
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-orange-500"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-500 text-sm font-mono font-bold bg-black/50 px-4 py-2 rounded">
                                ALIGN LOGBOOK PAGE
                            </div>
                        </div>
                    </div>
                    <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 pointer-events-auto">
                        <button onClick={handleCameraClose} className="px-6 py-3 bg-slate-800 text-white rounded-xl font-bold">Cancel</button>
                        <button onClick={handleCapture} className="px-8 py-3 bg-orange-500 text-black rounded-xl font-bold flex items-center gap-2">
                            <Camera className="w-5 h-5" /> Capture
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="relative z-10 w-full max-w-5xl">

                {/* Hero Section */}
                <div className="text-center mb-12 animate-fade-in-down">
                    {/* Logo */}
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/50">
                            <Shield className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight">
                            goTailScan
                        </h1>
                    </div>

                    {/* Tagline */}
                    <div className="flex flex-col items-center gap-3 mb-6">
                        <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-widest flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            ENTERPRISE DB V2.0 ONLINE
                        </div>
                        <p className="text-xl md:text-3xl text-slate-300 font-light">
                            Global Aviation Forensic Intelligence
                        </p>
                    </div>

                    {/* Value Props */}
                    <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-8">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Zap className="w-4 h-4 text-emerald-500" />
                            <span>Instant Forensics</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Target className="w-4 h-4 text-blue-500" />
                            <span>AI-Powered Analysis</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Shield className="w-4 h-4 text-orange-500" />
                            <span>FAA/TC Verified Data</span>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="relative w-full mb-8">
                    <div className={`relative h-20 flex items-center bg-slate-900/50 backdrop-blur-xl border-2 rounded-2xl px-6 shadow-2xl transition-all duration-300 ${isFocused ? `border-${activeLens.color.split('-')[1]}-500 shadow-${activeLens.color.split('-')[1]}-500/50` : 'border-slate-700'
                        }`} style={{
                            borderColor: isFocused ? activeLens.color : undefined,
                            boxShadow: isFocused ? `0 0 30px ${activeLens.color}40` : undefined
                        }}>
                        <input
                            type="text"
                            value={tailNumber}
                            onChange={(e) => setTailNumber(e.target.value.toUpperCase())}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder="ENTER TAIL, MODEL, OR SERIAL..."
                            className="flex-1 bg-transparent border-none outline-none text-2xl md:text-3xl font-bold text-white placeholder-slate-600 font-mono tracking-wider caret-white"
                            autoFocus
                        />

                        {lens === 'tools' && (
                            <button
                                type="button"
                                onClick={handleCameraOpen}
                                className="ml-2 p-4 bg-orange-500/20 hover:bg-orange-500/30 rounded-xl transition-all"
                                title="Scan Logbook"
                            >
                                <Camera className="w-6 h-6 text-orange-400" />
                            </button>
                        )}

                        <button
                            type="submit"
                            className="ml-2 md:ml-4 px-4 md:px-8 py-3 md:py-4 text-white rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-all duration-300 text-sm md:text-base"
                            style={{
                                background: `linear-gradient(135deg, ${activeLens.color}, ${activeLens.color}dd)`,
                                boxShadow: `0 4px 20px ${activeLens.color}40, 0 0 40px ${activeLens.color}20`
                            }}
                        >
                            SCAN <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                    </div>
                </form>

                {/* Clear Role Selection Header */}
                <div className="text-center mb-6">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                        Choose Your Role
                    </h2>
                    <p className="text-slate-400 text-sm md:text-base">
                        Select how you're using this aircraft to get tailored insights
                    </p>
                </div>

                {/* Role Selection Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {lenses.map((l) => (
                        <button
                            key={l.id}
                            onClick={() => setLens(l.id)}
                            onMouseEnter={() => setHoveredLens(l.id)}
                            onMouseLeave={() => setHoveredLens(null)}
                            className={`relative p-6 rounded-2xl transition-all duration-300 ${lens === l.id
                                ? 'bg-slate-800/80 ring-2 scale-105'
                                : 'bg-slate-900/50 hover:bg-slate-800/60'
                                }`}
                            style={{
                                ringColor: lens === l.id ? l.color : undefined,
                                boxShadow: lens === l.id ? `0 0 40px ${l.color}30` : undefined
                            }}
                        >
                            <div className="flex flex-col items-center text-center">
                                {lens === l.id && (
                                    <div className="absolute top-4 right-4 px-3 py-1 bg-white text-black text-xs font-bold rounded-full">
                                        ✓ SELECTED
                                    </div>
                                )}
                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${l.gradient} flex items-center justify-center mb-4 shadow-lg`}
                                    style={{ background: `linear-gradient(135deg, ${l.color}, ${l.color}dd)` }}>
                                    <l.icon className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">{l.label}</h3>
                                <p className="text-sm text-slate-400 mb-4">{l.description}</p>
                                <div className="flex flex-col gap-2 w-full">
                                    {l.features.map((feature, idx) => (
                                        <div key={idx} className="text-xs text-slate-500 flex items-center gap-2">
                                            <div className="w-1 h-1 rounded-full bg-slate-600"></div>
                                            {feature}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Authority Badges */}
                <div className="flex flex-wrap justify-center items-center gap-6 opacity-40 hover:opacity-60 transition-all duration-500">
                    {['TC', 'FAA', 'NTSB', 'TSB', 'NAV'].map((authority) => (
                        <div key={authority} className="flex flex-col items-center gap-1 group cursor-pointer">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center border border-slate-600/30 shadow-sm group-hover:scale-110 transition-transform">
                                <div className="text-slate-300 font-black text-xs">{authority}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

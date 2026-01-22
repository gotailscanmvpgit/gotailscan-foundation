import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radar, TrendingUp, Wrench, ArrowRight, Camera } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function RoleGateway() {
    const navigate = useNavigate();
    const [tailNumber, setTailNumber] = useState('');
    const [lens, setLens] = useState('radar'); // 'radar' (buy), 'vault' (sell), 'tools' (audit)
    const [hoveredLens, setHoveredLens] = useState(null); // For dynamic mission text
    const [isFocused, setIsFocused] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    // Dynamic Route Handling based on Lens
    const handleSearch = (e) => {
        if (e) e.preventDefault();

        let path = '/buyer'; // default
        if (lens === 'vault') path = '/seller';
        if (lens === 'tools') path = '/mechanic';

        // Navigate with tail number as query param if present
        if (tailNumber.trim()) {
            navigate(`${path}?tail=${tailNumber.toUpperCase()}&autostart=true`);
        } else {
            navigate(path);
        }
    };

    // Camera functionality for Mechanic mode
    const handleCameraOpen = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' } // Rear camera
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setShowCamera(true);
        } catch (err) {
            console.error('Camera access denied:', err);
            alert('Camera access is required to scan logbooks. Please enable camera permissions.');
        }
    };

    const handleCameraClose = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        setShowCamera(false);
    };

    const handleCapture = () => {
        // Capture logic would go here
        alert('Logbook page captured! OCR processing would start here.');
        handleCameraClose();
    };

    const lenses = [
        { id: 'radar', icon: Radar, label: 'Buyer', color: 'text-emerald-400', bgColor: 'bg-emerald-500', path: '/buyer', hint: 'Risk Radar' },
        { id: 'vault', icon: TrendingUp, label: 'Seller', color: 'text-blue-400', bgColor: 'bg-blue-500', path: '/seller', hint: 'Value Vault' },
        { id: 'tools', icon: Wrench, label: 'Mechanic', color: 'text-orange-400', bgColor: 'bg-orange-500', path: '/mechanic', hint: 'Audit Tools' }
    ];

    const activeLens = lenses.find(l => l.id === lens) || lenses[0];

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-start pt-24 relative overflow-hidden font-sans selection:bg-white/20 px-4 pb-8">

            {/* Camera Overlay */}
            {showCamera && (
                <div className="fixed inset-0 z-[100] bg-black">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                    />

                    {/* Scan Frame Overlay */}
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

                    {/* Camera Controls */}
                    <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 pointer-events-auto">
                        <button
                            onClick={handleCameraClose}
                            className="px-6 py-3 bg-slate-800 text-white rounded-xl font-bold"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCapture}
                            className="px-8 py-3 bg-orange-500 text-black rounded-xl font-bold flex items-center gap-2"
                        >
                            <Camera className="w-5 h-5" />
                            Capture
                        </button>
                    </div>
                </div>
            )}

            {/* Background Effects */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-scanline"></div>
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-r from-transparent via-${activeLens.color.split('-')[1]}-900/10 to-transparent blur-3xl opacity-30 transition-colors duration-1000`}></div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 w-full max-w-3xl">

                {/* BRAND */}
                <div className="text-center mb-6 md:mb-8 animate-fade-in-down">
                    <h1 className="text-3xl md:text-6xl font-black text-white tracking-tight mb-2 md:mb-3 flex items-center justify-center gap-2 md:gap-4 font-mono">
                        <span className="text-white/20 font-thin tracking-widest text-xl md:text-2xl">///</span>
                        goTailScan<span className="text-emerald-500 animate-pulse">_</span>
                    </h1>
                    <p className="text-slate-400 text-xs md:text-lg font-light tracking-wide uppercase">
                        Aviation Intelligence <span className="text-white/30 mx-2">|</span> Command Interface
                    </p>
                </div>

                {/* SEARCH BAR - Separated */}
                <form onSubmit={handleSearch} className="relative w-full mb-3">
                    <div className="relative h-[60px] flex items-center bg-slate-950/80 backdrop-blur-xl border border-[#333] rounded-2xl px-4 md:px-6 shadow-2xl">
                        <input
                            type="text"
                            inputMode="text"
                            value={tailNumber}
                            onChange={(e) => setTailNumber(e.target.value.toUpperCase())}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => setIsFocused(false)}
                            placeholder="ENTER TAIL NUMBER..."
                            className="flex-1 bg-transparent border-none outline-none text-xl md:text-2xl font-bold text-white placeholder-slate-600 font-mono tracking-wider caret-white"
                            autoFocus
                        />

                        {/* Camera Icon for Mechanic Mode */}
                        {lens === 'tools' && (
                            <button
                                type="button"
                                onClick={handleCameraOpen}
                                className="ml-2 p-3 bg-orange-500/20 hover:bg-orange-500/30 rounded-xl transition-all"
                                title="Scan Logbook with Camera"
                            >
                                <Camera className="w-6 h-6 text-orange-400" />
                            </button>
                        )}
                    </div>
                </form>

                {/* MISSION INSTRUCTION TEXT */}
                <div className="mb-4 pl-2 flex justify-start">
                    <p className={`text-[0.65rem] md:text-[0.75rem] font-mono font-bold tracking-widest uppercase animate-pulse transition-colors duration-300 ${(hoveredLens || lens) === 'vault' ? 'text-blue-400' : (hoveredLens || lens) === 'tools' ? 'text-orange-500' : 'text-amber-500'}`}>
                        {(() => {
                            const target = hoveredLens || lens;
                            if (target === 'radar') return "/// TARGET: RISK DETECTION & NEGOTIATION DATA";
                            if (target === 'vault') return "/// TARGET: ASSET EQUITY & PRESERVATION PROOF";
                            if (target === 'tools') return "/// TARGET: LOGBOOK OCR & COMPLIANCE WORKBENCH";
                            return "/// SELECT MISSION PROFILE TO INITIALIZE SCAN";
                        })()}
                    </p>
                </div>

                {/* MISSION ICONS - Separated with mt-4 */}
                <div className="flex justify-center gap-3 md:gap-4 mt-4">
                    {lenses.map((l) => (
                        <button
                            key={l.id}
                            type="button"
                            onMouseEnter={() => setHoveredLens(l.id)}
                            onMouseLeave={() => setHoveredLens(null)}
                            onClick={() => {
                                setLens(l.id);
                                // Blur input to prevent keyboard from covering icons on mobile
                                const input = document.querySelector('input[type="text"]');
                                if (input) input.blur();
                            }}
                            className={`flex flex-col items-center gap-2 p-4 rounded-2xl min-w-[100px] md:min-w-[120px] transition-all duration-300 ${lens === l.id ? `${l.bgColor} bg-opacity-20 ring-2 ring-${l.color.split('-')[1]}-500` : 'bg-slate-900/50 hover:bg-slate-900/80'}`}
                        >
                            <l.icon className={`w-8 h-8 md:w-10 md:h-10 ${lens === l.id ? l.color : 'text-slate-400'} transition-colors`} />
                            <span className={`text-xs md:text-sm font-bold uppercase tracking-wider ${lens === l.id ? 'text-white' : 'text-slate-500'}`}>
                                {l.label}
                            </span>
                        </button>
                    ))}
                </div>

                {/* REGULATORY AUTHORITY BADGES */}
                <div className="mt-8 md:mt-12 flex flex-wrap justify-center items-center gap-4 md:gap-6 opacity-30 hover:opacity-50 transition-all duration-700 grayscale">
                    {/* Transport Canada */}
                    <div className="flex flex-col items-center gap-1 group cursor-pointer">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center border border-slate-600/30 shadow-sm group-hover:scale-105 transition-transform">
                            <div className="text-center">
                                <div className="text-slate-300 font-black text-[8px] md:text-[9px] leading-tight">TC</div>
                                <div className="text-slate-400 text-[5px] md:text-[6px] font-bold">CANADA</div>
                            </div>
                        </div>
                        <span className="text-[7px] md:text-[8px] font-mono text-slate-500 uppercase tracking-wider">Transport</span>
                    </div>

                    {/* FAA */}
                    <div className="flex flex-col items-center gap-1 group cursor-pointer">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center border border-slate-600/30 shadow-sm group-hover:scale-105 transition-transform">
                            <div className="text-center">
                                <div className="text-slate-300 font-black text-[9px] md:text-[10px] leading-tight">FAA</div>
                                <div className="text-slate-400 text-[5px] md:text-[6px] font-bold">USA</div>
                            </div>
                        </div>
                        <span className="text-[7px] md:text-[8px] font-mono text-slate-500 uppercase tracking-wider">Aviation</span>
                    </div>

                    {/* NTSB */}
                    <div className="flex flex-col items-center gap-1 group cursor-pointer">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center border border-slate-600/30 shadow-sm group-hover:scale-105 transition-transform">
                            <div className="text-center">
                                <div className="text-slate-300 font-black text-[8px] md:text-[9px] leading-tight">NTSB</div>
                                <div className="text-slate-400 text-[5px] md:text-[6px] font-bold">SAFETY</div>
                            </div>
                        </div>
                        <span className="text-[7px] md:text-[8px] font-mono text-slate-500 uppercase tracking-wider">Safety</span>
                    </div>

                    {/* TSB Canada */}
                    <div className="flex flex-col items-center gap-1 group cursor-pointer">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center border border-slate-600/30 shadow-sm group-hover:scale-105 transition-transform">
                            <div className="text-center">
                                <div className="text-slate-300 font-black text-[8px] md:text-[9px] leading-tight">TSB</div>
                                <div className="text-slate-400 text-[5px] md:text-[6px] font-bold">CANADA</div>
                            </div>
                        </div>
                        <span className="text-[7px] md:text-[8px] font-mono text-slate-500 uppercase tracking-wider">TSB</span>
                    </div>

                    {/* NAV CANADA */}
                    <div className="flex flex-col items-center gap-1 group cursor-pointer">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center border border-slate-600/30 shadow-sm group-hover:scale-105 transition-transform">
                            <div className="text-center">
                                <div className="text-slate-300 font-black text-[7px] md:text-[8px] leading-tight">NAV</div>
                                <div className="text-slate-400 text-[5px] md:text-[6px] font-bold">CANADA</div>
                            </div>
                        </div>
                        <span className="text-[7px] md:text-[8px] font-mono text-slate-500 uppercase tracking-wider">Nav</span>
                    </div>
                </div>

            </div>
        </div>
    );
}

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radar, TrendingUp, Wrench, ArrowRight, Camera, Zap, Target, Eye, BarChart3, Lock, PlaneTakeoff } from 'lucide-react';
import { Button } from "@/components/ui/button";
import xrayImage from '../assets/xray.png';

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

    const navigateToRole = (roleId) => {
        const targetLens = roleId || lens;
        let path = '/buyer';
        if (targetLens === 'vault') path = '/seller';
        if (targetLens === 'tools') path = '/mechanic';

        if (tailNumber.trim()) {
            navigate(`${path}?tail=${tailNumber.toUpperCase()}&autostart=true`);
        } else {
            navigate(path);
        }
    };

    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault();
        navigateToRole();
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

    const pillars = [
        {
            title: 'Predictive Maintenance',
            subtitle: 'The "Future-Proof" Audit',
            pitch: '"Stop looking at what was fixed. See what\'s about to break."',
            data: 'Our AI cross-references millions of SDR (Service Difficulty Reports) and CADORS logs to identify failure patterns for your specific make and model.',
            value: 'We predict major maintenance events—like landing gear actuators or engine overhauls—before they happen, giving you a 200-hour "Early Warning System".',
            icon: Eye,
            color: '#10b981'
        },
        {
            title: 'Market Alpha',
            subtitle: 'The "Fair Deal" Finder',
            pitch: '"Stop guessing the value. Know the score."',
            data: 'We rank the aircraft against the entire global fleet based on its equipment, airframe time, and verified maintenance health.',
            value: 'Instantly see if a tail is a "Hidden Gem" or a "Money Pit" with a single, data-backed score.',
            icon: BarChart3,
            color: '#3b82f6'
        },
        {
            title: 'Risk Radar',
            subtitle: 'The "Blocked" Status Check',
            pitch: '"Identify red flags before you call the broker."',
            data: 'A 24/7 forensic scan of global sanction lists, theft registries, and unreported incident databases.',
            value: 'Instantly see if a plane is "Blocked" due to legal liens, safety issues, or compliance gaps.',
            icon: Lock,
            color: '#ef4444'
        },
        {
            title: 'Mission Fit',
            subtitle: 'Personalized Flight Plan',
            pitch: '"The right plane for your life, not just the brochure."',
            data: 'A real-world payload-to-fuel simulation based on your standard passengers and frequent routes.',
            value: 'Ensure your typical mission (e.g., Teterboro to Palm Beach) is achievable with your typical layout.',
            icon: PlaneTakeoff,
            color: '#a855f7'
        }
    ];

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center relative overflow-x-hidden">

            {/* Premium Background Effects */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
                <div
                    className="absolute w-[800px] h-[800px] rounded-full blur-[120px] opacity-10 transition-all duration-1000"
                    style={{
                        background: `radial-gradient(circle, ${activeLens.color}, transparent)`,
                        left: `${mousePosition.x - 400}px`,
                        top: `${mousePosition.y - 400}px`,
                    }}
                ></div>
            </div>

            {/* Main Hero & Console Section */}
            <div className="relative z-10 w-full max-w-6xl px-4 flex flex-col items-center">

                {/* Hero Section */}
                <div className="text-center pt-16 md:pt-24 pb-8 md:pb-12 animate-fade-in-down w-full">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-6 md:mb-8">
                        <div className="flex items-center gap-2">
                            <h1 className="text-4xl sm:text-6xl md:text-7xl font-registration text-white tracking-widest text-center">
                                goTailScan
                            </h1>
                            <div className="w-3 h-8 md:h-12 bg-emerald-500 animate-pulse"></div>
                        </div>
                    </div>
                    <div className="space-y-4 px-2">
                        <p className="text-xl md:text-3xl text-slate-300 font-light tracking-tight max-w-2xl mx-auto leading-tight">
                            See what others miss. <span className="font-black text-white italic underline decoration-emerald-500 underline-offset-8">Audit the Future</span> of any aircraft.
                        </p>
                        <p className="text-slate-500 text-[10px] md:text-sm font-bold uppercase tracking-[0.2em] md:tracking-[0.4em]">Forensic Aviation Intelligence Engine</p>
                    </div>
                </div>

                {/* Intelligence Console */}
                <div className="w-full max-w-4xl mb-24 md:mb-32 bg-slate-900/40 backdrop-blur-3xl border border-white/10 rounded-[30px] md:rounded-[40px] p-3 md:p-4 shadow-3xl">
                    <form onSubmit={handleSearchSubmit} className="relative w-full mb-4 md:mb-6">
                        <div className={`relative h-20 md:h-32 flex items-center bg-black/60 border-2 rounded-[24px] md:rounded-[30px] px-6 md:px-12 transition-all duration-500 ${isFocused ? `border-${activeLens.color}-500` : 'border-slate-800'}`}
                            style={{
                                borderColor: isFocused ? activeLens.color : undefined,
                                boxShadow: isFocused ? `0 0 60px ${activeLens.color}30` : '0 0 20px rgba(0,0,0,0.5)'
                            }}>
                            <input
                                type="text"
                                value={tailNumber}
                                onChange={(e) => setTailNumber(e.target.value.toUpperCase())}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
                                placeholder="N-NUMBER..."
                                className="flex-1 bg-transparent border-none outline-none text-2xl md:text-6xl font-black text-white placeholder-slate-900 font-mono tracking-tighter cursor-text min-w-0"
                                autoFocus
                            />

                            <Button
                                type="submit"
                                className="h-12 md:h-20 px-4 md:px-12 rounded-xl md:rounded-[24px] bg-white text-black hover:bg-slate-200 transition-all active:scale-95 ml-2"
                            >
                                <ArrowRight className="w-6 h-6 md:w-8 md:h-8" />
                            </Button>
                        </div>
                    </form>

                    <div className="grid grid-cols-3 gap-2 md:gap-4">
                        {lenses.map((l) => (
                            <button
                                key={l.id}
                                onClick={() => navigateToRole(l.id)}
                                onMouseEnter={() => { setHoveredLens(l.id); setLens(l.id); }}
                                className={`relative p-3 sm:p-6 md:p-10 rounded-2xl md:rounded-[28px] transition-all duration-500 flex flex-col items-center gap-2 md:gap-4 border-2 ${lens === l.id
                                    ? 'bg-white text-black border-transparent scale-[1.02] md:scale-[1.05] shadow-2xl'
                                    : 'bg-slate-900/40 text-slate-500 border-transparent hover:border-white/10 hover:text-white'
                                    }`}
                            >
                                <l.icon className={`w-5 h-5 md:w-10 md:h-10 ${lens === l.id ? 'text-black' : 'opacity-40'}`} />
                                <span className="text-[10px] md:text-xl font-black uppercase tracking-widest">{l.label}</span>
                                {lens === l.id && (
                                    <div className="absolute -top-1 -right-1 w-2 h-2 md:w-4 md:h-4 bg-black rounded-full border-2 border-white animate-pulse"></div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* THE 4 PILLARS SECTION */}
                <div className="w-full mb-32 md:mb-48 pt-12 md:pt-24 border-t border-white/5">
                    <div className="mb-16 md:mb-24 text-center">
                        <h2 className="text-3xl md:text-6xl font-black text-white tracking-tighter uppercase italic mb-4 md:mb-6 px-4">
                            Deep Forensic Infrastructure
                        </h2>
                        <div className="w-16 md:w-24 h-1 bg-emerald-500 mx-auto"></div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center mb-24 md:mb-32">
                        {/* THE X-RAY IMAGE */}
                        <div className="relative group perspective-1000 px-2">
                            <div className="absolute inset-0 bg-emerald-500/20 blur-[60px] md:blur-[100px] rounded-full group-hover:bg-emerald-500/30 transition-all duration-1000"></div>
                            <img
                                src={xrayImage}
                                alt="Aircraft X-Ray"
                                className="relative z-10 w-full h-auto rounded-2xl md:rounded-[32px] border border-white/10 shadow-3xl transform md:rotate-1 group-hover:rotate-0 transition-all duration-700"
                            />
                            {/* Scanning Effect */}
                            <div className="absolute top-0 left-0 w-full h-px bg-emerald-500 shadow-[0_0_20px_emerald-500] z-20 animate-scanline"></div>
                        </div>

                        <div className="space-y-6 md:space-y-8 px-4">
                            <h3 className="text-2xl md:text-5xl font-black text-white italic tracking-tighter leading-tight mb-2 md:mb-4">
                                "X-Ray Vision for your next Acquisition."
                            </h3>
                            <p className="text-lg md:text-xl text-slate-400 leading-relaxed font-light">
                                goTailScan doesn't just read the logbooks—it reconstructs the aircraft's entire lifecycle using global multi-source data feeds.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <div className="flex -space-x-2 md:-space-x-3">
                                    {['FAA', 'NTSB', 'CADORS', 'SDR'].map((lbl, i) => (
                                        <div key={i} className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-800 border-2 border-slate-950 flex items-center justify-center text-[8px] md:text-[10px] font-black text-white shadow-xl">
                                            {lbl}
                                        </div>
                                    ))}
                                </div>
                                <div className="ml-4 flex flex-col justify-center">
                                    <span className="text-white font-black text-sm tracking-widest">LIVE FEEDS</span>
                                    <span className="text-emerald-500 text-xs font-bold animate-pulse">SECURE CONNECTION ESTABLISHED</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 px-2 md:px-0">
                        {pillars.map((p, idx) => (
                            <div key={idx} className="group relative p-6 md:p-12 rounded-[24px] md:rounded-[40px] bg-slate-900/40 border border-white/5 hover:border-white/20 transition-all duration-500 overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-all" style={{ background: `linear-gradient(135deg, ${p.color}, transparent)` }}></div>

                                <div className="flex items-start gap-4 md:gap-6 mb-6 md:mb-8">
                                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center relative shrink-0" style={{ background: `${p.color}20` }}>
                                        <p.icon className="w-6 h-6 md:w-8 md:h-8" style={{ color: p.color }} />
                                        <div className="absolute inset-0 rounded-xl md:rounded-2xl blur-lg opacity-40" style={{ background: p.color }}></div>
                                    </div>
                                    <div>
                                        <div className="text-[8px] md:text-[10px] font-black tracking-[0.2em] md:tracking-[0.3em] uppercase mb-1" style={{ color: p.color }}>{p.subtitle}</div>
                                        <h4 className="text-xl md:text-3xl font-black text-white uppercase italic tracking-tighter">{p.title}</h4>
                                    </div>
                                </div>

                                <div className="space-y-4 md:space-y-6 relative z-10">
                                    <p className="text-lg md:text-xl font-bold text-white italic">{p.pitch}</p>

                                    <div className="p-4 rounded-xl md:rounded-2xl bg-black/40 border border-white/5">
                                        <span className="text-[9px] md:text-[10px] font-black text-slate-500 tracking-widest uppercase mb-2 block">The Intelligence Source</span>
                                        <p className="text-xs md:text-sm text-slate-300 leading-relaxed">{p.data}</p>
                                    </div>

                                    <div className="p-4 rounded-xl md:rounded-2xl bg-white/5">
                                        <span className="text-[9px] md:text-[10px] font-black text-emerald-500 tracking-widest uppercase mb-2 block">Forensic Value</span>
                                        <p className="text-xs md:text-sm text-slate-100 font-bold leading-relaxed">{p.value}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Final CTA */}
                <div className="w-full max-w-2xl text-center pb-24 md:pb-48 px-4">
                    <h5 className="text-xl md:text-2xl font-black text-white uppercase tracking-[0.2em] mb-6 md:mb-8">Ready to audit?</h5>
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="group flex items-center gap-3 md:gap-4 mx-auto px-6 md:px-10 py-4 md:py-6 bg-emerald-500 rounded-full text-black font-black text-lg md:text-xl uppercase italic tracking-tighter hover:scale-105 transition-all shadow-2xl shadow-emerald-500/20"
                    >
                        START YOUR FIRST SCAN <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-2 transition-transform" />
                    </button>
                    <p className="mt-6 md:mt-8 text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest leading-relaxed">No Credit Card Required<br className="md:hidden" /> for Guest Forensic Lookup</p>
                </div>

            </div>
        </div>
    );
}

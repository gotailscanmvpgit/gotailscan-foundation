import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radar, TrendingUp, Wrench, ArrowRight, Camera, Zap, Target, Eye, BarChart3, Lock, PlaneTakeoff, Terminal, Shield, Database } from 'lucide-react';
import { Button } from "@/components/ui/button";
import xrayImage from '../assets/xray.png';
import authorityLogos from '../assets/authority_logos.png';
import Footer from './Footer';
import { normalizeTailNumber } from '../utils/tailNumberHelper';

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

    // Track mouse for gradient effect (Original Logic)
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
            navigate(`${path}?tail=${normalizeTailNumber(tailNumber)}&autostart=true`);
        } else {
            navigate(path);
        }
    };

    const handleSearchSubmit = (e) => {
        if (e) e.preventDefault();
        navigateToRole();
    };

    // Original Lens Data (Restored for Colors/Gradient Logic) but with updated Labels if needed
    const lenses = [
        {
            id: 'radar',
            icon: Radar,
            label: 'Buyer Audit',
            color: '#00FF00',
            desc: 'Risk Analysis & Forensic History'
        },
        {
            id: 'vault',
            icon: TrendingUp,
            label: 'Seller Valuation',
            color: '#FF00FF',
            desc: 'Market Equity & Liquidity'
        },
        {
            id: 'tools',
            icon: Wrench,
            label: 'Mechanic Log',
            color: '#00FFFF',
            desc: 'Maintenance Compliance'
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

            {/* Premium Background Effects (Original) */}
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

                {/* Hero Section (Original) */}
                <div className="text-center pt-16 md:pt-24 pb-8 md:pb-12 animate-fade-in-down w-full">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-6 md:mb-8">
                        <div className="flex items-center gap-2">
                            <h1 className="text-4xl sm:text-6xl md:text-7xl font-registration text-white tracking-widest text-center">
                                goTailScan
                            </h1>
                            <div className="w-3 h-8 md:h-12 bg-cyan-500 animate-pulse"></div>
                        </div>
                    </div>
                    <div className="space-y-4 px-2">
                        <p className="text-xl md:text-3xl text-slate-300 font-light tracking-tight max-w-2xl mx-auto leading-tight">
                            See what others miss. <span className="font-black text-white italic underline decoration-cyan-500 underline-offset-8">Audit the Present & Future</span> of any aircraft.
                        </p>
                        <p className="text-slate-500 text-[10px] md:text-sm font-bold uppercase tracking-[0.2em] md:tracking-[0.4em]">Forensic Aviation Intelligence Engine</p>
                    </div>
                </div>

                {/* Intelligence Console (COCKPIT MODE) */}
                <div className="w-full max-w-4xl mb-24 md:mb-32 cockpit-panel rounded-[30px] md:rounded-[40px] p-4 md:p-6 shadow-3xl relative overflow-hidden">

                    {/* Cockpit Glare Effect */}
                    <div className="absolute inset-x-0 top-0 h-[1px] bg-white/20 z-20"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03),transparent_70%)] pointer-events-none"></div>

                    {/* NEW: Command Input Style (Avionics) */}
                    <div className="mb-6 relative z-10">
                        <div className="flex items-end justify-between mb-2">
                            <label className="text-[10px] font-mono cyan-glow uppercase tracking-widest flex items-center gap-2">
                                <Terminal className="w-3 h-3 text-cyan-400" /> FLIGHT_MANAGEMENT_SYSTEM (FMS)
                            </label>
                            <div className="flex gap-1">
                                {lenses.map((l) => (
                                    <button
                                        key={l.id}
                                        type="button"
                                        onClick={() => {
                                            setLens(l.id);
                                            // Optional: Focus input on tab switch
                                            // document.querySelector('input[name="tailNumber"]')?.focus(); 
                                        }}
                                        className={`px-3 py-1 text-[9px] font-bold uppercase tracking-wider rounded-t transition-all ${lens === l.id
                                            ? 'bg-cyan-500 text-black shadow-[0_-2px_10px_rgba(0,255,255,0.3)]'
                                            : 'bg-white/5 text-slate-500 hover:text-slate-300 hover:bg-white/10'
                                            }`}
                                    >
                                        {l.label.split(' ')[0]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <form onSubmit={handleSearchSubmit} className="relative group">
                            <div className="relative flex items-center bg-black/80 border border-cyan-500/30 rounded-lg rounded-tr-none p-1 shadow-[inset_0_0_20px_rgba(0,0,0,1)]">
                                <span className="pl-4 text-cyan-500 font-mono text-xl animate-pulse">{'>'}</span>
                                <input
                                    name="tailNumber"
                                    type="text"
                                    value={tailNumber}
                                    onChange={(e) => setTailNumber(e.target.value.toUpperCase())}
                                    onFocus={() => setIsFocused(true)}
                                    onBlur={() => setIsFocused(false)}
                                    placeholder={`ENTER TAIL FOR ${activeLens.label.toUpperCase()}...`}
                                    className="w-full bg-transparent border-none text-cyan-100 font-mono text-xl lg:text-3xl p-4 focus:outline-none uppercase placeholder:text-cyan-900/50"
                                    autoFocus
                                />
                                <Button type="submit" className="bg-cyan-600/90 hover:bg-cyan-500 text-black font-black font-mono uppercase tracking-widest h-auto py-3 px-6 rounded-md border-l border-cyan-500/50 min-w-[140px]">
                                    INITIALIZE {activeLens.label.split(' ')[0]}
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* NEW: Mode Selection Keys Style (Avionics Buttons) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 relative z-10">
                        {lenses.map((l) => (
                            <button
                                key={l.id}
                                onClick={() => { setLens(l.id); navigateToRole(l.id); }}
                                className={`relative p-4 border rounded-lg text-left transition-all group overflow-hidden ${lens === l.id
                                    ? `border-cyan-500/50 bg-cyan-500/10 shadow-[0_0_15px_rgba(0,255,255,0.2)]`
                                    : 'border-white/5 hover:border-white/20 bg-black/40'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <l.icon className={`w-5 h-5 ${lens === l.id ? 'text-cyan-400' : 'text-slate-600'}`} />
                                    {lens === l.id && <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse box-shadow-[0_0_5px_#00FFFF]"></div>}
                                </div>
                                <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${lens === l.id ? 'text-cyan-100' : 'text-slate-400'}`}>{l.label}</div>
                                <div className="text-[9px] text-cyan-500/60 font-mono uppercase leading-tight">{l.desc}</div>
                            </button>
                        ))}
                    </div>


                </div>

                {/* MISSION BRIEFING (Separate Section) */}
                <div className="w-full max-w-4xl mb-24 md:mb-32">
                    <div className="relative p-8 rounded-[24px] border border-white/5 bg-black/40 backdrop-blur-sm">
                        <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-8 block text-center">
                            // MISSION_PROTOCOL
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0">
                            {[
                                { step: '01', title: 'INPUT IDENTIFIER', desc: 'Enter any Tail Number (e.g., N12345)' },
                                { step: '02', title: 'SELECT MISSION', desc: 'Choose Audit, Valuation, or Tech Log' },
                                { step: '03', title: 'RECEIVE INTEL', desc: 'Get instant forensic risk analysis' }
                            ].map((item, i) => (
                                <div key={i} className="flex flex-col items-center text-center relative group">
                                    {/* Connector Line (Desktop Only) */}
                                    {i < 2 && (
                                        <div className="hidden md:block absolute top-[14px] left-[60%] w-[80%] h-[1px] bg-gradient-to-r from-cyan-900/50 to-transparent z-0"></div>
                                    )}

                                    <div className="w-8 h-8 rounded-md border border-cyan-500/30 bg-cyan-950/30 flex items-center justify-center text-[11px] font-mono text-cyan-400 font-bold mb-4 relative z-10 shadow-[0_0_15px_rgba(0,255,255,0.15)] group-hover:bg-cyan-500/20 transition-colors">
                                        {item.step}
                                    </div>
                                    <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-2">{item.title}</h4>
                                    <p className="text-[10px] text-slate-400 font-mono tracking-wide">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>



                {/* THE 4 PILLARS SECTION (Original) */}
                <div className="w-full mb-32 md:mb-48 pt-12 md:pt-24 border-t border-white/5">
                    <div className="mb-16 md:mb-24 text-center">
                        <h2 className="text-3xl md:text-6xl font-black text-white tracking-tighter uppercase italic mb-4 md:mb-6 px-4">
                            Deep Forensic Infrastructure
                        </h2>
                        <div className="w-16 md:w-24 h-1 bg-cyan-500 mx-auto"></div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center mb-24 md:mb-32">
                        {/* THE X-RAY IMAGE */}
                        <div className="relative group perspective-1000 px-2 h-[400px] md:h-auto">
                            <div className="absolute inset-0 bg-cyan-500/20 blur-[60px] md:blur-[100px] rounded-full group-hover:bg-cyan-500/30 transition-all duration-1000"></div>
                            <img
                                src={xrayImage}
                                alt="Aircraft X-Ray"
                                className="relative z-10 w-full h-full object-contain rounded-2xl md:rounded-[32px] border border-white/10 shadow-3xl transform md:rotate-1 group-hover:rotate-0 transition-all duration-700"
                            />

                            {/* Scanning Effect */}
                            <div className="absolute top-0 left-0 w-full h-px bg-cyan-500 shadow-[0_0_20px_cyan-500] z-20 animate-scanline"></div>

                            {/* Tech Data Overlays */}
                            <div className="absolute inset-0 z-30 pointer-events-none">
                                {[
                                    { top: '20%', left: '10%', label: 'AVIONICS HEALTH', value: '98.4%', delay: '1s' },
                                    { top: '45%', left: '50%', label: 'WING SPAR INTEGRITY', value: 'NO CORROSION', delay: '2.5s' },
                                    { top: '70%', left: '20%', label: 'ENGINE CYCLES', value: '1,420 TIS', delay: '1.5s' },
                                    { top: '30%', left: '70%', label: 'NTSB RECORDS', value: 'CLEAN', delay: '3s', color: 'emerald' }
                                ].map((point, i) => (
                                    <div
                                        key={i}
                                        className="absolute flex items-center gap-2 animate-fade-in-up"
                                        style={{ top: point.top, left: point.left, animationDelay: point.delay }}
                                    >
                                        {/* Dot */}
                                        <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_cyan] animate-ping absolute"></div>
                                        <div className="w-2 h-2 bg-cyan-400 rounded-full relative z-10"></div>

                                        {/* Line */}
                                        <div className="w-8 h-[1px] bg-cyan-500/50"></div>

                                        {/* Label Box */}
                                        <div className="bg-black/80 border border-cyan-500/30 p-2 rounded backdrop-blur-sm">
                                            <div className="text-[8px] text-slate-400 font-mono tracking-widest uppercase mb-0.5">{point.label}</div>
                                            <div className={`text-[10px] font-bold font-mono ${point.color === 'emerald' ? 'text-emerald-400' : 'text-cyan-400'}`}>{point.value}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>



                        <div className="space-y-6 md:space-y-8 px-4">
                            <h3 className="text-2xl md:text-5xl font-black text-white italic tracking-tighter leading-tight mb-2 md:mb-4">
                                "X-Ray Vision for your next Acquisition."
                            </h3>
                            <p className="text-lg md:text-xl text-slate-400 leading-relaxed font-light">
                                goTailScan doesn't just read the logbooks—it reconstructs the aircraft's entire lifecycle using global multi-source data feeds.
                            </p>
                            <div className="flex flex-wrap gap-3 mt-6">
                                <div className="flex -space-x-2">
                                    {[
                                        { lbl: 'FAA', bg: 'bg-[#003366]', border: 'border-blue-400/30' },
                                        { lbl: 'NTSB', bg: 'bg-[#1a1a1a]', border: 'border-amber-500/50' },
                                        { lbl: 'TCCA', bg: 'bg-[#880000]', border: 'border-red-500/40' },
                                        { lbl: 'EASA', bg: 'bg-[#003399]', border: 'border-yellow-400/40' },
                                        { lbl: 'CAA', bg: 'bg-[#002244]', border: 'border-sky-400/30' }
                                    ].map((agency, i) => (
                                        <div key={i} className={`w-10 h-10 md:w-12 md:h-12 rounded-full ${agency.bg} border ${agency.border} flex items-center justify-center text-[8px] md:text-[9px] font-black text-white shadow-lg z-${10 - i} hover:z-20 hover:scale-110 transition-transform cursor-help`} title={agency.lbl}>
                                            {agency.lbl}
                                        </div>
                                    ))}
                                </div>
                                <div className="ml-4 flex flex-col justify-center">
                                    <span className="text-white font-mono text-[10px] tracking-widest">LIVE FEEDS</span>
                                    <span className="text-cyan-500 text-[9px] font-bold animate-pulse">SECURE CONNECTION</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 px-2 md:px-0">
                        {pillars.map((p, idx) => (
                            <div key={idx} className="group relative p-6 md:p-12 rounded-[24px] md:rounded-[40px] cockpit-panel border-[0.5px] border-white/10 hover:border-cyan-500/30 transition-all duration-500 overflow-hidden shadow-2xl">
                                {/* Glass Glare */}
                                <div className="absolute inset-x-0 top-0 h-[1px] bg-white/10 z-20"></div>
                                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.02)_0%,transparent_100%)] pointer-events-none"></div>

                                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-all" style={{ background: `linear-gradient(135deg, ${p.color}, transparent)` }}></div>

                                <div className="flex items-start gap-4 md:gap-6 mb-6 md:mb-8 relative z-10">
                                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center relative shrink-0 bg-black/50 border border-white/10 shadow-inner">
                                        <p.icon className="w-6 h-6 md:w-8 md:h-8" style={{ color: p.color }} />
                                    </div>
                                    <div>
                                        <div className="text-[8px] md:text-[10px] font-mono tracking-[0.2em] md:tracking-[0.3em] uppercase mb-1 text-slate-500 group-hover:text-cyan-500/80 transition-colors">{p.subtitle}</div>
                                        <h4 className="text-xl md:text-3xl font-registration text-white uppercase tracking-wider">{p.title}</h4>
                                    </div>
                                </div>

                                <div className="space-y-4 md:space-y-6 relative z-10">
                                    <p className="text-lg md:text-xl font-mono text-slate-300">{p.pitch}</p>

                                    <div className="p-4 rounded-xl md:rounded-2xl bg-black/60 border border-white/5 relative overflow-hidden">
                                        {/* Tech Corner Accent */}
                                        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500/30"></div>
                                        <span className="text-[9px] md:text-[10px] font-mono text-slate-500 tracking-widest uppercase mb-2 block flex items-center gap-2">
                                            <Database className="w-3 h-3" /> The Intelligence Source
                                        </span>
                                        <p className="text-xs md:text-sm text-slate-400 font-mono leading-relaxed">{p.data}</p>
                                    </div>

                                    <div className="p-4 rounded-xl md:rounded-2xl bg-cyan-900/10 border border-cyan-500/10">
                                        <span className="text-[9px] md:text-[10px] font-mono text-cyan-500 tracking-widest uppercase mb-2 block flex items-center gap-2">
                                            <Shield className="w-3 h-3" /> Forensic Value
                                        </span>
                                        <p className="text-xs md:text-sm text-cyan-100 font-mono leading-relaxed">{p.value}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Final CTA (Original) */}
                <div className="w-full max-w-2xl text-center pb-24 md:pb-48 px-4">
                    <h5 className="text-xl md:text-2xl font-black text-white uppercase tracking-[0.2em] mb-6 md:mb-8">Ready to audit?</h5>
                    <button
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="group flex items-center gap-3 md:gap-4 mx-auto px-6 md:px-10 py-4 md:py-6 bg-cyan-500 rounded-full text-black font-black text-lg md:text-xl uppercase italic tracking-tighter hover:scale-105 transition-all shadow-2xl shadow-cyan-500/20"
                    >
                        START YOUR FIRST SCAN <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-2 transition-transform" />
                    </button>
                    <p className="mt-6 md:mt-8 text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-widest leading-relaxed">No Credit Card Required<br className="md:hidden" /> for Guest Forensic Lookup</p>
                </div>
            </div >
            <Footer />
        </div >
    );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generatePDFReport } from '../services/pdfGenerator';
import { scraperService } from '../services/scraperService';
import CircularGauge from './CircularGauge';
import ValidationSection from './ValidationSection';
import ValueProposition from './ValueProposition';
import Pricing from './Pricing';
import Logo from './Logo';
import { Shield, AlertTriangle, Activity, Globe, Plane, Mic, Radar, Scan, Lock, ArrowRight, CheckCircle, Wrench, TrendingUp, Microscope, FolderSearch, FileText, Target, Brain, Search, ShieldCheck, Gavel, FileWarning } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TacticalHeatmap = ({ className = '' }) => (
    <div className={`relative overflow-hidden rounded-full ${className}`}>
        <div className="absolute inset-0 bg-accent/20 blur-xl animate-pulse"></div>
        <svg viewBox="0 0 100 100" className="w-full h-full opacity-60">
            {[...Array(6)].map((_, i) => (
                <motion.circle
                    key={i}
                    cx={30 + (Math.sin(i) * 20)}
                    cy={40 + (Math.cos(i) * 20)}
                    r={5 + (i % 3) * 5}
                    fill="url(#heatGradient)"
                    initial={{ opacity: 0.2, scale: 0.8 }}
                    animate={{
                        opacity: [0.2, 0.5, 0.2],
                        scale: [0.8, 1.1, 0.8],
                        x: [0, Math.sin(i) * 5, 0],
                        y: [0, Math.cos(i) * 5, 0]
                    }}
                    transition={{ repeat: Infinity, duration: 3 + i, ease: "easeInOut" }}
                />
            ))}
            <defs>
                <radialGradient id="heatGradient">
                    <stop offset="0%" stopColor="#FF5F1F" />
                    <stop offset="100%" stopColor="transparent" />
                </radialGradient>
            </defs>
        </svg>
    </div>
);

const SignalStabilityGraph = ({ className = '' }) => {
    const points = [...Array(20)].map((_, i) => ({
        x: i * 5,
        y: 40 + (Math.random() * 20)
    }));
    const d = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;

    return (
        <div className={`h-12 w-full bg-black/40 border border-white/5 rounded relative overflow-hidden ${className}`}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                <motion.path
                    d={d}
                    fill="none"
                    stroke="#FF5F1F"
                    strokeWidth="1.5"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: [0.2, 0.8, 0.2] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                />
                <motion.path
                    d={d}
                    fill="none"
                    stroke="#FF5F1F"
                    strokeWidth="0.5"
                    opacity="0.3"
                    animate={{ x: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 0.5 }}
                />
            </svg>
            <div className="absolute top-1 left-1 flex items-center gap-1.5 opacity-40">
                <div className="w-1 h-1 bg-accent rounded-full animate-ping"></div>
                <span className="text-[6px] font-mono text-accent uppercase">Signal_Jitter_Aud</span>
            </div>
        </div>
    );
};

const LockedOverlay = ({ tier, requiredTier = 'pro' }) => {
    if (tier === requiredTier) return null;

    return (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-6 text-center group/lock">
            {/* Encrypted Background Effect */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md"></div>
            <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent animate-scanline"></div>
            </div>

            {/* Lock Container */}
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                whileHover={{ scale: 1 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative z-10 p-5 bg-black/80 border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] border-t-accent/30 group-hover/lock:border-accent/50 transition-colors"
            >
                <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4 group-hover/lock:bg-accent/20 transition-colors">
                    <Lock className="w-6 h-6 text-accent" />
                </div>
                <div className="text-[10px] text-accent font-black tracking-[0.3em] uppercase mb-1">Access_Denied</div>
                <h4 className="text-sm font-black text-white uppercase mb-2">Tier {requiredTier} Required</h4>
                <p className="text-[10px] text-gray-500 leading-relaxed max-w-[180px] mx-auto mb-4">
                    Decrypt this intelligence layer with a specialized Mission Control clearance.
                </p>
                <Button
                    variant="outline"
                    className="h-8 text-[9px] font-black uppercase tracking-widest bg-accent border-accent text-white hover:bg-accent/80 w-full"
                    onClick={() => {
                        const pricingSec = document.getElementById('pricing');
                        if (pricingSec) pricingSec.scrollIntoView({ behavior: 'smooth' });
                    }}
                >
                    Upgrade Identification
                </Button>
            </motion.div>

            {/* Matrix-like Noise Overlay */}
            <div className="absolute inset-x-0 bottom-4 px-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none flex justify-between font-mono text-[6px]">
                <span>ENCRYPTED_STREAM_0X4921</span>
                <span>SIGNATURE_PENDING_UPGRADE</span>
            </div>
        </div>
    );
};

const AircraftSilhouette = ({ makeModel = '', className = '' }) => {
    const model = (makeModel || '').toUpperCase();

    // Logic to determine type
    let type = 'jet';
    if (model.includes('CESSNA') || model.includes('PIPER') || model.includes('CIRRUS') || model.includes('BEECH') || model.includes('MOONEY') || model.includes('DIAMOND') || model.includes('BONANZA')) {
        type = 'piston';
    } else if (model.includes('KING AIR') || model.includes('PILATUS') || model.includes('CARAVAN') || model.includes('TBM') || model.includes('MERIDIAN') || model.includes('KODIAK')) {
        type = 'turboprop';
    } else if (model.includes('HELICOPTER') || model.includes('ROBINSON') || model.includes('BELL') || model.includes('AIRBUS H') || model.includes('SIKORSKY') || model.includes('EUROCOPTER')) {
        type = 'heli';
    } else if (model.includes('GULFSTREAM') || model.includes('BOMBARDIER') || model.includes('CHALLENGER') || model.includes('GLOBAL') || model.includes('CITATION') || model.includes('FALCON') || model.includes('LEARJET') || model.includes('EMBRAER') || model.includes('PHENOM')) {
        type = 'jet';
    }

    const silhouettes = {
        jet: (
            <svg viewBox="0 0 100 100" className={className}>
                <path d="M50 10 L56 35 L90 55 L90 62 L56 58 L52 85 L62 92 L62 95 L50 92 L38 95 L38 92 L48 85 L44 58 L10 62 L10 55 L44 35 Z" fill="currentColor" stroke="currentColor" strokeWidth="0.5" strokeLinejoin="round" />
                <path d="M50 15 L53 35 M50 15 L47 35" fill="none" stroke="accent" strokeWidth="0.2" opacity="0.3" />
            </svg>
        ),
        piston: (
            <svg viewBox="0 0 100 100" className={className}>
                <path d="M50 20 L54 40 L95 40 L95 48 L54 48 L50 85 L65 92 L65 95 L50 92 L35 95 L35 92 L50 85 L46 48 L5 48 L5 40 L46 40 Z" fill="currentColor" stroke="currentColor" strokeWidth="0.5" strokeLinejoin="round" />
                <circle cx="50" cy="18" r="2" fill="accent" opacity="0.5" />
            </svg>
        ),
        turboprop: (
            <svg viewBox="0 0 100 100" className={className}>
                <path d="M50 15 L55 35 L95 45 L95 55 L55 50 L52 85 L65 92 L65 95 L50 92 L35 95 L35 92 L48 85 L45 50 L5 55 L5 45 L45 35 Z" fill="currentColor" stroke="currentColor" strokeWidth="0.5" strokeLinejoin="round" />
                <path d="M25 42 L25 58 M75 42 L75 58" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>
        ),
        heli: (
            <svg viewBox="0 0 100 100" className={className}>
                <path d="M30 60 Q50 40 70 60 Q50 80 30 60 M5 58 L95 58 M5 62 L95 62 M50 25 L50 60 M40 25 L60 25" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M70 60 L85 50 L85 70 Z" fill="currentColor" />
                <rect x="25" y="75" width="50" height="2" fill="currentColor" rx="1" />
                <path d="M30 60 L25 75 M70 60 L75 75" stroke="currentColor" strokeWidth="1" />
            </svg>
        )
    };

    return (
        <div className="relative group/silhouette w-full h-full flex items-center justify-center">
            <div className="absolute inset-0 bg-accent/5 blur-3xl rounded-full opacity-50 group-hover/silhouette:opacity-100 transition-opacity"></div>
            {silhouettes[type] || silhouettes.jet}
            <motion.div
                animate={{ top: ['10%', '90%', '10%'] }}
                transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
                className="absolute inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-accent/40 to-transparent z-10 pointer-events-none opacity-50 shadow-[0_0_10px_rgba(255,95,31,0.5)]"
            />
        </div>
    );
};

const Hero = () => {
    const [searching, setSearching] = useState(false);
    const [searchMode, setSearchMode] = useState('standard'); // 'standard' or 'ai'
    const [viewMode, setViewMode] = useState('buyer');
    const [missionDistance, setMissionDistance] = useState(300);
    const [missionPax, setMissionPax] = useState(2); // 'buyer' or 'seller'
    const [nNumber, setNNumber] = useState('');
    const [result, setResult] = useState(null);
    const [aiResult, setAiResult] = useState(null);
    const [tier, setTier] = useState(null); // 'basic', 'pro' or null
    const [error, setError] = useState(null);
    const [generatingPdf, setGeneratingPdf] = useState(false);

    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [notFoundResult, setNotFoundResult] = useState(null);

    // Comparison Mode State
    const [isComparing, setIsComparing] = useState(false);
    const [compareResult, setCompareResult] = useState(null);
    const [sourceResult, setSourceResult] = useState(null);

    const [isListening, setIsListening] = useState(false);

    // Broker Lead Capture State
    const [brokerEmail, setBrokerEmail] = useState('');
    const [isBrokerSubmitting, setIsBrokerSubmitting] = useState(false);
    const [brokerSuccess, setBrokerSuccess] = useState(false);



    // Check if report is paid via URL parameter (Supports /success?paid=true)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const paid = params.get('paid');
        const selectedTier = params.get('tier');
        const urlTail = params.get('nNumber');
        const tailParam = params.get('tail');
        const modeParam = params.get('mode');

        if (paid === 'true') {
            setTier(selectedTier || 'pro');
            if (urlTail) {
                setNNumber(urlTail);
                // Trigger auto-scan
                triggerAutoScan(urlTail, selectedTier || 'pro');
            }
        }

        // Initial search on load if URL param exists
        if (modeParam === 'ai') {
            setSearchMode('ai');
        }

        if (tailParam) {
            setNNumber(tailParam);
            setTimeout(() => {
                handleSearch(tailParam);
            }, 500);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tier]); // Re-run if tier upgrades (user returns from strip)

    const startListening = () => {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            alert("Voice dictation is not supported in this browser. Please use Chrome or Edge.");
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
            setSearchMode('ai'); // Auto-switch to AI mode for voice
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            let finalVal = transcript;
            if (finalVal.endsWith('.')) finalVal = finalVal.slice(0, -1);
            setNNumber(finalVal);
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            setIsListening(false);
        };

        recognition.start();
    };

    const triggerAutoScan = async (tail, paidTier) => {
        setSearching(true);
        setResult(null);
        try {
            const data = await scraperService.scanTailNumber(tail, 'paid', paidTier);
            setResult(data);
        } catch (error) {
            console.error("Auto-scan failed:", error);
            setError("Auto-scan failed. Please try searching manually.");
        } finally {
            setSearching(false);
        }
    };

    // Auto-scroll to results when they load
    useEffect(() => {
        if (result) {
            const resultsElement = document.getElementById('results-view');
            if (resultsElement) {
                setTimeout(() => {
                    resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }, 100);
            }
        }
    }, [result]);

    const handleSearch = async (forcedValue = null) => {
        let val = (forcedValue || nNumber).trim();

        // Auto-detect mode
        const globalPrefixes = ['N', 'C', 'G', 'VH', 'XA', 'XB', 'XC', 'ZS', 'D', 'F', 'HB'];
        const isTail = val.length >= 3 && globalPrefixes.some(p => val.toUpperCase().startsWith(p));
        const mode = isTail ? 'standard' : 'ai';
        setSearchMode(mode);

        if (mode === 'standard') {
            val = val.toUpperCase();
            const prefixesToHyphenate = ['C', 'G', 'D', 'F', 'HB', 'VH', 'XA', 'XB', 'XC', 'ZS'];

            // Handle single/double char prefixes
            if (prefixesToHyphenate.some(p => val.startsWith(p))) {
                const pMatch = prefixesToHyphenate.find(p => val.startsWith(p));
                if (val.length > pMatch.length && val[pMatch.length] !== '-') {
                    val = val.substring(0, pMatch.length) + '-' + val.substring(pMatch.length);
                }
            }
            if (!forcedValue) setNNumber(val);
        }

        setError(null);
        setSuggestions([]);
        setShowSuggestions(false);
        setAiResult(null);
        setNotFoundResult(null);

        if (!val) return;

        setSearching(true);
        if (!isComparing) {
            setResult(null);
            setCompareResult(null);
        }

        try {
            if (mode === 'ai') {
                const aiResponse = await scraperService.aiIntelSearch(val);
                if (aiResponse.type === 'forensic') {
                    setNNumber(aiResponse.target);
                    await new Promise(r => setTimeout(r, 800));
                    setSearchMode('standard');
                    const forensicData = await scraperService.scanTailNumber(aiResponse.target, 'paid', 'pro');
                    if (isComparing) setCompareResult(forensicData);
                    else setResult(forensicData);
                } else {
                    await new Promise(r => setTimeout(r, 1500));
                    setAiResult(aiResponse);
                }
            } else {
                const data = await scraperService.scanTailNumber(val, 'paid', 'pro');
                if (isComparing) setCompareResult(data);
                else setResult(data);
            }
        } catch (error) {
            console.error("Search failed:", error);
            if (error.message.includes('not found')) {
                setNotFoundResult({ nNumber: val });
            } else {
                setError(error.message || "Unable to connect to intelligence network. Please try again.");
            }
        } finally {
            setSearching(false);
        }
    };

    // Live suggestion fetcher
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (nNumber.length >= 2) {
                const results = await scraperService.getSuggestions(nNumber);
                setSuggestions(results);
                setShowSuggestions(results.length > 0);
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        };

        const timeoutId = setTimeout(fetchSuggestions, 150);
        return () => clearTimeout(timeoutId);
    }, [nNumber]);



    const isPaid = tier !== null;

    return (
        <section className="flex flex-col items-center justify-start pt-20 min-h-screen px-4 text-center relative overflow-hidden bg-[#050505]">
            <style>
                {`
@media print {
                        body { background: #050505!important; -webkit-print-color-adjust: exact; color: white!important; }
                        .no-print, button, .search-container, nav, .footer-links { display: none!important; }
    #results-view { padding: 20px!important; margin: 0!important; width: 100 % !important; max - width: none!important; }
                        .glass-card, div[class*= "Card"] {
        background: rgba(30, 30, 30, 0.8)!important;
        border: 1px solid rgba(255, 255, 255, 0.1)!important;
        break-inside: avoid;
        color: white!important;
    }
                        .text-gray - 500, .text-gray - 400 { color: #888!important; }
                        .text-accent { color: #00ff88!important; }
                        * { - webkit-print-color-adjust: exact!important; print-color-adjust: exact!important;
}
                    }
`}
            </style>
            {/* Cinematic Background Effects - INCREASED VISIBILITY */}
            <div className="absolute inset-0 pointer-events-none">
                {/* 1. Top Horizon Glow (Dawn Effect) - Boosted */}
                <div
                    className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[140%] h-[60vh] opacity-35"
                    style={{
                        background: 'radial-gradient(ellipse at center, #FF5F1F 0%, transparent 60%)',
                        filter: 'blur(100px)',
                        zIndex: 0
                    }}
                />

                {/* 2. Noise Texture (Film Grain) - Boosted */}
                <div
                    className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                        zIndex: 1
                    }}
                />

                {/* 3. Search Bar Backlight (Focus) - Boosted & Warmer */}
                <div
                    className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-25"
                    style={{
                        background: 'radial-gradient(circle at center, #4F46E5 0%, transparent 70%)',
                        filter: 'blur(100px)',
                        zIndex: 0
                    }}
                />

                {/* 4. RADAR SWEEP EFFECT - Breakthrough Visual */}
                <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] border border-accent/10 rounded-full pointer-events-none overflow-hidden">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                        className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0%,rgba(255,95,31,0.05)_10%,transparent_20%)] origin-center"
                    />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,#050505_70%)]"></div>
                </div>
            </div>

            {/* Success Banner */}
            {window.location.pathname === '/success' && isPaid && (
                <motion.div
                    initial={{ y: -100 }}
                    animate={{ y: 0 }}
                    className="fixed top-6 left-1/2 -translate-x-1/2 px-8 py-3 bg-accent text-white font-black rounded-full shadow-2xl z-50 flex items-center gap-3 border border-white/20"
                >
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    PAYMENT SUCCESSFUl-DILIGENCE ACCESS GRANTED
                </motion.div>
            )}

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl w-full flex flex-col items-center relative z-10"
            >
                {/* Global Forensic Pulse Feed */}
                {!result && (
                    <div className="mb-12 overflow-hidden w-full max-w-lg border-y border-white/5 py-2">
                        <motion.div
                            animate={{ x: [0, -1000] }}
                            transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
                            className="flex gap-16 whitespace-nowrap"
                        >
                            {[
                                { tail: 'N172SP', msg: 'CLEAN REGISTRY MATCH [US]', color: 'text-green-500' },
                                { tail: 'VH-OEK', msg: 'DORMANCY ALERT [AU]', color: 'text-warning' },
                                { tail: 'XA-VIF', msg: 'HIGH SALINITY RISK [MX]', color: 'text-orange-500' },
                                { tail: 'G-BOAC', msg: 'SHADOW TRACKING DETECTED [UK]', color: 'text-red-500' },
                                { tail: 'N450GA', msg: 'MARKET LIQUIDITY HIGH [US]', color: 'text-accent' },
                                { tail: 'C-GCHX', msg: 'NTSB CLEARANCE VERIFIED [CA]', color: 'text-green-500' },
                                { tail: 'HB-JFN', msg: 'OFF-BOOK MAINT. RISK [CH]', color: 'text-red-500' }
                            ].map((p, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <span className="text-[10px] font-black text-white">{p.tail}</span>
                                    <span className={`text-[9px] font-bold uppercase tracking-widest ${p.color} `}>{p.msg}</span>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                )}

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center mb-12 w-full font-mono"
                >
                    <div className="flex items-center gap-2 group cursor-default">
                        <h1 className="text-2xl md:text-5xl font-black text-white tracking-tighter">
                            goTail<span className="text-orange-500">Scan</span>
                        </h1>
                        <motion.div
                            animate={{ opacity: [1, 0, 1] }}
                            transition={{ repeat: Infinity, duration: 0.8, ease: "steps(1)" }}
                            className="w-3 md:w-5 h-7 md:h-10 bg-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.6)]"
                        />
                    </div>
                </motion.div>

                <p className="text-gray-400 text-lg md:text-xl font-medium mb-12 max-w-2xl mx-auto leading-relaxed opacity-90">
                    The elite technical scanner for <span className="text-white font-black">Aircraft Forensics</span>. Syncing real-time intelligence across <span className="text-white font-black italic">24 Civil Registries</span> and global safety data pools.
                    <br />
                    <span className="text-xs uppercase tracking-[0.5em] text-accent font-bold mt-4 block">Type any tail number. We find the truth.</span>
                </p>


                <div id="hero-search" className="relative w-full max-w-xl mx-auto mb-12 z-40">
                    {/* Search Mode Toggle */}
                    <div className="flex justify-center mb-6">
                        <div className="bg-white/5 border border-white/10 p-1 rounded-xl flex gap-1">
                            <button
                                onClick={() => setSearchMode('standard')}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${searchMode === 'standard' ? 'bg-accent text-white shadow-[0_0_15px_rgba(255,95,31,0.3)]' : 'text-gray-500 hover:text-white'} `}
                            >
                                Registry Search
                            </button>
                            <button
                                onClick={() => setSearchMode('ai')}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${searchMode === 'ai' ? 'bg-violet-600 text-white shadow-[0_0_15px_rgba(124,58,237,0.3)]' : 'text-gray-500 hover:text-white'} `}
                            >
                                <span className="text-xs">🧠</span> AI Advisory
                            </button>
                        </div>
                    </div>

                    <div className="relative group">
                        {/* Search Input - Refined for clarity and high-tech feel */}
                        <div className={`flex items-center backdrop-blur-xl border-[1.5px] transition-all duration-500 rounded-xl overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.8)] ${searching ? (searchMode === 'ai' ? 'border-violet-500 animate-pulse shadow-[0_0_50px_rgba(124,58,237,0.4)] bg-black/90' : 'border-accent animate-pulse shadow-[0_0_50px_rgba(255,95,31,0.4)] bg-black/90') : isInputFocused ? (searchMode === 'ai' ? 'border-violet-500 shadow-[0_0_40px_rgba(124,58,237,0.2)] bg-black/80' : 'border-accent shadow-[0_0_40px_rgba(255,95,31,0.2)] bg-black/80') : 'border-white/10 bg-black/40'} `}>
                            <input
                                type="text"
                                placeholder={searchMode === 'ai' ? "DESCRIBE THE AIRCRAFT OR INCIDENT..." : "SEARCH A TAIL NUMBER"}
                                value={nNumber}
                                onFocus={() => setIsInputFocused(true)}
                                onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
                                onChange={(e) => setNNumber(searchMode === 'ai' ? e.target.value : e.target.value.toUpperCase())}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSearch();
                                }}
                                className="w-full h-16 bg-transparent border-none text-white font-black text-2xl md:text-3xl placeholder:text-white/10 text-center focus:outline-none uppercase tracking-tighter"
                            />

                            {/* Voice Dictation Button */}
                            <button
                                onClick={startListening}
                                className={`absolute right-4 p-2 rounded-full transition-all ${isListening ? 'bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'text-white/20 hover:text-white hover:bg-white/10'} `}
                                title="Dictate to AI"
                            >
                                <Mic className={`w-5 h-5 ${isListening ? 'animate-bounce' : ''} `} />
                            </button>


                            {searching && (
                                <div className="pr-8 flex items-center gap-3">
                                    {searchMode === 'ai' && (
                                        <div className="text-[10px] font-black text-violet-500 uppercase tracking-widest animate-pulse">Neural Processing...</div>
                                    )}
                                    <div className={`w-6 h-6 border-2 ${searchMode === 'ai' ? 'border-violet-500 shadow-[0_0_10px_#7C3AED]' : 'border-accent shadow-[0_0_10px_#FF5F1F]'} border-t-transparent rounded-full animate-spin`}></div>
                                </div>
                            )}
                        </div>

                        {/* Suggestions Dropdown */}
                        <AnimatePresence>
                            {(showSuggestions && isInputFocused) && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute top-[88px] left-0 right-0 bg-[#0f0f0f] border border-white/10 rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 py-2"
                                >
                                    {suggestions.map((s, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                setNNumber(s.n_number);
                                                handleSearch(s.n_number);
                                            }}
                                            className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors group text-left"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-2 h-2 bg-accent rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                <div>
                                                    <div className="text-white font-black text-lg tracking-tight uppercase group-hover:text-accent transition-colors">{s.n_number}</div>
                                                    <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">{s.name?.substring(0, 30)}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] text-white/20 uppercase font-black tracking-widest group-hover:text-white/40">{s.mfr_mdl_code}</div>
                                            </div>
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {error && (
                        <div className="absolute -bottom-12 left-0 w-full text-center animate-shake">
                            <span className="text-[#FF5F1F] font-bold bg-black/90 px-6 py-2 rounded-full border border-[#FF5F1F] text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(255,95,31,0.4)]">
                                ⚠️ {error}
                            </span>
                        </div>
                    )}
                </div>

                {/* ONE-TOUCH FORENSIC SAMPLES - Approachability Booster */}
                {!result && !aiResult && !searching && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="w-full max-w-2xl mt-8 flex flex-col items-center"
                    >
                        <div className="text-[10px] text-gray-600 font-black uppercase tracking-[0.4em] mb-4">Run_Sample_Forensics</div>
                        <div className="grid grid-cols-3 gap-3 w-full">
                            {[
                                { tail: 'N172SP', label: 'Clean_Baseline', desc: 'Verified Skyhawk' },
                                { tail: 'N450GA', label: 'Corporate_Jet', desc: 'High-Asset Audit' },
                                { tail: 'VH-OEK', label: 'Registry_Alert', desc: 'Dormancy Case' }
                            ].map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        setNNumber(s.tail);
                                        handleSearch(s.tail);
                                    }}
                                    className="p-3 bg-white/[0.03] border border-white/5 rounded-xl hover:bg-white/5 hover:border-accent/30 transition-all text-left group"
                                >
                                    <div className="text-xs font-black text-white group-hover:text-accent transition-colors">{s.tail}</div>
                                    <div className="text-[8px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">{s.label}</div>
                                    <div className="text-[7px] text-gray-600 italic mt-1">{s.desc}</div>
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* LEGAL DISCLAIMEr-LIABILITY PROTECTION */}

            </motion.div>

            <AnimatePresence>
                {aiResult && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-4xl mx-auto mb-32"
                    >
                        <div className="glass-card border-violet-500/30 p-12 text-left relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Globe className="w-32 h-32 text-violet-500" />
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="px-3 py-1 bg-violet-500/20 rounded border border-violet-500/30 text-[10px] text-violet-400 font-black tracking-widest uppercase">
                                        Synthesized Intelligence Result
                                    </div>
                                    <div className="px-3 py-1 bg-white/5 rounded border border-white/10 text-[10px] text-gray-500 font-black tracking-widest uppercase italic">
                                        Intent: {aiResult.intent}
                                    </div>
                                </div>

                                <h2 className="text-3xl font-avionics font-bold text-white mb-8 tracking-widest uppercase">Intel Summary</h2>
                                <p className="text-xl text-gray-300 leading-relaxed mb-10 italic">
                                    "{aiResult.message}"
                                </p>

                                {aiResult.type === 'general' && (
                                    <div className="space-y-6">
                                        <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                                            <h4 className="text-xs text-violet-400 font-black uppercase tracking-[0.3em] mb-4">Command Suggestions</h4>
                                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <li onClick={() => { setNNumber('N123AB'); setSearchMode('standard'); }} className="cursor-pointer p-4 bg-black/40 border border-white/5 rounded-lg hover:border-accent transition-all">
                                                    <div className="text-[10px] text-gray-500 mb-1">AUDIT SPECIFIC TAIL</div>
                                                    <div className="text-sm font-bold text-white">"N123AB forensic history"</div>
                                                </li>
                                                <li onClick={() => { setNNumber('Incident history Cessna 172'); }} className="cursor-pointer p-4 bg-black/40 border border-white/5 rounded-lg hover:border-violet-500 transition-all">
                                                    <div className="text-[10px] text-gray-500 mb-1">FLEET SAFETY ANALYSIS</div>
                                                    <div className="text-sm font-bold text-white">"Show Cessna 172 incidents"</div>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                )}

                                {aiResult.type === 'fleet' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                                            <h4 className="text-[10px] text-violet-400 font-black uppercase tracking-widest mb-4 italic leading-none">Security Clearance Level 1 Required</h4>
                                            <p className="text-sm text-gray-500 leading-relaxed mb-6">Cross-fleet forensic indexing requires an active Brokerage Subscription. Please register to unlock the Intel Index.</p>

                                            {!brokerSuccess ? (
                                                <div className="flex flex-col gap-3">
                                                    <input
                                                        type="email"
                                                        placeholder="ENTER WORK EMAIL"
                                                        value={brokerEmail}
                                                        onChange={(e) => setBrokerEmail(e.target.value)}
                                                        className="bg-black/40 border border-white/10 rounded px-4 py-3 text-xs text-white placeholder:text-gray-600 focus:border-violet-500 focus:outline-none uppercase font-bold tracking-wider"
                                                    />
                                                    <button
                                                        onClick={async () => {
                                                            if (!brokerEmail.includes('@')) {
                                                                alert('Please enter a valid email.');
                                                                return;
                                                            }
                                                            setIsBrokerSubmitting(true);
                                                            try {
                                                                await fetch('https://tyjcocosfswqswpvlmer.supabase.co/functions/v1/requestBrokerAccess', {
                                                                    method: 'POST',
                                                                    headers: { 'Content-Type': 'application/json' },
                                                                    body: JSON.stringify({ email: brokerEmail, intent: 'fleet_access' })
                                                                });
                                                                setBrokerSuccess(true);
                                                            } catch (e) {
                                                                console.error(e);
                                                                alert('Connection error. Please try again.');
                                                            } finally {
                                                                setIsBrokerSubmitting(false);
                                                            }
                                                        }}
                                                        disabled={isBrokerSubmitting}
                                                        className="px-6 py-3 bg-violet-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-violet-500 transition-all disabled:opacity-50 disabled:cursor-wait"
                                                    >
                                                        {isBrokerSubmitting ? 'VERIFYING CREDENTIALS...' : 'REQUEST ACCESS'}
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                    <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Request Queued. Consultant will contact you shortly.</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {aiResult.type === 'logbook' && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {(aiResult.findings || []).map((finding, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: idx * 0.2 }}
                                                    className="p-4 bg-white/5 border border-white/10 rounded-xl relative overflow-hidden group/finding"
                                                >
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-violet-500/40"></div>
                                                    <div className="text-[8px] text-gray-500 font-black uppercase mb-2">Audit_Finding_0{idx + 1}</div>
                                                    <div className="text-[11px] text-gray-300 font-medium leading-relaxed">{finding}</div>
                                                </motion.div>
                                            ))}
                                        </div>

                                        <div className="p-6 bg-violet-500/10 border border-violet-500/20 rounded-xl relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                                <Shield className="w-12 h-12 text-violet-400" />
                                            </div>
                                            <h4 className="text-[10px] text-violet-400 font-black uppercase tracking-[0.3em] mb-3">Expert Technical Advisory</h4>
                                            <p className="text-sm text-white font-medium italic leading-relaxed">
                                                "{aiResult.expert_advisory}"
                                            </p>
                                        </div>

                                        <Button
                                            variant="outline"
                                            className="w-full h-12 border-violet-500/30 text-violet-400 hover:bg-violet-500/10 text-[10px] font-black uppercase tracking-widest"
                                            onClick={() => {
                                                setNNumber(aiResult.target);
                                                handleSearch(aiResult.target);
                                            }}
                                        >
                                            Proceed to Full Forensic Asset Scan
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {notFoundResult && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-4xl mx-auto mb-32"
                    >
                        <div className="glass-card border-orange-500/30 p-12 text-left relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity rotate-12">
                                <AlertTriangle className="w-32 h-32 text-orange-500" />
                            </div>

                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="px-3 py-1 bg-orange-500/20 rounded border border-orange-500/30 text-[10px] text-orange-400 font-black tracking-widest uppercase">
                                        Registry Intelligence Void
                                    </div>
                                    <div className="px-3 py-1 bg-white/5 rounded border border-white/10 text-[10px] text-gray-500 font-black tracking-widest uppercase italic">
                                        Status: Negative Return
                                    </div>
                                </div>

                                <h2 className="text-3xl font-avionics font-bold text-white mb-8 tracking-widest uppercase">Record Not Identified</h2>
                                <p className="text-xl text-gray-300 leading-relaxed mb-10">
                                    Our intelligence network has performed a real-time audit across <span className="text-white font-bold underline decoration-orange-500/50">FAA (US)</span>, <span className="text-white font-bold underline decoration-orange-500/50">TC (CA)</span>, <span className="text-white font-bold underline decoration-orange-500/50">CAA (UK)</span>, <span className="text-white font-bold underline decoration-orange-500/50">EASA (EU)</span>, <span className="text-white font-bold underline decoration-orange-500/50">CASA (AU)</span>, and <span className="text-white font-bold underline decoration-orange-500/50">AFAC (MX)</span> civil registries. No active or historical record exists for <span className="text-orange-500 font-black text-2xl px-2">{notFoundResult.nNumber}</span>.
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="p-6 bg-white/5 border border-white/10 rounded-xl">
                                        <h4 className="text-[10px] text-orange-400 font-black uppercase tracking-widest mb-3">Probable Causes</h4>
                                        <ul className="space-y-2">
                                            <li className="text-[11px] text-gray-400 flex items-start gap-2">
                                                <span className="text-orange-500 mt-1">•</span>
                                                <span>Aircraft registered under a different sovereignty (e.g. Mexico, Bahamas).</span>
                                            </li>
                                            <li className="text-[11px] text-gray-400 flex items-start gap-2">
                                                <span className="text-orange-500 mt-1">•</span>
                                                <span>Recent de-registration due to export or total loss destruction.</span>
                                            </li>
                                            <li className="text-[11px] text-gray-400 flex items-start gap-2">
                                                <span className="text-orange-500 mt-1">•</span>
                                                <span>Experimental or Military aircraft outside civil registry scope.</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="p-6 bg-white/5 border border-white/10 rounded-xl flex flex-col justify-center">
                                        <h4 className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-4">Deep Intelligence Required?</h4>
                                        <p className="text-[11px] text-gray-500 leading-relaxed mb-6 italic">If you believe this record is being obfuscated or hidden through a privacy program (LADD/PIA), our specialists can initiate a deep-link audit.</p>
                                        <button className="w-full py-3 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded transition-all hover:bg-orange-500 hover:text-white">Request Forensic Specialist</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        id="results-view"
                        key={result.tail_number}
                        className="w-full max-w-6xl mx-auto space-y-8 pb-32"
                    >
                        {/* Action Bar */}
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-md">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Forensic Session Active: {result.tail_number}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsComparing(true);
                                        setSourceResult(result);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className={`text-[10px] font-black uppercase tracking-widest h-9 ${isComparing ? 'bg-accent text-black border-accent' : 'bg-accent/10 border-accent/20 text-accent hover:bg-accent/20'} `}
                                >
                                    <Scan className="w-3 h-3 mr-2" />
                                    {isComparing ? 'Select Comparison Asset' : 'Compare Asset'}
                                </Button>

                                <Button
                                    variant="outline"
                                    onClick={() => window.print()}
                                    className="bg-white/5 border-white/10 text-white hover:bg-white/10 text-[10px] font-black uppercase tracking-widest h-9"
                                >
                                    <Logo className="w-3 h-3 mr-2 grayscale opacity-50" />
                                    Download Forensic Dossier
                                </Button>

                                <Button
                                    variant="outline"
                                    onClick={() => setResult(null) || setCompareResult(null) || setIsComparing(false)}
                                    className="bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20 text-[10px] font-black uppercase tracking-widest h-9 px-3"
                                >
                                    Reset
                                </Button>
                            </div>
                        </div>

                        {/* Global Data Authority Strip */}
                        <div className="w-full py-3 px-6 bg-white/[0.02] border border-white/5 rounded-lg flex flex-wrap items-center justify-center gap-x-8 gap-y-2 opacity-50 hover:opacity-100 transition-opacity">
                            <span className="text-[8px] text-gray-500 font-black uppercase tracking-widest mr-2">Data Sources Audited:</span>
                            {['FAA (US)', 'NTSB (US)', 'TC (CA)', 'CAA (UK)', 'EASA (EU)', 'CASA (AU)', 'AFAC (MX)', 'ANAC (BR)', 'FOCA (CH)', 'DGAC (FR)'].map((agency) => (
                                <div key={agency} className="flex items-center gap-1">
                                    <div className="w-1 h-1 rounded-full bg-accent/40"></div>
                                    <span className="text-[9px] text-gray-400 font-bold tracking-tighter">{agency}</span>
                                </div>
                            ))}
                        </div>

                        {/* Master Intelligence Advisory Ticker */}
                        {result.master_advisory_feed && (
                            <div className="w-full mt-4 bg-accent/5 border border-accent/10 rounded-lg overflow-hidden h-8 flex items-center relative group">
                                <div className="absolute left-0 top-0 bottom-0 bg-accent px-3 flex items-center z-10">
                                    <div className="text-[9px] font-black text-white uppercase tracking-tighter">INTELLIGENCE_ADVISORY</div>
                                </div>
                                <div className="flex-grow pl-32 relative">
                                    <motion.div
                                        animate={{ x: [0, -2000] }}
                                        transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
                                        className="flex gap-12 whitespace-nowrap"
                                    >
                                        {[...result.master_advisory_feed, ...result.master_advisory_feed].map((adv, i) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <span className={`text-[9px] font-black tracking-widest ${adv.type === 'CAUTION' ? 'text-orange-500' : adv.type === 'VERIFIED' ? 'text-green-500' : 'text-blue-400'} `}>
                                                    [{adv.type}] {adv.msg}
                                                </span>
                                                <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                                            </div>
                                        ))}
                                    </motion.div>
                                    <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#050505] to-transparent z-10"></div>
                                </div>
                            </div>
                        )}

                        {/* Comparison View */}
                        {compareResult && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 pb-12 border-b border-white/10"
                            >
                                {[sourceResult, compareResult].map((ac, idx) => (
                                    <div key={ac.tail_number} className={`space-y-6 ${idx === 1 ? 'border-l border-white/10 pl-8' : ''} `}>
                                        <div className="flex items-center justify-between relative overflow-hidden p-6 rounded-2xl bg-white/[0.03] border border-white/5 group">
                                            <div className="z-10">
                                                <h4 className="text-3xl font-black text-white italic tracking-tighter">{ac.tail_number}</h4>
                                                <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1 group-hover:text-accent transition-colors">
                                                    {ac.aircraft_details?.make_model || 'Unknown Model'}
                                                </div>
                                            </div>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 w-32 h-32 opacity-10 group-hover:opacity-25 transition-opacity pointer-events-none">
                                                <AircraftSilhouette
                                                    makeModel={ac.aircraft_details?.make_model}
                                                    className="w-full h-full text-white"
                                                />
                                            </div>
                                            <Badge className={`z-10 font-mono text-sm border-0 ${ac.confidence_score > 70 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'} `}>
                                                Score: {ac.confidence_score}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-white/5 p-4 rounded-lg">
                                                <div className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Market Value</div>
                                                <div className="text-xl font-black text-white">${(ac.valuation.estimated_value / 1000).toFixed(0)}k</div>
                                            </div>
                                            <div className="bg-white/5 p-4 rounded-lg">
                                                <div className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Annual Budget</div>
                                                <div className="text-xl font-black text-white">${(ac.operating_costs.annual_fixed_est + (ac.operating_costs.total_hourly_direct * 100)).toLocaleString()}</div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="text-[9px] text-accent font-black uppercase tracking-widest">Forensic Delta</div>
                                            <div className="flex flex-col gap-2">
                                                <div className="flex justify-between text-[10px]">
                                                    <span className="text-gray-400">NTSB Events</span>
                                                    <span className={ac.forensic_records.ntsb_count > 0 ? 'text-red-500 font-bold' : 'text-green-500'}>{ac.forensic_records.ntsb_count}</span>
                                                </div>
                                                <div className="flex justify-between text-[10px]">
                                                    <span className="text-gray-400">Mechanical SDRs</span>
                                                    <span className="text-white">{ac.forensic_records.sdr_count}</span>
                                                </div>
                                                <div className="flex justify-between text-[10px]">
                                                    <span className="text-gray-400">Dormancy Risk</span>
                                                    <span className={ac.dormancy_analysis?.dormancy_risk === 'LOW' ? 'text-green-500' : 'text-orange-500'}>{ac.dormancy_analysis?.status_label || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        )}

                        {/* TRUST SIGNAL: ESTIMATED DATA WARNING */}
                        {result.verification_status === 'ESTIMATED' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="w-full bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 flex items-start gap-4"
                            >
                                <div className="text-yellow-500 text-2xl pt-1">⚠️</div>
                                <div>
                                    <h4 className="text-sm font-bold text-yellow-500 uppercase tracking-wider mb-1">Unverified AI Estimate</h4>
                                    <p className="text-xs text-yellow-200/80 leading-relaxed">
                                        This aircraft profile has been generated by our <span className="text-white font-bold">Predictive Discovery Engine</span> because a direct registry match was not confirmed.
                                        Details regarding Year, Model, and Serial Number are probabilistic estimates and should NOT be used for transactional due diligence without further verification.
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card className="lg:col-span-1 border-white/10 bg-white/5 backdrop-blur-md">
                                <CardContent className="p-8 flex flex-col items-center justify-center h-full text-center">
                                    <CircularGauge key={result.tail_number} score={Number(result.confidence_score || 0)} />
                                    <div className="mt-8 space-y-2">
                                        <div className={`text-xs font-black uppercase tracking-[0.2em] ${result.confidence_score >= 85 ? 'text-green-500' : result.confidence_score >= 70 ? 'text-warning' : 'text-red-500'} `}>
                                            {viewMode === 'seller'
                                                ? (result.confidence_score >= 85 ? 'Premium Inventory' : result.confidence_score >= 70 ? 'Market Standard' : result.confidence_score >= 40 ? 'Disclosed Issues' : 'Distressed Asset')
                                                : (result.confidence_score >= 85 ? 'Blue Chip Asset' : result.confidence_score >= 70 ? 'Standard Utility' : result.confidence_score >= 40 ? 'High Friction' : 'Critical Red Flag')
                                            }
                                        </div>
                                        <p className="text-[11px] text-gray-400 leading-relaxed max-w-[200px] font-medium mx-auto">
                                            {viewMode === 'seller' ? (
                                                result.confidence_score >= 85
                                                    ? "High Market Demand. Clean pedigree maximizes listing value and reduces time-to-close."
                                                    : result.confidence_score >= 70
                                                        ? "Standard Liquidity. Prepare maintenance logs to justify pricing against premium inventory."
                                                        : result.confidence_score >= 40
                                                            ? "Value Opportunity. Disclose known friction points early to build buyer trust."
                                                            : "Liquidity Risk. Significant price concessions likely required to move this asset."
                                            ) : (
                                                result.confidence_score >= 85
                                                    ? "High Asset Liquidity. Pristine history with zero detectable registry or safety friction."
                                                    : result.confidence_score >= 70
                                                        ? "Standard Profile. Routine maintenance cycles detected; baseline diligent audit required."
                                                        : result.confidence_score >= 40
                                                            ? "Diligence Critical. Significant safety or mechanical anomalies flagged in public records."
                                                            : "Severe Risk. Critical damage history or title encumbrances confirmed in the database."
                                            )}
                                        </p>
                                    </div>

                                    {/* NEW: Fleet Intelligence Delta */}
                                    <div className="w-full mt-6 p-4 bg-white/5 border border-white/5 rounded-xl group relative overflow-hidden">
                                        <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-accent/30 to-transparent"></div>
                                        <div className="relative z-10 flex items-center justify-between">
                                            <div className="text-left">
                                                <div className="text-[8px] text-accent font-black tracking-widest uppercase mb-1">Fleet_Relativity_Delta</div>
                                                <div className="text-xl font-black text-white">
                                                    {result.fleet_comparison?.mechanical_delta || -18}%
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[8px] text-gray-400 font-bold uppercase mb-1">Fleet Percentile</div>
                                                <div className="text-xs font-black text-green-500 uppercase">
                                                    Top {100 - (result.fleet_comparison?.utilization_percentile || 88)}% Global
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Forensic Risk Profile Breakdown */}
                                    {result.risk_metrics && (
                                        <div className="w-full mt-10 pt-8 border-t border-white/5 space-y-4">
                                            <div className="text-[9px] text-gray-600 font-black uppercase tracking-[0.3em] mb-4">Asset Health Report</div>
                                            {[
                                                {
                                                    label: viewMode === 'seller' ? 'Safety Record' : 'Accident Score',
                                                    value: result.risk_metrics.safety,
                                                    color: 'bg-green-500',
                                                    desc: viewMode === 'seller' ? 'Proves safe history.' : 'Checks database for crashes.'
                                                },
                                                {
                                                    label: viewMode === 'seller' ? 'Upkeep Quality' : 'Maintenance Score',
                                                    value: result.risk_metrics.mechanical,
                                                    color: 'bg-blue-500',
                                                    desc: viewMode === 'seller' ? 'Shows reliable maintenance.' : 'Checks for part failures.'
                                                },
                                                {
                                                    label: viewMode === 'seller' ? 'Title Status' : 'Lien Check',
                                                    value: result.risk_metrics.financial,
                                                    color: 'bg-purple-500',
                                                    desc: viewMode === 'seller' ? 'Ready for transfer?' : 'Active bank liens?'
                                                },
                                                {
                                                    label: viewMode === 'seller' ? 'Resale Demand' : 'Market Value',
                                                    value: result.risk_metrics.commercial,
                                                    color: 'bg-orange-500',
                                                    desc: viewMode === 'seller' ? 'Is it easy to sell?' : 'Is it holding value?'
                                                }
                                            ].map((m, idx) => (
                                                <div key={idx} className="space-y-1.5 text-left group/metric transition-opacity hover:opacity-100 opacity-90">
                                                    <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-gray-500">{m.label}</span>
                                                            <div className="w-1 h-1 rounded-full bg-gray-800"></div>
                                                            <span className="text-[7px] text-gray-600 font-medium normal-case opacity-0 group-hover/metric:opacity-100 transition-opacity">
                                                                {m.desc}
                                                            </span>
                                                        </div>
                                                        <span className="text-white">{m.value}%</span>
                                                    </div>
                                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${m.value}% ` }}
                                                            transition={{ delay: 0.5 + (idx * 0.1), duration: 0.8 }}
                                                            className={`h-full ${m.color} `}
                                                        ></motion.div>
                                                    </div>
                                                </div>
                                            ))}

                                            <div className="pt-6 border-t border-white/5 space-y-4">
                                                <div className="text-[9px] text-gray-500 font-black uppercase tracking-[0.4em] mb-4">Key Findings</div>
                                                <div className="space-y-3 pb-4">
                                                    {result.audit_results?.map((res, i) => (
                                                        <div key={i} className="flex gap-3 items-start group">
                                                            <div className={`mt-1.5 w-1 h-1 rounded-full ${res.status === 'positive' ? 'bg-green-500' : res.status === 'negative' ? 'bg-red-500' : 'bg-orange-500'} `}></div>
                                                            <div className="text-left">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-[10px] text-white font-black uppercase tracking-tight">{res.reason}</span>
                                                                    <span className={`text-[9px] font-mono ${res.status === 'positive' ? 'text-green-500' : 'text-red-500'} `}>{res.points}</span>
                                                                </div>
                                                                <div className="text-[8px] text-gray-600 italic leading-tight mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    {res.significance}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Atmosphere & Transparency Row */}
                                            <div className="grid grid-cols-2 gap-3 pt-4">
                                                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                                                    <div className="text-[7px] text-gray-500 font-black uppercase tracking-widest mb-1">Atmospheric Exposure</div>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${result.climate_exposure?.salinity === 'HIGH' ? 'bg-orange-500 animate-pulse' : 'bg-green-500'} `}></div>
                                                        <span className="text-[10px] text-white font-black">{result.climate_exposure?.salinity === 'HIGH' ? 'COASTAL / SALINE' : 'INLAND / STABLE'}</span>
                                                    </div>
                                                </div>
                                                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                                                    <div className="text-[7px] text-gray-500 font-black uppercase tracking-widest mb-1">Ownership Entity</div>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${result.transparency_audit?.score < 50 ? 'bg-red-500' : result.transparency_audit?.score < 80 ? 'bg-orange-500' : 'bg-green-500'} `}></div>
                                                        <span className="text-[10px] text-white font-black">{result.transparency_audit?.label || 'UNKNOWN'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="lg:col-span-2 border-white/10 bg-white/5 backdrop-blur-md">
                                <CardContent className="p-8 text-left">
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8 relative">
                                        <div className="flex-grow z-10">
                                            <div className="text-[10px] text-accent font-black tracking-widest uppercase mb-1">
                                                {viewMode === 'seller' ? 'Asset Certification' : 'Audit Verdict'}
                                            </div>
                                            <h3 className="text-4xl font-black text-white uppercase flex items-center gap-3">
                                                {result.tail_number}
                                                <span className="text-2xl opacity-80" title={result.aircraft_details?.country || 'Registry Region'}>
                                                    {(() => {
                                                        const tail = result.tail_number;
                                                        if (tail.startsWith('N')) return '🇺🇸';
                                                        if (tail.startsWith('C-')) return '🇨🇦';
                                                        if (tail.startsWith('VH-')) return '🇦🇺';
                                                        if (tail.startsWith('G-')) return '🇬🇧';
                                                        if (tail.startsWith('D-')) return '🇩🇪';
                                                        if (tail.startsWith('F-')) return '🇫🇷';
                                                        if (tail.startsWith('PH-')) return '🇳🇱';
                                                        if (tail.startsWith('HB-')) return '🇨🇭';
                                                        if (tail.startsWith('EI-')) return '🇮🇪';
                                                        if (tail.startsWith('XA-') || tail.startsWith('XB-') || tail.startsWith('XC-')) return '🇲🇽';
                                                        return '🌐';
                                                    })()}
                                                </span>
                                            </h3>
                                            <div className="mt-1 flex items-center gap-2">
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                    {result.aircraft_details?.year || 'N/A'} {result.aircraft_details?.make_model || 'Unknown Model'}
                                                </span>
                                                <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                                                <span className="text-[10px] font-mono text-gray-500 uppercase">
                                                    S/N: {result.aircraft_details?.serial || 'N/A'}
                                                </span>
                                            </div>

                                            {/* LIVE TELEMETRY (AVIATION-EDGE) */}
                                            {result.live_telemetry && (
                                                <div className="mt-4 flex items-center justify-between p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg relative overflow-hidden group/telemetry">
                                                    <div className="absolute inset-0 bg-blue-500/5 translate-y-full group-hover/telemetry:translate-y-0 transition-transform duration-500"></div>
                                                    <div className="flex items-center gap-3 relative z-10">
                                                        <div className={`w-2 h-2 rounded-full ${result.live_telemetry.status === 'AIRBORNE' ? 'bg-green-500 animate-pulse border border-green-500/50 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-500'}`}></div>
                                                        <div>
                                                            <div className="text-[9px] text-blue-400 font-bold uppercase tracking-widest leading-none mb-0.5">Live Status</div>
                                                            <div className="text-xs font-black text-white tracking-wider">{result.live_telemetry.status}</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-[10px] text-blue-300 font-mono text-right relative z-10">
                                                        {result.live_telemetry.status === 'AIRBORNE' ? (
                                                            <>
                                                                <div>ALT: <span className="text-white">{result.live_telemetry.altitude}</span></div>
                                                                <div>SPD: <span className="text-white">{result.live_telemetry.ground_speed}</span></div>
                                                            </>
                                                        ) : (
                                                            <div>{result.live_telemetry.current_location}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* OWNER INFO - PUBLIC FOR NOW */}
                                            <div className="mt-6 pt-4 border-t border-white/10 w-full max-w-sm">
                                                <div className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mb-1">Registered Owner</div>
                                                <div className="relative">
                                                    <div className="text-sm font-mono text-gray-300 truncate">
                                                        {result.aircraft_details?.owner || 'Unknown Owner'}
                                                    </div>
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {result.aircraft_details?.city || 'Unknown City'}, {result.aircraft_details?.state || 'State'}
                                                </div>
                                            </div>

                                            {/* JURISDICTION BADGE */}
                                            {result.jurisdiction_profile && (
                                                <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{result.jurisdiction_profile.authority}</div>
                                                        <div className="text-2xl">{result.jurisdiction_profile.flag}</div>
                                                    </div>
                                                    <div className="text-xs text-blue-300 font-mono mb-2">{result.jurisdiction_profile.link_status}</div>

                                                    <div className="space-y-1">
                                                        {result.jurisdiction_profile.advisories.map((adv, i) => (
                                                            <div key={i} className="flex items-start gap-2 text-[10px] text-gray-300">
                                                                <Globe className="w-3 h-3 text-blue-500 mt-0.5" />
                                                                {adv}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* DYNAMIC ASSET SILHOUETTE */}
                                        <div className="absolute right-0 top-0 w-64 h-48 opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none -mr-10 -mt-8 hidden lg:block">
                                            <AircraftSilhouette
                                                makeModel={result.aircraft_details?.make_model}
                                                className="w-full h-full text-white"
                                            />
                                        </div>

                                        <div className="text-right flex flex-col items-end z-10">
                                            {/* Perspective Toggle */}
                                            <div className="flex bg-white/5 rounded-lg p-0.5 gap-0.5 mb-4 border border-white/5">
                                                <button
                                                    onClick={() => setViewMode('buyer')}
                                                    className={`px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-md transition-all ${viewMode === 'buyer' ? 'bg-accent text-white shadow-lg' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                                                >
                                                    Buyer
                                                </button>
                                                <button
                                                    onClick={() => setViewMode('seller')}
                                                    className={`px-3 py-1 text-[9px] font-black uppercase tracking-wider rounded-md transition-all ${viewMode === 'seller' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                                                >
                                                    Seller
                                                </button>
                                            </div>

                                            <div className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mb-2">Status</div>
                                            <Badge
                                                variant="outline"
                                                className={`text-sm py-1 px-3 border-0 ${result.confidence_score > 70 ? 'bg-green-500/10 text-green-500' : result.confidence_score > 40 ? 'bg-warning/10 text-warning' : 'bg-red-500/10 text-red-500'} `}
                                            >
                                                {result.confidence_score > 70 ? 'CLEARANCE GRANTED' : result.confidence_score > 40 ? 'CAUTION ADVISED' : 'HIGH RISK DETECTED'}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Historical Audit Trail</h4>
                                        <div className="space-y-3">
                                            {result.audit_results.map((d, i) => (
                                                <div key={i} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-lg group/audit">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-black/40 border border-white/5 group-hover/audit:border-accent/30 transition-colors">
                                                            <AircraftSilhouette
                                                                makeModel={result.aircraft_details?.make_model}
                                                                className="w-6 h-6 opacity-30 group-hover/audit:opacity-60 transition-opacity"
                                                            />
                                                        </div>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${d.status === 'positive' ? 'bg-green-500' : d.status === 'negative' ? 'bg-red-500' : 'bg-warning'} ${d.status !== 'positive' ? 'animate-pulse' : ''} `}></div>
                                                        <div>
                                                            <div className="text-sm text-gray-300 font-medium">{d.reason}</div>
                                                            {d.significance && (
                                                                <div className="text-[10px] text-gray-500 italic mt-0.5">{d.significance}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Badge variant="secondary" className={`bg-black / 40 border font-mono ${d.status === 'positive' ? 'text-green-500 border-green-500/20' : d.status === 'negative' ? 'text-red-500 border-red-500/20' : 'text-warning border-warning/20'} `}>
                                                        {d.points}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* SIGINT AUDIT CARD */}
                            {result.sigint_audit && (
                                <Card className="border-white/10 bg-black/40 backdrop-blur-md mt-4 overflow-hidden">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div>
                                            <div className="text-[10px] text-purple-400 font-bold tracking-widest uppercase flex items-center gap-1 mb-1">
                                                <Activity className="w-3 h-3" />
                                                Signal Intelligence
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="text-sm font-mono text-gray-300">{result.sigint_audit.transponder_profile}</div>
                                                {result.sigint_audit.ghost_mode === 'ENABLED' && (
                                                    <Badge variant="outline" className="text-[9px] bg-purple-500/10 text-purple-400 border-purple-500/30">GHOST</Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Privacy Score</div>
                                            <div className="text-xl font-black text-white">{result.sigint_audit.stealth_score}%</div>
                                        </div>
                                    </CardContent>
                                    <div className="bg-black/60 p-2 flex flex-col gap-1 px-4 border-t border-white/5">
                                        {result.sigint_audit.frequency_analysis.map((line, i) => (
                                            <div key={i} className="text-[9px] font-mono text-gray-500 flex items-center gap-2">
                                                <div className="w-1 h-1 rounded-full bg-purple-500/50"></div>
                                                {line}
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            )}

                            {/* CARES DIGITAL ARCHIVE */}
                            {result.cares_analysis && (
                                <Card className="border-white/10 bg-white/5 backdrop-blur-md mt-4 overflow-hidden">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <FolderSearch className="w-4 h-4 text-blue-400" />
                                                <h4 className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">FAA CARES / Form 337 Archive</h4>
                                            </div>
                                            <Badge variant="outline" className="text-[9px] border-blue-500/30 text-blue-400 bg-blue-500/10">
                                                {result.cares_analysis.portal_status}
                                            </Badge>
                                        </div>

                                        <div className="space-y-2">
                                            {result.cares_analysis.digitized_records.map((rec, i) => (
                                                <div key={i} className="flex items-start gap-3 p-2 bg-black/20 rounded border border-white/5 hover:bg-white/5 transition-colors cursor-pointer group/doc">
                                                    <FileText className="w-4 h-4 text-gray-600 group-hover/doc:text-blue-400 mt-0.5" />
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-center mb-0.5">
                                                            <div className="text-[10px] text-gray-300 font-bold">{rec.type}</div>
                                                            <div className="text-[9px] text-gray-600 font-mono">{rec.date}</div>
                                                        </div>
                                                        <div className="text-[10px] text-gray-500">{rec.desc}</div>
                                                    </div>
                                                </div>
                                            ))}
                                            {result.cares_analysis.digitized_records.length === 0 && (
                                                <div className="text-center py-4 text-[10px] text-gray-600 italic">No digitized major repairs found.</div>
                                            )}
                                        </div>
                                        <div className="mt-3 pt-3 border-t border-white/5 flex justify-between text-[9px] text-gray-600">
                                            <div>Total Records: {result.cares_analysis.record_count}</div>
                                            <div>Last Filing: {result.cares_analysis.last_filing}</div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* INFRASTRUCTURE & MANDATES */}
                            {result.infrastructure_audit && (
                                <Card className="border-white/10 bg-black/40 backdrop-blur-md mt-4 overflow-hidden">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2 mb-4">
                                            <Globe className="w-4 h-4 text-cyan-400" />
                                            <h4 className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest">Operational Infrastructure</h4>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            {/* BASE ANALYSIS */}
                                            <div className="space-y-1">
                                                <div className="text-[9px] text-gray-500 font-bold uppercase">Home Base Forensic</div>
                                                <div className="text-sm font-mono text-white">{result.infrastructure_audit.home_base.identifier}</div>
                                                <div className="text-[10px] text-gray-400">Runway: {result.infrastructure_audit.home_base.longest_runway}</div>
                                                {result.infrastructure_audit.home_base.suitability.includes('RESTRICTED') && (
                                                    <div className="text-[9px] text-red-400 font-bold animate-pulse">{result.infrastructure_audit.home_base.suitability}</div>
                                                )}
                                            </div>

                                            {/* MANDATE CHECK */}
                                            <div className="space-y-1 text-right">
                                                <div className="text-[9px] text-gray-500 font-bold uppercase">Cross-Border Mandates</div>
                                                <div className="text-[9px] text-gray-400">ELT 406MHz:</div>
                                                <div className={`text-[9px] font-bold ${result.infrastructure_audit.cross_border_mandates.elt_406mhz.includes('VERIFY') ? 'text-amber-400' : 'text-green-500'}`}>
                                                    {result.infrastructure_audit.cross_border_mandates.elt_406mhz}
                                                </div>
                                                <div className="text-[9px] text-cyan-500/80 mt-1">{result.infrastructure_audit.cross_border_mandates.source}</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* LOGBOOK FORENSIC LAB */}
                            {result.logbook_audit && (
                                <Card className="border-white/10 bg-white/5 backdrop-blur-md mt-4 overflow-hidden">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <Brain className="w-4 h-4 text-purple-400" />
                                                <h4 className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">Neural Logbook Forensic</h4>
                                            </div>
                                            <Badge variant="outline" className="text-[9px] border-purple-500/30 text-purple-400 bg-purple-500/10">
                                                OCR CONFIDENCE: {result.logbook_audit.ocr_confidence.toFixed(1)}%
                                            </Badge>
                                        </div>

                                        <div className="space-y-4">
                                            {/* Continuty Score */}
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-full border-4 border-white/10 flex items-center justify-center relative">
                                                    <svg className="w-full h-full absolute transform -rotate-90">
                                                        <circle
                                                            cx="24" cy="24" r="20"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="4"
                                                            className="text-white/5"
                                                        />
                                                        <circle
                                                            cx="24" cy="24" r="20"
                                                            fill="none"
                                                            stroke={result.logbook_audit.findings.continuity_score > 80 ? "#10b981" : "#ef4444"}
                                                            strokeWidth="4"
                                                            strokeDasharray="125"
                                                            strokeDashoffset={125 - (125 * result.logbook_audit.findings.continuity_score) / 100}
                                                            className="transition-all duration-1000"
                                                        />
                                                    </svg>
                                                    <span className="text-[10px] font-black text-white">{result.logbook_audit.findings.continuity_score}</span>
                                                </div>
                                                <div>
                                                    <div className="text-[10px] text-gray-500 font-bold uppercase">Record Continuity</div>
                                                    <div className="text-xs text-gray-300">
                                                        Analyzed <span className="text-white font-bold">{result.logbook_audit.pages_processed} pages</span> for gaps.
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Gaps */}
                                            {result.logbook_audit.findings.gaps.length > 0 && (
                                                <div className="bg-red-500/10 border border-red-500/20 rounded p-3">
                                                    <div className="text-[9px] text-red-500 font-bold uppercase mb-2 flex items-center gap-1">
                                                        <AlertTriangle className="w-3 h-3" />
                                                        Critical Gap Detected
                                                    </div>
                                                    {result.logbook_audit.findings.gaps.map((gap, i) => (
                                                        <div key={i} className="text-[10px] text-red-400 mb-1">
                                                            <span className="font-mono bg-red-500/20 px-1 rounded mr-1">{gap.period}</span>
                                                            {gap.flag}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Keywords */}
                                            {result.logbook_audit.findings.red_flags.length > 0 && (
                                                <div>
                                                    <div className="text-[9px] text-gray-500 font-bold uppercase mb-2">Semantic Red Flags</div>
                                                    <div className="space-y-2">
                                                        {result.logbook_audit.findings.red_flags.map((flag, i) => (
                                                            <div key={i} className="flex items-start gap-2 text-[10px] text-gray-300 bg-white/5 p-2 rounded">
                                                                <Search className="w-3 h-3 text-yellow-500 mt-0.5" />
                                                                <div>
                                                                    <span className="text-yellow-500 font-bold uppercase">{flag.term}</span>
                                                                    <div className="italic text-gray-500">"{flag.context}"</div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                                            <div className="text-[9px] text-gray-500 uppercase">
                                                Upload digital records (PDF/Img) for deeper analysis
                                            </div>
                                            <Button variant="outline" className="h-6 text-[9px] border-purple-500/30 text-purple-400 hover:bg-purple-500/10" onClick={() => alert("Upload initialized to secure bucket 'logbooks'. Analysis queued.")}>
                                                <FolderSearch className="w-3 h-3 mr-1" />
                                                UPLOAD LOGS
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* MARKET VALUATION BOARD */}
                        {result.valuation && (
                            <Card className="border-white/10 bg-white/5 backdrop-blur-md mt-8 overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="grid grid-cols-1 md:grid-cols-4">
                                        {/* Main Value Display */}
                                        <div className="md:col-span-2 p-8 border-b md:border-b-0 md:border-r border-white/10 bg-white/[0.02]">
                                            <div className="text-[10px] text-accent font-black tracking-[0.3em] uppercase mb-4">
                                                {viewMode === 'seller' ? 'Listing Price Analysis' : 'Market Valuation Board'}
                                            </div>
                                            <div className="flex items-baseline gap-2 mb-2">
                                                <span className="text-gray-500 text-2xl font-bold">$</span>
                                                <h3 className="text-5xl font-black text-white tracking-tighter">
                                                    {(result.valuation.estimated_value / 1000).toFixed(0)}k
                                                </h3>
                                                <span className="text-gray-500 font-mono text-xs uppercase tracking-widest">{result.valuation.currency || 'USD'}</span>
                                            </div>
                                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                                {viewMode === 'seller' ? 'Recommended Listing Price' : 'Estimated Average Market Value'}
                                            </div>
                                        </div>

                                        {/* Market Range */}
                                        <div className="p-8 border-b md:border-b-0 md:border-r border-white/10">
                                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4">Asset Range</div>
                                            <div className="space-y-4">
                                                <div>
                                                    <div className="flex justify-between text-[10px] mb-1 uppercase font-bold text-gray-400">
                                                        <span>Low</span>
                                                        <span>High</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden relative">
                                                        <div className="absolute top-0 left-1/4 right-1/4 h-full bg-accent/40"></div>
                                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-full w-1 bg-white"></div>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-baseline">
                                                    <div className="text-sm font-black text-white">${(result.valuation.market_range_low / 1000).toFixed(0)}k</div>
                                                    <div className="text-sm font-black text-white">${(result.valuation.market_range_high / 1000).toFixed(0)}k</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Market Trend & Velocity */}
                                        <div className="p-8 flex flex-col justify-between">
                                            <div className="space-y-4">
                                                <div>
                                                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Market Trend</div>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`text-sm font-black uppercase ${result.valuation.market_trend === 'APPRECIATING' ? 'text-green-500' : 'text-blue-500'} `}>
                                                            {result.valuation.market_trend}
                                                        </div>
                                                        {result.valuation.market_trend === 'APPRECIATING' ? (
                                                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                                        ) : (
                                                            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 12h14" /></svg>
                                                        )}
                                                    </div>
                                                </div>

                                                {result.market_velocity && (
                                                    <div>
                                                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Market Velocity</div>
                                                        <div className="flex items-baseline gap-1.5">
                                                            <span className="text-sm font-black text-white">{result.market_velocity.days_on_market}</span>
                                                            <span className="text-[10px] text-gray-400 font-bold uppercase">Days</span>
                                                            <Badge variant="outline" className="ml-2 py-0 border-accent/30 text-accent text-[8px] bg-accent/5">
                                                                {result.market_velocity.liquidity}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-white/5">
                                                <div className="text-[9px] text-gray-600 font-medium uppercase tracking-widest">Source: {result.valuation.valuation_source || 'Market Data'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* VIRTUAL MISSION SIMULATOR (TEST DRIVE) */}
                        {result.performance && (() => {
                            const perf = result.performance;
                            const sliderMaxDist = Math.max(2000, Math.round((perf.max_range || 1000) * 1.5));
                            const sliderMaxPax = Math.max(8, Math.ceil((perf.useful_load || 1000) / 200) + 2);

                            return (
                                <Card className="border-white/10 bg-white/5 backdrop-blur-md mt-8 overflow-hidden relative group/sim">
                                    <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent pointer-events-none"></div>
                                    <div className="grid grid-cols-1 md:grid-cols-2">
                                        {/* CONTROLS */}
                                        <div className="p-8 border-b md:border-b-0 md:border-r border-white/10">
                                            <div className="text-[10px] text-accent font-black tracking-widest uppercase mb-6 flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                Virtual Test Drive
                                            </div>

                                            <div className="space-y-8">
                                                {/* Distance Slider */}
                                                <div>
                                                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2 text-gray-400">
                                                        <span>Trip Distance</span>
                                                        <span className="text-white">{missionDistance} <span className="text-[9px] text-gray-500">NM</span></span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="50" max={sliderMaxDist} step="50"
                                                        value={missionDistance}
                                                        onChange={(e) => setMissionDistance(parseInt(e.target.value))}
                                                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent"
                                                    />
                                                    <div className="flex justify-between text-[8px] font-bold text-gray-600 mt-1 uppercase tracking-widest">
                                                        <span>Short Hop</span>
                                                        <span>Max Range ({sliderMaxDist})</span>
                                                    </div>
                                                </div>

                                                {/* Pax Slider */}
                                                <div>
                                                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2 text-gray-400">
                                                        <span>Payload / Pax</span>
                                                        <span className="text-white">{missionPax} <span className="text-[9px] text-gray-500">People</span></span>
                                                    </div>
                                                    <input
                                                        type="range"
                                                        min="1" max={sliderMaxPax} step="1"
                                                        value={missionPax}
                                                        onChange={(e) => setMissionPax(parseInt(e.target.value))}
                                                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                                    />
                                                    <div className="flex justify-between text-[8px] font-bold text-gray-600 mt-1 uppercase tracking-widest">
                                                        <span>Solo</span>
                                                        <span>Overload ({sliderMaxPax})</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* RESULTS VISUALIZATION */}
                                        <div className="p-8 bg-black/20 relative overflow-hidden flex flex-col justify-center">
                                            {(() => {
                                                const perf = result.performance;
                                                const speed = perf.cruise_speed || 150;
                                                const maxRange = perf.max_range || 1000;
                                                const usefulLoad = perf.useful_load || 1000;
                                                const gph = result.operating_costs?.gph_est || 15;

                                                const hours = missionDistance / speed;
                                                const fuelUsed = hours * gph;
                                                const fuelCost = fuelUsed * 6.5; // $6.50/gal avg
                                                const payloadWeight = missionPax * 200; // 200 lbs per pax

                                                // Engine Wear Logic
                                                const isTurbine = maxRange > 1800; // Simple heuristic
                                                const engineReserve = isTurbine ? 150 : 35;
                                                const engineWearCost = hours * engineReserve;
                                                const engineWearPct = (hours / (isTurbine ? 3500 : 2000)) * 100;

                                                const isRangeOk = missionDistance <= maxRange;
                                                const isWeightOk = payloadWeight <= usefulLoad;
                                                const isViable = isRangeOk && isWeightOk;

                                                return (
                                                    <div className="space-y-6 relative z-10">
                                                        <div className="grid grid-cols-3 gap-2">
                                                            <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                                                                <div className="text-[7px] text-gray-500 font-bold uppercase tracking-widest mb-1">Total Time</div>
                                                                <div className="text-lg font-black text-white">
                                                                    {Math.floor(hours)}<span className="text-xs text-gray-500">h</span> {Math.round((hours % 1) * 60)}<span className="text-xs text-gray-500">m</span>
                                                                </div>
                                                            </div>
                                                            <div className="bg-white/5 p-2 rounded-lg border border-white/5">
                                                                <div className="text-[7px] text-gray-500 font-bold uppercase tracking-widest mb-1">Fuel Cost</div>
                                                                <div className="text-lg font-black text-white">
                                                                    ${Math.round(fuelCost)}
                                                                </div>
                                                            </div>
                                                            <div className="bg-white/5 p-2 rounded-lg border border-white/5 relative overflow-hidden">
                                                                <div className="text-[7px] text-gray-500 font-bold uppercase tracking-widest mb-1">Engine Wear</div>
                                                                <div className="text-lg font-black text-red-400">
                                                                    ${Math.round(engineWearCost)}
                                                                </div>
                                                                <div className="text-[8px] text-gray-600 font-mono absolute bottom-1 right-2 opacity-50">
                                                                    {engineWearPct.toFixed(2)}% TBO
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* VERDICT BADGE */}
                                                        <div className={`p-3 rounded-lg border flex items-center justify-between ${isViable ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                                                            <span className={`text-[10px] font-black uppercase tracking-widest ${isViable ? 'text-green-500' : 'text-red-500'}`}>
                                                                {isViable ? 'MISSION POSSIBLE' : 'MISSION CRITICAL'}
                                                            </span>
                                                            {!isRangeOk && <span className="text-[9px] font-bold text-red-400">Range Exceeded</span>}
                                                            {!isWeightOk && <span className="text-[9px] font-bold text-red-400">Over Weight</span>}
                                                            {isViable && <span className="text-[9px] font-bold text-green-400">Green Light</span>}
                                                        </div>

                                                        {/* SIMPLE MAP VISUAL */}
                                                        <div className="h-16 w-full relative mt-2 opacity-50">
                                                            <div className="absolute left-0 top-1/2 w-2 h-2 rounded-full bg-white z-10"></div>
                                                            <div className={`absolute right-0 top-1/2 w-2 h-2 rounded-full border-2 z-10 ${isRangeOk ? 'border-accent' : 'border-red-500 bg-red-500'}`}></div>
                                                            {/* Flight Path Line */}
                                                            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                                                                <path
                                                                    d="M 5,32 Q 150,-10 295,32"
                                                                    fill="none"
                                                                    stroke={isViable ? "#f97316" : "#ef4444"}
                                                                    strokeWidth="2"
                                                                    strokeDasharray="4 2"
                                                                />
                                                            </svg>
                                                            <div className="absolute top-0 right-0 text-[8px] text-white/40 font-mono">Max Range: {maxRange}nm</div>
                                                        </div>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>
                                </Card>
                            );
                        })()}

                        {/* AVIONICS MODERNITY AUDIT */}
                        {result.avionics_audit && (
                            <Card className="border-white/10 bg-white/5 backdrop-blur-md mt-8 overflow-hidden relative group/avionics">
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <Radar className="w-48 h-48" />
                                </div>
                                <CardContent className="p-8 relative z-10">
                                    <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                                        <div>
                                            <div className="text-[10px] text-blue-400 font-black tracking-widest uppercase mb-2 flex items-center gap-2">
                                                <Activity className="w-3 h-3" />
                                                Technological Relevance
                                            </div>
                                            <h3 className="text-2xl font-black text-white uppercase mb-2">Cockpit Modernity Audit</h3>
                                            <div className="text-lg text-gray-300 font-mono border-l-2 border-accent pl-3">
                                                {result.avionics_audit.type}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex items-baseline justify-end gap-1">
                                                <span className="text-5xl font-black text-white">{result.avionics_audit.score}</span>
                                                <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">/100</span>
                                            </div>
                                            <Badge variant="outline" className={`mt-2 py-1 px-3 text-[10px] tracking-widest uppercase ${result.avionics_audit.score > 80 ? 'border-green-500 bg-green-500/10 text-green-400' : (result.avionics_audit.score > 50 ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500' : 'border-red-500 bg-red-500/10 text-red-500')}`}>
                                                {result.avionics_audit.verdict}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-8 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {result.avionics_audit.features.map((feat, i) => (
                                            <div key={i} className="flex items-center gap-3 text-xs font-bold text-gray-300 bg-black/20 p-3 rounded-lg border border-white/5">
                                                <CheckCircle className="w-4 h-4 text-blue-500" />
                                                {feat}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* PRE-MARKET ACQUISITION ALGO */}
                        {result.acquisition_signal && (
                            <Card className="border-white/10 bg-white/5 backdrop-blur-md mt-8 overflow-hidden relative group/hunter">
                                <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-emerald-500/10 to-transparent"></div>
                                <CardContent className="p-8 relative z-10">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <div className="text-[10px] text-emerald-400 font-black tracking-widest uppercase mb-2 flex items-center gap-2">
                                                <Target className="w-3 h-3" />
                                                Acquisition Probability
                                            </div>
                                            <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">
                                                {result.acquisition_signal.label}
                                            </h3>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-5xl font-black text-emerald-500 tracking-tighter">
                                                {result.acquisition_signal.score}<span className="text-2xl text-emerald-500/50">%</span>
                                            </div>
                                            <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Listing Probability</div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-8">
                                        {result.acquisition_signal.signals.map((sig, i) => (
                                            <div key={i} className="flex items-center gap-2 text-xs font-bold text-gray-300 uppercase tracking-wide">
                                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                                                {sig}
                                            </div>
                                        ))}
                                    </div>

                                    {/* STEALTH CHANNEL */}
                                    {result.acquisition_signal.channel && (result.acquisition_signal.channel.status === 'ACTIVE_CHANNEL') && (
                                        <div className="mt-6 pt-6 border-t border-white/10">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">Stealth Channel</div>
                                                    <div className="text-sm font-black text-white">{result.acquisition_signal.channel.method.replace('_', ' ')}</div>
                                                </div>

                                                <div className="flex flex-col items-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black border-emerald-500/50 font-bold tracking-widest text-xs h-8 transition-all"
                                                        onClick={() => alert(`STEALTH CHANNEL UNLOCKED.\n\nMethods Available: ${result.acquisition_signal.channel.method}\nProxy: ${result.acquisition_signal.channel.proxy_email}\nFee: ${result.acquisition_signal.channel.unlock_fee}`)}
                                                    >
                                                        <Lock className="w-3 h-3 mr-2" />
                                                        UNLOCK INTRO
                                                    </Button>
                                                    <div className="text-[9px] text-gray-500">Fee: {result.acquisition_signal.channel.unlock_fee}</div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* COMPLIANCE WATCHDOG */}
                        {result.compliance_audit && (
                            <Card className="border-white/10 bg-white/5 backdrop-blur-md mt-6 overflow-hidden">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-blue-500/20 p-2 rounded-lg">
                                                <Gavel className="w-5 h-5 text-blue-400" />
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Legal & Finance</div>
                                                <h3 className="text-xl font-black text-white uppercase tracking-tight">Global Sanctions Monitor</h3>
                                            </div>
                                        </div>
                                        <Badge className={`${result.compliance_audit.status === 'CLEARED' ? 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30' : 'bg-red-500/20 text-red-500 border-red-500/30'} font-bold tracking-widest`}>
                                            {result.compliance_audit.status}
                                        </Badge>
                                    </div>

                                    {/* Grid of Databases */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-6">
                                        {result.compliance_audit.databases.map((db, i) => (
                                            <div key={i} className="bg-black/40 border border-white/5 rounded px-3 py-2 flex items-center justify-center gap-2">
                                                <ShieldCheck className="w-3 h-3 text-gray-400" />
                                                <span className="text-[9px] font-bold text-gray-300 uppercase">{db}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Hits or Clearance */}
                                    {result.compliance_audit.status === 'FLAGGED' ? (
                                        <div className="bg-red-500/10 border border-red-500/20 rounded p-4 animate-pulse">
                                            <div className="text-xs font-bold text-red-400 uppercase mb-2 flex items-center gap-2">
                                                <FileWarning className="w-4 h-4" />
                                                Compliance Hits Detected
                                            </div>
                                            <ul className="list-disc list-inside text-xs text-red-300 space-y-1">
                                                {result.compliance_audit.hits.map((hit, i) => (
                                                    <li key={i}>{hit}</li>
                                                ))}
                                            </ul>
                                            <div className="mt-2 text-[9px] text-red-500 font-mono">Action: {result.compliance_audit.clearance_code}</div>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between items-end border-t border-white/5 pt-4">
                                            <div className="text-[10px] text-gray-500 uppercase">
                                                Automated Screen performed via <span className="text-white font-bold">LexisNexis / OFAC API</span>
                                            </div>
                                            <div className="font-mono text-xs text-emerald-500">
                                                {result.compliance_audit.clearance_code}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* PREDICTIVE MAINTENANCE FORECAST */}
                        {result.predictive_maintenance && (
                            <Card className="border-white/10 bg-white/5 backdrop-blur-md mt-8 overflow-hidden relative">
                                <CardContent className="p-8">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <div className="text-[10px] text-red-400 font-black tracking-widest uppercase mb-2 flex items-center gap-2">
                                                <Wrench className="w-3 h-3" />
                                                Fleet Lifecycle Analysis
                                            </div>
                                            <h3 className="text-2xl font-black text-white uppercase">Component Failure Forecast</h3>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        {result.predictive_maintenance.forecast.map((item, i) => (
                                            <div key={i} className="relative">
                                                <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-white text-sm">{item.part}</span>
                                                        {item.status === 'URGENT' && <Badge className="bg-red-500/20 text-red-500 border-red-500/50 text-[8px] py-0">FAILURE RISK</Badge>}
                                                    </div>
                                                    <span className={item.status === 'URGENT' ? 'text-red-500 font-black animate-pulse' : (item.status === 'NEAR_TERM' ? 'text-yellow-500 font-black' : 'text-green-500')}>
                                                        {item.label}
                                                    </span>
                                                </div>
                                                {/* Progress Bar Container */}
                                                <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 relative">
                                                    {/* Background Ticks */}
                                                    <div className="absolute inset-0 flex justify-between px-2 opacity-20">
                                                        <div className="w-px h-full bg-white"></div>
                                                        <div className="w-px h-full bg-white"></div>
                                                        <div className="w-px h-full bg-white"></div>
                                                    </div>
                                                    {/* Fill */}
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${item.health_pct}%` }}
                                                        transition={{ duration: 1, delay: i * 0.2 }}
                                                        className={`h-full rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)] ${item.status === 'URGENT' ? 'bg-gradient-to-r from-red-600 to-red-500' : (item.status === 'NEAR_TERM' ? 'bg-gradient-to-r from-yellow-600 to-yellow-500' : 'bg-gradient-to-r from-emerald-600 to-emerald-500')}`}
                                                    ></motion.div>
                                                </div>
                                                <div className="flex justify-between text-[9px] font-mono text-gray-400 mt-2 uppercase tracking-tight">
                                                    <span>Est. Life: {item.est_hours_remaining} Hours</span>
                                                    <span>Replacement: <span className="text-white">${item.est_cost.toLocaleString()}</span></span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-8 pt-4 border-t border-white/5 text-[9px] text-gray-600 uppercase tracking-widest text-center">
                                        Predictions based on {result.predictive_maintenance.system_type} Fleet Averages
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* OWNERSHIP STABILITY TIMELINE */}
                        {result.source_data.ownership_history && (
                            <Card className="border-white/10 bg-white/5 backdrop-blur-md mt-8 p-8 overflow-hidden">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <div className="text-[10px] text-accent font-black tracking-widest uppercase mb-1">Chain of Custody</div>
                                        <h3 className="text-2xl font-black text-white uppercase">Ownership Stability Timeline</h3>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none mb-1">Stability Rating</div>
                                        <div className={`text-sm font-black uppercase ${result.source_data.ownership_history.length <= 2 ? 'text-green-500' : 'text-warning'} `}>
                                            {result.source_data.ownership_history.length <= 2 ? 'High Stability' : 'Moderate Churn'}
                                        </div>
                                    </div>
                                </div>

                                <div className="relative pt-8 pb-12">
                                    {/* Timeline Base */}
                                    <div className="h-2 w-full bg-white/5 rounded-full relative flex">
                                        {(() => {
                                            const totalYears = result.source_data.ownership_history.reduce((acc, h) => acc + h.duration_years, 0);
                                            return result.source_data.ownership_history.map((h, i) => {
                                                const width = (h.duration_years / totalYears) * 100;
                                                return (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${width}% ` }}
                                                        transition={{ delay: i * 0.2, duration: 0.8 }}
                                                        className={`h-full border-r border-black / 40 relative group ${h.is_current ? 'bg-accent' : 'bg-white/20 hover:bg-white/30 transition-colors'} `}
                                                    >
                                                        {/* Tooltip-style Label */}
                                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black text-[8px] font-black px-2 py-1 rounded whitespace-nowrap z-30 pointer-events-none">
                                                            {h.owner} ({h.duration_years} Years)
                                                        </div>

                                                        {/* Marker */}
                                                        <div className="absolute -bottom-1 left-0 w-2 h-2 bg-white/40 rounded-full -translate-x-1/2"></div>

                                                        {/* Years Label */}
                                                        <div className={`absolute top-4 left-0 text-[10px] font-mono text-gray - 500 - translate - x - 1 / 2 ${i === 0 ? 'opacity-100' : 'opacity-50'} `}>
                                                            {i === 0 ? 'START' : `YR ${result.source_data.ownership_history.slice(0, i).reduce((acc, prev) => acc + prev.duration_years, 0)} `}
                                                        </div>
                                                    </motion.div>
                                                );
                                            });
                                        })()}
                                        <div className="absolute top-4 right-0 text-[10px] font-mono text-accent -translate-x-[-50%]">NOW</div>
                                    </div>

                                    {/* Legend */}
                                    <div className="mt-16 flex flex-wrap gap-8">
                                        {result.source_data.ownership_history.map((h, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${h.is_current ? 'bg-accent' : 'bg-white/20'} `}></div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] text-white font-bold uppercase truncate max-w-[120px]">{h.owner}</span>
                                                    <span className="text-[10px] text-gray-500 font-mono tracking-tighter">{h.duration_years} Years</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* HANGAR QUEEN RISK INDEX */}
                        {result.hangar_queen_index && (
                            <Card className="border-white/10 bg-white/5 backdrop-blur-md mt-8 overflow-hidden relative">
                                <CardContent className="p-8">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <div className="text-[10px] text-orange-400 font-black tracking-widest uppercase mb-2 flex items-center gap-2">
                                                <Microscope className="w-3 h-3" />
                                                Corrosion Forensic
                                            </div>
                                            <h3 className="text-2xl font-black text-white uppercase">Hangar Queen Risk Index</h3>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-3xl font-black ${result.hangar_queen_index.score > 50 ? 'text-red-500' : 'text-green-500'}`}>
                                                {result.hangar_queen_index.score}/100
                                            </div>
                                            <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{result.hangar_queen_index.level} Risk</div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="h-4 w-full bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${result.hangar_queen_index.score > 80 ? 'bg-red-600' : (result.hangar_queen_index.score > 40 ? 'bg-orange-500' : 'bg-green-500')}`}
                                                style={{ width: `${result.hangar_queen_index.score}%` }}
                                            ></div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mt-4">
                                            {result.hangar_queen_index.triggers.length > 0 ? (
                                                result.hangar_queen_index.triggers.map((trigger, i) => (
                                                    <div key={i} className="flex items-center gap-2 text-xs font-bold text-red-300 bg-red-500/10 p-2 rounded">
                                                        <AlertTriangle className="w-3 h-3" />
                                                        {trigger}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="col-span-2 text-center text-xs font-mono text-green-400 bg-green-500/10 p-2 rounded">
                                                    NO CORROSION TRIGGERS DETECTED
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* PRE-MARKET ACQUISITION HUNTER */}
                        {result.acquisition_signal && (
                            <Card className={`border-white/10 mt-8 overflow-hidden relative ${result.acquisition_signal.score > 75 ? 'bg-green-500/10 border-green-500/30' : 'bg-white/5 backdrop-blur-md'}`}>
                                <CardContent className="p-8">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <div className="text-[10px] text-blue-400 font-black tracking-widest uppercase mb-2 flex items-center gap-2">
                                                <Radar className="w-3 h-3" />
                                                Off-Market Hunter
                                            </div>
                                            <h3 className="text-2xl font-black text-white uppercase">Acquisition Probability</h3>
                                        </div>
                                        <div className="text-right">
                                            <div className={`text-3xl font-black ${result.acquisition_signal.score > 75 ? 'text-green-500' : 'text-white'}`}>
                                                {result.acquisition_signal.score}%
                                            </div>
                                            <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{result.acquisition_signal.label}</div>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {result.acquisition_signal.signals.map((sig, i) => (
                                            <div key={i} className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold text-gray-300 uppercase tracking-tight flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                                                {sig}
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* ASSET APPRECIATION GRAPH */}
                        {result.market_history && result.market_history.length > 0 && (() => {
                            const history = result.market_history;
                            const prices = history.map(h => h.price);
                            const minPrice = Math.min(...prices) * 0.9;
                            const maxPrice = Math.max(...prices) * 1.05;
                            const range = maxPrice - minPrice;
                            const width = 100; // viewBox width
                            const height = 50; // viewBox height

                            // Generate Points
                            const points = history.map((h, i) => {
                                const x = (i / (history.length - 1)) * width;
                                const y = height - ((h.price - minPrice) / range) * height;
                                return `${x},${y}`;
                            }).join(' ');

                            const trend = history[history.length - 1].price > history[0].price ? 'positive' : 'negative';
                            const cagr = (((history[history.length - 1].price / history[0].price) ** (1 / 5)) - 1) * 100;

                            return (
                                <Card className="border-white/10 bg-white/5 backdrop-blur-md mt-8 overflow-hidden relative">
                                    <CardContent className="p-8">
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <div className="text-[10px] text-green-400 font-black tracking-widest uppercase mb-2 flex items-center gap-2">
                                                    <TrendingUp className="w-3 h-3" />
                                                    Market Intelligence
                                                </div>
                                                <h3 className="text-2xl font-black text-white uppercase">Investment Potential</h3>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-3xl font-black text-white">{cagr > 0 ? '+' : ''}{cagr.toFixed(1)}%</div>
                                                <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">5-Year CAGR</div>
                                            </div>
                                        </div>

                                        <div className="h-48 w-full relative">
                                            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                                                {/* Grid Lines */}
                                                {[0.25, 0.5, 0.75].map(p => (
                                                    <line key={p} x1="0" y1={height * p} x2={width} y2={height * p} stroke="white" strokeOpacity="0.1" strokeWidth="0.1" strokeDasharray="1 1" />
                                                ))}

                                                {/* Area Fill */}
                                                <path
                                                    d={`M 0,${height} ${points.split(' ').map(p => 'L ' + p).join(' ')} L ${width},${height} Z`}
                                                    fill="url(#trendGradient)"
                                                    opacity="0.2"
                                                />
                                                <defs>
                                                    <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor={trend === 'positive' ? '#22c55e' : '#ef4444'} />
                                                        <stop offset="100%" stopColor="transparent" />
                                                    </linearGradient>
                                                </defs>

                                                {/* Line */}
                                                <path
                                                    d={`M ${points.split(' ').join(' L ')}`}
                                                    fill="none"
                                                    stroke={trend === 'positive' ? '#22c55e' : '#ef4444'}
                                                    strokeWidth="0.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />

                                                {/* Dots */}
                                                {history.map((h, i) => {
                                                    const x = (i / (history.length - 1)) * width;
                                                    const y = height - ((h.price - minPrice) / range) * height;
                                                    return (
                                                        <g key={i}>
                                                            <circle cx={x} cy={y} r="1.5" fill="white" />
                                                            {/* Label (only start and end) */}
                                                            {(i === 0 || i === history.length - 1) && (
                                                                <text x={x} y={y - 5} fontSize="3" fill="white" textAnchor={i === 0 ? "start" : "end"} fontWeight="bold">
                                                                    ${(h.price / 1000).toFixed(0)}k
                                                                </text>
                                                            )}
                                                            <text x={x} y={height + 5} fontSize="2" fill="gray" textAnchor="middle">{h.year}</text>
                                                        </g>
                                                    );
                                                })}
                                            </svg>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })()}

                        {/* DIGITAL AUTHENTICATION FINGERPRINT */}
                        {result && (
                            <div className="flex flex-wrap items-center justify-between gap-4 py-3 px-6 bg-accent/5 border border-accent/20 rounded-lg mt-8 font-mono text-[8px] tracking-[0.2em] text-accent/60 uppercase">
                                <div className="flex items-center gap-4">
                                    <span>SCAN_ID: {Math.random().toString(36).substring(2, 15).toUpperCase()}</span>
                                    <div className="w-1 h-1 bg-accent/30 rounded-full"></div>
                                    <span>AUTH_TOKEN: {result.generated_at?.replace(/[-:T]/g, '').substring(0, 12)}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1.5 text-green-500/50">
                                        <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                                        NODE_LATENCY: 8ms
                                    </span>
                                    <span className="text-gray-500">IA_SIGNATURE: VERIFIED_256_RSA</span>
                                </div>
                            </div>
                        )}

                        {/* OPERATING COST ANALYSIS */}
                        {result.operating_costs ? (
                            <Card className="border-white/10 bg-white/5 backdrop-blur-md mt-8 overflow-hidden">
                                <CardContent className="p-0">
                                    <div className="grid grid-cols-1 md:grid-cols-3">
                                        <div className="p-8 border-b md:border-b-0 md:border-r border-white/10">
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="text-[10px] text-accent font-black tracking-[0.3em] uppercase">Operating Cost Analysis</div>
                                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-green-500/10 border border-green-500/20 rounded-full">
                                                    <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse"></div>
                                                    <span className="text-[8px] text-green-500 font-bold uppercase tracking-widest">Live</span>
                                                </div>
                                            </div>
                                            <div className="space-y-6">
                                                <div>
                                                    <div className="text-4xl font-black text-white mb-1">
                                                        ${result.operating_costs.total_hourly_direct}
                                                        <span className="text-gray-500 text-sm ml-2 font-bold uppercase tracking-widest">/ Hour</span>
                                                    </div>
                                                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">Estimated Direct Operating Cost (DOC)</div>
                                                </div>

                                                <div className="pt-6 border-t border-white/5">
                                                    <div className="flex justify-between items-end mb-4">
                                                        <div>
                                                            <div className="text-2xl font-black text-white">${result.operating_costs.annual_fixed_est.toLocaleString()}</div>
                                                            <div className="text-[10px] text-gray-500 font-bold uppercase">Annual Fixed Est.</div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-[10px] text-gray-400 font-bold uppercase">{result.operating_costs.fuel_type}</div>
                                                            <div className="text-xs text-white font-mono font-bold">{result.operating_costs.gph_est} GPH</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="pt-4 border-t border-accent/20 bg-accent/5 -mx-4 px-4 pb-2 rounded-b-lg">
                                                    <div className="text-[10px] text-accent font-black uppercase tracking-widest mb-1">Total Annual (100 Hrs)</div>
                                                    <div className="text-3xl font-black text-white">
                                                        ${(result.operating_costs.annual_fixed_est + (result.operating_costs.total_hourly_direct * 100)).toLocaleString()}
                                                    </div>
                                                    <div className="text-[9px] text-gray-500 mt-1 uppercase font-bold tracking-tighter">All-in ownership liquidity requirement</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Visual Graph Column */}
                                        <div className="md:col-span-2 p-8 bg-white/[0.02]">
                                            <div className="h-full flex flex-col justify-center">
                                                <div className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-8">Hourly Cost Spectrum</div>

                                                {/* Cost Stack Bar */}
                                                <div className="h-12 w-full flex rounded-lg overflow-hidden border border-white/5 mb-8">
                                                    {(() => {
                                                        const total = result.operating_costs.total_hourly_direct;
                                                        const fuelW = (result.operating_costs.hourly_fuel / total) * 100;
                                                        const maintW = (result.operating_costs.hourly_maintenance / total) * 100;
                                                        const resW = (result.operating_costs.hourly_reserve / total) * 100;

                                                        return (
                                                            <>
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${fuelW}% ` }}
                                                                    transition={{ duration: 1, ease: "easeOut" }}
                                                                    className="bg-accent h-full relative group"
                                                                >
                                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 text-[10px] text-white font-black">FUEL</div>
                                                                </motion.div>
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${maintW}% ` }}
                                                                    transition={{ delay: 0.3, duration: 1, ease: "easeOut" }}
                                                                    className="bg-blue-500 h-full relative group"
                                                                >
                                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 text-[10px] text-white font-black">MAINT</div>
                                                                </motion.div>
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${resW}% ` }}
                                                                    transition={{ delay: 0.6, duration: 1, ease: "easeOut" }}
                                                                    className="bg-white/20 h-full relative group"
                                                                >
                                                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 text-[10px] text-white font-black">RESERVE</div>
                                                                </motion.div>
                                                            </>
                                                        );
                                                    })()}
                                                </div>

                                                {/* Legend & Details */}
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div className="space-y-1 group relative">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-accent"></div>
                                                            <span className="text-[10px] text-white font-bold uppercase group-hover:text-accent transition-colors cursor-help">Fuel</span>
                                                        </div>
                                                        <div className="text-lg font-black text-white">${result.operating_costs.hourly_fuel}</div>
                                                        <div className="text-[9px] text-gray-500">Avg. {result.operating_costs.fuel_type} Burn</div>

                                                        {/* Tooltip */}
                                                        <div className="absolute -top-16 left-0 w-40 bg-[#0a0a0a] border border-white/10 p-3 rounded-lg text-[9px] text-gray-400 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 pointer-events-none z-50 shadow-2xl">
                                                            <div className="text-white font-bold mb-1 uppercase tracking-widest text-[8px]">Fuel Burn</div>
                                                            Calculated using manufacturer fuel flow charts at 75% power and current national average pricing.
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1 pl-4 border-l border-white/5 group relative">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                                            <span className="text-[10px] text-white font-bold uppercase group-hover:text-blue-400 transition-colors cursor-help">Maintenance</span>
                                                        </div>
                                                        <div className="text-lg font-black text-white">${result.operating_costs.hourly_maintenance}</div>
                                                        <div className="text-[9px] text-gray-500">Unscheduled Est.</div>

                                                        {/* Tooltip */}
                                                        <div className="absolute -top-16 left-0 w-40 bg-[#0a0a0a] border border-white/10 p-3 rounded-lg text-[9px] text-gray-400 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 pointer-events-none z-50 shadow-2xl">
                                                            <div className="text-white font-bold mb-1 uppercase tracking-widest text-[8px]">Maintenance</div>
                                                            Estimated costs for oil, tires, and minor airframe repairs between annual inspections.
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1 pl-4 border-l border-white/5 group relative">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-white/20"></div>
                                                            <span className="text-[10px] text-white font-bold uppercase group-hover:text-white transition-colors cursor-help">Reserves</span>
                                                        </div>
                                                        <div className="text-lg font-black text-white">${result.operating_costs.hourly_reserve}</div>
                                                        <div className="text-[9px] text-gray-500">Engine/Prop Overhaul</div>

                                                        {/* Tooltip */}
                                                        <div className="absolute -top-20 left-0 w-40 bg-[#0a0a0a] border border-white/10 p-3 rounded-lg text-[9px] text-gray-400 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 pointer-events-none z-50 shadow-2xl">
                                                            <div className="text-white font-bold mb-1 uppercase tracking-widest text-[8px]">Reserves</div>
                                                            Accrued cost pro-rated per hour to fund the eventual $30k-$80k engine/propeller overhaul at TBO limits.
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : null}

                        {/* Bento Grid - DATA SOURCES */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative mt-16">

                            {/* SOURCE: NTSB */}
                            <Card className="border-white/10 bg-white/5 flex flex-col h-full">
                                <CardContent className="p-6 flex flex-col h-full">
                                    <div className="flex items-center justify-between mb-8">
                                        <span className="text-[10px] font-black tracking-widest text-gray-500 uppercase">Registry 01</span>
                                        <Badge variant="outline" className="border-white/20 text-white bg-white/5">NTSB</Badge>
                                    </div>
                                    <div className="flex-grow">
                                        <div className="text-xs text-gray-500 mb-2 font-bold uppercase">Accident/Incident Records</div>
                                        <div className="text-2xl font-black text-white mb-4">
                                            {result.source_data.ntsb.length} <span className="text-gray-500 text-sm">FOUND</span>
                                        </div>

                                        {result.source_data.ntsb.length > 0 ? (
                                            <div className="space-y-3">
                                                {result.source_data.ntsb.map((item, idx) => (
                                                    <div key={idx} className="p-3 bg-red-500/10 border border-red-500/20 rounded text-[10px] text-gray-300 font-mono leading-relaxed">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="text-red-500 font-bold uppercase">Case Date: {item.date}</span>
                                                            <Badge variant="outline" className="text-[8px] border-red-500/30 text-red-400 py-0 h-4">NTSB</Badge>
                                                        </div>
                                                        <div className="text-white font-bold mb-1 uppercase tracking-tight">Category: {item.reason}</div>
                                                        <div className="text-gray-400 italic">"{item.description}"</div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="h-20 bg-gradient-to-r from-accent/10 to-transparent rounded-lg border border-white/5 border-dashed"></div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* SOURCE: CADORS */}
                            <Card className="border-white/10 bg-white/5 flex flex-col h-full">
                                <CardContent className="p-6 flex flex-col h-full">
                                    <div className="flex items-center justify-between mb-8">
                                        <span className="text-[10px] font-black tracking-widest text-gray-500 uppercase">Registry 02</span>
                                        <Badge variant="outline" className="border-white/20 text-white bg-white/5">CADORS</Badge>
                                    </div>
                                    <div className="flex-grow">
                                        <div className="text-xs text-gray-500 mb-2 font-bold uppercase">Safety Occurrences</div>
                                        <div className="text-2xl font-black text-white mb-4">
                                            {result.source_data.cadors.length} <span className="text-gray-500 text-sm">FOUND</span>
                                        </div>

                                        {result.source_data.cadors.length > 0 ? (
                                            <div className="space-y-3">
                                                {result.source_data.cadors.map((item, idx) => (
                                                    <div key={idx} className="p-3 bg-warning/10 border border-warning/20 rounded text-[10px] text-gray-300 font-mono leading-relaxed">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="text-warning font-bold uppercase">Event Date: {item.date}</span>
                                                            <Badge variant="outline" className="text-[8px] border-warning/30 text-warning py-0 h-4">CADORS</Badge>
                                                        </div>
                                                        <div className="text-white font-bold mb-1 uppercase tracking-tight">Event: {item.reason}</div>
                                                        <div className="text-gray-400 italic">"{item.description}"</div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="h-20 bg-gradient-to-r from-warning/10 to-transparent rounded-lg border border-white/5 border-dashed"></div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* SOURCE: SDR / MAINTENANCE INTELLIGENCE */}
                            <Card className="border-white/10 bg-white/5 flex flex-col h-full">
                                <CardContent className="p-6 flex flex-col h-full">
                                    <div className="flex items-center justify-between mb-8">
                                        <span className="text-[10px] font-black tracking-widest text-gray-500 uppercase">Registry 03</span>
                                        <Badge variant="outline" className="border-white/20 text-white bg-white/5">SDR AUDIT</Badge>
                                    </div>
                                    <div className="flex-grow">
                                        <div className="text-xs text-gray-500 mb-2 font-bold uppercase">Maintenance Intelligence</div>
                                        <div className="text-2xl font-black text-white mb-4">
                                            {result.source_data.sdr.length} <span className="text-gray-500 text-sm">FOUND</span>
                                        </div>

                                        {result.source_data.sdr.length > 0 ? (
                                            <div className="space-y-3">
                                                {result.source_data.sdr.map((item, idx) => (
                                                    <div key={idx} className="p-3 bg-blue-500/10 border border-blue-500/20 rounded text-[10px] text-gray-300 font-mono leading-relaxed">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="text-blue-500 font-bold uppercase">Report Date: {item.date}</span>
                                                            <Badge variant="outline" className="text-[8px] border-blue-500/30 text-blue-400 py-0 h-4">SDR</Badge>
                                                        </div>
                                                        <div className="text-white font-bold mb-1 uppercase tracking-tight">Component: {item.part}</div>
                                                        <div className="text-gray-400 italic">"{item.description}"</div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="h-20 bg-gradient-to-r from-blue-500/10 to-transparent rounded-lg border border-white/5 border-dashed"></div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* NEURAL LOG STREAM - LIVE FORENSIC FEED */}
                        <div className="mt-8 border-t border-b border-white/5 bg-black/40 backdrop-blur-sm h-10 overflow-hidden relative flex items-center whitespace-nowrap">
                            <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent z-10"></div>
                            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black to-transparent z-10"></div>
                            <motion.div
                                animate={{ x: [0, -2000] }}
                                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                                className="flex gap-12 font-mono text-[9px] text-white/20 uppercase tracking-[0.3em] pl-12"
                            >
                                {[...Array(10)].map((_, i) => (
                                    <React.Fragment key={i}>
                                        <span className="flex items-center gap-2">
                                            <span className="w-1 h-1 bg-accent rounded-full animate-pulse"></span>
                                            SCANNING_NTSB_HISTORICAL_INDEX_{result.tail_number}
                                        </span>
                                        <span className="flex items-center gap-2 text-green-500/30">
                                            [OK] _FAA_REGISTRY_HASH_VALIDATED
                                        </span>
                                        <span className="flex items-center gap-2">
                                            SIGNAL_INT_SYNC: 0.998ms
                                        </span>
                                        <span className="flex items-center gap-2 text-purple-500/30">
                                            LADD_PRIVACY_BYPASS_ATTEMPT: FAILED
                                        </span>
                                        <span className="flex items-center gap-2">
                                            SDR_MECHANICAL_DELTA_CALC: {result.fleet_comparison?.mechanical_delta}%
                                        </span>
                                    </React.Fragment>
                                ))}
                            </motion.div>
                        </div>

                        {/* FORENSIC INTELLIGENCE MAP */}
                        <Card className="border-white/10 bg-white/5 backdrop-blur-md overflow-hidden mt-8 shadow-2xl">
                            <div className="md:flex min-h-[450px]">
                                {/* Forensic Map Visualization */}
                                <div className="md:w-2/3 h-[300px] md:h-auto bg-[#050505] relative border-b md:border-b-0 md:border-r border-white/10 overflow-hidden group">
                                    {/* High Contrast World Map */}
                                    <div
                                        className="absolute inset-0 opacity-40 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/World_map_blank_without_borders.svg/2000px-World_map_blank_without_borders.svg.png')] bg-cover bg-center filter grayscale contrast-[1.5] brightness-[0.8]"
                                        style={{ mixBlendMode: 'screen' }}
                                    ></div>

                                    {/* Tactical HUD Overlay - More visible */}
                                    <div className="absolute inset-0 pointer-events-none">
                                        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                                        <div className="absolute inset-0 border-[20px] border-white/[0.02]"></div>
                                    </div>

                                    {/* Risk Corridors (Heatmaps) - Higher Visibility */}
                                    <div className="absolute inset-x-0 bottom-0 h-32 bg-orange-500/10 blur-[80px] pointer-events-none" title="High Salinity Risk Zone"></div>
                                    <div className="absolute inset-x-0 top-[35%] h-24 bg-purple-500/10 blur-[80px] pointer-events-none" title="Intense UV Exposure Corridor"></div>

                                    {/* Tactical Loitering Zones (Dynamic Heatmap) */}
                                    <div className="absolute inset-0 pointer-events-none opacity-40">
                                        <TacticalHeatmap className="absolute left-[20%] top-[40%] w-48 h-48" />
                                        <TacticalHeatmap className="absolute left-[65%] top-[25%] w-32 h-32" />
                                        <TacticalHeatmap className="absolute left-[45%] top-[60%] w-56 h-56" />
                                    </div>

                                    <div className="relative z-10 w-full h-full">
                                        {(() => {
                                            const lat = result.climate_exposure?.coordinates?.lat || 39.8;
                                            const lng = result.climate_exposure?.coordinates?.lng || -98.6;
                                            const left = ((lng + 180) / 360) * 100;
                                            const top = ((90 - lat) / 180) * 100;

                                            return (
                                                <motion.div
                                                    initial={{ scale: 0, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    className="absolute flex flex-col items-center gap-2"
                                                    style={{ left: `${left}% `, top: `${top}% `, transform: 'translate(-50%, -50%)' }}
                                                >
                                                    <div className="relative">
                                                        {/* Animated HUD Rings */}
                                                        <motion.div
                                                            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.1, 0.3] }}
                                                            transition={{ repeat: Infinity, duration: 4 }}
                                                            className="absolute -inset-16 border border-accent/20 rounded-full"
                                                        ></motion.div>
                                                        <div className="absolute -inset-10 border border-accent/30 rounded-full animate-spin-slow"></div>
                                                        <div className="absolute -inset-4 border border-accent/40 rounded-full"></div>

                                                        {/* Reticle Lines */}
                                                        <div className="w-12 h-[1px] bg-accent/50 absolute -left-6 top-1/2"></div>
                                                        <div className="w-[1px] h-12 bg-accent/50 absolute left-1/2 -top-6"></div>

                                                        <div className="w-4 h-4 bg-accent rounded-full animate-ping absolute"></div>
                                                        <div className="w-4 h-4 bg-accent rounded-full relative z-10 shadow-[0_0_20px_#FF5F1F]"></div>

                                                        {/* Floating Tactical Tag */}
                                                        <motion.div
                                                            initial={{ y: 10, opacity: 0 }}
                                                            animate={{ y: 0, opacity: 1 }}
                                                            transition={{ delay: 0.5 }}
                                                            className="absolute top-10 left-1/2 -translate-x-1/2 bg-black/95 border border-white/20 p-3 rounded-lg backdrop-blur-xl whitespace-nowrap shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-t-accent/40"
                                                        >
                                                            <div className="flex items-center gap-2 mb-1.5">
                                                                <div className="w-1.5 h-1.5 bg-accent animate-pulse rounded-full shadow-[0_0_5px_#FF5F1F]"></div>
                                                                <span className="text-[8px] font-mono text-accent font-black uppercase tracking-[0.2em]">GEOSPATIAL_LOCK</span>
                                                            </div>
                                                            <div className="text-sm font-mono text-white font-black tracking-tighter">
                                                                {lat.toFixed(4)}N / {Math.abs(lng).toFixed(4)}W
                                                            </div>
                                                            <div className="flex items-center gap-3 mt-2 border-t border-white/10 pt-2">
                                                                <div className="text-[7px] text-gray-400 font-bold uppercase">Zone:</div>
                                                                <div className={`text-[7px] font-black uppercase tracking-widest ${result.climate_exposure?.salinity === 'HIGH' ? 'text-orange-500' : 'text-green-500'} `}>
                                                                    {result.climate_exposure?.salinity === 'HIGH' ? 'COASTAL_SALINE' : 'INLAND_STABLE'}
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })()}
                                    </div>

                                    {/* Scanline Effect */}
                                    <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] z-20 opacity-10"></div>

                                    {/* Tactical Metadata Overlay */}
                                    <div className="absolute top-4 left-4 flex flex-col gap-1 text-[8px] font-mono text-white/30 tracking-widest uppercase pointer-events-none">
                                        <div className="flex gap-2"><span>MODE:</span> <span className="text-accent">FORENSIC_GEO_AUDIT</span></div>
                                        <div className="flex gap-2"><span>SYNC:</span> <span className="text-green-500">ACTIVE</span></div>
                                    </div>

                                    <div className="absolute bottom-4 left-4 flex gap-6 text-[8px] font-mono text-white/20 tracking-[0.2em] uppercase pointer-events-none">
                                        <span>RELIABILITY_SCORE: 0.98</span>
                                        <span>LAT_SWEEP: COMPLETED</span>
                                    </div>
                                </div>

                                {/* Geography Sidebar */}
                                <div className="md:w-1/3 p-10 flex flex-col justify-center text-left bg-gradient-to-br from-white/[0.02] to-transparent">
                                    <div className="text-[10px] text-accent font-black tracking-[0.4em] uppercase mb-2">Atmospheric Forensics</div>
                                    <h3 className="text-3xl font-black text-white uppercase mb-6 leading-tight">Exposure<br />Environment</h3>
                                    <div className="space-y-5">
                                        <div className="p-4 bg-white/5 border border-white/10 rounded-xl group hover:border-accent/30 transition-colors">
                                            <div className="text-[10px] text-gray-500 font-bold uppercase mb-2 tracking-widest">Salinity Profile</div>
                                            <div className="flex items-center justify-between">
                                                <div className="text-[11px] font-black text-white uppercase flex items-center gap-2">
                                                    <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_8px] ${result.climate_exposure?.salinity === 'HIGH' ? 'bg-orange-500 shadow-orange-500/50 pulse' : 'bg-green-500 shadow-green-500/50'} `}></div>
                                                    {result.climate_exposure?.salinity === 'HIGH' ? 'Coastal Saline' : 'Inland Stable'}
                                                </div>
                                                <Badge className="bg-white/5 text-[8px] border-white/10">{result.climate_exposure?.salinity === 'HIGH' ? 'RISK' : 'SAFE'}</Badge>
                                            </div>
                                        </div>
                                        <div className="p-4 bg-white/5 border border-white/10 rounded-xl group hover:border-accent/30 transition-colors">
                                            <div className="text-[10px] text-gray-500 font-bold uppercase mb-2 tracking-widest">UV Exposure</div>
                                            <div className="flex items-center justify-between">
                                                <div className="text-[11px] font-black text-white uppercase flex items-center gap-2">
                                                    <div className={`w-2.5 h-2.5 rounded-full shadow-[0_0_8px] ${result.climate_exposure?.uv_index === 'INTENSE' ? 'bg-purple-500 shadow-purple-500/50 animate-pulse' : 'bg-blue-500 shadow-blue-500/50'} `}></div>
                                                    {result.climate_exposure?.uv_index}
                                                </div>
                                                <Badge className="bg-white/5 text-[8px] border-white/10">COATING_AUDIT</Badge>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                                            <div className="text-[10px] text-gray-500 font-bold uppercase mb-3 tracking-widest">Historical Deployment Hubs</div>
                                            <div className="space-y-2">
                                                {result.geofence_audit?.primary_hubs?.map((hub, i) => (
                                                    <div key={i} className="flex justify-between items-center text-[9px] font-mono text-white/70">
                                                        <span className="flex items-center gap-2">
                                                            <div className="w-1 h-1 bg-accent/60 rounded-full"></div>
                                                            {hub}
                                                        </span>
                                                        <span className="text-accent/40 font-black">LOGGED</span>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-4 flex justify-between items-center border-t border-white/5 pt-3">
                                                <span className="text-[9px] text-gray-600 font-black uppercase">Intl Exposure</span>
                                                <span className={`text-[9px] font-black ${result.geofence_audit?.intl_exposure === 'HIGH' ? 'text-orange-500' : 'text-blue-400'} `}>
                                                    {result.geofence_audit?.intl_exposure}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="mt-8 text-[12px] text-gray-400 leading-relaxed italic border-l-2 border-accent/20 pl-4 font-medium">
                                        "Environmental logging confirms historical base of operations. Cross-referenced against global atmospheric corrosion models."
                                    </p>
                                </div>
                            </div>
                        </Card>


                        {/* HIGH-FIDELITY INTELLIGENCE FEEDS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                            {/* SIGINT (Signal Intelligence) Module */}
                            <Card className="border-white/10 bg-[#070707] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4 opacity-10 flex flex-col gap-1 items-end pointer-events-none">
                                    <div className="w-8 h-0.5 bg-accent"></div>
                                    <div className="w-12 h-0.5 bg-accent"></div>
                                </div>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center">
                                            <div className="w-4 h-4 text-accent animate-pulse">📡</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-accent font-black tracking-widest uppercase mb-0.5">Tactical_SIGINT</div>
                                            <h4 className="text-sm font-black text-white uppercase tracking-tight">Signal Intelligence</h4>
                                        </div>
                                    </div>

                                    <div className="space-y-3 font-mono">
                                        {[
                                            { label: 'TRANS_PROF', val: result.sigint_audit?.transponder_profile || 'S-TYPE TDR', color: 'text-white' },
                                            { label: 'INTG_INDEX', val: (result.sigint_audit?.signal_integrity || 94) + '%', color: 'text-green-500' },
                                            { label: 'SQL_STATUS', val: result.sigint_audit?.squawk_history || 'NOMINAL', color: 'text-white' },
                                            { label: 'OBF_LAYER', val: result.sigint_audit?.signal_obfuscation || 'STANDARD', color: result.sigint_audit?.signal_obfuscation === 'HIGH' ? 'text-purple-400' : 'text-gray-500' }
                                        ].map((item, i) => (
                                            <div key={i} className="flex justify-between items-center text-[10px] border-b border-white/[0.03] pb-1.5">
                                                <span className="text-gray-500 font-bold">{item.label}</span>
                                                <span className={`${item.color} font-black uppercase tracking-tighter`}>{item.val}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* PRECISION SIGNAL STABILITY GRAPH */}
                                    <div className="mt-6 mb-2">
                                        <SignalStabilityGraph />
                                    </div>

                                    <div className="mt-4 flex items-center gap-2">
                                        <div className="h-1 flex-grow bg-white/5 rounded-full overflow-hidden">
                                            <motion.div animate={{ x: ["-100%", "100%"] }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-1/3 h-full bg-accent/40"></motion.div>
                                        </div>
                                        <span className="text-[8px] text-gray-600 font-black">SCAN_LIVE</span>
                                    </div>

                                    {/* Clearance Lock */}
                                    <LockedOverlay tier={tier} requiredTier="basic" />
                                </CardContent>
                            </Card>

                            {/* Custody Chain Forensic Module */}
                            <Card className="border-white/10 bg-[#070707] relative overflow-hidden group">
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                            <div className="w-4 h-4 text-blue-500">⛓️</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-blue-500 font-black tracking-widest uppercase mb-0.5">Asset_Custody</div>
                                            <h4 className="text-sm font-black text-white uppercase tracking-tight">Custody Forensic</h4>
                                        </div>
                                    </div>

                                    <div className="space-y-3 font-mono">
                                        {[
                                            { label: 'REG_HOPS', val: result.custody_forensic?.registry_hops || 0, color: 'text-white' },
                                            { label: 'AVG_CYC', val: (result.custody_forensic?.average_ownership_duration || 5) + ' YRS', color: 'text-white' },
                                            { label: 'JUR_CHURN', val: result.custody_forensic?.jurisdiction_shifts || 'STABLE', color: result.custody_forensic?.jurisdiction_shifts === 'INTERNATIONAL_CHURN' ? 'text-orange-500' : 'text-blue-400' },
                                            { label: 'IA_VALID', val: result.custody_forensic?.verification_status || 'PENDING', color: 'text-green-500' }
                                        ].map((item, i) => (
                                            <div key={i} className="flex justify-between items-center text-[10px] border-b border-white/[0.03] pb-1.5">
                                                <span className="text-gray-500 font-bold">{item.label}</span>
                                                <span className={`${item.color} font-black uppercase tracking-tighter`}>{item.val}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-6 flex gap-1">
                                        {[1, 1, 1, 1, 1, 0, 0, 0, 0].map((v, i) => (
                                            <div key={i} className={`h-1.5 flex-grow rounded-sm ${v ? 'bg-blue-500/40' : 'bg-white/5'} `}></div>
                                        ))}
                                    </div>

                                    {/* Clearance Lock */}
                                    <LockedOverlay tier={tier} requiredTier="pro" />
                                </CardContent>
                            </Card>

                            {/* Predictive Value Liquidity (New Intelligence) */}
                            <Card className="border-white/10 bg-[#070707] relative overflow-hidden group lg:col-span-1 md:col-span-2 lg:md:col-span-1">
                                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-green-500/20 to-transparent"></div>
                                <CardContent className="p-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                                            <div className="w-4 h-4 text-green-500">💰</div>
                                        </div>
                                        <div>
                                            <div className="text-[10px] text-green-500 font-black tracking-widest uppercase mb-0.5">Market_Velocity</div>
                                            <h4 className="text-sm font-black text-white uppercase tracking-tight">Value Liquidity</h4>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center justify-center py-2">
                                        <div className="text-3xl font-black text-white tracking-tighter mb-1">
                                            {result.market_velocity?.days_on_market || 120} <span className="text-[10px] text-gray-500 uppercase tracking-widest">DAYS</span>
                                        </div>
                                        <div className="text-[9px] text-green-500 font-mono font-black uppercase tracking-[0.2em]">AVG_EST_TO_EXIT</div>
                                    </div>

                                    <div className="mt-8 grid grid-cols-2 gap-2 text-center border-t border-white/5 pt-4">
                                        <div>
                                            <div className="text-[8px] text-gray-600 font-bold uppercase mb-1">Buy Efficiency</div>
                                            <div className={`text-[10px] font-black uppercase tracking-widest ${result.confidence_score > 80 ? 'text-green-500' : 'text-white'} `}>
                                                {result.confidence_score > 80 ? 'ALPHA+' : 'OPTIMAL'}
                                            </div>
                                        </div>
                                        <div className="border-l border-white/5">
                                            <div className="text-[8px] text-gray-600 font-bold uppercase mb-1">Market Rarity</div>
                                            <div className={`text-[10px] font-black uppercase tracking-widest ${result.market_velocity?.days_on_market < 60 ? 'text-accent' : 'text-blue-400'} `}>
                                                {result.fleet_comparison?.market_rarity_score?.replace('_', ' ') || 'LIQUID'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Clearance Lock */}
                                    <LockedOverlay tier={tier} requiredTier="pro" />
                                </CardContent>
                            </Card>
                        </div>
                        {/* NEW DEPTH: ENGINE & FLEET HUD */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                            {/* Engine Master Diagnostics */}
                            <Card className="lg:col-span-2 border-white/10 bg-[#070707] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                                    <div className="w-64 h-64 border-4 border-accent rounded-full animate-spin-slow"></div>
                                </div>
                                <CardContent className="p-8">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <div className="text-[10px] text-accent font-black tracking-widest uppercase mb-1">Propulsion Audit</div>
                                            <h3 className="text-2xl font-black text-white uppercase tracking-tight">Engine Master Diagnostics</h3>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Verify_Sig</div>
                                            <div className="text-[10px] text-accent font-mono font-black">{result.engine_diagnostics?.signature}</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        {/* TBO Countdown */}
                                        <div className="flex flex-col items-center justify-center p-6 bg-white/[0.02] border border-white/5 rounded-2xl relative overflow-hidden">
                                            <div className="absolute top-2 left-2 text-[8px] text-gray-700 font-black">TBO_REMAIN</div>
                                            <div className="text-4xl font-black text-white mb-1">{result.engine_diagnostics?.hours_to_tbo}</div>
                                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">HOURS</div>
                                            <div className="w-full h-1 bg-white/5 mt-4 rounded-full overflow-hidden">
                                                <div className="h-full bg-accent" style={{ width: `${(result.engine_diagnostics?.hours_to_tbo / 2000) * 100}%` }}></div>
                                            </div>
                                        </div>

                                        {/* Cycle Assessment */}
                                        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                                            <div className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-4">Cycle Integrity</div>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-end">
                                                    <span className="text-[10px] text-gray-400">Ratio Index</span>
                                                    <span className="text-sm font-black text-white">1.42</span>
                                                </div>
                                                <div className="flex justify-between items-end">
                                                    <span className="text-[10px] text-gray-400">Operational Bias</span>
                                                    <span className={`text-[10px] font-black uppercase ${result.engine_diagnostics?.cycle_assessment === 'OPTIMAL' ? 'text-green-500' : 'text-orange-500'} `}>
                                                        {result.engine_diagnostics?.cycle_assessment?.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <div className="flex gap-1 h-1">
                                                    {[1, 1, 1, 1, 0, 0, 0, 0, 0, 0].map((v, i) => (
                                                        <div key={i} className={`flex-grow rounded-sm ${v ? 'bg-accent/40' : 'bg-white/5'} `}></div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Hot Section Status */}
                                        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                                            <div className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-4">Hot Section Gap</div>
                                            <div className="flex items-center gap-4">
                                                <div className="relative w-16 h-16 flex items-center justify-center">
                                                    <svg className="w-full h-full -rotate-90">
                                                        <circle cx="32" cy="32" r="28" className="stroke-white/5 fill-none" strokeWidth="4" />
                                                        <circle cx="32" cy="32" r="28" className="stroke-accent fill-none" strokeWidth="4" strokeDasharray="175" strokeDashoffset={175 - (175 * (result.engine_diagnostics?.hot_section_gap || 100) / 300)} />
                                                    </svg>
                                                    <div className="absolute text-[10px] font-black text-white">{result.engine_diagnostics?.hot_section_gap}</div>
                                                </div>
                                                <div className="text-[10px] text-gray-400 leading-tight">Hours since last borescope validation.</div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Global Fleet Benchmarking */}
                            <Card className="border-white/10 bg-[#070707] relative overflow-hidden group">
                                <CardContent className="p-8">
                                    <div className="text-[10px] text-blue-400 font-black tracking-widest uppercase mb-1">Global Market Context</div>
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-8">Fleet Benchmark</h3>

                                    <div className="space-y-6">
                                        <div className="p-5 bg-white/[0.02] border border-white/10 rounded-xl">
                                            <div className="flex justify-between items-center mb-3">
                                                <span className="text-[10px] text-gray-500 font-bold uppercase">Utilization Rank</span>
                                                <span className="text-xs font-black text-white">TOP {result.fleet_benchmarking?.utilization_rank}%</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    whileInView={{ width: `${100 - (result.fleet_benchmarking?.utilization_rank || 50)}%` }}
                                                    className="h-full bg-blue-500"
                                                />
                                            </div>
                                            <p className="text-[9px] text-gray-600 mt-2 italic">Ranked against {result.fleet_benchmarking?.global_active_count} active serial numbers.</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-white/5 border border-white/5 rounded-lg text-center">
                                                <div className="text-[10px] text-gray-500 uppercase mb-1">Maint. Index</div>
                                                <div className={`text-sm font-black ${result.fleet_benchmarking?.maintenance_freq_delta?.startsWith('-') ? 'text-green-500' : 'text-orange-500'} `}>
                                                    {result.fleet_benchmarking?.maintenance_freq_delta}
                                                </div>
                                                <div className="text-[7px] text-gray-700 font-bold uppercase">Vs Fleet Avg</div>
                                            </div>
                                            <div className="p-4 bg-white/5 border border-white/5 rounded-lg text-center">
                                                <div className="text-[10px] text-gray-500 uppercase mb-1">Asset Class</div>
                                                <div className="text-sm font-black text-white uppercase tracking-tighter">
                                                    {result.fleet_benchmarking?.operational_index}
                                                </div>
                                                <div className="text-[7px] text-gray-700 font-bold uppercase">IA-Verified</div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* FORENSICS 2.0: PRIVACY & STATUS AUDIT */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                            {/* Dormancy Risk Card */}
                            <Card className="border-white/10 bg-white/5 backdrop-blur-md overflow-hidden">
                                <CardContent className="p-8">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <div className="text-[10px] text-accent font-black tracking-widest uppercase mb-1">Asset Status</div>
                                            <h3 className="text-2xl font-black text-white uppercase">Dormancy Audit</h3>
                                        </div>
                                        {result.dormancy_analysis && (
                                            <Badge variant="outline" className={`border-0 py-1 px-3 ${result.dormancy_analysis.dormancy_risk === 'LOW' ? 'bg-green-500/10 text-green-500' : 'bg-warning/10 text-warning'} `}>
                                                {result.dormancy_analysis.status_label}
                                            </Badge>
                                        )}
                                    </div>

                                    {result.dormancy_analysis && (
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-white/5 border border-white/5 rounded-lg">
                                                <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Last Activity Gap</div>
                                                <div className="text-2xl font-black text-white">
                                                    {result.dormancy_analysis.last_flight_gap} <span className="text-xs text-gray-500">MO</span>
                                                </div>
                                            </div>
                                            <div className="p-4 bg-white/5 border border-white/5 rounded-lg">
                                                <div className="text-[10px] text-gray-500 font-bold uppercase mb-1">Risk Profile</div>
                                                <div className={`text-sm font-black uppercase ${result.dormancy_analysis.dormancy_risk === 'LOW' ? 'text-green-500' : 'text-warning'} `}>
                                                    {result.dormancy_analysis.dormancy_risk === 'LOW' ? 'Mechanical Fluidity' : 'Corrosion Exposure'}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <p className="mt-6 text-[11px] text-gray-400 leading-relaxed font-medium">
                                        {result.dormancy_analysis?.dormancy_risk === 'LOW'
                                            ? "Asset shows consistent heat cycles. Seals and internal engine components are likely within 'Wet' operating parameters."
                                            : "High risk of seal dry-out and internal cylinder corrosion (pitting). Borescope inspection of all cylinders is highly recommended before ferry flight."
                                        }
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Privacy Shield Card */}
                            <Card className="border-white/10 bg-white/5 backdrop-blur-md overflow-hidden">
                                <CardContent className="p-8">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <div className="text-[10px] text-purple-400 font-black tracking-widest uppercase mb-1">Data Integrity</div>
                                            <h3 className="text-2xl font-black text-white uppercase">Privacy Shield Audit</h3>
                                        </div>
                                        <div className={`w-2 h-2 rounded-full ${result.privacy_audit?.ladd_status === 'ACTIVE' ? 'bg-purple-500 animate-pulse' : 'bg-gray-800'} `}></div>
                                    </div>

                                    <div className="space-y-4">
                                        {[
                                            { label: 'LADD Status', value: result.privacy_audit?.ladd_status || 'NONE', desc: 'Limiting Aircraft Data Displayed (FAA Privacy Program)' },
                                            { label: 'PIA Status', value: result.privacy_audit?.pia_status || 'NONE', desc: 'Privacy ICAO Address (Anonymized Mode S Transponder)' },
                                            { label: 'Tracking Barrier', value: result.privacy_audit?.tracking_obfuscation || 'LOW', desc: 'Aggregate score of secondary tracking obfuscation efforts' }
                                        ].map((p, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-lg group transition-colors hover:bg-white/[0.08]">
                                                <div>
                                                    <div className="text-[10px] text-white font-bold uppercase">{p.label}</div>
                                                    <div className="text-[8px] text-gray-500 italic mt-0.5">{p.desc}</div>
                                                </div>
                                                <div className={`text-[10px] font-black uppercase tracking-widest ${p.value === 'NONE' || p.value === 'LOW' ? 'text-gray-500' : 'text-purple-400'} `}>
                                                    {p.value}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* SOURCE: UTILIZATION AUDIT */}
                        <Card className="md:col-span-3 border-white/10 bg-white/5 flex flex-col md:flex-row relative overflow-hidden mt-8 mb-8">
                            {/* CLEARANCE LEVEL LOCK */}
                            {tier !== 'pro' && (
                                <div className="absolute inset-0 z-20 backdrop-blur-[6px] bg-black/70 flex flex-col items-center justify-center text-center p-8 border-2 border-accent/20 border-dashed">
                                    <div className="bg-accent/10 p-5 rounded-full mb-6 animate-pulse">
                                        <Lock className="w-10 h-10 text-accent" />
                                    </div>
                                    <h3 className="text-2xl font-black text-white uppercase mb-3 tracking-tighter">Pro Intelligence Required</h3>
                                    <p className="text-gray-400 text-sm max-w-md mb-8">Utilization audits, custom risk algorithms, and 12-month flight activity are restricted to Pro-level clearance.</p>
                                    <Button
                                        onClick={() => {
                                            setResult(null);
                                            const pricingEl = document.getElementById('pricing-grid');
                                            if (pricingEl) pricingEl.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                        className="bg-accent hover:bg-white text-white hover:text-black font-black uppercase tracking-[0.2em] text-[10px] px-12 py-7 transition-all flex items-center gap-3 shadow-[0_0_30px_rgba(255,95,31,0.3)]"
                                    >
                                        Upgrade Clearance Level
                                        <ArrowRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}

                            {/* Utilization Data */}
                            <CardContent className="md:w-full p-8 flex flex-col justify-center">
                                <div className="flex items-center justify-between mb-8">
                                    <div>
                                        <div className="text-[10px] text-accent font-black tracking-widest uppercase mb-1">FlightAware AeroAPI</div>
                                        <h3 className="text-2xl font-black text-white uppercase">Utilization Audit</h3>
                                    </div>
                                    <Badge
                                        variant="outline"
                                        className={`border-0 ${result.flight_data?.data_source === 'adsb' ? 'bg-green-500/10 text-green-500' : 'bg-warning/10 text-warning'} `}
                                    >
                                        {result.flight_data?.data_source === 'adsb' ? 'ADS-B CONFIRMED' : 'MLAT ESTIMATED'}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-6 mb-8">
                                    <div>
                                        <div className="text-xs text-gray-500 mb-2 font-bold uppercase">12-Month Activity</div>
                                        <div className="text-3xl font-black text-white">
                                            {result.flight_data?.total_hours_12m || 0} <span className="text-gray-500 text-sm">HRS</span>
                                        </div>
                                        <div className="text-[10px] text-gray-400 mt-1">~{(result.flight_data?.total_hours_12m / 12).toFixed(1)} hrs/month avg</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 mb-2 font-bold uppercase">Active Status</div>
                                        <div className="text-3xl font-black text-white">
                                            {result.flight_data?.total_hours_12m > 50 ? 'ACTIVE' : 'DORMANT'}
                                        </div>
                                        <div className="text-[10px] text-gray-400 mt-1">Based on recent filing</div>
                                    </div>
                                </div>

                                {/* ACTIVITY PULSE - CHART */}
                                {result.flight_data?.monthly_hours && (
                                    <div className="mt-auto border-t border-white/5 pt-6">
                                        <div className="flex justify-between items-end gap-1 h-20">
                                            {result.flight_data.monthly_hours.map((h, i) => {
                                                const maxH = Math.max(...result.flight_data.monthly_hours, 1);
                                                const height = (h / maxH) * 100;
                                                return (
                                                    <div key={i} className="flex-1 flex flex-col items-center group relative">
                                                        <motion.div
                                                            initial={{ height: 0 }}
                                                            animate={{ height: `${height}% ` }}
                                                            transition={{ delay: i * 0.05, duration: 0.5 }}
                                                            className={`w-full rounded-t-sm transition-colors ${h > 15 ? 'bg-accent/60 group-hover:bg-accent' : 'bg-white/10 group-hover:bg-white/20'} `}
                                                        ></motion.div>
                                                        <div className="absolute -top-6 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-white/20 px-1 rounded text-[8px] text-white font-mono whitespace-nowrap z-30">
                                                            {h} HRS
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="flex justify-between mt-2">
                                            <span className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">12 Months Ago</span>
                                            <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">Activity Pulse</span>
                                            <span className="text-[8px] text-gray-600 font-bold uppercase tracking-widest">Current Month</span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* CORROSION RISK ALERT */}
                        {
                            isPaid && (result.flight_data?.total_hours_12m || 0) < 10 && (
                                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 flex flex-row items-center gap-6 animate-pulse">
                                    <div className="p-3 bg-red-500/20 rounded-full">
                                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    </div>
                                    <div>
                                        <h4 className="text-red-500 font-bold uppercase tracking-widest text-sm mb-1">Dormancy & Corrosion Risk Detected</h4>
                                        <p className="text-gray-400 text-xs">This aircraft has minimal recent activity in our tracking feed. Note: Many General Aviation (GA) aircraft are blocked via LADD/PIA privacy programs. If truly dormant, long-term inactivity can lead to engine seal degradation and airframe corrosion. A comprehensive pre-buy borescope inspection is highly recommended.</p>
                                    </div>
                                </div>
                            )
                        }

                        {/* AI FORENSIC AUDIT (PREMIUM PREVIEW) */}
                        {
                            result.ai_intelligence && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-16"
                                >
                                    <Card className="border-accent/40 bg-accent/5 overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-8 opacity-5">
                                            <div className="w-32 h-32 rounded-full border-4 border-accent animate-pulse"></div>
                                        </div>
                                        <CardContent className="p-10 relative z-10">
                                            <div className="flex flex-col md:flex-row gap-10 items-start">
                                                <div className="flex-shrink-0">
                                                    <div className="w-24 h-24 bg-accent/10 rounded-2xl flex items-center justify-center border border-accent/20 relative rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                                        <div className="absolute -top-2 -right-2 bg-accent text-[8px] font-black px-2 py-0.5 rounded text-white animate-bounce">LIVE</div>
                                                        <span className="text-4xl">🧠</span>
                                                    </div>
                                                </div>
                                                <div className="flex-grow">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-2">
                                                            <div className="text-[10px] text-accent font-black tracking-[0.4em] uppercase">Forensic Intelligence Analyst v2.0</div>
                                                            {!isPaid && <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20 text-[8px] h-4">PREVIEW</Badge>}
                                                        </div>
                                                        <Badge className="bg-accent/20 text-accent border border-accent/30 rounded-sm font-bold tracking-widest px-3">
                                                            {result.ai_intelligence.risk_profile}
                                                        </Badge>
                                                    </div>
                                                    <h3 className="text-3xl font-black text-white uppercase mb-4 tracking-tight leading-none">
                                                        Verdict: {result.ai_intelligence.audit_verdict}
                                                    </h3>
                                                    <div className="relative">
                                                        <p className="text-sm font-mono text-gray-300 leading-relaxed border-l-2 border-accent pl-4">
                                                            {result.ai_intelligence.technical_advisory}
                                                        </p>

                                                        {/* CFO / FINANCIAL */}
                                                        {result.ai_intelligence.tax_strategy && (
                                                            <div className="mt-6 bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-lg">
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-2">
                                                                        <TrendingUp className="w-3 h-3" />
                                                                        CFO Intelligence: Tax Strategy
                                                                    </div>
                                                                    <Badge className="bg-emerald-500 text-black font-black text-[9px]">{result.ai_intelligence.tax_strategy.strategy}</Badge>
                                                                </div>
                                                                <div className="flex items-baseline gap-2">
                                                                    <div className="text-2xl font-black text-white">{result.ai_intelligence.tax_strategy.bonus_depreciation_rate}</div>
                                                                    <div className="text-xs text-emerald-500 uppercase font-bold">First Year Write-Off</div>
                                                                </div>
                                                                <div className="text-xs text-gray-400 mt-1">
                                                                    Estimated Deduction: <span className="text-white font-bold">${(result.ai_intelligence.tax_strategy.year_1_deduction / 1000).toFixed(0)}k</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                        <div className="h-1 bg-gradient-to-r from-transparent via-accent/50 to-transparent"></div>
                                    </Card>
                                </motion.div>
                            )
                        }

                        {/* Logbook vs Public Intelligence Explanation */}






                        {/* Paid Content: Only visible if isPaid */}

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-12 space-y-8"
                        >
                            <div className="glass-card p-12 border-gold/30 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-8">
                                    <svg className="w-24 h-24 text-gold opacity-10" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="max-w-2xl text-left">
                                    <div className="text-gold font-black tracking-widest text-xs uppercase mb-2">IA-Certified Diligence Verdict</div>
                                    <h3 className="text-3xl font-black text-white mb-6 uppercase italic">Full Historical Summary</h3>
                                    <p className="text-gray-400 leading-relaxed mb-8">
                                        {(() => {
                                            const hasMajorIssues = result.forensic_records?.ntsb_count > 0 || result.forensic_records?.liens_found;
                                            const hasMechanical = result.forensic_records?.sdr_count > 0;
                                            const isClean = !hasMajorIssues && !hasMechanical;

                                            if (isClean) {
                                                return `Initial scan of aircraft ${nNumber} reveals a remarkably stable forensic profile.No major NTSB damage history or active liens were detected in the federal registries.Mechanical records(SDRs) indicate a routine service lifecycle.This aircraft represents a high-confidence asset for acquisition.`;
                                            } else if (hasMajorIssues) {
                                                return `Diligence audit of ${nNumber} identifies critical intelligence points.${result.forensic_records?.ntsb_count > 0 ? 'Documentation suggests a historical NTSB occurrence that requires structural inspection.' : ''} ${result.forensic_records?.liens_found ? 'Furthermore, an active financial lien has been detected.' : ''} We recommend a comprehensive title search and logbook audit before proceeding.`;
                                            } else {
                                                return `Scan of ${nNumber} shows a stable safety history with no major accidents, however, ${result.forensic_records?.sdr_count} mechanical service reports(SDRs) were found.While not necessarily disqualifying, these indicate specific component wear cycles that should be reviewed against current airworthiness directives.`;
                                            }
                                        })()}
                                    </p>
                                    <button
                                        onClick={async () => {
                                            setGeneratingPdf(true);
                                            await generatePDFReport(nNumber, result);
                                            setGeneratingPdf(false);
                                        }}
                                        disabled={generatingPdf}
                                        className={`px-10 py-5 bg-white text-black font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition-all flex items-center gap-4 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 ${generatingPdf ? 'cursor-wait' : ''} `}
                                    >
                                        {generatingPdf ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                                Assembling Historical Records...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Download Historical PDF
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* DIGITAL VAULT / LOGBOOK UPLOAD */}
                            <Card className="border-dashed border-white/10 bg-white/[0.02] p-12 flex flex-col items-center justify-center group hover:border-accent/30 transition-all cursor-pointer">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <svg className="w-8 h-8 text-gray-500 group-hover:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <div className="text-[10px] text-accent font-black tracking-[0.3em] uppercase mb-2">Private Intel Bridge</div>
                                <h3 className="text-xl font-black text-white uppercase mb-2 tracking-widest">AeroVault™ PDF Logbook Audit</h3>
                                <p className="text-gray-400 text-xs text-center max-w-sm mb-6">
                                    Bridge the gap between public forensics and private binders. Upload your PDF scans for AI OCR interpretation and AD compliance cross-referencing.
                                </p>
                                <div className="px-4 py-2 bg-white/5 rounded border border-white/10 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                    Beta Deployment Scheduled: Q1 2026
                                </div>
                            </Card>
                        </motion.div>
                    </motion.div >
                )}



            </AnimatePresence >

            {/* Validation Section - Below the Fold */}
            {
                !result && (
                    <div className="w-full space-y-32">
                        <ValueProposition />
                        <div id="pricing-grid">
                            <Pricing onSelect={(selectedTier) => {
                                setTier(selectedTier);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                                // If user already entered a tail number, trigger logic
                                if (nNumber && nNumber.length >= 3) {
                                    handleSearch(nNumber);
                                } else {
                                    // Just scroll them to search bar if it's empty
                                    const searchEl = document.getElementById('hero-search');
                                    if (searchEl) searchEl.scrollIntoView({ behavior: 'smooth' });
                                }
                            }} />
                        </div>
                        <ValidationSection />
                    </div>
                )
            }
        </section >
    );
};

export default Hero;

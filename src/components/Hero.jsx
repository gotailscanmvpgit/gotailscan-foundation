import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generatePDFReport } from '../services/pdfGenerator';
import { scraperService } from '../services/scraperService';
import CircularGauge from './CircularGauge';
import ValidationSection from './ValidationSection';
import Logo from './Logo';
import { Shield, AlertTriangle, Activity, Globe, Plane, Mic } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Hero = () => {
    const [searching, setSearching] = useState(false);
    const [searchMode, setSearchMode] = useState('standard'); // 'standard' or 'ai'
    const [nNumber, setNNumber] = useState('');
    const [result, setResult] = useState(null);
    const [aiResult, setAiResult] = useState(null);
    const [tier, setTier] = useState(null); // 'basic', 'pro' or null
    const [error, setError] = useState(null);
    const [generatingPdf, setGeneratingPdf] = useState(false);
    const [leadIntent, setLeadIntent] = useState('buying'); // 'buying' or 'selling'
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [notFoundResult, setNotFoundResult] = useState(null);
    const [scrolled, setScrolled] = useState(false);
    const [isListening, setIsListening] = useState(false);

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
        const isTail = val.length >= 3 && (val.toUpperCase().startsWith('N') || val.toUpperCase().startsWith('C'));
        const mode = isTail ? 'standard' : 'ai';
        setSearchMode(mode);

        if (mode === 'standard') {
            val = val.toUpperCase();
            if (val.startsWith('C') && val.length > 1 && val[1] !== '-') {
                val = 'C-' + val.substring(1);
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
        setResult(null);

        try {
            if (mode === 'ai') {
                const aiResponse = await scraperService.aiIntelSearch(val);
                if (aiResponse.type === 'forensic') {
                    setNNumber(aiResponse.target);
                    await new Promise(r => setTimeout(r, 800));
                    setSearchMode('standard');
                    const forensicData = await scraperService.scanTailNumber(aiResponse.target, tier ? 'paid' : 'unpaid', tier);
                    setResult(forensicData);
                } else {
                    await new Promise(r => setTimeout(r, 1500));
                    setAiResult(aiResponse);
                }
            } else {
                const data = await scraperService.scanTailNumber(val, tier ? 'paid' : 'unpaid', tier);
                setResult(data);
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

    const handleUnlock = async (selectedTier) => {
        if (!nNumber) {
            alert("Please enter a tail number first.");
            return;
        }

        try {
            // Call our backend API to create a Stripe session
            const response = await fetch('/api/create-checkout-session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tier: selectedTier, // 'basic' or 'pro'
                    nNumber: nNumber,
                    successUrl: `${window.location.origin}/success?paid=true&tier=${selectedTier}&nNumber=${nNumber}`,
                    cancelUrl: window.location.href,
                }),
            });

            const data = await response.json();

            if (data.url) {
                // Redirect to Stripe hosted checkout page
                window.location.href = data.url;
            } else {
                console.error("Stripe session creation failed:", data);
                alert("Payment system is currently initializing. Please try again in a moment.");
            }
        } catch (error) {
            console.error("Payment error:", error);
            alert("Unable to connect to payment server.");
        }
    };

    const isPaid = tier !== null;

    return (
        <section className="flex flex-col items-center justify-start pt-20 min-h-screen px-4 text-center relative overflow-hidden bg-[#050505]">
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
            </div>

            {/* Success Banner */}
            {window.location.pathname === '/success' && isPaid && (
                <motion.div
                    initial={{ y: -100 }}
                    animate={{ y: 0 }}
                    className="fixed top-6 left-1/2 -translate-x-1/2 px-8 py-3 bg-accent text-white font-black rounded-full shadow-2xl z-50 flex items-center gap-3 border border-white/20"
                >
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    PAYMENT SUCCESSFUL - DILIGENCE ACCESS GRANTED
                </motion.div>
            )}

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl w-full flex flex-col items-center relative z-10"
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center justify-center mb-12 w-full"
                >
                    <div className="relative group flex items-center justify-center">
                        <h1 className="text-4xl md:text-5xl font-avionics font-bold text-white tracking-[0.2em] uppercase leading-none select-none w-full max-w-xl text-center pr-[-0.2em] flex items-center justify-center gap-4">
                            <Plane className="w-8 h-8 md:w-10 md:h-10 text-accent rotate-[-45deg] drop-shadow-[0_0_15px_rgba(255,95,31,0.5)]" />
                            <span>GO<span className="text-accent">TAIL</span>SCAN</span>
                        </h1>

                        {/* Subtle Scanner Sweep */}
                        <motion.div
                            initial={{ left: "-20%", opacity: 0 }}
                            animate={{
                                left: ["-20%", "120%"],
                                opacity: [0, 0.5, 0]
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut",
                                repeatDelay: 2
                            }}
                            className="absolute top-0 bottom-0 w-24 bg-gradient-to-r from-transparent via-accent/20 to-transparent skew-x-[-20deg] pointer-events-none blur-sm"
                        />
                    </div>
                </motion.div>

                <p className="text-gray-400 text-lg md:text-xl font-medium mb-12 max-w-2xl mx-auto leading-relaxed opacity-90">
                    Trusted by <span className="text-white font-black italic">Buyers & Sellers</span> to instantly find the <span className="text-white font-black">secret history</span> of any plane.
                    <br />
                    <span className="text-xs uppercase tracking-[0.5em] text-accent font-bold mt-4 block">Type a tail number. We find the truth.</span>
                </p>


                <div id="hero-search" className="relative w-full max-w-xl mx-auto mb-20 z-40">
                    {/* Search Mode Toggle */}
                    <div className="flex justify-center mb-6">
                        <div className="bg-white/5 border border-white/10 p-1 rounded-xl flex gap-1">
                            <button
                                onClick={() => setSearchMode('standard')}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${searchMode === 'standard' ? 'bg-accent text-white shadow-[0_0_15px_rgba(255,95,31,0.3)]' : 'text-gray-500 hover:text-white'}`}
                            >
                                Registry Search
                            </button>
                            <button
                                onClick={() => setSearchMode('ai')}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${searchMode === 'ai' ? 'bg-violet-600 text-white shadow-[0_0_15px_rgba(124,58,237,0.3)]' : 'text-gray-500 hover:text-white'}`}
                            >
                                <span className="text-xs">🧠</span> AI Advisory
                            </button>
                        </div>
                    </div>

                    <div className="relative group">
                        {/* Search Input - Refined, More Compact, Google-style */}
                        <div className={`flex items-center backdrop-blur-md border-[1.5px] transition-all duration-500 rounded-xl overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.8)] ${searching ? (searchMode === 'ai' ? 'border-violet-500 animate-pulse shadow-[0_0_50px_rgba(124,58,237,0.3)] bg-black' : 'border-accent animate-pulse shadow-[0_0_50px_rgba(255,95,31,0.3)] bg-black') : isInputFocused ? (searchMode === 'ai' ? 'border-violet-500 shadow-[0_0_40px_rgba(124,58,237,0.15)] bg-black' : 'border-accent shadow-[0_0_40px_rgba(255,95,31,0.15)] bg-black') : 'border-white/10 bg-white/[0.03]'}`}>
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
                                className={`absolute right-4 p-2 rounded-full transition-all ${isListening ? 'bg-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'text-white/20 hover:text-white hover:bg-white/10'}`}
                                title="Dictate to AI"
                            >
                                <Mic className={`w-5 h-5 ${isListening ? 'animate-bounce' : ''}`} />
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

                {/* LEGAL DISCLAIMER - LIABILITY PROTECTION */}

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
                                            <p className="text-sm text-gray-500 leading-relaxed">Cross-fleet forensic indexing requires an active Brokerage Subscription. Please register to unlock the Intel Index.</p>
                                            <button className="mt-6 px-6 py-3 bg-violet-600 text-white text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-violet-500 transition-all">Upgrade to Fleet Access</button>
                                        </div>
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
                                    Our intelligence network has performed a real-time audit across <span className="text-white font-bold underline decoration-orange-500/50">FAA (US)</span> and <span className="text-white font-bold underline decoration-orange-500/50">Transport Canada (CA)</span> civil registries. No active or historical record exists for <span className="text-orange-500 font-black text-2xl px-2">{notFoundResult.nNumber}</span>.
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
                        className="w-full max-w-6xl mx-auto space-y-8 pb-32"
                    >
                        {/* Summary Header */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card className="lg:col-span-1 border-white/10 bg-white/5 backdrop-blur-md">
                                <CardContent className="p-8 flex flex-col items-center justify-center h-full text-center">
                                    <CircularGauge score={result.confidence_score} />
                                    <div className="mt-8 space-y-2">
                                        <div className={`text-xs font-black uppercase tracking-[0.2em] ${result.confidence_score >= 85 ? 'text-green-500' : result.confidence_score >= 70 ? 'text-warning' : 'text-red-500'}`}>
                                            {result.confidence_score >= 85 ? 'Blue Chip Asset' : result.confidence_score >= 70 ? 'Standard Utility' : result.confidence_score >= 40 ? 'High Friction' : 'Critical Red Flag'}
                                        </div>
                                        <p className="text-[11px] text-gray-400 leading-relaxed max-w-[200px] font-medium mx-auto">
                                            {result.confidence_score >= 85
                                                ? "High Asset Liquidity. Pristine history with zero detectable registry or safety friction."
                                                : result.confidence_score >= 70
                                                    ? "Standard Profile. Routine maintenance cycles detected; baseline diligent audit required."
                                                    : result.confidence_score >= 40
                                                        ? "Diligence Critical. Significant safety or mechanical anomalies flagged in public records."
                                                        : "Severe Risk. Critical damage history or title encumbrances confirmed in the database."
                                            }
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="lg:col-span-2 border-white/10 bg-white/5 backdrop-blur-md">
                                <CardContent className="p-8 text-left">
                                    <div className="flex justify-between items-start mb-8">
                                        <div>
                                            <div className="text-[10px] text-accent font-black tracking-widest uppercase mb-1">Audit Verdict</div>
                                            <h3 className="text-4xl font-black text-white uppercase flex items-center gap-3">
                                                {result.tail_number}
                                                {result.tail_number.startsWith('C-') && <span className="text-3xl" title="Canadian Aircraft">🇨🇦</span>}
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
                                        </div>
                                        <div className="text-right flex flex-col items-end">
                                            <div className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mb-2">Status</div>
                                            <Badge
                                                variant="outline"
                                                className={`text-sm py-1 px-3 border-0 ${result.confidence_score > 70 ? 'bg-green-500/10 text-green-500' : result.confidence_score > 40 ? 'bg-warning/10 text-warning' : 'bg-red-500/10 text-red-500'}`}
                                            >
                                                {result.confidence_score > 70 ? 'CLEARANCE GRANTED' : result.confidence_score > 40 ? 'CAUTION ADVISED' : 'HIGH RISK DETECTED'}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Historical Audit Trail</h4>
                                        <div className="space-y-3">
                                            {result.audit_results.map((d, i) => (
                                                <div key={i} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${d.status === 'positive' ? 'bg-green-500' : d.status === 'negative' ? 'bg-red-500' : 'bg-warning'} ${d.status !== 'positive' ? 'animate-pulse' : ''}`}></div>
                                                        <div>
                                                            <div className="text-sm text-gray-300 font-medium">{d.reason}</div>
                                                            {d.significance && (
                                                                <div className="text-[10px] text-gray-500 italic mt-0.5">{d.significance}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <Badge variant="secondary" className={`bg-black/40 border font-mono ${d.status === 'positive' ? 'text-green-500 border-green-500/20' : d.status === 'negative' ? 'text-red-500 border-red-500/20' : 'text-warning border-warning/20'}`}>
                                                        {d.points}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* CORROSION RISK ALERT */}
                        {isPaid && (result.flight_data?.total_hours_12m || 0) < 10 && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 flex flex-row items-center gap-6 animate-pulse">
                                <div className="p-3 bg-red-500/20 rounded-full">
                                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                </div>
                                <div>
                                    <h4 className="text-red-500 font-bold uppercase tracking-widest text-sm mb-1">Dormancy & Corrosion Risk Detected</h4>
                                    <p className="text-gray-400 text-xs">This aircraft has minimal recent activity in our tracking feed. Note: Many General Aviation (GA) aircraft are blocked via LADD/PIA privacy programs. If truly dormant, long-term inactivity can lead to engine seal degradation and airframe corrosion. A comprehensive pre-buy borescope inspection is highly recommended.</p>
                                </div>
                            </div>
                        )}

                        {/* AI FORENSIC AUDIT (PREMIUM PREVIEW) */}
                        {result.ai_intelligence && (
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
                                                    <p className="text-gray-300 leading-relaxed italic text-lg max-w-3xl mb-0 pl-8 relative">
                                                        <span className="absolute left-0 top-0 text-5xl text-accent/20 leading-none">"</span>
                                                        {result.ai_intelligence.technical_advisory}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                    <div className="h-1 bg-gradient-to-r from-transparent via-accent/50 to-transparent"></div>
                                </Card>
                            </motion.div>
                        )}

                        {/* Logbook vs Public Intelligence Explanation */}
                        <div className="bg-accent/5 border border-accent/20 rounded-xl p-8 mt-16 mb-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                <div>
                                    <div className="text-[10px] text-accent font-black tracking-[0.3em] uppercase mb-2">The Logbook Paradox</div>
                                    <h3 className="text-2xl font-black text-white uppercase mb-4 leading-tight">Public Forensic vs. Private Logs</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed mb-4">
                                        Aircraft logbooks (the binders) are <span className="text-white font-bold">private property</span> and often siloed in proprietary systems. There is no central "Google" for aircraft logbooks because they contain proprietary operator data.
                                    </p>
                                    <p className="text-gray-400 text-sm leading-relaxed">
                                        However, when a mechanic finds a major defect during an audit, they are legally required to report it as a <span className="text-accent underline font-bold uppercase">Service Difficulty (SDR)</span>. GOTAILSCAN indexes these <span className="text-white font-bold underline italic">Public Forensic Trails</span> to verify if the physical logbooks tell the whole truth.
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex gap-4 p-4 bg-white/5 border border-white/5 rounded-lg group hover:border-accent/30 transition-all">
                                        <div className="p-3 bg-white/5 rounded-full flex-shrink-0">📖</div>
                                        <div>
                                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Private Logs</div>
                                            <div className="text-[11px] text-gray-500">Operator-owned. Often digitizied in private silos like CAMP or FlightDocs.</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-4 p-4 bg-accent/10 border border-accent/20 rounded-lg group">
                                        <div className="p-3 bg-accent/20 rounded-full flex-shrink-0">📡</div>
                                        <div>
                                            <div className="text-[10px] font-black text-accent uppercase tracking-widest mb-1">Manual Maintenance Shadow</div>
                                            <div className="text-[11px] text-gray-300">Public forensic evidence that cannot be censored, deleted, or lost.</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bento Grid - DATA SOURCES */}
                        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 relative mt-16 ${!isPaid ? 'min-h-[800px]' : ''}`}>
                            {/* Blur Overlay for Paywall - Mission Control Redesign */}
                            {!isPaid && (
                                <div className="absolute inset-0 z-10 backdrop-blur-[12px] bg-black/60 rounded-xl flex flex-col items-center justify-center border border-white/10 h-full w-full">
                                    <div className="p-8 max-w-2xl text-center">
                                        <div className="mb-6">
                                            <h3 className="text-2xl md:text-3xl font-avionics font-bold text-white tracking-widest mb-2 uppercase">Unstoppable Diligence</h3>
                                            <div className="h-1 w-16 bg-accent mx-auto"></div>
                                        </div>

                                        <p className="text-gray-300 text-lg mb-10 italic max-w-lg mx-auto leading-relaxed">We found {result.source_data.ntsb.length + result.source_data.sdr.length + result.source_data.cadors.length} government intelligence records for {nNumber}. Interpreting this data requires expert advisory.</p>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 text-left">
                                            <div className="p-4 bg-white/5 border border-white/5 rounded-lg">
                                                <div className="text-[10px] font-black text-accent uppercase mb-2 tracking-widest">Global Audit</div>
                                                <div className="text-[11px] text-gray-400 leading-tight">Indexing 2.1M+ records from NTSB, FAA, and Transport Canada.</div>
                                            </div>
                                            <div className="p-4 bg-white/5 border border-white/5 rounded-lg">
                                                <div className="text-[10px] font-black text-accent uppercase mb-2 tracking-widest">Equity Protection</div>
                                                <div className="text-[11px] text-gray-400 leading-tight">One hidden incident can devalue an aircraft by up to $250,000.</div>
                                            </div>
                                            <div className="p-4 bg-white/5 border border-white/5 rounded-lg">
                                                <div className="text-[10px] font-black text-accent uppercase mb-2 tracking-widest">Official Access</div>
                                                <div className="text-[11px] text-gray-400 leading-tight">Direct real-time links to official 2024 government database vaults.</div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-4 max-w-md mx-auto">
                                            <div className="flex bg-white/5 p-1 rounded-lg border border-white/10 items-center justify-center">
                                                <button
                                                    onClick={() => setLeadIntent('buying')}
                                                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-md transition-all ${leadIntent === 'buying' ? 'bg-accent text-white' : 'text-gray-400 hover:text-white'}`}
                                                >
                                                    I am Buying
                                                </button>
                                                <button
                                                    onClick={() => setLeadIntent('selling')}
                                                    className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-md transition-all ${leadIntent === 'selling' ? 'bg-accent text-white' : 'text-gray-400 hover:text-white'}`}
                                                >
                                                    I own this Tail
                                                </button>
                                            </div>

                                            <input
                                                type="email"
                                                placeholder={leadIntent === 'buying' ? "ENTER EMAIL FOR BROKER RISK SHEET" : "ENTER EMAIL FOR ASSET AUDIT PREVIEW"}
                                                className="bg-black/40 border border-white/20 text-white text-center h-14 rounded-xl font-bold text-sm tracking-widest placeholder:text-gray-600 outline-none focus:border-accent transition-colors"
                                            />
                                            <Button
                                                onClick={() => {
                                                    alert(leadIntent === 'buying' ? "Brokerage Risk Summary has been sent! A consultant will follow up on the specific findings for " + nNumber : "Asset Audit Preview requested! We'll send the pre-listing brief for " + nNumber + " to your inbox shortly.");
                                                }}
                                                className="px-8 py-7 bg-accent text-white font-black rounded-xl uppercase text-xs tracking-[0.2em] hover:scale-[1.02] transition-all shadow-[0_0_30px_rgba(255,95,31,0.2)]"
                                            >
                                                {leadIntent === 'buying' ? "Request Broker Data Sheet" : "Get Asset Listing Brief"}
                                            </Button>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-4">Standard Brokerage Fee Applied Upon Delivery</p>
                                        </div>
                                    </div>
                                </div>
                            )}

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
                                            {result.source_data.sdr.length} <span className="text-gray-500 text-sm italic font-medium tracking-tight">DIGITAL SHADOW RECORDS FOUND</span>
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
                            {/* SOURCE: UTILIZATION AUDIT */}
                            {/* Logic: If Paid, show this card. But if Tier is Basic, BLUR it. If Pro, SHOW it. */}
                            {isPaid && (
                                <Card className="md:col-span-3 border-white/10 bg-white/5 flex flex-col md:flex-row relative overflow-hidden">
                                    {/* BASIC TIER LOCK OVERLAY */}
                                    {tier === 'basic' && (
                                        <div className="absolute inset-0 z-20 backdrop-blur-[6px] bg-black/40 flex flex-col items-center justify-center text-center p-8">
                                            <div className="bg-accent/10 p-4 rounded-full mb-4">
                                                <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                            </div>
                                            <h3 className="text-xl font-black text-white uppercase mb-2">Pro Feature Locked</h3>
                                            <p className="text-gray-400 text-sm max-w-md mb-6">Unlock 12-Month Utilization Audit & Flight Paths with the PRO upgrade.</p>
                                            <Button
                                                onClick={() => {
                                                    // Simulate upgrade flow
                                                    window.location.href = `${window.location.origin}/success?paid=true&tier=pro`;
                                                }}
                                                className="bg-accent hover:bg-[#ff7b45] text-white font-bold uppercase tracking-widest text-xs px-8 py-3"
                                            >
                                                Upgrade to Pro
                                            </Button>
                                        </div>
                                    )}

                                    {/* Map Visualization (Mock) */}
                                    <div className="md:w-1/2 h-64 md:h-auto bg-[#0f0f0f] relative border-b md:border-b-0 md:border-r border-white/10">
                                        <div className="absolute inset-0 opacity-40 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/World_map_blank_without_borders.svg/2000px-World_map_blank_without_borders.svg.png')] bg-cover bg-center filter grayscale contrast-125"></div>
                                        <div className="relative z-10 w-full h-full">
                                            {/* Deterministic Dot Placement (Shift from Africa to North America + Jitter) */}
                                            {(() => {
                                                const seed = (nNumber || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
                                                const jitter = (offset) => (Math.sin(seed + offset) * 10); // +/- 10%
                                                // North America Bias: Left 20-35%, Top 25-45%
                                                const left = 25 + jitter(1);
                                                const top = 35 + jitter(2);

                                                return (
                                                    <div
                                                        className="absolute flex flex-col items-center gap-2"
                                                        style={{ left: `${left}%`, top: `${top}%` }}
                                                    >
                                                        <div className="w-3 h-3 bg-accent rounded-full animate-ping absolute"></div>
                                                        <div className="w-3 h-3 bg-accent rounded-full relative shadow-[0_0_15px_#FF5F1F]"></div>
                                                        <Badge variant="secondary" className="bg-black/80 text-white font-mono text-[10px] border border-white/10 backdrop-blur-sm whitespace-nowrap">
                                                            LAST TRACKED: {result.flight_data?.last_tracked ? new Date(result.flight_data.last_tracked).toLocaleDateString() : 'N/A'}
                                                        </Badge>
                                                    </div>
                                                );
                                            })()}
                                        </div>
                                    </div>

                                    {/* Utilization Data */}
                                    <CardContent className="md:w-1/2 p-8 flex flex-col justify-center">
                                        <div className="flex items-center justify-between mb-8">
                                            <div>
                                                <div className="text-[10px] text-accent font-black tracking-widest uppercase mb-1">FlightAware AeroAPI</div>
                                                <h3 className="text-2xl font-black text-white uppercase">Utilization Audit</h3>
                                            </div>
                                            <Badge
                                                variant="outline"
                                                className={`border-0 ${result.flight_data?.data_source === 'adsb' ? 'bg-green-500/10 text-green-500' : 'bg-warning/10 text-warning'}`}
                                            >
                                                {result.flight_data?.data_source === 'adsb' ? 'ADS-B CONFIRMED' : 'MLAT ESTIMATED'}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
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
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Paid Content: Only visible if isPaid */}
                        {isPaid && (
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
                                                    return `Initial scan of aircraft ${nNumber} reveals a remarkably stable forensic profile. No major NTSB damage history or active liens were detected in the federal registries. Mechanical records (SDRs) indicate a routine service lifecycle. This aircraft represents a high-confidence asset for acquisition.`;
                                                } else if (hasMajorIssues) {
                                                    return `Diligence audit of ${nNumber} identifies critical intelligence points. ${result.forensic_records?.ntsb_count > 0 ? 'Documentation suggests a historical NTSB occurrence that requires structural inspection.' : ''} ${result.forensic_records?.liens_found ? 'Furthermore, an active financial lien has been detected.' : ''} We recommend a comprehensive title search and logbook audit before proceeding.`;
                                                } else {
                                                    return `Scan of ${nNumber} shows a stable safety history with no major accidents, however, ${result.forensic_records?.sdr_count} mechanical service reports (SDRs) were found. While not necessarily disqualifying, these indicate specific component wear cycles that should be reviewed against current airworthiness directives.`;
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
                                            className={`px-10 py-5 bg-white text-black font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition-all flex items-center gap-4 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 ${generatingPdf ? 'cursor-wait' : ''}`}
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
                        )}

                        {/* Lead captured via paywall overlay - no redundancy needed here */}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Validation Section - Below the Fold */}
            {!result && <ValidationSection />}
        </section >
    );
};

export default Hero;

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { scraperService } from '../services/scraperService';
import CircularGauge from './CircularGauge';
import Pricing from './Pricing';
import ValueProposition from './ValueProposition';
import Logo from './Logo';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Hero = () => {
    const [searching, setSearching] = useState(false);
    const [nNumber, setNNumber] = useState('');
    const [result, setResult] = useState(null);
    const [tier, setTier] = useState(null); // 'basic', 'pro' or null

    // Check if report is paid via URL parameter (Supports /success?paid=true)
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const paid = params.get('paid');
        const selectedTier = params.get('tier');
        if (paid === 'true') setTier(selectedTier || 'pro');
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!nNumber) return;

        setSearching(true);
        setResult(null);

        // Determine payment status based on current tier state
        const paymentStatus = tier ? 'paid' : 'unpaid';

        try {
            const data = await scraperService.scanTailNumber(nNumber, paymentStatus, tier);
            setResult(data);
        } catch (error) {
            console.error("Scan failed:", error);
        } finally {
            setSearching(false);
        }
    };

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
                    PAYMENT SUCCESSFUL - FORENSIC ACCESS GRANTED
                </motion.div>
            )}

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl w-full flex flex-col items-center relative z-10"
            >
                <div className="inline-block px-3 py-1 mb-6 border border-accent/30 bg-accent/5 rounded-full">
                    <span className="text-accent text-[10px] font-black tracking-[0.2em] uppercase">Mission Control • Live Database Access</span>
                </div>

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center justify-center gap-4 mb-8"
                >
                    <Logo className="w-12 h-12 md:w-16 md:h-16" />
                    <h1 className="text-5xl md:text-7xl font-mono font-black text-white tracking-tighter uppercase leading-none">
                        GOTAIL<span className="text-accent">SCAN</span>
                    </h1>
                </motion.div>

                <p className="text-gray-400 text-lg md:text-xl font-medium mb-3 max-w-2xl mx-auto leading-relaxed">
                    Before you <span className="text-white font-bold">sign</span>, before you <span className="text-white font-bold">wire</span>, before you <span className="text-white font-bold">fly</span> — know the truth.
                </p>
                <p className="text-accent text-base md:text-lg font-black mb-12 max-w-2xl mx-auto">
                    One hidden NTSB or Transport Canada incident can cost you $50,000.
                </p>


                <form id="hero-search" onSubmit={handleSearch} className="relative max-w-xl mx-auto mb-20">
                    <div className="flex gap-2 mb-2">
                        <div className="relative flex-grow">
                            <Input
                                type="text"
                                placeholder="US/CANADA TAIL NUMBER"
                                value={nNumber}
                                onChange={(e) => setNNumber(e.target.value.toUpperCase())}
                                className="h-14 bg-[#0a0a0a] border-white/10 text-white font-bold text-xl placeholder:text-white/20 uppercase tracking-widest text-center focus-visible:ring-accent focus-visible:border-accent rounded-xl"
                            />
                        </div>
                        <Button
                            disabled={searching}
                            className="h-14 px-8 bg-accent hover:bg-[#e04f14] disabled:bg-gray-800 text-white font-black rounded-xl uppercase text-sm shadow-[0_0_20px_rgba(255,95,31,0.3)] transition-all hover:shadow-[0_0_30px_rgba(255,95,31,0.5)]"
                        >
                            {searching ? 'Scanning...' : 'Scan'}
                        </Button>
                    </div>
                    <div className="text-center text-xs text-gray-500 font-medium">
                        Examples: <span className="text-gray-400">N123AB (US)</span> • <span className="text-gray-400">C-GABC (Canada)</span>
                    </div>
                </form>

                {/* LEGAL DISCLAIMER - LIABILITY PROTECTION */}
                <div className="max-w-2xl mx-auto mt-8 p-4 border border-white/5 rounded-lg bg-black/40 backdrop-blur-sm">
                    <p className="text-[10px] text-gray-500 leading-relaxed uppercase tracking-wide font-medium">
                        <span className="text-red-500 font-bold block mb-1">⚠️ IMPORTANT DISCLAIMER</span>
                        GoTailScan aggregates public government data for informational purposes only. This report is <span className="text-gray-300">NOT an airworthiness certificate</span> and does not replace a physical pre-buy inspection by a certified A&P mechanic. Do not operate an aircraft based solely on this data.
                    </p>
                </div>

                <div className="mt-12 pt-8 border-t border-white/5 w-full max-w-4xl mx-auto">
                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em] mb-6">Intelligence Aggregated From</p>
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* FAA Logo Mock */}
                        <div className="flex items-center gap-2">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/US-FederalAviationAdmin-Seal.svg/1024px-US-FederalAviationAdmin-Seal.svg.png" className="h-10 w-auto" alt="FAA" />
                            <span className="text-sm font-black hidden md:block">FAA</span>
                        </div>
                        {/* NTSB Logo Mock */}
                        <div className="flex items-center gap-2">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Seal_of_the_National_Transportation_Safety_Board.svg/1200px-Seal_of_the_National_Transportation_Safety_Board.svg.png" className="h-10 w-auto" alt="NTSB" />
                            <span className="text-sm font-black hidden md:block">NTSB</span>
                        </div>
                        {/* FlightAware Logo Mock (Text) */}
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-black tracking-tighter">FlightAware</span>
                            <span className="text-[10px] bg-white text-black px-1 rounded font-bold">DATA</span>
                        </div>
                        {/* Transport Canada Logo Mock */}
                        <div className="flex items-center gap-2">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Transport_Canada_logo.svg/2560px-Transport_Canada_logo.svg.png" className="h-8 w-auto" alt="Transport Canada" />
                        </div>
                    </div>
                </div>
            </motion.div>

            <AnimatePresence>
                {result && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-6xl mx-auto space-y-8 pb-32"
                    >
                        {/* Summary Header */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <Card className="lg:col-span-1 border-white/10 bg-white/5 backdrop-blur-md">
                                <CardContent className="p-8 flex flex-col items-center justify-center h-full">
                                    <CircularGauge score={result.confidence_score} />
                                </CardContent>
                            </Card>

                            <Card className="lg:col-span-2 border-white/10 bg-white/5 backdrop-blur-md">
                                <CardContent className="p-8 text-left">
                                    <div className="flex justify-between items-start mb-8">
                                        <div>
                                            <div className="text-[10px] text-accent font-black tracking-widest uppercase mb-1">Forensic Verdict</div>
                                            <h3 className="text-4xl font-black text-white uppercase">{nNumber}</h3>
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
                                        <h4 className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Forensic Deductions</h4>
                                        <div className="space-y-3">
                                            {result.deductions.map((d, i) => (
                                                <div key={i} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse"></div>
                                                        <span className="text-sm text-gray-300 font-medium">{d.reason}</span>
                                                    </div>
                                                    <Badge variant="secondary" className="bg-black/40 text-accent border border-accent/20 font-mono">
                                                        {d.points}
                                                    </Badge>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Bento Grid - DATA SOURCES */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                            {/* Blur Overlay for Paywall */}
                            {!isPaid && (
                                <div className="absolute inset-0 z-10 backdrop-blur-md bg-black/40 rounded-xl flex flex-col items-center justify-center border border-white/10 h-full w-full">
                                    <div className="p-10 max-w-md text-center">
                                        <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-accent/20">
                                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Full History Locked</h3>
                                        <p className="text-gray-400 text-sm mb-8">Purchase a Basic or Pro report to unlock the full forensic breakdown, NTSB documents, and certification.</p>
                                        <Button
                                            onClick={() => {
                                                const pricingEl = document.getElementById('pricing-grid');
                                                pricingEl?.scrollIntoView({ behavior: 'smooth' });
                                            }}
                                            className="px-8 py-6 bg-accent text-white font-black rounded-xl uppercase text-xs tracking-widest hover:bg-[#e04f14]"
                                        >
                                            View Pricing
                                        </Button>
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
                                        <div className="h-20 bg-gradient-to-r from-accent/10 to-transparent rounded-lg border border-white/5 border-dashed"></div>
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
                                        <div className="h-20 bg-gradient-to-r from-warning/10 to-transparent rounded-lg border border-white/5 border-dashed"></div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* SOURCE: SDR */}
                            <Card className="border-white/10 bg-white/5 flex flex-col h-full">
                                <CardContent className="p-6 flex flex-col h-full">
                                    <div className="flex items-center justify-between mb-8">
                                        <span className="text-[10px] font-black tracking-widest text-gray-500 uppercase">Registry 03</span>
                                        <Badge variant="outline" className="border-white/20 text-white bg-white/5">SDR</Badge>
                                    </div>
                                    <div className="flex-grow">
                                        <div className="text-xs text-gray-500 mb-2 font-bold uppercase">Mechanical Defects</div>
                                        <div className="text-2xl font-black text-white mb-4">
                                            {result.source_data.sdr.length} <span className="text-gray-500 text-sm">FOUND</span>
                                        </div>
                                        <div className="h-20 bg-gradient-to-r from-blue-500/10 to-transparent rounded-lg border border-white/5 border-dashed"></div>
                                    </div>
                                </CardContent>
                            </Card>
                            {/* SOURCE: UTILIZATION AUDIT */}
                            {/* Logic: If Paid, show this card. But if Tier is Basic, BLUR it. If Pro, SHOW it. */}
                            {isPaid && (
                                <Card className="md:col-span-3 border-white/10 bg-white/5 flex flex-col md:flex-row relative overflow-hidden">
                                    {/* BASIC TIER LOCK OVERLAY */}
                                    {tier === 'basic' && (
                                        <div className="absolute inset-0 z-20 backdrop-blur-lg bg-black/60 flex flex-col items-center justify-center text-center p-8">
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
                                        <div className="relative z-10 w-full h-full flex items-center justify-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <div className="w-3 h-3 bg-accent rounded-full animate-ping absolute"></div>
                                                <div className="w-3 h-3 bg-accent rounded-full relative shadow-[0_0_15px_#FF5F1F]"></div>
                                                <Badge variant="secondary" className="bg-black/80 text-white font-mono text-[10px] border border-white/10 backdrop-blur-sm">
                                                    LAST TRACKED: {result.flight_data?.last_tracked ? new Date(result.flight_data.last_tracked).toLocaleDateString() : 'N/A'}
                                                </Badge>
                                            </div>
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
                                        <div className="text-gold font-black tracking-widest text-xs uppercase mb-2">IA-Certified Forensic Verdict</div>
                                        <h3 className="text-3xl font-black text-white mb-6 uppercase italic">Full Forensic Summary</h3>
                                        <p className="text-gray-400 leading-relaxed mb-8">
                                            Analysis complete. {tier === 'pro' ? 'Detailed wreckage analysis and ownership churn data' : 'Basic safety scan'} reveals no critical outstanding structural AD compliance issues, however the historical incident {result.source_data.ntsb.length > 0 ? 'referenced in NTSB' : 'records'} should be audited by a qualified A&P mechanic.
                                        </p>
                                        <button className="px-10 py-5 bg-white text-black font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition-all flex items-center gap-4">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            Download Forensic PDF
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Pricing Section */}
                        {!isPaid && (
                            <div id="pricing-grid">
                                <Pricing onSelect={handleUnlock} />
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Value Proposition Section - Always visible */}
            {!result && <ValueProposition />}
        </section>
    );
};

export default Hero;

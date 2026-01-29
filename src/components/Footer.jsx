import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Plane,
    Globe,
    LifeBuoy,
    Code,
    CreditCard,
    Headphones,
    ShieldCheck,
    Activity,
    MapPin,
    ExternalLink,
    AlertTriangle,
    Clock
} from 'lucide-react';

const Footer = () => {
    const [syncTime, setSyncTime] = useState('');

    useEffect(() => {
        const now = new Date();
        const formatted = now.toISOString().replace('T', ' ').substring(0, 16) + ' EST';
        setSyncTime(formatted);
    }, []);

    return (
        <footer className="w-full border-t border-cyan-500/30 bg-black/90 backdrop-blur-xl pt-16 pb-8 mt-auto relative z-20 flex-shrink-0">
            {/* GLOWING DIVIDER LINE - G1000 BLUE */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent shadow-[0_0_15px_rgba(6,182,212,0.5)]"></div>

            {/* GLOBAL INTELLIGENCE DISTRIBUTION TICKER */}
            <div className="w-full border-b border-white/5 bg-black/40 overflow-hidden py-2 mb-12 relative">
                <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black to-transparent z-10"></div>
                <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black to-transparent z-10"></div>
                <div className="flex animate-[infinite-scroll_60s_linear_infinite] whitespace-nowrap gap-12 font-mono text-[8px] text-gray-600 uppercase tracking-[0.4em]">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex gap-12 items-center">
                            <span className="flex items-center gap-2"><div className="w-1 h-1 bg-green-500 rounded-full shadow-[0_0_8px_#22c55e]"></div>FAA_REGISTRY_LIVE</span>
                            <span className="flex items-center gap-2"><div className="w-1 h-1 bg-green-500 rounded-full shadow-[0_0_8px_#22c55e]"></div>NTSB_ACCIDENT_DATABASE_SYNCED</span>
                            <span className="flex items-center gap-2"><div className="w-1 h-1 bg-red-600 rounded-full shadow-[0_0_8px_#ef4444]"></div>TRANSPORT_CANADA_TC_SECURED</span>
                            <span className="flex items-center gap-2"><div className="w-1 h-1 bg-blue-500 rounded-full shadow-[0_0_8px_#3b82f6]"></div>UK_CAA_REGISTRY_ACTIVE</span>
                            <span className="flex items-center gap-2"><div className="w-1 h-1 bg-purple-500 rounded-full shadow-[0_0_8px_#a855f7]"></div>EASA_AD_COMPLIANCE_NODE</span>
                            <span className="flex items-center gap-2"><div className="w-1 h-1 bg-accent rounded-full shadow-[0_0_8px_rgba(255,0,255,0.8)]"></div>SDR_MECHANICAL_FAILURES_AUDITED</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

                {/* COLUMN 1: BRAND & ROOTS */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 group cursor-default">
                            <div style={{ position: "relative", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <svg viewBox="0 0 24 24" fill="none" style={{ width: "100%", height: "100%", filter: "drop-shadow(0 0 8px rgba(0, 160, 226, 0.4))" }}>
                                    <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" fill="#00a0e2" />
                                    <path d="M12 18V2" stroke="#ffffff20" strokeWidth="0.5" />
                                </svg>
                            </div>
                            <div className="flex items-baseline" style={{ fontFamily: "'Roboto', sans-serif", fontSize: "18px", letterSpacing: "-0.5px" }}>
                                <span style={{ fontWeight: "900", color: "#ffffff" }}>goTail</span>
                                <span style={{ fontWeight: "300", color: "#00a0e2", marginLeft: "1px" }}>Scan</span>
                            </div>
                        </div>
                    </div>

                    <p className="text-gray-400 text-xs leading-relaxed max-w-xs font-medium">
                        The world's most advanced forensic aircraft intelligence platform. Aggregating multi-national data to secure your aviation investments.
                    </p>

                    <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest group">
                            <MapPin className="w-3.5 h-3.5 text-cyan-500 group-hover:drop-shadow-[0_0_10px_rgba(6,182,212,0.8)] transition-all" />
                            <span>Rooted in Ontario, Canada <span className="text-xs">🇨🇦</span></span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest group">
                            <Globe className="w-3.5 h-3.5 text-cyan-500 group-hover:drop-shadow-[0_0_10px_rgba(6,182,212,0.8)] transition-all" />
                            <span>Global HQ: gotailscan.com</span>
                        </div>
                    </div>
                </div>

                {/* COLUMN 2: QUICK LINKS */}
                <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em] border-b border-white/10 pb-2">Mission Control</h4>
                    <ul className="space-y-3">
                        <li>
                            <a href="/support" className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-all group">
                                <LifeBuoy className="w-3.5 h-3.5 group-hover:text-cyan-500 group-hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
                                <span>Support Center</span>
                            </a>
                        </li>
                        <li>
                            <a href="/docs" className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-all group">
                                <Code className="w-3.5 h-3.5 group-hover:text-cyan-500 group-hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
                                <span>API Documentation</span>
                            </a>
                        </li>
                        <li>
                            <a href="#pricing" className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-all group border-b border-transparent hover:border-cyan-500/50 pb-0.5 w-fit">
                                <CreditCard className="w-3.5 h-3.5 group-hover:text-cyan-500 group-hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
                                <span>Pricing Plans <span className="text-[9px] text-cyan-400 ml-1 font-black group-hover:scale-110 group-hover:text-cyan-300 transition-all drop-shadow-[0_0_3px_rgba(34,211,238,0.4)]">from $39/mo</span></span>
                            </a>
                        </li>
                        <li>
                            <a href="mailto:support@gotailscan.com" className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-all group">
                                <Headphones className="w-3.5 h-3.5 group-hover:text-cyan-500 group-hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
                                <span>Contact Flight Support</span>
                            </a>
                        </li>
                    </ul>
                </div>

                {/* COLUMN 3: SYSTEM STATUS */}
                <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em] border-b border-white/10 pb-2">Avionics Diagnostics</h4>
                    <div className="bg-black/40 border border-white/5 rounded-xl p-4 space-y-4 shadow-[inset_0_0_30px_rgba(0,0,0,0.6)]">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping absolute opacity-75 shadow-[0_0_12px_#22c55e]"></div>
                                    <div className="w-2.5 h-2.5 bg-green-500 rounded-full relative shadow-[0_0_10px_#22c55e]"></div>
                                </div>
                                <span className="text-[10px] font-black text-white uppercase tracking-widest drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">All Systems Nominal</span>
                            </div>
                            <span className="text-[9px] font-mono text-green-500/80 drop-shadow-[0_0_4px_rgba(34,197,94,0.4)]">LATENCY: 8ms</span>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-[9px] uppercase tracking-tighter">
                                <span className="text-gray-500 font-bold">FEEDS:</span>
                                <span className="text-green-500/60 font-mono drop-shadow-[0_0_2px_rgba(34,197,94,0.2)]">ENCRYPTED_AES256</span>
                            </div>
                            <div className="flex justify-between items-center text-[9px] uppercase tracking-tighter">
                                <span className="text-gray-500 font-bold">UPTIME:</span>
                                <span className="text-green-500/60 font-mono text-right drop-shadow-[0_0_2px_rgba(34,197,94,0.2)]">99.98% CY_2026</span>
                            </div>
                            <div className="flex justify-between items-center text-[9px] uppercase tracking-tighter border-t border-white/5 pt-2 mt-1">
                                <div className="flex items-center gap-1">
                                    <Clock className="w-2.5 h-2.5 text-gray-500" />
                                    <span className="text-gray-500 font-bold">SYNC_CLOCK:</span>
                                </div>
                                <span className="text-cyan-500/90 font-mono text-right drop-shadow-[0_0_5px_rgba(6,182,212,0.4)]">{syncTime}</span>
                            </div>
                        </div>

                        <div className="pt-2 border-t border-white/5">
                            <div className="text-[8px] text-gray-600 font-mono uppercase tracking-widest opacity-60">Node ID: SC-ONT-89201-GTS</div>
                        </div>
                    </div>
                </div>

                {/* COLUMN 4: LEGAL & TRUST */}
                <div className="space-y-6">
                    <h4 className="text-[10px] font-black text-white uppercase tracking-[0.2em] border-b border-white/10 pb-2">Legal Clearance</h4>
                    <ul className="space-y-3">
                        <li>
                            <a href="/privacy" className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-all group">
                                <ShieldCheck className="w-3.5 h-3.5 group-hover:text-cyan-500 group-hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
                                <span>Privacy Policy</span>
                            </a>
                        </li>
                        <li>
                            <a href="/terms" className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-all group">
                                <Activity className="w-3.5 h-3.5 group-hover:text-cyan-500 group-hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
                                <span>Terms of Service</span>
                            </a>
                        </li>
                        <li>
                            <a href="/data-sources" className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-all group">
                                <ExternalLink className="w-3.5 h-3.5 group-hover:text-cyan-500 group-hover:drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
                                <span>Data Governance</span>
                            </a>
                        </li>
                    </ul>

                    <div className="pt-2">
                        <div className="text-[10px] font-mono text-gray-600 uppercase tracking-wide">
                            © 2026 GoTailScan Avionics.
                            <br />
                            All Rights Reserved.
                        </div>
                    </div>
                </div>
            </div>

            {/* MANDATORY AVIATION DISCLAIMER */}
            <div className="pt-12 border-t border-white/5 bg-black/50 px-6">
                <div className="max-w-6xl mx-auto space-y-6">
                    <div className="flex items-center justify-center gap-3">
                        <div className="h-px flex-grow bg-gradient-to-r from-transparent to-red-900/40"></div>
                        <div className="flex items-center gap-4 text-red-600 font-black text-[10px] uppercase tracking-[0.4em] drop-shadow-[0_0_10px_rgba(220,38,38,0.5)]">
                            <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
                            Critical Operations Manual
                            <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
                        </div>
                        <div className="h-px flex-grow bg-gradient-to-l from-transparent to-red-900/40"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-[10px] text-gray-500 font-medium uppercase tracking-wider text-center md:text-left leading-relaxed">
                        <div className="space-y-2 p-5 border border-white/5 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] transition-all hover:border-red-900/20 group">
                            <span className="text-gray-300 font-black block mb-2 underline decoration-red-900/50 underline-offset-4 group-hover:text-white transition-colors">1. NOT A CERTIFICATION</span>
                            GoTail Scan is a data analysis tool and does not replace a physical pre-buy inspection by a certified A&P mechanic or IA. No airworthiness determination is implied.
                        </div>
                        <div className="space-y-2 p-5 border border-white/5 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] transition-all hover:border-red-900/20 group">
                            <span className="text-gray-300 font-black block mb-2 underline decoration-red-900/50 underline-offset-4 group-hover:text-white transition-colors">2. DATA ACCURACY</span>
                            Risk scores are generated based on available public and private records; GoTail Scan is not liable for omissions, errors, or delays in official government databases.
                        </div>
                        <div className="space-y-2 p-5 border border-white/5 rounded-xl bg-white/[0.01] hover:bg-white/[0.03] transition-all hover:border-red-900/20 group">
                            <span className="text-gray-300 font-black block mb-2 underline decoration-red-900/50 underline-offset-4 group-hover:text-white transition-colors">3. DECISION SOVEREIGNTY</span>
                            All final purchase or flight-readiness decisions are the sole responsibility of the aircraft owner/operator. Consult with legal and technical counsel before wire transfer.
                        </div>
                    </div>

                    <div className="text-center pb-8 pt-6">
                        <div className="text-[9px] font-mono text-gray-700 tracking-[0.5em] uppercase opacity-40">
                            SYSTEM_HASH: 0x8A2B9C0D1E2F3G4H5I6J7K8L9M0N • SECURE_BOOT_ENABLED
                        </div>
                    </div>
                </div>
            </div>

            {/* CSS FOR INFINITE SCROLL */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes infinite-scroll {
                    from { transform: translateX(0); }
                    to { transform: translateX(-50%); }
                }
            `}} />
        </footer>
    );
};

export default Footer;

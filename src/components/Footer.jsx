import React from 'react';
import { motion } from 'framer-motion';

const Footer = () => {
    return (
        <footer className="w-full border-t border-white/10 bg-black/80 backdrop-blur-md py-12 mt-auto relative z-20">
            {/* GLOBAL INTELLIGENCE DISTRIBUTION TICKER */}
            <div className="w-full border-b border-white/5 bg-black/40 overflow-hidden py-1.5 relative">
                <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-black to-transparent z-10"></div>
                <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-black to-transparent z-10"></div>
                <div className="flex animate-[infinite-scroll_60s_linear_infinite] whitespace-nowrap gap-12 font-mono text-[7px] text-gray-600 uppercase tracking-[0.4em]">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex gap-12">
                            <span>FAA_REGISTRY_US_LIVE_STREAM</span>
                            <span>NTSB_ACCIDENT_DATABASE_AUDITED</span>
                            <span>TC_CADORS_CANADA_INTELLIGENCE_INDEXED</span>
                            <span>UK_CAA_CIVIL_REGISTRY_SYNC_ESTABLISHED</span>
                            <span>EASA_AD_COMPLIANCE_ENGINE_ONLINE</span>
                            <span>CASA_AUSTRALIA_ACTIVE_FLEET_INDEXED</span>
                            <span>AFAC_MEXICO_REGISTRY_TUNNEL_ACTIVE</span>
                            <span>ANAC_BRAZIL_REGISTRY_NODE_SYNCED</span>
                            <span>FOCA_SWITZERLAND_INTELLIGENCE_SECURED</span>
                            <span>SDR_MECHANICAL_FAILURES_GLOBAL_ANALYTICS</span>
                            <span>IA_VERIFIED_SIGNATURE_SEQUENCE_ACTIVE</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6 py-12">

                {/* Brand & Copyright */}
                <div className="text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start mb-2 gap-2">
                        <div className="flex items-center gap-1.5">
                            <div className="flex items-center gap-1.5">
                                <div className="text-white font-registration tracking-widest text-md">
                                    goTailScan
                                </div>
                                <div className="w-1.5 h-4 bg-accent animate-pulse"></div>
                            </div>

                        </div>
                    </div>
                    <div className="text-[10px] text-gray-500 font-medium tracking-wide italic">
                        © {new Date().getFullYear()} POWERED BY FORENSIC AVIATION DATA INC. ALL RIGHTS RESERVED.
                    </div>
                </div>

                {/* Legal Links (Stripe Requirement) */}
                <div className="flex items-center gap-6 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                    <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                    <a href="#" className="hover:text-white transition-colors">Data Sources</a>
                </div>

                {/* Contact */}
                <div className="text-[10px] text-gray-500 font-mono">
                    System Status: <span className="text-green-500">● ONLINE</span>
                    <br />
                    support@gotailscan.com
                </div>
            </div>

            {/* Compliance Disclaimer - Moved to Bottom */}
            <div className="mt-12 pt-8 border-t border-white/5 text-center px-4 relative z-10 bg-black">
                <p className="text-[10px] text-gray-600 leading-relaxed max-w-4xl mx-auto uppercase tracking-wide font-medium">
                    <span className="text-red-900/50 font-bold mr-2">⚠️ DISCLAIMER:</span>
                    GoTailScan aggregates public government data for informational purposes only. This report is NOT an airworthiness certificate and does not replace a physical pre-buy inspection by a certified A&P mechanic. Do not operate an aircraft based solely on this data.
                </p>
            </div>
        </footer>
    );
};

export default Footer;

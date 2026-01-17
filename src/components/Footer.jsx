import React from 'react';
import { Plane } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="w-full border-t border-white/10 bg-black/80 backdrop-blur-md py-12 mt-auto relative z-20">
            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">

                {/* Brand & Copyright */}
                <div className="text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start mb-2 gap-2">
                        <Plane className="w-4 h-4 text-accent rotate-[-45deg]" />
                        <div className="text-white font-avionics font-bold tracking-[0.2em] uppercase text-sm">
                            GOTAIL<span className="text-accent">SCAN</span>
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

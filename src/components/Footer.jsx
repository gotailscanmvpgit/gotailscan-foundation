import React from 'react';

const Footer = () => {
    return (
        <footer className="w-full border-t border-white/10 bg-black/80 backdrop-blur-md py-12 mt-auto relative z-20">
            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">

                {/* Brand & Copyright */}
                <div className="text-center md:text-left">
                    <div className="text-white font-black tracking-tighter uppercase mb-1">
                        GOTAIL<span className="text-accent">SCAN</span>
                    </div>
                    <div className="text-[10px] text-gray-500 font-medium tracking-wide">
                        © {new Date().getFullYear()} FORENSIC AVIATION DATA LLC. ALL RIGHTS RESERVED.
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
        </footer>
    );
};

export default Footer;

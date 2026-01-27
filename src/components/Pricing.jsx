import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Pricing = ({ onSelect }) => {
    const features = [
        { text: 'Comprehensive Registry Lookup', basic: true, pro: true },
        { text: 'Basic Confidence Scoring', basic: true, pro: true },
        { text: 'Safety Index (NTSB/FAA)', basic: true, pro: true },
        { text: 'Summary PDF Report', basic: true, pro: true },
        { text: 'SIGINT Transponder Audit', basic: false, pro: true },
        { text: 'Custody Chain Forensic', basic: false, pro: true },
        { text: 'Global Fleet Delta Benchmarking', basic: false, pro: true },
        { text: 'SDR Mechanical History', basic: false, pro: true },
        { text: 'Real-Time Market Liquidity', basic: false, pro: true },
        { text: 'Direct Operating Cost (DOC) Analysis', basic: false, pro: true },
    ];

    const CheckIcon = () => (
        <svg className="w-4 h-4 text-accent flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
        </svg>
    );

    const XIcon = () => (
        <svg className="w-4 h-4 text-gray-700 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
    );

    return (
        <div className="w-full max-w-5xl mx-auto mt-24 mb-32 px-4 relative z-10">
            <div className="flex flex-col items-center mb-16 text-center">
                <div className="px-3 py-1 bg-accent/20 border border-accent/30 rounded-full text-[10px] text-accent font-black tracking-[0.3em] uppercase mb-4 animate-pulse">
                    Intelligence Clearance Selection
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase mb-4">
                    Choose Your <span className="text-accent underline decoration-white/10">Audit depth</span>
                </h2>
                <p className="text-gray-500 max-w-xl text-sm md:text-base">
                    From basic registry verification to deep-link forensic intelligence. Select the clearance level required for your transaction.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                {/* Basic Plan */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="h-full"
                >
                    <Card className="h-full border-white/10 bg-[#0A0A0A] backdrop-blur-md flex flex-col pt-6 group hover:border-white/20 transition-colors">
                        <CardHeader className="pb-4">
                            <div className="text-[10px] text-gray-600 font-bold tracking-widest uppercase mb-1">Standard Clearance</div>
                            <CardTitle className="text-2xl font-black text-white uppercase">Basic Summary</CardTitle>
                        </CardHeader>

                        <CardContent className="flex-grow">
                            <div className="flex items-baseline gap-1 mb-8">
                                <span className="text-4xl font-black text-white">$49</span>
                                <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">/ Per Tail</span>
                            </div>

                            <ul className="space-y-4">
                                {features.map((feature, i) => (
                                    <li key={i} className={`flex items-start gap-3 text-[11px] font-bold uppercase tracking-tight ${feature.basic ? 'text-gray-300' : 'text-gray-800'}`}>
                                        <div className="mt-0.5">
                                            {feature.basic ? <CheckIcon /> : <XIcon />}
                                        </div>
                                        <span className={feature.basic ? '' : 'line-through'}>{feature.text}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>

                        <CardFooter className="pt-8 bg-white/[0.02] border-t border-white/5">
                            <Button
                                onClick={() => onSelect('basic')}
                                variant="outline"
                                className="w-full py-6 text-[10px] font-black uppercase tracking-[0.2em] border-white/10 hover:bg-white text-gray-400 hover:text-black transition-all"
                            >
                                Initiate Basic Audit
                            </Button>
                        </CardFooter>
                    </Card>
                </motion.div>

                {/* Pro Plan */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="h-full relative"
                >
                    {/* Glow and Pulse Effects */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-accent to-purple-600 rounded-xl blur-lg opacity-20 group-hover:opacity-40 animate-pulse"></div>

                    <Card className="h-full border-accent bg-black border-2 flex flex-col relative overflow-hidden pt-8 shadow-2xl shadow-accent/20">
                        <div className="absolute top-0 right-0">
                            <div className="bg-accent text-white font-black px-4 py-1 text-[9px] tracking-widest uppercase rounded-bl-lg shadow-xl">
                                Recommended for Acquisition
                            </div>
                        </div>

                        <CardHeader className="pb-4">
                            <div className="text-[10px] text-accent font-black tracking-[0.4em] uppercase mb-1">Forensic Intelligence</div>
                            <CardTitle className="text-3xl font-black text-white uppercase italic tracking-tighter">Pro Intelligence</CardTitle>
                        </CardHeader>

                        <CardContent className="flex-grow">
                            <div className="flex items-baseline gap-1 mb-8">
                                <span className="text-6xl font-black text-white">$99</span>
                                <span className="text-xs font-bold text-accent uppercase tracking-widest animate-pulse">/ Deep Audit</span>
                            </div>

                            <ul className="grid grid-cols-1 gap-4 mb-8">
                                {features.map((feature, i) => (
                                    <li key={i} className={`flex items-start gap-3 text-[11px] font-black uppercase tracking-[0.05em] ${feature.pro ? 'text-white' : 'text-gray-600'}`}>
                                        <div className={`mt-0.5 p-0.5 rounded ${feature.pro ? 'bg-accent/20' : 'bg-transparent'}`}>
                                            <CheckIcon />
                                        </div>
                                        {feature.text}
                                    </li>
                                ))}
                            </ul>

                            <div className="p-4 bg-accent/10 border border-accent/30 rounded-lg flex items-center gap-3">
                                <div className="w-2 h-2 bg-accent rounded-full animate-ping"></div>
                                <span className="text-[9px] font-black text-white uppercase tracking-widest">Includes IA-Certified Diligence Signature</span>
                            </div>
                        </CardContent>

                        <CardFooter className="pt-6 pb-8 bg-accent/5 border-t border-accent/20">
                            <Button
                                onClick={() => onSelect('pro')}
                                className="w-full py-8 bg-accent hover:bg-white text-white hover:text-black text-xs font-black uppercase tracking-[0.3em] transition-all shadow-[0_0_30px_rgba(255,0,255,0.3)] transform hover:scale-[1.02]"
                            >
                                Get Pro Intelligence
                            </Button>
                        </CardFooter>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};

export default Pricing;

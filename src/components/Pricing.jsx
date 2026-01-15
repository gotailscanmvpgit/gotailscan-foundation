import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Pricing = ({ onSelect }) => {
    return (
        <div className="w-full max-w-5xl mx-auto mt-20 mb-32 px-4">
            <div className="flex flex-col items-center mb-12">
                <h2 className="text-3xl font-black text-white tracking-widest uppercase mb-2">Forensic Pricing</h2>
                <div className="w-20 h-1 bg-accent rounded-full mb-8"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Basic Plan */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    whileHover={{ y: -5 }}
                    className="h-full"
                >
                    <Card className="h-full border-white/10 bg-white/5 backdrop-blur-md flex flex-col pt-6">
                        <CardHeader className="pb-4">
                            <span className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mb-1">Tier 01</span>
                            <CardTitle className="text-2xl font-black text-white uppercase">Basic Summary</CardTitle>
                        </CardHeader>

                        <CardContent className="flex-grow">
                            <div className="text-4xl font-black text-white mb-8">
                                $39<span className="text-sm font-normal text-gray-500"> /per scan</span>
                            </div>

                            <ul className="space-y-4">
                                {[
                                    'Comprehensive N-Number Scan',
                                    'Confidence Score Readout',
                                    'Aggregated Registry Match',
                                    'Basic Summary PDF'
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-xs text-gray-400">
                                        <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </CardContent>

                        <CardFooter className="pt-8">
                            <Button
                                onClick={() => onSelect('basic')}
                                variant="outline"
                                className="w-full py-6 text-xs font-bold uppercase tracking-widest border-white/10 hover:bg-white/10 hover:text-white"
                            >
                                Order Basic
                            </Button>
                        </CardFooter>
                    </Card>
                </motion.div>

                {/* Pro Plan */}
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    whileHover={{ y: -8 }}
                    className="h-full group relative md:scale-105 z-10"
                >
                    {/* Pro Glow Effect - Enhanced */}
                    <div className="absolute inset-0 bg-accent/30 blur-3xl rounded-xl opacity-20 group-hover:opacity-60 transition-opacity duration-500" />

                    <Card className="h-full border-accent bg-gradient-to-b from-white/10 via-white/5 to-black border-2 flex flex-col relative overflow-hidden pt-8 shadow-2xl shadow-black/50">
                        <div className="absolute top-0 inset-x-0 h-1 bg-accent shadow-[0_0_10px_#FF5F1F]"></div>
                        <div className="absolute top-5 right-5">
                            <Badge variant="default" className="bg-accent text-white hover:bg-accent font-black tracking-widest text-[10px] px-3 py-1 shadow-lg shadow-accent/40 border border-white/20">
                                MOST TRUSTED
                            </Badge>
                        </div>

                        <CardHeader className="pb-4">
                            <span className="text-xs text-accent font-black tracking-[0.2em] uppercase mb-2">Tier 02</span>
                            <CardTitle className="text-3xl font-black text-white uppercase italic tracking-tight">Pro Forensic</CardTitle>
                        </CardHeader>

                        <CardContent className="flex-grow">
                            <div className="text-5xl font-black text-white mb-8 drop-shadow-lg">
                                $99<span className="text-base font-bold text-gray-400"> /scan</span>
                            </div>

                            <div className="w-full h-px bg-white/10 mb-8"></div>

                            <ul className="space-y-5 mb-8">
                                {[
                                    'Everything in Basic',
                                    'Full NTSB Docket Access',
                                    'ADS-B Utilization Analysis',
                                    'Detailed Ownership Churn Analysis',
                                    'Structural Damage Assessment',
                                    'Airworthiness Directives Check'
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-white font-medium">
                                        <div className="p-1 rounded-full bg-accent/20">
                                            <svg className="w-3.5 h-3.5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <div className="flex items-center gap-3 text-[11px] font-bold text-gold bg-gold-glow/10 p-4 rounded-xl border border-gold/40 border-dashed mb-2 animate-pulse-slow">
                                <div className="bg-gold/20 p-1.5 rounded-full">
                                    <svg className="w-5 h-5 flex-shrink-0 text-gold" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <span className="tracking-wide">IA-CERTIFIED FORENSIC VERDICT</span>
                            </div>
                        </CardContent>

                        <CardFooter className="pt-6 pb-8">
                            <Button
                                onClick={() => onSelect('pro')}
                                className="w-full py-7 bg-accent hover:bg-[#ff7b45] text-white text-sm font-black uppercase tracking-widest shadow-[0_4px_20px_rgba(255,95,31,0.3)] hover:shadow-[0_4px_30px_rgba(255,95,31,0.5)] transition-all border border-white/20 transform hover:-translate-y-1"
                            >
                                Order Pro Forensic
                            </Button>
                        </CardFooter>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};

export default Pricing;

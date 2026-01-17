import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, DollarSign, Clock, CheckCircle2, XCircle } from 'lucide-react';

const ValueProposition = () => {
    const [showModal, setShowModal] = React.useState(false);

    const handleCTA = () => {
        const pricingEl = document.getElementById('pricing-grid');
        const searchEl = document.getElementById('hero-search');

        if (pricingEl) {
            pricingEl.scrollIntoView({ behavior: 'smooth' });
        } else if (searchEl) {
            searchEl.scrollIntoView({ behavior: 'smooth' });
            // Optional: Focus the input for better UX
            const input = searchEl.querySelector('input');
            if (input) input.focus();
        }
    };

    return (
        <section className="w-full max-w-7xl mx-auto px-4 py-32 relative">
            {/* Report Preview Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" onClick={() => setShowModal(false)}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="relative max-w-3xl w-full bg-[#1a1a1a] rounded-xl overflow-hidden border border-white/10 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-[#0a0a0a]">
                            <h3 className="text-xl font-bold text-white uppercase tracking-widest">Sample Dossier Preview</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white transition-colors">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-8 flex justify-center bg-[#0f0f0f]">
                            <img
                                src="/sample-report.png"
                                alt="Sample Historical Audit"
                                className="max-h-[70vh] w-auto shadow-xl rounded-sm border border-white/20"
                            />
                        </div>
                        <div className="p-6 border-t border-white/10 bg-[#0a0a0a] text-center">
                            <p className="text-gray-400 text-sm mb-4">This is a standardized sample. Actual reports include live ADS-B data and full NTSB dockets.</p>
                            <Button onClick={() => { setShowModal(false); handleCTA(); }} className="bg-accent hover:bg-[#e04f14] text-white font-bold uppercase tracking-widest">
                                Get My Full Report
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Section Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="text-center mb-16"
            >
                <Badge variant="outline" className="mb-4 border-accent/30 bg-accent/5 text-accent">
                    THE MATH IS SIMPLE
                </Badge>
                <h2 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tight">
                    The Value Proposition
                </h2>
                <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto">
                    One historical deep scan can save you from a catastrophic purchase decision.
                </p>
            </motion.div>

            {/* Comparison Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
                {/* LEFT CARD - The Risk */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <Card className="border-white/10 bg-muted/20 backdrop-blur-md h-full relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl"></div>
                        <CardHeader className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-red-500/10 rounded-lg flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6 text-red-500" />
                                </div>
                                <Badge variant="secondary" className="bg-red-500/10 text-red-500 border-0">
                                    HIGH RISK
                                </Badge>
                            </div>
                            <CardTitle className="text-3xl font-black text-white uppercase tracking-tight">
                                The Blind Purchase
                            </CardTitle>
                            <p className="text-muted-foreground text-sm mt-2">
                                Traditional aircraft acquisition without forensic intelligence
                            </p>
                        </CardHeader>
                        <CardContent className="relative z-10 space-y-6">
                            {/* Cost Breakdown */}
                            <div className="space-y-4">
                                <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg border border-white/5">
                                    <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                    <div className="flex-grow">
                                        <div className="text-white font-bold mb-1">Pre-Buy Inspection</div>
                                        <div className="text-gray-400 text-sm mb-2">Traditional A&P mechanic evaluation</div>
                                        <div className="text-2xl font-black text-red-400">$2,000</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg border border-white/5">
                                    <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                    <div className="flex-grow">
                                        <div className="text-white font-bold mb-1">Hidden Engine Issues</div>
                                        <div className="text-gray-400 text-sm mb-2">Discovered after purchase (NTSB/SDR history missed)</div>
                                        <div className="text-2xl font-black text-red-400">$10,000+</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg border border-white/5">
                                    <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                                    <div className="flex-grow">
                                        <div className="text-white font-bold mb-1">Downtime & Repairs</div>
                                        <div className="text-gray-400 text-sm mb-2">Months of grounded aircraft, lost revenue</div>
                                        <div className="text-2xl font-black text-red-400">Priceless</div>
                                    </div>
                                </div>
                            </div>

                            {/* Total */}
                            <div className="pt-6 border-t border-white/10">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-400 font-bold uppercase text-sm tracking-wider">Total Risk Exposure</span>
                                    <span className="text-4xl font-black text-red-400">$20,000+</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* RIGHT CARD - The Solution */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <Card className="border-accent/30 bg-white/5 backdrop-blur-md h-full relative overflow-hidden shadow-[0_0_40px_rgba(255,95,31,0.15)]">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl"></div>
                        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent"></div>
                        <CardHeader className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(255,95,31,0.3)]">
                                    <Shield className="w-6 h-6 text-accent" />
                                </div>
                                <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30">
                                    MISSION CRITICAL
                                </Badge>
                            </div>
                            <CardTitle className="text-3xl font-black text-white uppercase tracking-tight">
                                The Historical Audit
                            </CardTitle>
                            <p className="text-gray-300 text-sm mt-2">
                                AI-powered intelligence from FAA, NTSB, CADORS & FlightAware
                            </p>
                        </CardHeader>
                        <CardContent className="relative z-10 space-y-6">
                            {/* Benefits Breakdown */}
                            <div className="space-y-4">
                                <div className="flex items-start gap-3 p-4 bg-accent/5 rounded-lg border border-accent/20">
                                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                    <div className="flex-grow">
                                        <div className="text-white font-bold mb-1">Instant Digital Scan</div>
                                        <div className="text-gray-300 text-sm mb-2">Real-time aggregation from 4 federal databases</div>
                                        <div className="text-2xl font-black text-accent">30 Seconds</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-accent/5 rounded-lg border border-accent/20">
                                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                    <div className="flex-grow">
                                        <div className="text-white font-bold mb-1">ADS-B Verification</div>
                                        <div className="text-gray-300 text-sm mb-2">12-month utilization audit via FlightAware (PRO)</div>
                                        <div className="text-2xl font-black text-accent">Live Data</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 p-4 bg-accent/5 rounded-lg border border-accent/20">
                                    <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                    <div className="flex-grow">
                                        <div className="text-white font-bold mb-1">Risk Score Algorithm</div>
                                        <div className="text-gray-300 text-sm mb-2">Confidence score based on incident history</div>
                                        <div className="text-2xl font-black text-accent">65/100</div>
                                    </div>
                                </div>
                            </div>

                            {/* Total */}
                            <div className="pt-6 border-t border-accent/20">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-300 font-bold uppercase text-sm tracking-wider">Investment Required</span>
                                    <span className="text-4xl font-black text-accent">$99</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* The Math Section */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-center space-y-8"
            >
                <div className="glass-card-accent p-12 max-w-4xl mx-auto relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-transparent to-accent/10"></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <DollarSign className="w-12 h-12 text-accent" />
                            <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">
                                The Math Is Simple
                            </h3>
                        </div>
                        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 mb-8">
                            <div className="text-center">
                                <div className="text-5xl md:text-7xl font-black text-accent mb-2">$99</div>
                                <div className="text-gray-400 text-sm uppercase tracking-widest">Historical Scan</div>
                            </div>
                            <div className="text-4xl md:text-6xl font-black text-white">→</div>
                            <div className="text-center">
                                <div className="text-5xl md:text-7xl font-black text-green-500 mb-2">$20,000</div>
                                <div className="text-gray-400 text-sm uppercase tracking-widest">Potential Savings</div>
                            </div>
                        </div>
                        <p className="text-gray-300 text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
                            One hidden NTSB incident. One undisclosed AD compliance issue. One ownership churn red flag.
                            <span className="text-white font-bold"> That's all it takes to turn your dream aircraft into a financial nightmare.</span>
                        </p>
                        <div className="mt-12 pt-8 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
                            <div className="flex items-center gap-3 text-gray-300">
                                <CheckCircle2 className="w-5 h-5 text-accent" />
                                <span className="font-bold">3-Page PDF Dossier</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-300">
                                <CheckCircle2 className="w-5 h-5 text-accent" />
                                <span className="font-bold">Color-Coded Risk Assessment</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-300">
                                <CheckCircle2 className="w-5 h-5 text-accent" />
                                <span className="font-bold">Shareable Mechanic Link</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-300">
                                <CheckCircle2 className="w-5 h-5 text-accent" />
                                <span className="font-bold">Real-Time Market Value</span>
                            </div>
                        </div>

                        <div className="mt-8 flex items-center justify-center gap-4">
                            <Button
                                onClick={handleCTA}
                                size="lg"
                                className="h-16 px-12 bg-accent hover:bg-[#e04f14] text-white font-black rounded-xl uppercase text-sm tracking-widest shadow-[0_0_30px_rgba(255,95,31,0.4)] hover:shadow-[0_0_50px_rgba(255,95,31,0.6)] transition-all"
                            >
                                <Shield className="w-5 h-5 mr-3" />
                                Secure My Investment Now
                            </Button>
                        </div>

                        <div className="mt-6 flex flex-col gap-2 items-center">
                            <button
                                onClick={() => setShowModal(true)}
                                className="text-gray-400 text-xs uppercase tracking-widest border-b border-gray-600 hover:text-white hover:border-white transition-all pb-0.5"
                            >
                                View Sample Report
                            </button>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                                <Clock className="w-4 h-4" />
                                <span>Results in 30 seconds • No credit card required for preview</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </section>
    );
};

export default ValueProposition;

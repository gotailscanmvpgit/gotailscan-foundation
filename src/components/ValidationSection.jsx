import React from 'react';
import { motion } from 'framer-motion';
import { Database, ShieldAlert, BadgeCheck } from 'lucide-react';

const ValidationSection = () => {
    const points = [
        {
            icon: <Database className="w-6 h-6 text-accent" />,
            title: "WHAT IS THIS?",
            description: "We check thousands of official records to find if a plane was ever in a crash or ever broke."
        },
        {
            icon: <ShieldAlert className="w-6 h-6 text-accent" />,
            title: "WHO IS IT FOR?",
            description: "Buyers use it to stay safe from hidden damage. Sellers use it to prove their plane is in great shape."
        },
        {
            icon: <BadgeCheck className="w-6 h-6 text-accent" />,
            title: "IS IT TRUE?",
            description: "Yes. We search the actual government files that experts use. No guesses, just the facts."
        }
    ];

    return (
        <div className="w-full max-w-5xl mx-auto py-24 px-6 border-t border-white/5 mt-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
                {points.map((point, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="group"
                    >
                        <div className="mb-6 opacity-50 group-hover:opacity-100 transition-opacity">
                            {point.icon}
                        </div>
                        <h3 className="text-white font-avionics font-bold text-lg tracking-widest mb-4 group-hover:text-accent transition-colors">
                            {point.title}
                        </h3>
                        <p className="text-gray-500 text-sm leading-relaxed group-hover:text-gray-400 transition-colors">
                            {point.description}
                        </p>
                    </motion.div>
                ))}
            </div>

            {/* Authority Logos - Stylized & Robust */}
            <div className="mt-24 pt-10 border-t border-white/5 text-center">
                <p className="text-[10px] text-gray-700 font-bold uppercase tracking-[0.3em] mb-12">Intelligence Aggregated From</p>
                <div className="flex flex-wrap justify-center items-center gap-10 md:gap-24 opacity-30 grayscale hover:opacity-100 transition-all duration-700">

                    {/* FAA Stylized */}
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded border-2 border-white flex items-center justify-center font-black text-[10px]">FAA</div>
                        <div className="text-left leading-none">
                            <div className="text-[10px] font-black text-white tracking-tighter">FEDERAL AVIATION</div>
                            <div className="text-[8px] font-bold text-gray-500">ADMINISTRATION</div>
                        </div>
                    </div>

                    {/* NTSB Stylized */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center p-1">
                            <ShieldAlert className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-left leading-none">
                            <div className="text-[14px] font-avionics font-bold text-white tracking-widest leading-tight">NTSB</div>
                            <div className="text-[8px] font-bold text-gray-500 tracking-widest">SAFETY BOARD</div>
                        </div>
                    </div>

                    {/* Transport Canada Stylized */}
                    <div className="flex flex-col items-center gap-1 group">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-0.5 bg-red-600"></div>
                            <div className="text-[12px] font-black text-white tracking-widest group-hover:text-red-500 transition-colors">TRANSPORT CANADA</div>
                        </div>
                        <div className="text-[7px] font-bold text-gray-600 tracking-[0.4em] uppercase">Security and Safety</div>
                    </div>

                    {/* CADORS Stylized */}
                    <div className="flex flex-col items-start gap-0.5">
                        <div className="font-avionics font-bold text-white tracking-tighter text-2xl leading-none">CADORS</div>
                        <div className="text-[8px] font-bold text-accent tracking-widest pl-1 uppercase">Canada Registry</div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ValidationSection;

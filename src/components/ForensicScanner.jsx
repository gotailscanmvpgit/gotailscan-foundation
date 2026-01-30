import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const radarColors = {
    cyan: { hex: "#06b6d4", bg: "rgba(6, 182, 212, 0.2)" }, // Buyer
    blue: { hex: "#3b82f6", bg: "rgba(59, 130, 246, 0.2)" }, // Seller (Legacy)
    purple: { hex: "#a855f7", bg: "rgba(168, 85, 247, 0.2)" }, // Seller (New)
    amber: { hex: "#f59e0b", bg: "rgba(245, 158, 11, 0.2)" }, // Mechanic
    red: { hex: "#ef4444", bg: "rgba(239, 68, 68, 0.2)" }     // Danger
};

const STEPS = [
    "INITIALIZING SECURE HANDSHAKE...",
    "QUERYING FAA REGISTRY DATABASE...",
    "ANALYZING TC CADORS REPORTS...",
    "CROSS-REFERENCING NTSB LOGS...",
    "PARSING SDR INCIDENT HISTORY...",
    "VALIDATING AIRWORTHINESS DIRECTIVES...",
    "CALCULATING FLEET UTILIZATION...",
    "GENERATING MARKET ALPHA INDEX...",
    "FINALIZING FORENSIC PROFILE..."
];

export default function ForensicScanner({ color = "cyan" }) {
    const theme = radarColors[color] || radarColors.cyan;
    const [logs, setLogs] = useState([]);
    const [records, setRecords] = useState(0);
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        // Log Stream Logic
        if (currentStep < STEPS.length) {
            const timeout = setTimeout(() => {
                setLogs(prev => [...prev.slice(-4), { text: STEPS[currentStep], status: "OK" }]);
                setCurrentStep(prev => prev + 1);
            }, 800); // New log every 800ms
            return () => clearTimeout(timeout);
        }
    }, [currentStep]);

    useEffect(() => {
        // Fast Counter Logic
        const interval = setInterval(() => {
            setRecords(prev => prev + Math.floor(Math.random() * 12) + 1);
        }, 50);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(11, 15, 25, 0.95)",
            backdropFilter: "blur(10px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Share Tech Mono', monospace"
        }}>
            {/* Radar Container */}
            <div style={{ position: "relative", width: "120px", height: "120px", marginBottom: "32px" }}>
                {/* Outer Ring */}
                <div style={{
                    position: "absolute", inset: 0,
                    border: `2px solid ${theme.bg}`,
                    borderRadius: "50%",
                    boxShadow: `0 0 20px ${theme.bg}`
                }} />

                {/* Inner Grid */}
                <div style={{
                    position: "absolute", inset: "10px",
                    border: `1px solid ${theme.bg}`,
                    borderRadius: "50%",
                    opacity: 0.5
                }} />
                <div style={{
                    position: "absolute", top: "50%", left: 0, right: 0, height: "1px",
                    background: theme.bg
                }} />
                <div style={{
                    position: "absolute", left: "50%", top: 0, bottom: 0, width: "1px",
                    background: theme.bg
                }} />

                {/* Sweep Animation */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: "50%",
                        background: `conic-gradient(from 0deg, transparent 70%, ${theme.hex} 100%)`,
                        mask: "radial-gradient(circle, transparent 60%, white 100%)",
                        WebkitMask: "radial-gradient(circle, transparent 5%, black 100%)",
                        opacity: 0.6
                    }}
                />
                {/* Line for Sweep */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    style={{
                        position: "absolute", top: "50%", left: "50%", width: "50%", height: "2px",
                        background: theme.hex,
                        transformOrigin: "left center",
                        boxShadow: `0 0 10px ${theme.hex}`
                    }}
                />

                {/* Blips (Random Data Points) */}
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                            opacity: [0, 1, 0],
                            scale: [0, 1.5, 0],
                            x: Math.random() * 60 - 30,
                            y: Math.random() * 60 - 30
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: i * 0.4,
                            repeatDelay: Math.random() * 2
                        }}
                        style={{
                            position: "absolute", top: "50%", left: "50%",
                            width: "4px", height: "4px",
                            borderRadius: "50%",
                            background: theme.hex,
                            boxShadow: `0 0 6px ${theme.hex}`
                        }}
                    />
                ))}

                {/* Center Target */}
                <div style={{
                    position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
                    width: "6px", height: "6px", background: theme.hex, borderRadius: "50%",
                    border: "1px solid white"
                }} />
            </div>

            {/* Loading Text */}
            <h2 style={{
                color: "white",
                fontSize: "24px",
                fontWeight: "bold",
                letterSpacing: "4px",
                marginBottom: "8px",
                textShadow: `0 0 10px ${theme.hex}`
            }}>
                FORENSIC SCAN ACTIVE
            </h2>

            {/* Records Counter */}
            <div style={{ color: theme.hex, fontSize: "16px", marginBottom: "32px", fontWeight: "bold" }}>
                {records.toLocaleString()} RECORDS INDEXED
            </div>

            {/* Rolling Log */}
            <div style={{
                width: "320px",
                fontFamily: "'Roboto Mono', monospace",
                fontSize: "12px",
                textAlign: "left",
                display: "flex",
                flexDirection: "column",
                gap: "4px"
            }}>
                {logs.map((log, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            color: i === logs.length - 1 ? "white" : "#64748b",
                            borderLeft: i === logs.length - 1 ? `2px solid ${theme.hex}` : "2px solid transparent",
                            paddingLeft: "8px"
                        }}
                    >
                        <span>{log.text}</span>
                        <span style={{ color: theme.hex, fontWeight: "bold" }}>OK</span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

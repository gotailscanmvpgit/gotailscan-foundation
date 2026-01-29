import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radar, TrendingUp, Wrench, Shield, Compass, LayoutGrid, Zap, Loader2, Plane, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from './Footer';

const DirectToIcon = ({ size = 20, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12h16" />
        <path d="M14 6l6 6-6 6" />
        <rect x="3" y="7" width="10" height="10" rx="1" fill="black" stroke={color} />
        <text x="5" y="15" fontSize="10" fontWeight="900" fill={color} stroke="none" style={{ fontFamily: 'Roboto Mono, monospace' }}>D</text>
    </svg>
);

export default function RoleGateway() {
    const navigate = useNavigate();
    const [isBooting, setIsBooting] = useState(true);
    const [bootStep, setBootStep] = useState(0);

    const G3000 = {
        WARNING: "#ef4444", CAUTION: "#f59e0b", ADVISORY: "#06b6d4", NORMAL: "#ffffff", BG: "#0b0f19", BEZEL: "#1e293b", GRID: "rgba(255, 255, 255, 0.05)"
    };

    const bootSequence = [
        "INITIALIZING CORE AVIONICS...",
        "SYNCING WITH GLOBAL FEEDER NETWORK...",
        "CONNECTING TO NTSB FORENSIC DATABASE...",
        "AUTHENTICATING DATA SOURCE ALPHA...",
        "SYSTEMS NOMINAL - AWAITING MISSION SELECTION"
    ];

    useEffect(() => {
        if (bootStep < bootSequence.length) {
            const timer = setTimeout(() => setBootStep(bootStep + 1), 600);
            return () => clearTimeout(timer);
        } else {
            const timer = setTimeout(() => setIsBooting(false), 500);
            return () => clearTimeout(timer);
        }
    }, [bootStep]);

    const navigateToRole = (path) => {
        navigate(path);
    };

    const roles = [
        {
            id: 'buyer',
            title: 'BUYER AUDIT',
            subtitle: 'RISK RADAR & FORENSIC HISTORY',
            icon: Radar,
            color: G3000.ADVISORY,
            desc: 'Analyze aircraft risk profiles and maintenance continuity before purchase.',
            sources: 'FAA / NTSB / TRANSPORT CANADA (TC) / SDR',
            path: '/buyer'
        },
        {
            id: 'seller',
            title: 'SELLER VAULT',
            subtitle: 'MARKET ALPHA & EQUITY SHIELDS',
            icon: TrendingUp,
            color: G3000.ADVISORY,
            desc: 'Maximize asset valuation with verified forensic quality markers.',
            sources: 'MARKET VELOCITY / PROPRIETARY AI PRICING ALPHA',
            path: '/seller'
        },
        {
            id: 'mechanic',
            title: 'MECHANIC CONSOLE',
            subtitle: 'LOGBOOK FORENSICS & COMPLIANCE',
            icon: Wrench,
            color: G3000.ADVISORY,
            desc: 'A&P grade tools for logbook OCR, AD compliance, and predictive maintenance.',
            sources: 'LOGBOOK OCR / AD COMPLIANCE REGISTRY / C3 AI',
            path: '/mechanic'
        }
    ];

    if (isBooting) {
        return (
            <div style={{ height: "100vh", width: "100vw", background: "black", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: G3000.ADVISORY, fontFamily: "'Roboto Mono', monospace" }}>
                <div style={{ width: "300px", height: "2px", background: "rgba(6, 182, 212, 0.1)", marginBottom: "20px", position: "relative" }}>
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(bootStep / bootSequence.length) * 100}%` }}
                        style={{ height: "100%", background: G3000.ADVISORY, boxShadow: "0 0 10px #06b6d4" }}
                    />
                </div>
                <div style={{ fontSize: "10px", fontWeight: "900", letterSpacing: "2px", textTransform: "uppercase" }}>
                    {bootSequence[bootStep] || "READY"}
                </div>
            </div>
        );
    }

    return (
        <div className="gateway-viewport" style={{
            height: "100vh",
            width: "100vw",
            background: G3000.BG,
            color: G3000.NORMAL,
            overflowX: "hidden",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* TOP STATUS BAR - STICKY */}
            <div style={{
                height: "44px",
                background: "#1e293b",
                display: "flex",
                alignItems: "center",
                padding: "0 20px",
                justifyContent: "space-between",
                borderBottom: "1px solid rgba(255,255,255,0.1)",
                zIndex: 100,
                position: "sticky",
                top: 0,
                width: "100%"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ fontSize: "12px", fontWeight: "900", display: "flex", alignItems: "center", gap: "6px", letterSpacing: "1px" }}>
                        <Shield size={14} color={G3000.ADVISORY} />
                        <span className="status-label">AVIONICS</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div className="led-pulse" style={{ width: "6px", height: "6px", background: "#10b981", borderRadius: "50%", boxShadow: "0 0 8px #10b981" }} />
                        <div style={{ fontSize: "10px", color: "#10b981", fontWeight: "bold" }}>READY</div>
                    </div>
                </div>
                <div style={{ fontSize: "11px", opacity: 0.6, fontWeight: "bold", fontFamily: "'Roboto Mono', monospace" }}>121.50 MHz</div>
            </div>

            {/* MAIN SELECTION GRID */}
            <div className="mission-grid" style={{ flex: 1, padding: "24px" }}>
                {roles.map((role) => (
                    <motion.div
                        key={role.id}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigateToRole(role.path)}
                        className="mission-card"
                        style={{
                            background: "black",
                            borderRadius: "12px",
                            border: `4px solid ${G3000.BEZEL}`,
                            outline: "1px solid #2D333B",
                            boxShadow: "inset 0 0 60px rgba(0,0,0,0.9), 0 10px 30px rgba(0,0,0,0.5)",
                            cursor: "pointer",
                            position: "relative",
                            overflow: "hidden",
                            display: "flex",
                            flexDirection: "column",
                            padding: "40px 30px",
                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                        }}
                    >
                        {/* PFD EFFECT */}
                        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${G3000.ADVISORY}08 0%, transparent 100%)` }} />
                        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: "rgba(255,255,255,0.1)" }} />

                        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%" }}>
                            {/* GTC ICON CONTAINER */}
                            <div style={{
                                width: "80px",
                                height: "80px",
                                borderRadius: "20px",
                                background: "#05070a",
                                border: `1px solid rgba(6, 182, 212, 0.2)`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                marginBottom: "24px",
                                color: G3000.ADVISORY,
                                boxShadow: "inset 0 4px 10px rgba(0,0,0,0.5)"
                            }}>
                                <role.icon size={40} strokeWidth={1.5} />
                            </div>

                            <div style={{ fontSize: "11px", color: G3000.ADVISORY, fontWeight: "900", letterSpacing: "3px", marginBottom: "8px" }}>MISSION SELECT</div>
                            <h2 style={{ fontSize: "32px", fontWeight: "900", textAlign: "center", marginBottom: "4px", color: "white", letterSpacing: "-0.5px" }}>{role.title}</h2>
                            <div style={{ fontSize: "13px", color: G3000.ADVISORY, fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "24px", textAlign: "center" }}>{role.subtitle}</div>

                            <p style={{ textAlign: "center", fontSize: "16px", color: "#94a3b8", lineHeight: "1.6", maxWidth: "320px", marginBottom: "32px", flex: 1 }}>{role.desc}</p>

                            <div style={{ marginBottom: "24px", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                                <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.3)", fontWeight: "900", letterSpacing: "1px" }}>VERIFIED DATA STREAM</div>
                                <div style={{ fontSize: "11px", color: G3000.ADVISORY, opacity: 0.8, fontWeight: "bold", fontFamily: "'Roboto Mono', monospace", textAlign: "center" }}>
                                    {role.sources}
                                </div>
                            </div>

                            <div style={{ width: "100%", height: "1px", background: "rgba(255,255,255,0.05)", margin: "0 0 32px 0" }} />

                            {/* ENTER CONSOLE BUTTON */}
                            <div style={{
                                width: "100%",
                                maxWidth: "240px",
                                padding: "14px 20px",
                                borderRadius: "4px",
                                background: G3000.ADVISORY,
                                color: "black",
                                fontWeight: "950",
                                fontSize: "14px",
                                letterSpacing: "1.5px",
                                transition: "all 0.2s ease",
                                border: "1px solid rgba(255,255,255,0.3)",
                                boxShadow: "0 0 0 1px rgba(6, 182, 212, 0.4), 0 0 15px 2px rgba(6, 182, 212, 0.3)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "10px"
                            }}>
                                ENTER CONSOLE
                                <Compass size={16} />
                            </div>
                        </div>

                        {/* BOTTOM SOFTKEYS DECORATION */}
                        <div style={{ position: "absolute", bottom: "10px", left: "10px", right: "10px", display: "flex", justifyContent: "space-around" }}>
                            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} style={{ width: "20px", height: "4px", background: "rgba(255,255,255,0.08)", borderRadius: "2px" }} />)}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* FLIGHTAWARE-STYLE LOGO */}
            <div style={{ textAlign: "center", padding: "20px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <div style={{ position: "relative", width: "32px", height: "32px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {/* FlightAware inspired climbing aero icon */}
                    <svg viewBox="0 0 24 24" fill="none" style={{ width: "100%", height: "100%", filter: "drop-shadow(0 0 8px rgba(0, 160, 226, 0.4))" }}>
                        <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" fill="#00a0e2" />
                        <path d="M12 18V2" stroke="#ffffff20" strokeWidth="0.5" />
                    </svg>
                </div>
                <div style={{ fontFamily: "'Roboto', sans-serif", fontSize: "22px", letterSpacing: "-0.5px", display: "flex", alignItems: "baseline" }}>
                    <span style={{ fontWeight: "900", color: "#ffffff" }}>goTail</span>
                    <span style={{ fontWeight: "300", color: "#00a0e2", marginLeft: "1px" }}>Scan</span>
                </div>
            </div>

            <style>{`
                body {
                    margin: 0;
                    background: black;
                }
                * {
                    box-sizing: border-box;
                }
                .gateway-viewport::-webkit-scrollbar {
                    width: 6px;
                }
                .gateway-viewport::-webkit-scrollbar-track {
                    background: #0b1019;
                }
                .gateway-viewport::-webkit-scrollbar-thumb {
                    background: #1e293b;
                    border-radius: 3px;
                }
                .mission-grid {
                    display: flex;
                    gap: 20px;
                }
                .mission-card {
                    flex: 1;
                }
                @media (max-width: 900px) {
                    .mission-grid {
                        flex-direction: column;
                    }
                    .mission-card {
                        margin-bottom: 24px;
                    }
                    .status-label {
                        display: none;
                    }
                }
                @keyframes ledPulse {
                    0% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.4; transform: scale(0.9); }
                    100% { opacity: 1; transform: scale(1); }
                }
                .led-pulse {
                    animation: ledPulse 2s infinite ease-in-out;
                }
            `}</style>
            <Footer />
        </div>
    );
}

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Upload, FileText, Scan, Loader2, CheckCircle, AlertTriangle, TrendingUp, Clock, Shield, LayoutGrid, ShieldCheck, Compass, Settings, Zap, ListChecks } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from './Footer';
import SplitScreenComparison from './SplitScreenComparison';
import AircraftIdentityCard from './AircraftIdentityCard';
import { logbookOCRService } from '../services/logbookOCRService';

const DirectToIcon = ({ size = 20, color = "currentColor" }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 12h16" />
        <path d="M14 6l6 6-6 6" />
        <rect x="3" y="7" width="10" height="10" rx="1" fill="black" stroke={color} />
        <text x="5" y="15" fontSize="10" fontWeight="900" fill={color} stroke="none" style={{ fontFamily: 'Roboto Mono, monospace' }}>D</text>
    </svg>
);

export default function MechanicDashboardStandalone() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState("AUDIT");
    const [tailNumber, setTailNumber] = useState(searchParams.get('tail') || '');
    const [loading, setLoading] = useState(searchParams.get('autostart') === 'true');
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    // OCR State
    const [ocrLoading, setOcrLoading] = useState(false);
    const [ocrProgress, setOcrProgress] = useState(0);
    const [ocrResult, setOcrResult] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [ocrError, setOcrError] = useState(null);

    useEffect(() => {
        const tail = searchParams.get('tail');
        const autostart = searchParams.get('autostart');
        if (tail && autostart === 'true') {
            handleAudit(tail);
        } else {
            setLoading(false);
        }
    }, []);

    const handleAudit = async (overrideTail) => {
        const targetTail = overrideTail || tailNumber;
        if (!targetTail?.trim()) return;
        setLoading(true);
        setError(null);
        try {
            const module = await import('../services/scraperService');
            const data = await module.scraperService.scanTailNumber(targetTail.toUpperCase());
            setResult(data);
        } catch (err) {
            setError(err.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setOcrResult(null);
        setOcrError(null);
    };

    const runOCR = async () => {
        if (!selectedFile) return;
        setOcrLoading(true);
        setOcrProgress(0);
        setOcrError(null);
        try {
            const data = await logbookOCRService.processLogbookImage(selectedFile, (progress) => {
                setOcrProgress(progress);
            });
            setOcrResult(data);
            if (data.findings.aircraft_id && !tailNumber) {
                setTailNumber(data.findings.aircraft_id);
            }
        } catch (err) {
            setOcrError("Failed to process image. Ensure it is a clear logbook photo.");
        } finally {
            setOcrLoading(false);
        }
    };

    const getComplianceChecklist = () => {
        if (!result) return [];
        const aircraft = result.aircraft_details;
        const makeModel = aircraft?.make_model?.toUpperCase() || '';
        const checklist = [];
        if (makeModel.includes('CESSNA')) {
            checklist.push({ id: 'AD 2020-26-16', description: 'Wing Spar Inspection (SID)', status: 'PENDING', due: '100hr' });
            checklist.push({ id: 'AD 2021-12-05', description: 'Elevator Trim Tab Inspection', status: result.logbook_audit ? 'VERIFIED' : 'UNKNOWN', due: 'Annual' });
        }
        if (makeModel.includes('PIPER')) {
            checklist.push({ id: 'AD 2019-01-09', description: 'Wing Attachment Inspection', status: 'PENDING', due: '500hr' });
            checklist.push({ id: 'AD 2018-23-12', description: 'Fuel System Compliance', status: 'VERIFIED', due: '1000hr' });
        }
        checklist.push({ id: 'AD 2017-17-11', description: 'ELT Battery Replacement', status: result.infrastructure_audit?.elt_406mhz ? 'VERIFIED' : 'CHECK', due: 'Annual' });
        checklist.push({ id: 'AD 2022-05-01', description: 'ADS-B Out Compliance', status: 'VERIFIED', due: 'N/A' });
        return checklist;
    };

    const checklist = getComplianceChecklist();

    const G3000 = {
        WARNING: "#ef4444", CAUTION: "#f59e0b", ADVISORY: "#06b6d4", NORMAL: "#ffffff", BG: "#0b0f19", BEZEL: "#1e293b", GRID: "rgba(255, 255, 255, 0.05)"
    };

    const sidebarStyle = {
        position: "fixed",
        left: "0px",
        top: "0px",
        bottom: "0px",
        width: "80px",
        background: "#0f172a",
        borderRight: "2px solid #334155",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px 0",
        zIndex: 100
    };
    const g3000ButtonStyle = (isActive) => ({
        width: "56px",
        height: "56px",
        borderRadius: "8px",
        background: isActive ? "rgba(245, 158, 11, 0.2)" : "rgba(255, 255, 255, 0.05)",
        border: `1px solid ${isActive ? "#f59e0b" : "rgba(255, 255, 255, 0.1)"}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: isActive ? "#f59e0b" : "#94a3b8",
        cursor: "pointer",
        marginBottom: "16px",
        transition: "all 0.2s ease",
        gap: "4px"
    });
    const g3000LabelStyle = { fontSize: "8px", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.5px" };

    const BottomNav = () => (
        <div className="bottom-nav">
            <button onClick={() => setActiveTab("AUDIT")} className={activeTab === "AUDIT" ? "active" : ""}><LayoutGrid size={24} /><span>Audit</span></button>
            <button onClick={() => setActiveTab("OCR")} className={activeTab === "OCR" ? "active" : ""}><Scan size={24} /><span>Forensic</span></button>
            <button onClick={() => setActiveTab("COMPLIANCE")} className={activeTab === "COMPLIANCE" ? "active" : ""}><ShieldCheck size={24} /><span>Cert</span></button>
            <button onClick={() => setActiveTab("COMPARISON")} className={activeTab === "COMPARISON" ? "active" : ""}><TrendingUp size={24} /><span>Compare</span></button>
        </div>
    );

    return (
        <div className="cockpit-container" style={{ height: "100vh", width: "100vw", background: G3000.BG, color: G3000.NORMAL, display: "flex", flexDirection: "column", fontFamily: "'Rajdhani', sans-serif" }}>
            <div className="desktop-sidebar" style={sidebarStyle}>
                <div onClick={() => navigate("/")} style={{ marginBottom: "32px", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", cursor: "pointer" }}>
                    <svg viewBox="0 0 24 24" fill="none" style={{ width: "28px", height: "28px", filter: "drop-shadow(0 0 4px rgba(0, 160, 226, 0.4))" }}>
                        <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z" fill="#00a0e2" />
                    </svg>
                    <div style={{ fontFamily: "'Roboto', sans-serif", fontSize: "10px", textAlign: "center" }}>
                        <div style={{ fontWeight: "900", color: "#ffffff", lineHeight: "1" }}>goTail</div>
                        <div style={{ fontWeight: "300", color: "#00a0e2", lineHeight: "1" }}>Scan</div>
                    </div>
                </div>
                <button onClick={() => setActiveTab("AUDIT")} style={g3000ButtonStyle(activeTab === "AUDIT")}><LayoutGrid size={20} /><span style={g3000LabelStyle}>Audit</span></button>
                <button onClick={() => setActiveTab("OCR")} style={g3000ButtonStyle(activeTab === "OCR")}><Scan size={20} /><span style={g3000LabelStyle}>Forensic</span></button>
                <button onClick={() => setActiveTab("COMPLIANCE")} style={g3000ButtonStyle(activeTab === "COMPLIANCE")}><ShieldCheck size={20} /><span style={g3000LabelStyle}>Cert</span></button>
                <button onClick={() => setActiveTab("COMPARISON")} style={g3000ButtonStyle(activeTab === "COMPARISON")}><TrendingUp size={20} /><span style={g3000LabelStyle}>Compare</span></button>
                <div style={{ marginTop: "auto" }}><button onClick={() => navigate("/")} style={g3000ButtonStyle(false)}><Compass size={20} /><span style={g3000LabelStyle}>Exit</span></button></div>
            </div>

            <div className="main-viewport" style={{ flex: 1, display: "flex", flexDirection: "column", background: "black", margin: "10px", marginLeft: "90px", borderRadius: "4px", border: "4px solid #1e293b", boxShadow: "inset 0 0 40px rgba(0,0,0,0.8)", position: "relative", overflowX: "hidden", overflowY: "auto" }}>
                {/* STICKY TOP STATUS BAR */}
                <div className="status-bar" style={{ height: "40px", background: "#1e293b", display: "flex", alignItems: "center", padding: "0 20px", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.1)", fontFamily: "'Roboto Mono', monospace", position: "sticky", top: 0, zIndex: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                        <div style={{ fontSize: "12px", fontWeight: "900", color: "#f59e0b" }} className="status-title">MAINTENANCE CONSOLE ACTIVE</div>
                        <div style={{ fontSize: "14px", fontWeight: "bold", color: "white" }}>{tailNumber || "---"}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ display: "flex", gap: "10px" }} className="status-meta">
                            <div style={{ background: "#f59e0b", color: "black", fontSize: "10px", fontWeight: "900", padding: "2px 8px", borderRadius: "2px" }}>A&P CERTIFIED</div>
                            <div style={{ fontSize: "12px", opacity: 0.5 }}>121.50 MHz</div>
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                            <button onClick={() => navigate("/")} className="mobile-auth-btn" style={{ display: "none" }}><Compass size={18} color="#f59e0b" /></button>
                        </div>
                    </div>
                </div>

                {loading && <div style={{ position: "absolute", inset: 0, zIndex: 100, background: "rgba(0,0,0,0.9)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}><Loader2 size={48} className="animate-spin text-amber-500 mb-4" /><div style={{ fontSize: "24px", fontWeight: "bold", color: "white", letterSpacing: "4px", textAlign: "center" }}>RETRIEVING ASSET TELEMETRY</div></div>}

                <div style={{ flex: 1, padding: "24px" }}>
                    {!result && !loading ? (
                        <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
                            <div className="ghost-icon-wrap" style={{ position: "relative" }}>
                                <Zap size={80} color="rgba(255,255,255,0.03)" style={{ marginBottom: "20px" }} />
                            </div>
                            <h2 style={{ fontSize: "32px", fontWeight: "900", color: "white", letterSpacing: "2px", margin: "0 10px" }} className="awaiting-text">READY FOR INSPECTION</h2>
                            <p style={{ color: "#94a3b8", marginBottom: "32px", fontSize: "14px" }}>Connect to Aircraft Transponder for Forensic Audit</p>
                            <div className="search-box-wrap" style={{ width: "100%", maxWidth: "440px", display: "flex", gap: "10px" }}>
                                <input placeholder="ENTER TAIL NUMBER" value={tailNumber} onChange={(e) => setTailNumber(e.target.value)} style={{ flex: 1, background: "rgba(0,0,0,0.5)", border: "1px solid #334155", padding: "16px", borderRadius: "4px", color: "white", fontSize: "16px", fontWeight: "bold", textAlign: "center" }} />
                                <button className="scan-btn" onClick={() => handleAudit()} style={{ background: "#f59e0b", color: "black", border: "none", padding: "0 24px", minWidth: "120px", borderRadius: "4px", fontWeight: "950", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                                    <DirectToIcon size={16} color="black" />
                                    AUDIT
                                </button>
                            </div>
                        </div>
                    ) : result && (
                        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
                            <div className="dashboard-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                                    {activeTab === "AUDIT" && (
                                        <>
                                            <AircraftIdentityCard aircraftDetails={result.aircraft_details} />
                                            <div style={{ background: "#0f172a", border: "1px solid #78350f", padding: "20px", borderRadius: "4px", borderLeft: "6px solid #f59e0b" }}>
                                                <div style={{ color: "#f59e0b", fontSize: "10px", fontWeight: "900", marginBottom: "16px" }}>C3 AI PREDICTIVE PAG</div>
                                                <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
                                                    <div style={{ fontSize: "48px", fontWeight: "900", color: result?.predictive_maintenance?.pag_score > 70 ? "#ef4444" : "#f59e0b" }}>{result?.predictive_maintenance?.pag_score || 0}%</div>
                                                    <div>
                                                        <div style={{ fontSize: "14px", fontWeight: "bold" }}>PROBABILITY OF GROUNDING</div>
                                                        <div style={{ fontSize: "11px", opacity: 0.6 }}>Based on fleet lifecycle telemetry</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {activeTab === "OCR" && (
                                        <div style={{ background: "#0f172a", border: "1px solid #334155", padding: "24px", borderRadius: "4px" }}>
                                            <div style={{ fontSize: "10px", color: "#f59e0b", fontWeight: "900", marginBottom: "20px" }}>LOGBOOK FORENSIC SCAN</div>
                                            <label style={{ display: "block", border: "2px dashed rgba(255,255,255,0.1)", borderRadius: "8px", padding: "40px", textAlign: "center", cursor: "pointer", background: "rgba(0,0,0,0.3)" }}>
                                                <input type="file" className="hidden" accept="image/*" onChange={handleFileSelect} />
                                                {previewUrl ? <img src={previewUrl} style={{ maxWidth: "100%", maxHeight: "200px", margin: "0 auto" }} /> : <><Upload size={32} style={{ margin: "0 auto 12px", opacity: 0.3 }} /><div style={{ fontSize: "12px", fontWeight: "bold" }}>UPLOAD LOGBOOK PAGE</div></>}
                                            </label>
                                            <button onClick={runOCR} disabled={!selectedFile || ocrLoading} style={{ width: "100%", marginTop: "20px", padding: "16px", background: "#f59e0b", color: "black", border: "none", borderRadius: "4px", fontWeight: "900" }}>{ocrLoading ? "EXTRACTING..." : "RUN FORENSIC SCAN"}</button>

                                            {ocrResult && (
                                                <div style={{ marginTop: "24px", background: "rgba(0,0,0,0.5)", padding: "16px", borderRadius: "4px", border: "1px solid #f59e0b" }}>
                                                    <div style={{ fontSize: "10px", color: "#10b981", fontWeight: "900", marginBottom: "12px" }}>✓ INTELLIGENCE EXTRACTED</div>
                                                    <div style={{ fontSize: "14px", fontWeight: "bold" }}>Audit Score: {ocrResult.findings.audit_score}%</div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === "COMPLIANCE" && (
                                        <div style={{ background: "#0f172a", border: "1px solid #334155", padding: "20px", borderRadius: "4px" }}>
                                            <div style={{ fontSize: "10px", color: "#f59e0b", fontWeight: "900", marginBottom: "20px" }}>AD COMPLIANCE REGISTRY</div>
                                            <div style={{ display: "grid", gap: "12px" }}>
                                                {checklist.map((ad, i) => (
                                                    <div key={i} style={{ padding: "12px", background: "rgba(255,255,255,0.02)", borderLeft: `4px solid ${ad.status === 'VERIFIED' ? '#10b981' : '#f59e0b'}`, borderRadius: "4px" }}>
                                                        <div style={{ fontSize: "11px", fontWeight: "bold" }}>{ad.id}</div>
                                                        <div style={{ fontSize: "10px", opacity: 0.6 }}>{ad.description}</div>
                                                        <div style={{ marginTop: "4px", fontSize: "10px", color: ad.status === 'VERIFIED' ? "#10b981" : "#f59e0b", fontWeight: "bold" }}>{ad.status}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                                    {(activeTab === "AUDIT" || activeTab === "COMPARISON") && (
                                        <div style={{ background: "rgba(0,0,0,0.3)", padding: "24px", borderRadius: "4px", border: "1px solid #334155" }}>
                                            <div style={{ fontSize: "10px", color: "#f59e0b", fontWeight: "900", marginBottom: "20px" }}>ANOMALY DETECTION</div>
                                            {result?.logbook_audit?.findings?.gaps?.length > 0 ? (
                                                result.logbook_audit.findings.gaps.map((gap, i) => (
                                                    <div key={i} style={{ padding: "12px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid #ef4444", borderRadius: "4px", marginBottom: "12px" }}>
                                                        <div style={{ fontSize: "12px", fontWeight: "bold", color: "#ef4444" }}>{gap.flag}</div>
                                                        <div style={{ fontSize: "11px", opacity: 0.8 }}>{gap.period}</div>
                                                    </div>
                                                ))
                                            ) : <div style={{ opacity: 0.5, fontSize: "12px" }}>No critical gaps detected in registry.</div>}
                                        </div>
                                    )}

                                    {activeTab === "AUDIT" && (
                                        <div style={{ background: "rgba(245, 158, 11, 0.05)", padding: "20px", borderRadius: "4px", border: "1px solid rgba(245, 158, 11, 0.2)" }}>
                                            <div style={{ fontSize: "10px", color: "#f59e0b", fontWeight: "900", marginBottom: "12px" }}>TECHNICAL ADVISORY</div>
                                            <p style={{ fontSize: "14px", lineHeight: "1.6", color: "#d1d5db", fontStyle: "italic" }}>
                                                "{result.ai_intelligence?.technical_advisory || "Asset appears to follow standard maintenance cycles. High confidence in AD compliance based on recent registry entries."}"
                                            </p>
                                        </div>
                                    )}

                                    {activeTab === "COMPARISON" && (
                                        <div style={{ maxHeight: "600px", overflow: "auto" }}>
                                            <SplitScreenComparison
                                                tcAdData={[
                                                    { ad_number: 'AD 2020-26-16', compliance_date: '2023-05-15', description: 'Wing Spar Inspection (SID)' },
                                                    { ad_number: 'AD 2021-12-05', compliance_date: '2023-08-22', description: 'Elevator Trim Tab Inspection' }
                                                ]}
                                                ocrData={[
                                                    { ad_number: 'AD 2020-26-16', compliance_date: '2023-05-15', description: 'Wing Spar Inspection (SID)' },
                                                    { ad_number: 'AD 2021-12-05', compliance_date: '2023-09-01', description: 'Elevator Trim Tab Inspection' }
                                                ]}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div style={{ padding: "40px 0" }}>
                    <Footer />
                </div>
                <BottomNav />
            </div>

            <style>{`
                ::-webkit-scrollbar { width: 8px; }
                ::-webkit-scrollbar-track { background: #0b101c; }
                ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
                ::-webkit-scrollbar-thumb:hover { background: #475569; }
                .hidden { display: none; }
                .bottom-nav { display: none; }
                @media (max-width: 900px) {
                    .desktop-sidebar { display: none !important; }
                    .main-viewport { margin: 0 !important; border: none !important; border-radius: 0 !important; }
                    .status-title { display: none; }
                    .status-meta { font-size: 10px !important; }
                    .mobile-auth-btn { display: block !important; padding: 0; background: none; border: none; cursor: pointer; }
                    .awaiting-text { font-size: 24px !important; }
                    .search-box-wrap { flex-direction: column; align-items: stretch; }
                    .scan-btn { height: 56px; width: 100% !important; margin-top: 8px; }
                    .dashboard-grid { grid-template-columns: 1fr !important; }
                    .bottom-nav { 
                        display: flex; 
                        justify-content: space-around; 
                        align-items: center; 
                        background: #0f172a; 
                        border-top: 1px solid #1e293b; 
                        padding: 10px 0; 
                        position: sticky; 
                        bottom: 0; 
                        z-index: 100;
                    }
                    .bottom-nav button { 
                        background: none; 
                        border: none; 
                        color: #94a3b8; 
                        display: flex; 
                        flex-direction: column; 
                        align-items: center; 
                        gap: 4px; 
                        font-size: 10px; 
                        font-weight: bold; 
                        text-transform: uppercase;
                    }
                    .bottom-nav button.active { color: #f59e0b; }
                }
            `}</style>
        </div>
    );
}

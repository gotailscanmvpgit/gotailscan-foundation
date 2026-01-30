import { useState, useEffect } from "react";
import { Shield, Loader2, Search, Users, Plane, LayoutGrid, Activity, FileText, BarChart3, Settings, Zap, Compass, AlertTriangle, ShieldCheck, TrendingUp, DollarSign } from "lucide-react";
import ForensicScanner from "./ForensicScanner";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useSearchParams } from "react-router-dom";
import Footer from "./Footer";
import { resolveMakeModel, isCleanMakeModel } from "../utils/makeModelResolver";
import CircularGauge from "./CircularGauge";
import PillarBar from "./PillarBar";
import HangarDoorModal from "./HangarDoorModal";
import AircraftAssetCard from "./AircraftAssetCard";
import { supabase } from "../lib/supabaseClient";

const DirectToIcon = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12h16" />
    <path d="M14 6l6 6-6 6" />
    <rect x="3" y="7" width="10" height="10" rx="1" fill="black" stroke={color} />
    <text x="5" y="15" fontSize="10" fontWeight="900" fill={color} stroke="none" style={{ fontFamily: 'Roboto Mono, monospace' }}>D</text>
  </svg>
);

export default function MinimalBuyerTest() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [tailNumber, setTailNumber] = useState(searchParams.get("tail") || "");
  const [loading, setLoading] = useState(searchParams.get("autostart") === "true");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [resolvedMakeModel, setResolvedMakeModel] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [guestHistory, setGuestHistory] = useState([]);
  const [userHistory, setUserHistory] = useState([]);
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState("SUMMARY"); // G3000 PANE SELECTOR

  const G3000 = {
    WARNING: "#ef4444", CAUTION: "#f59e0b", ADVISORY: "#06b6d4", NORMAL: "#ffffff", BG: "#0b0f19", BEZEL: "#1e293b", GRID: "rgba(255, 255, 255, 0.05)"
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("guest_searches");
    if (stored) setGuestHistory(JSON.parse(stored));
  }, []);

  useEffect(() => {
    const fetchUserHistory = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase.from("user_searches").select("*").order("searched_at", { ascending: false }).limit(6);
        if (data) setUserHistory(data);
      }
    };
    fetchUserHistory();
  }, [result]);

  const handleScan = async (overrideTail) => {
    const targetTail = overrideTail || tailNumber;
    if (!targetTail?.trim()) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      const stored = localStorage.getItem("guest_searches");
      const history = stored ? JSON.parse(stored) : [];
      if (history.length >= 3) {
        setIsModalOpen(true);
        setLoading(false);
        return;
      }
      if (!history.includes(targetTail.toUpperCase().trim())) {
        const newHistory = [...history, targetTail.toUpperCase().trim()];
        localStorage.setItem("guest_searches", JSON.stringify(newHistory));
        setGuestHistory(newHistory);
      }
    }

    setLoading(true);
    setError(null);
    try {
      const module = await import("../services/scraperService");
      const data = await module.scraperService.scanTailNumber(targetTail.toUpperCase());
      setResult(data);
    } catch (err) {
      setError(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!result?.aircraft_details) return;
    const aircraftData = result.aircraft_details;
    if (!isCleanMakeModel(aircraftData.make_model)) {
      resolveMakeModel(aircraftData).then((resolved) => setResolvedMakeModel(resolved)).catch(() => setResolvedMakeModel({ make_model: aircraftData.make_model || "Unknown Aircraft" }));
    } else {
      setResolvedMakeModel({ make_model: aircraftData.make_model });
    }
  }, [result]);

  const getCleanMakeModel = () => resolvedMakeModel ? resolvedMakeModel.make_model : "Loading...";

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
    background: isActive ? "rgba(6, 182, 212, 0.2)" : "rgba(255, 255, 255, 0.05)",
    border: `1px solid ${isActive ? "#06b6d4" : "rgba(255, 255, 255, 0.1)"}`,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: isActive ? "#06b6d4" : "#94a3b8",
    cursor: "pointer",
    marginBottom: "16px",
    transition: "all 0.2s ease",
    gap: "4px"
  });
  const g3000LabelStyle = { fontSize: "8px", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.5px" };

  const BottomNav = () => (
    <div className="bottom-nav">
      <button onClick={() => setActiveTab("SUMMARY")} className={activeTab === "SUMMARY" ? "active" : ""}><LayoutGrid size={24} /><span>Summary</span></button>
      <button onClick={() => setActiveTab("RADAR")} className={activeTab === "RADAR" ? "active" : ""}><Activity size={24} /><span>Radar</span></button>
      <button onClick={() => setActiveTab("AUDIT")} className={activeTab === "AUDIT" ? "active" : ""}><FileText size={24} /><span>Audit</span></button>
      <button onClick={() => setActiveTab("MISSION")} className={activeTab === "MISSION" ? "active" : ""}><Plane size={24} /><span>Mission</span></button>
    </div>
  );

  return (
    <div className="cockpit-container" style={{ height: "100vh", width: "100vw", background: G3000.BG, color: G3000.NORMAL, display: "flex", flexDirection: "column", fontFamily: "'Inter', sans-serif" }}>
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
        <button onClick={() => setActiveTab("SUMMARY")} style={g3000ButtonStyle(activeTab === "SUMMARY")}><LayoutGrid size={20} /><span style={g3000LabelStyle}>Summary</span></button>
        <button onClick={() => setActiveTab("RADAR")} style={g3000ButtonStyle(activeTab === "RADAR")}><Activity size={20} /><span style={g3000LabelStyle}>Radar</span></button>
        <button onClick={() => setActiveTab("AUDIT")} style={g3000ButtonStyle(activeTab === "AUDIT")}><FileText size={20} /><span style={g3000LabelStyle}>Audit</span></button>
        <button onClick={() => setActiveTab("MISSION")} style={g3000ButtonStyle(activeTab === "MISSION")}><Plane size={20} /><span style={g3000LabelStyle}>Mission</span></button>
        <div style={{ marginTop: "auto" }}>
          <button onClick={() => navigate("/")} style={g3000ButtonStyle(false)}><Compass size={20} /><span style={g3000LabelStyle}>Exit</span></button>
          <button onClick={() => setIsModalOpen(true)} style={g3000ButtonStyle(false)}><Settings size={20} /><span style={g3000LabelStyle}>Auth</span></button>
        </div>
      </div>

      <div className="main-viewport" style={{ flex: 1, display: "flex", flexDirection: "column", background: "black", margin: "10px", marginLeft: "90px", borderRadius: "4px", border: "4px solid #1e293b", boxShadow: "inset 0 0 40px rgba(0,0,0,0.8)", position: "relative", overflowX: "hidden", overflowY: "auto" }}>
        {/* STICKY TOP STATUS BAR */}
        <div className="status-bar" style={{ height: "40px", background: "#1e293b", display: "flex", alignItems: "center", padding: "0 20px", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.1)", fontFamily: "'Roboto Mono', monospace", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ fontSize: "12px", fontWeight: "900", color: "#06b6d4" }} className="status-title">FORENSIC SENSORS ONLINE</div>
            <div style={{ fontSize: "14px", fontWeight: "bold", color: "white" }}>{tailNumber || "---"}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ fontSize: "12px", opacity: 0.5 }} className="status-meta">118.70 MHz | MISSION READY</div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => navigate("/")} className="mobile-auth-btn" style={{ display: "none" }}><Compass size={18} color="#06b6d4" /></button>
              <button onClick={() => setIsModalOpen(true)} className="mobile-auth-btn" style={{ display: "none" }}><Settings size={18} color="#06b6d4" /></button>
            </div>
          </div>
        </div>

        {loading && <ForensicScanner color="cyan" />}

        <div style={{ flex: 1, padding: "24px" }}>
          {!result && !loading ? (
            <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
              <div className="ghost-icon-wrap" style={{ position: "relative" }}>
                <Compass size={80} color="rgba(255,255,255,0.03)" style={{ marginBottom: "20px" }} />
              </div>
              <h2 style={{ fontSize: "32px", fontWeight: "900", color: "white", letterSpacing: "2px", margin: "0 10px" }} className="awaiting-text">AWAITING IDENTIFIER</h2>
              <div className="search-box-wrap" style={{ width: "100%", maxWidth: "440px", display: "flex", gap: "10px", marginTop: "32px" }}>
                <input placeholder="ENTER TAIL NUMBER" value={tailNumber} onChange={(e) => setTailNumber(e.target.value.toUpperCase())} onKeyDown={(e) => e.key === "Enter" && handleScan()} style={{ flex: 1, background: "rgba(0,0,0,0.5)", border: "1px solid #334155", padding: "16px", borderRadius: "4px", color: "white", fontSize: "16px", fontWeight: "bold", textAlign: "center" }} />
                <button className="scan-btn" onClick={() => handleScan()} style={{ background: "#06b6d4", color: "black", border: "none", padding: "0 24px", minWidth: "120px", borderRadius: "4px", fontWeight: "950", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <DirectToIcon size={16} color="black" />
                  SCAN
                </button>
              </div>
              {userHistory.length > 0 && (
                <div style={{ marginTop: "48px", width: "100%", maxWidth: "800px" }}>
                  <div style={{ fontSize: "10px", color: "#06b6d4", fontWeight: "900", marginBottom: "16px", letterSpacing: "2px" }}>RECENT FLIGHTS</div>
                  <div className="history-grid">
                    {userHistory.map((h) => (
                      <div key={h.id} onClick={() => { setTailNumber(h.tail_number); handleScan(h.tail_number); }} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", padding: "12px", borderRadius: "4px", cursor: "pointer" }}>
                        <div style={{ fontWeight: "bold" }}>{h.tail_number}</div>
                        <div style={{ fontSize: "10px", opacity: 0.5 }}>{h.search_data?.aircraft_details?.make_model}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : result && (
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
              <AircraftAssetCard search={result} />
              <div className="dashboard-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginTop: "24px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  {activeTab === "SUMMARY" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                      {/* RISK INDEX */}
                      <div style={{ background: "#0f172a", border: "1px solid #1e293b", padding: "24px", borderRadius: "8px", borderLeft: `6px solid ${(100 - (result.confidence_score || 0)) > 50 ? "#ef4444" : "#06b6d4"}`, boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}>
                        <div style={{ fontSize: "10px", color: "#06b6d4", fontWeight: "900", marginBottom: "20px", letterSpacing: "1px" }}>FORENSIC RISK INDEX</div>
                        <div style={{ display: "flex", alignItems: "center", gap: "32px", flexWrap: "wrap" }}>
                          <CircularGauge score={100 - (result.confidence_score || 0)} size={120} mode="risk" label="RISK" />
                          <div>
                            <div style={{ fontSize: "42px", fontWeight: "900", color: (100 - (result.confidence_score || 0)) > 50 ? "#ef4444" : "white" }}>
                              {100 - (result.confidence_score || 0)}
                            </div>
                            <div style={{ fontSize: "12px", color: "#94a3b8", fontWeight: "bold", textTransform: "uppercase" }}>Aggregate Risk Score</div>
                          </div>
                        </div>
                      </div>

                      {/* WHY THIS SCORE */}
                      <div style={{ background: "rgba(0,0,0,0.3)", padding: "24px", borderRadius: "8px", border: "1px solid #1e293b" }}>
                        <div style={{ fontSize: "10px", color: "#06b6d4", fontWeight: "900", marginBottom: "16px", letterSpacing: "1px" }}>WHY THIS SCORE?</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                          {result.audit_results?.map((audit, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                              <div style={{ fontSize: "13px", color: "#e2e8f0" }}>{audit.reason}</div>
                              <div style={{ fontSize: "12px", fontWeight: "900", color: audit.status === "negative" ? "#ef4444" : audit.status === "caution" ? "#f59e0b" : "#10b981" }}>
                                {audit.points}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* ACTION PLAN */}
                      <div style={{ background: "rgba(6, 182, 212, 0.05)", padding: "24px", borderRadius: "8px", border: "1px solid rgba(6, 182, 212, 0.2)" }}>
                        <div style={{ fontSize: "10px", color: "#06b6d4", fontWeight: "900", marginBottom: "16px", letterSpacing: "1px" }}>MISSION ACTION PLAN</div>
                        <div style={{ fontSize: "14px", color: "white", fontWeight: "bold", marginBottom: "8px", textTransform: "uppercase" }}>
                          {result.ai_intelligence?.audit_verdict || "ADVISORY READY"}
                        </div>
                        <p style={{ fontSize: "14px", color: "#94a3b8", lineHeight: "1.6", margin: 0 }}>
                          {result.ai_intelligence?.technical_advisory || "System analysis complete. Refer to forensic telemetry for mission-critical deductions."}
                        </p>
                      </div>

                      {/* FINANCIAL SHIELD */}
                      <div style={{ background: "rgba(16, 185, 129, 0.05)", padding: "24px", borderRadius: "8px", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                        <div style={{ fontSize: "10px", color: "#10b981", fontWeight: "900", marginBottom: "16px", letterSpacing: "1px" }}>FINANCIAL SHIELD</div>
                        <div style={{ display: "grid", gap: "12px" }}>
                          {[
                            { label: "TITLE CLEARANCE", status: result.forensic_records?.liens_found ? "CAUTION" : "VERIFIED" },
                            { label: "ESCROW READY", status: "ACTIVE" },
                            { label: "LIEN VERIFIED", status: result.forensic_records?.liens_found ? "WARNING" : "CLEAR" }
                          ].map((s, i) => (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "rgba(255,255,255,0.02)", borderRadius: "4px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <ShieldCheck size={14} color={s.status === "VERIFIED" || s.status === "ACTIVE" || s.status === "CLEAR" ? "#10b981" : "#ef4444"} />
                                <span style={{ fontSize: "12px", fontWeight: "800", color: "white" }}>{s.label}</span>
                              </div>
                              <span style={{ fontSize: "10px", fontWeight: "900", color: s.status === "VERIFIED" || s.status === "ACTIVE" || s.status === "CLEAR" ? "#10b981" : "#ef4444" }}>{s.status}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  {activeTab === "RADAR" && (
                    <div style={{ background: "rgba(0,0,0,0.3)", padding: "24px", borderRadius: "8px", border: "1px solid #334155" }}>
                      <div style={{ fontSize: "10px", color: "#06b6d4", fontWeight: "900", marginBottom: "20px" }}>RADAR TELEMETRY</div>
                      <PillarBar label="Safety" score={result.risk_metrics?.safety || 85} color="#10b981" />
                      <PillarBar label="Mechanical" score={result.risk_metrics?.mechanical || 65} color="#f59e0b" />
                      <PillarBar label="Compliance" score={result.risk_metrics?.financial || 95} color="#06b6d4" />
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  <div style={{ background: "rgba(239, 68, 68, 0.05)", padding: "24px", borderRadius: "8px", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
                    <div style={{ fontSize: "10px", color: "#ef4444", fontWeight: "900", marginBottom: "16px" }}>CRITICAL ALERTS</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {result.forensic_records?.ntsb_count > 0 && (
                        <div style={{ color: "#ef4444", fontWeight: "bold", background: "rgba(239,68,68,0.1)", padding: "10px", borderRadius: "4px" }}>⚠ {result.forensic_records.ntsb_count} ACCIDENT RECORDS FOUND</div>
                      )}
                      {result.forensic_records?.liens_found && (
                        <div style={{ color: "#f59e0b", fontWeight: "bold", background: "rgba(245,158,11,0.1)", padding: "10px", borderRadius: "4px" }}>⚠ ACTIVE LIEN DETECTED</div>
                      )}
                      {!result.forensic_records?.ntsb_count && !result.forensic_records?.liens_found && (
                        <div style={{ color: "#10b981", fontSize: "12px" }}>ZERO ACCIDENT HISTORY DETECTED</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div style={{ padding: "24px 0" }}>
          <Footer />
        </div>
        <BottomNav />
      </div>
      <HangarDoorModal isOpen={isModalOpen} searchHistory={guestHistory} onClose={() => setIsModalOpen(false)} />
      <style>{`
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
          .history-grid { grid-template-columns: 1fr !important; }
          .bottom-nav { 
            display: flex; 
            justify-content: space-around; 
            align-items: center; 
            background: #0f172a; 
            border-top: 1px solid #1e293b; 
            padding: 10px 0; 
            position: fixed; 
            bottom: 0; 
            left: 0;
            width: 100%;
            z-index: 9999;
          }
          .main-viewport { margin: 0 !important; border: none !important; border-radius: 0 !important; padding-bottom: 80px !important; }
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
            cursor: pointer;
          }
          .bottom-nav button.active { color: #06b6d4; }
        }
      `}</style>
    </div>
  );
}

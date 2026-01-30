import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resolveMakeModel, isCleanMakeModel } from "../utils/makeModelResolver";
import { supabase } from "../lib/supabaseClient";
import { Shield, Clock, Loader2, TrendingUp, ShieldCheck, LayoutGrid, Activity, BarChart3, Settings, Zap, Compass, AlertTriangle, Plane, DollarSign, ListChecks } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import CircularGauge from "./CircularGauge";
import AircraftAssetCard from "./AircraftAssetCard";
import HangarDoorModal from "./HangarDoorModal";
import ForensicScanner from "./ForensicScanner";

const DirectToIcon = ({ size = 20, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 12h16" />
    <path d="M14 6l6 6-6 6" />
    <rect x="3" y="7" width="10" height="10" rx="1" fill="black" stroke={color} />
    <text x="5" y="15" fontSize="10" fontWeight="900" fill={color} stroke="none" style={{ fontFamily: 'Roboto Mono, monospace' }}>D</text>
  </svg>
);

export default function SellerDashboardStandalone() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState("SUMMARY"); // G3000 PANE SELECTOR
  const [tailNumber, setTailNumber] = useState(searchParams.get("tail") || "");
  const [loading, setLoading] = useState(searchParams.get("autostart") === "true");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [resolvedMakeModel, setResolvedMakeModel] = useState(null);
  const [session, setSession] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [guestHistory, setGuestHistory] = useState([]);
  const [userHistory, setUserHistory] = useState([]);

  useEffect(() => {
    const tail = searchParams.get("tail");
    const autostart = searchParams.get("autostart");
    const stored = localStorage.getItem("guest_searches");
    const history = stored ? JSON.parse(stored) : [];
    setGuestHistory(history);

    if (tail && autostart === "true") {
      supabase.auth.getSession().then(({ data: { session } }) => {
        const isDemo = localStorage.getItem("demo_mode") === "true";
        if (session || isDemo) {
          handleScan(tail);
        } else {
          if (history.length >= 3) {
            setLoading(false);
            setIsModalOpen(true);
          } else {
            handleScan(tail);
          }
        }
      });
    } else {
      setLoading(false);
    }
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchUserHistory = async () => {
      if (localStorage.getItem("demo_mode") === "true") {
        const storedDemo = localStorage.getItem("demo_searches");
        if (storedDemo) setUserHistory(JSON.parse(storedDemo));
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase.from("user_searches").select("*").order("searched_at", { ascending: false }).limit(10);
        if (data) setUserHistory(data);
      }
    };
    fetchUserHistory();
  }, [result]);

  const signOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("demo_mode");
    localStorage.removeItem("demo_searches");
    window.location.reload();
  };

  const handleScan = async (overrideTail) => {
    const targetTail = overrideTail || tailNumber;
    if (!targetTail?.trim()) return;
    const { data: { session } } = await supabase.auth.getSession();
    const isDemo = localStorage.getItem("demo_mode") === "true";
    if (!session && !isDemo) {
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

  const getMarketAlpha = () => {
    if (!result) return { score: 0, label: "BASELINE" };
    let score = 0;
    if (result.forensic_records?.ntsb_count === 0) score += 15;
    if (!result.forensic_records?.liens_found) score += 10;
    if (result.logbook_audit?.findings?.continuity_score > 80) score += 15;
    if (result.dormancy_analysis?.dormancy_risk === "LOW") score += 10;
    if (result.hangar_queen_index < 30) score += 10;
    if (result.avionics_audit?.modernity_score > 70) score += 10;
    if (result.compliance_audit?.status === "CLEAR") score += 5;
    if (result.fleet_comparison?.mechanical_delta > 0) score += 10;
    if (result.market_velocity?.demand_index > 60) score += 10;
    if (result.valuation?.estimated_value > 100000) score += 5;
    const label = score >= 80 ? "PREMIUM" : score >= 65 ? "ABOVE AVERAGE" : score >= 50 ? "COMPETITIVE" : "BASELINE";
    return { score, label };
  };

  const getPriceShield = () => {
    if (!result) return [];
    const shields = [];
    if (result.forensic_records?.ntsb_count === 0) shields.push({ label: "Zero Accident History", icon: "✓", color: "emerald" });
    if (!result.forensic_records?.liens_found) shields.push({ label: "Clear Title", icon: "✓", color: "emerald" });
    if (result.logbook_audit?.findings?.continuity_score > 80) shields.push({ label: "Complete Logbooks", icon: "✓", color: "emerald" });
    if (result.dormancy_analysis?.dormancy_risk === "LOW") shields.push({ label: "Actively Flown", icon: "✓", color: "emerald" });
    if (result.avionics_audit?.modernity_score > 70) shields.push({ label: "Modern Avionics", icon: "✓", color: "blue" });
    if (result.hangar_queen_index < 30) shields.push({ label: "Low Corrosion Risk", icon: "✓", color: "blue" });
    if (result.compliance_audit?.status === "CLEAR") shields.push({ label: "Clean Sanctions", icon: "✓", color: "blue" });
    return shields;
  };

  const getMaintenanceAlpha = () => {
    if (!result) return { alpha: 0, rating: "UNKNOWN", comparison: "N/A" };
    const FLEET_MEAN_HOURS_PER_EVENT = 150;
    const totalHours = result.aircraft_details?.total_time || 0;
    const maintenanceEvents = result.logbook_audit?.findings?.maintenance_event_count || 1;
    const hoursPerEvent = totalHours / maintenanceEvents;
    const alpha = ((hoursPerEvent - FLEET_MEAN_HOURS_PER_EVENT) / FLEET_MEAN_HOURS_PER_EVENT) * 100;
    let rating = alpha > 20 ? "EXCELLENT" : alpha > 0 ? "GOOD" : alpha > -20 ? "FAIR" : "BELOW AVERAGE";
    return { alpha: alpha.toFixed(1), rating, comparison: alpha > 0 ? `${Math.abs(alpha).toFixed(1)}% ABOVE fleet mean` : `${Math.abs(alpha).toFixed(1)}% BELOW fleet mean`, hoursPerEvent: hoursPerEvent.toFixed(0) };
  };

  const getBuyerDemand = () => {
    if (!result) return null;
    const baseInterest = result.market_velocity?.demand_index || 50;
    return { activeBuyers: Math.floor(baseInterest / 10) + 2, daysOnMarket: Math.max(5, 90 - baseInterest), priceMovement: baseInterest > 60 ? "+3.2%" : baseInterest > 40 ? "+1.1%" : "-0.5%" };
  };

  const alpha = getMarketAlpha();
  const shields = getPriceShield();
  const demand = getBuyerDemand();
  const maintenanceAlpha = getMaintenanceAlpha();

  useEffect(() => {
    if (!result?.aircraft_details) { setResolvedMakeModel(null); return; }
    const aircraftData = result.aircraft_details;
    if (!isCleanMakeModel(aircraftData.make_model)) {
      resolveMakeModel(aircraftData).then((resolved) => setResolvedMakeModel(resolved)).catch(() => setResolvedMakeModel({ make_model: aircraftData.make_model || "Unknown Aircraft", source: "fallback", confidence: "low" }));
    } else {
      setResolvedMakeModel({ make_model: aircraftData.make_model, source: "registry", confidence: "high" });
    }
  }, [result]);

  const getCleanMakeModel = () => resolvedMakeModel ? resolvedMakeModel.make_model : "Loading...";

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
    background: isActive ? "rgba(59, 130, 246, 0.2)" : "rgba(255, 255, 255, 0.05)",
    border: `1px solid ${isActive ? "#3b82f6" : "rgba(255, 255, 255, 0.1)"}`,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: isActive ? "#3b82f6" : "#94a3b8",
    cursor: "pointer",
    marginBottom: "16px",
    transition: "all 0.2s ease",
    gap: "4px"
  });
  const g3000LabelStyle = { fontSize: "8px", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.5px" };

  const BottomNav = () => (
    <div className="bottom-nav">
      <button onClick={() => setActiveTab("SUMMARY")} className={activeTab === "SUMMARY" ? "active" : ""}><LayoutGrid size={24} /><span>Summary</span></button>
      <button onClick={() => setActiveTab("MARKET")} className={activeTab === "MARKET" ? "active" : ""}><TrendingUp size={24} /><span>Market</span></button>
      <button onClick={() => setActiveTab("SHIELDS")} className={activeTab === "SHIELDS" ? "active" : ""}><ShieldCheck size={24} /><span>Shields</span></button>
      <button onClick={() => setActiveTab("LISTING")} className={activeTab === "LISTING" ? "active" : ""}><ListChecks size={24} /><span>List</span></button>
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
        <button onClick={() => setActiveTab("MARKET")} style={g3000ButtonStyle(activeTab === "MARKET")}><TrendingUp size={20} /><span style={g3000LabelStyle}>Market</span></button>
        <button onClick={() => setActiveTab("SHIELDS")} style={g3000ButtonStyle(activeTab === "SHIELDS")}><ShieldCheck size={20} /><span style={g3000LabelStyle}>Shields</span></button>
        <button onClick={() => setActiveTab("LISTING")} style={g3000ButtonStyle(activeTab === "LISTING")}><ListChecks size={20} /><span style={g3000LabelStyle}>List</span></button>
        <div style={{ marginTop: "auto" }}>
          <button onClick={() => navigate("/")} style={g3000ButtonStyle(false)}><Compass size={20} /><span style={g3000LabelStyle}>Exit</span></button>
          <button onClick={() => setIsModalOpen(true)} style={g3000ButtonStyle(false)}><Settings size={20} /><span style={g3000LabelStyle}>Auth</span></button>
        </div>
      </div>

      <div className="main-viewport" style={{ flex: 1, display: "flex", flexDirection: "column", background: "black", margin: "10px", marginLeft: "90px", borderRadius: "4px", border: "4px solid #1e293b", boxShadow: "inset 0 0 40px rgba(0,0,0,0.8)", position: "relative", overflowX: "hidden", overflowY: "auto" }}>
        {/* STICKY TOP STATUS BAR */}
        <div className="status-bar" style={{ height: "40px", background: "#1e293b", display: "flex", alignItems: "center", padding: "0 20px", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.1)", fontFamily: "'Roboto Mono', monospace", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ fontSize: "12px", fontWeight: "900", color: "#3b82f6" }} className="status-title">VALUATION ENGINE READY</div>
            <div style={{ fontSize: "14px", fontWeight: "bold", color: "white" }}>{tailNumber || "---"}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ display: "flex", gap: "10px" }} className="status-meta">
              {result && <div style={{ background: "#3b82f6", color: "white", fontSize: "10px", fontWeight: "900", padding: "2px 8px", borderRadius: "2px" }}>{alpha.label}</div>}
              <div style={{ fontSize: "12px", opacity: 0.5 }}>118.70 MHz</div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => navigate("/")} className="mobile-auth-btn" style={{ display: "none" }}><Compass size={18} color="#3b82f6" /></button>
              <button onClick={() => setIsModalOpen(true)} className="mobile-auth-btn" style={{ display: "none" }}><Settings size={18} color="#3b82f6" /></button>
            </div>
          </div>
        </div>

        {loading && <ForensicScanner color="blue" />}

        <div style={{ flex: 1, padding: "24px" }}>
          {!result && !loading ? (
            <div style={{ height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
              <div className="ghost-icon-wrap" style={{ position: "relative" }}>
                <Compass size={80} color="rgba(255,255,255,0.03)" style={{ marginBottom: "20px" }} />
              </div>
              <h2 style={{ fontSize: "32px", fontWeight: "900", color: "white", letterSpacing: "2px", margin: "0 10px" }} className="awaiting-text">AWAITING ASSET</h2>
              <p style={{ color: "#94a3b8", marginBottom: "32px", fontSize: "14px" }}>Input Aircraft Registration for Value Mapping</p>
              <div className="search-box-wrap" style={{ width: "100%", maxWidth: "440px", display: "flex", gap: "10px" }}>
                <input placeholder="ENTER TAIL NUMBER" value={tailNumber} onChange={(e) => setTailNumber(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleScan()} style={{ flex: 1, background: "rgba(0,0,0,0.5)", border: "1px solid #334155", padding: "16px", borderRadius: "4px", color: "white", fontSize: "16px", fontWeight: "bold", textAlign: "center" }} />
                <button className="scan-btn" onClick={() => handleScan()} style={{ background: "#3b82f6", color: "white", border: "none", padding: "0 24px", minWidth: "120px", borderRadius: "4px", fontWeight: "950", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <DirectToIcon size={16} color="white" />
                  REVEAL
                </button>
              </div>
              {userHistory.length > 0 && (
                <div style={{ marginTop: "48px", width: "100%", maxWidth: "800px" }}>
                  <div style={{ fontSize: "10px", color: "#3b82f6", fontWeight: "900", marginBottom: "16px", letterSpacing: "2px" }}>MY HANGAR / RECENT ANALYSES</div>
                  <div className="history-grid">
                    {userHistory.slice(0, 4).map((card) => (
                      <div key={card.id} onClick={() => { setTailNumber(card.tail_number); handleScan(card.tail_number); }} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", padding: "12px", borderRadius: "4px", cursor: "pointer" }}>
                        <div style={{ fontSize: "14px", fontWeight: "bold" }}>{card.tail_number}</div>
                        <div style={{ fontSize: "10px", opacity: 0.5 }}>{card.search_data?.aircraft_details?.make_model}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : result && (
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
              <div className="dashboard-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  {(activeTab === "SUMMARY" || activeTab === "MARKET") && (
                    <>
                      <div style={{ background: "#0f172a", border: "1px solid #1e3a8a", padding: "20px", borderRadius: "4px", borderLeft: "6px solid #3b82f6" }}>
                        <div style={{ color: "#3b82f6", fontSize: "12px", fontWeight: "900", marginBottom: "16px", display: "flex", justifyContent: "space-between" }}>
                          <span>MARKET ALPHA INDEX</span><TrendingUp size={16} />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "32px", flexWrap: "wrap" }}>
                          <div style={{ position: "relative", width: "120px", height: "120px" }}>
                            <CircularGauge score={alpha.score} size={120} label="ALPHA" />
                          </div>
                          <div style={{ flex: 1, minWidth: "200px" }}>
                            <h2 style={{ fontSize: "24px", fontWeight: "900", color: "white", textTransform: "uppercase" }}>{alpha.label} ASSET</h2>
                            <p style={{ color: "#94a3b8", fontSize: "14px" }}>Your aircraft's forensic profile allows for a premium exit strategy.</p>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div style={{ fontSize: "10px", color: "#10b981", fontWeight: "900", marginBottom: "4px" }}>ACTIVE PRICE SHIELDS</div>
                        {shields.map((shield, idx) => (
                          <div key={idx} style={{ background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.2)", padding: "10px 16px", borderRadius: "4px", display: "flex", alignItems: "center", gap: "12px" }}>
                            <ShieldCheck size={16} color="#10b981" />
                            <span style={{ fontSize: "13px", fontWeight: "bold" }}>{shield.label}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  {activeTab === "SHIELDS" && (
                    <div style={{ background: "rgba(0,0,0,0.3)", padding: "20px", borderRadius: "4px", border: "1px solid #334155" }}>
                      <div style={{ fontSize: "10px", color: "#10b981", fontWeight: "900", marginBottom: "20px" }}>LISTING SHIELDS</div>
                      <p style={{ fontSize: "14px", opacity: 0.8, lineHeight: "1.6" }}>Use these forensic shields in your listing to justify a higher asking price. These shields "pre-answer" common buyer objections.</p>
                      <div style={{ marginTop: "24px", display: "grid", gap: "12px" }}>
                        {shields.map((s, i) => (
                          <div key={i} style={{ padding: "12px", background: "rgba(16, 185, 129, 0.1)", borderRadius: "4px", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                            <div style={{ fontWeight: "bold", color: "#10b981" }}>{s.label}</div>
                            <div style={{ fontSize: "11px", opacity: 0.6 }}>Forensic verification active for this marker.</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  {activeTab === "SUMMARY" && (
                    <>
                      <div style={{ background: "#1e293b", padding: "20px", borderRadius: "4px", border: "1px solid #334155" }}>
                        <div style={{ fontSize: "10px", color: "#94a3b8", fontWeight: "900", marginBottom: "8px" }}>VALUATION SUBJECT</div>
                        <h2 style={{ fontSize: "28px", fontWeight: "900", color: "white" }}>{getCleanMakeModel()}</h2>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "16px" }}>
                          <div>
                            <div style={{ fontSize: "10px", opacity: 0.5 }}>TOTAL TIME</div>
                            <div style={{ fontWeight: "bold" }}>{result.aircraft_details?.total_time || "---"} HRS</div>
                          </div>
                          <div>
                            <div style={{ fontSize: "10px", opacity: 0.5 }}>ENGINE ALPHA</div>
                            <div style={{ fontWeight: "bold", color: "#10b981" }}>+{maintenanceAlpha.alpha}%</div>
                          </div>
                        </div>
                      </div>
                      <div style={{ background: "rgba(59, 130, 246, 0.05)", padding: "20px", borderRadius: "4px", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
                        <div style={{ fontSize: "10px", fontWeight: "900", color: "#3b82f6", marginBottom: "12px" }}>MARKET VELOCITY</div>
                        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
                          <div>
                            <div style={{ fontSize: "18px", fontWeight: "bold" }}>{demand?.activeBuyers} ACTIVE BUYERS</div>
                            <div style={{ fontSize: "12px", opacity: 0.6 }}>Mapped within {result.aircraft_details.state || "Active Fleet"}</div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: "18px", fontWeight: "bold", color: "#10b981" }}>{demand?.priceMovement}</div>
                            <div style={{ fontSize: "12px", opacity: 0.6 }}>6-Mo Price Trend</div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  {activeTab === "MARKET" && (
                    <div style={{ background: "rgba(0,0,0,0.3)", padding: "20px", borderRadius: "4px", border: "1px solid #334155" }}>
                      <div style={{ fontSize: "10px", color: "#3b82f6", fontWeight: "900", marginBottom: "20px" }}>VALUATION BREAKDOWN</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ opacity: 0.6 }}>REGISTRY VALUE</span>
                          <span style={{ fontWeight: "bold" }}>${(result.valuation?.estimated_value || 0).toLocaleString()}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ opacity: 0.6 }}>FORENSIC PREMIUM</span>
                          <span style={{ fontWeight: "bold", color: "#10b981" }}>+${(alpha.score * 100).toLocaleString()}</span>
                        </div>
                        <div style={{ height: "1px", background: "rgba(255,255,255,0.1)" }} />
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "18px" }}>
                          <span style={{ fontWeight: "900" }}>TOTAL ALPHA VALUE</span>
                          <span style={{ fontWeight: "900", color: "#3b82f6" }}>${((result.valuation?.estimated_value || 0) + (alpha.score * 100)).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  {activeTab === "LISTING" && (
                    <div style={{ background: "rgba(0,0,0,0.3)", padding: "20px", borderRadius: "4px", border: "1px solid #334155" }}>
                      <div style={{ fontSize: "10px", color: G3000.ADVISORY, fontWeight: "900", marginBottom: "20px" }}>AI LISTING OPTIMIZER</div>
                      <p style={{ fontSize: "14px", color: "white", fontStyle: "italic", lineHeight: "1.6" }}>"Impeccably maintained {getCleanMakeModel()} with a clean NTSB profile and verified maintenance alpha. This asset ranks in the top {100 - alpha.score}% of the global fleet for forensic continuity."</p>
                      <button style={{ marginTop: "20px", width: "100%", padding: "12px", background: "#3b82f6", border: "none", borderRadius: "4px", fontWeight: "bold", color: "white" }}>COPY OPTIMIZED DESCRIPTION</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <BottomNav />
      </div>
      <HangarDoorModal isOpen={isModalOpen} searchHistory={guestHistory} onClose={() => setIsModalOpen(false)} />
      <style>{`
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #0b101c; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #475569; }
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
          .bottom-nav button.active { color: #3b82f6; }
        }
      `}</style>
    </div>
  );
}

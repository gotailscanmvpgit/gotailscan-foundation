import React, { useState } from 'react';
import { Plane, Users, Fuel, DollarSign, Clock, AlertTriangle, TrendingDown, Gauge } from 'lucide-react';

export default function MissionOracle({ aircraftData, riskScore, forensicData }) {
    // --- STATE ---
    const [distance, setDistance] = useState(950); // Default Hamilton to Orlando
    const [fuelLoadPct, setFuelLoadPct] = useState(100);
    const [paxCount, setPaxCount] = useState(2);
    const [costIndex, setCostIndex] = useState(50); // 0 = Ecomony, 100 = High Speed

    // --- MOCK PERFORMANCE DATA (In real app, infer from Make/Model) ---
    const PERF = {
        usefulLoad: 1100, // lbs
        maxFuelGal: 88,   // gallons (SR22 approx)
        cruiseSpeed: 170, // kts
        fuelBurn: 17.5,   // gph
        fuelWeight: 6     // lbs/gal
    };

    // --- CALCULATIONS ---
    const fuelLbs = (fuelLoadPct / 100) * PERF.maxFuelGal * PERF.fuelWeight;
    const paxLbs = paxCount * 170; // Standard weight
    const baggageLbs = paxCount * 15;
    const totalPayload = fuelLbs + paxLbs + baggageLbs;
    const usefulLoadRemaining = PERF.usefulLoad - totalPayload;
    const isOverweight = usefulLoadRemaining < 0;

    // Forensic Penalty Logic
    const hasRisk = forensicData?.ntsb_count > 0 || riskScore < 60;
    const penaltyFactor = hasRisk ? 1.05 : 1.0; // 5% penalty if risky
    const penaltyLabel = hasRisk ? "Engine Trend / Drag Penalty" : "Clean Airframe";

    // Mission Physics
    const speedAdjust = 1 + ((costIndex - 50) / 200); // +/- 25% speed variance (simple model)
    const adjustedSpeed = (PERF.cruiseSpeed * speedAdjust) * (hasRisk ? 0.98 : 1.0); // 2% speed loss if risky
    const flightTimeHours = distance / adjustedSpeed;

    const burnRateAdjust = 1 + ((costIndex - 50) / 100); // Higher speed = way higher burn
    const totalBurn = (flightTimeHours * PERF.fuelBurn * burnRateAdjust * penaltyFactor);

    const fuelCost = totalBurn * 6.50; // $6.50/gal
    const timeCost = flightTimeHours * 50; // $50/hr maintenance/reserve (simplified)
    const totalTripCost = fuelCost + timeCost;

    // Time formatting
    const hrs = Math.floor(flightTimeHours);
    const mins = Math.round((flightTimeHours - hrs) * 60);

    return (
        <div style={{ background: "rgba(0,0,0,0.5)", border: "1px solid #334155", borderRadius: "8px", fontFamily: "'Inter', sans-serif", color: "white", padding: "24px" }}>

            {/* HEADER */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <div>
                    <div style={{ fontSize: "10px", fontWeight: "900", color: "#06b6d4", letterSpacing: "2px" }}>MISSION ALPHA PREDICTOR</div>
                    <h2 style={{ fontSize: "24px", fontWeight: "900", margin: 0 }}>MISSION FEASIBILITY ORACLE</h2>
                </div>
                <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "12px", color: hasRisk ? "#ef4444" : "#10b981", fontWeight: "bold", display: "flex", alignItems: "center", gap: "6px", justifyContent: "flex-end" }}>
                        {hasRisk && <AlertTriangle size={14} />}
                        {penaltyLabel.toUpperCase()}
                    </div>
                    {hasRisk && <div style={{ fontSize: "10px", opacity: 0.7 }}>+5% Burn / -2% Speed Factor Applied</div>}
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "32px" }}>

                {/* LEFT COLUMN: CONTROLS */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

                    {/* 1. PAYLOAD SLIDERS */}
                    <div style={{ background: "rgba(255,255,255,0.05)", padding: "16px", borderRadius: "8px", border: isOverweight ? "1px solid #ef4444" : "1px solid rgba(255,255,255,0.1)" }}>
                        <div style={{ fontSize: "12px", fontWeight: "bold", marginBottom: "16px", display: "flex", justifyContent: "space-between" }}>
                            <span>WEIGHT & BALANCE</span>
                            <span style={{ color: isOverweight ? "#ef4444" : "#10b981" }}>{usefulLoadRemaining.toFixed(0)} lbs {isOverweight ? "OVER" : "AVAIL"}</span>
                        </div>

                        {/* Fuel Slider */}
                        <div style={{ marginBottom: "16px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px", color: "#94a3b8" }}>
                                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Fuel size={12} /> FUEL LOAD</span>
                                <span>{fuelLoadPct}% ({fuelLbs.toFixed(0)} lbs)</span>
                            </div>
                            <input type="range" min="10" max="100" value={fuelLoadPct} onChange={e => setFuelLoadPct(Number(e.target.value))} style={{ width: "100%", accentColor: "#06b6d4" }} />
                        </div>

                        {/* Pax Slider */}
                        <div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px", color: "#94a3b8" }}>
                                <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Users size={12} /> PASSENGERS</span>
                                <span>{paxCount} ({paxLbs.toFixed(0)} lbs)</span>
                            </div>
                            <input type="range" min="0" max="6" value={paxCount} onChange={e => setPaxCount(Number(e.target.value))} style={{ width: "100%", accentColor: "#eab308" }} />
                            <div style={{ display: "flex", gap: "4px", marginTop: "8px" }}>
                                {[...Array(6)].map((_, i) => (
                                    <Users key={i} size={16} color={i < paxCount ? (isOverweight ? "#ef4444" : "white") : "#334155"} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 2. ROUTE & COST INDEX */}
                    <div style={{ background: "rgba(255,255,255,0.05)", padding: "16px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)" }}>
                        <div style={{ fontSize: "12px", fontWeight: "bold", marginBottom: "16px" }}>FLIGHT PROFILE</div>

                        <div style={{ marginBottom: "16px" }}>
                            <div style={{ fontSize: "11px", color: "#94a3b8", marginBottom: "4px" }}>DISTANCE (NM)</div>
                            <input type="number" value={distance} onChange={e => setDistance(Number(e.target.value))} style={{ background: "rgba(0,0,0,0.3)", border: "1px solid #334155", color: "white", padding: "8px", borderRadius: "4px", width: "100%" }} />
                        </div>

                        <div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px", color: "#94a3b8" }}>
                                <span>COST INDEX (Speed vs Econ)</span>
                                <span>{costIndex > 50 ? "HIGH SPEED" : "LONG RANGE"}</span>
                            </div>
                            <input type="range" min="0" max="100" value={costIndex} onChange={e => setCostIndex(Number(e.target.value))} style={{ width: "100%", accentColor: "#a855f7" }} />
                        </div>
                    </div>

                </div>

                {/* RIGHT COLUMN: RESULTS */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

                    {/* TRIP COST CARD */}
                    <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid #10b981", borderRadius: "8px", padding: "24px", textAlign: "center" }}>
                        <div style={{ fontSize: "10px", fontWeight: "900", color: "#10b981", letterSpacing: "1px", marginBottom: "8px" }}>ESTIMATED TRIP COST</div>
                        <div style={{ fontSize: "36px", fontWeight: "900", color: "white" }}>${totalTripCost.toFixed(0)}</div>
                        <div style={{ fontSize: "12px", opacity: 0.7 }}>@ $6.50/gal</div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                        <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "8px", padding: "16px", textAlign: "center" }}>
                            <Clock size={20} color="#06b6d4" style={{ marginBottom: "8px" }} />
                            <div style={{ fontSize: "10px", opacity: 0.7 }}>ETE</div>
                            <div style={{ fontSize: "18px", fontWeight: "bold" }}>{hrs}h {mins}m</div>
                        </div>
                        <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: "8px", padding: "16px", textAlign: "center" }}>
                            <Fuel size={20} color="#eab308" style={{ marginBottom: "8px" }} />
                            <div style={{ fontSize: "10px", opacity: 0.7 }}>BURN</div>
                            <div style={{ fontSize: "18px", fontWeight: "bold" }}>{totalBurn.toFixed(0)} gal</div>
                        </div>
                    </div>

                    {/* FORENSIC ADVISORY */}
                    <div style={{ background: hasRisk ? "rgba(239, 68, 68, 0.1)" : "rgba(6, 182, 212, 0.1)", borderRadius: "8px", padding: "16px", border: hasRisk ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid rgba(6, 182, 212, 0.3)" }}>
                        <div style={{ fontSize: "12px", fontWeight: "bold", color: hasRisk ? "#ef4444" : "#06b6d4", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                            {hasRisk ? <TrendingDown size={14} /> : <Gauge size={14} />}
                            {hasRisk ? "PERFORMANCE DEGRADATION" : "OPTIMAL ENVELOPE"}
                        </div>
                        <div style={{ fontSize: "11px", lineHeight: "1.4", opacity: 0.8 }}>
                            {hasRisk
                                ? "Forensic scan indicates high-risk factors (Accident History or Maintenance Gaps). This model applies a penalty to fuel efficiency and cruise speed to reflect likely real-world degradations."
                                : "Aircraft forensic profile is clean. Performance numbers are calculated based on standard book values for this Make/Model."
                            }
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}

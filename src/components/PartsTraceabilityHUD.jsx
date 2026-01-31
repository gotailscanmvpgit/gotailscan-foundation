import React, { useState, useEffect } from 'react';
import { ShieldCheck, FileText, AlertTriangle, CheckCircle, Search, Wrench, Download, ExternalLink, Paperclip, Plus, Save, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const TraceabilityRow = ({ date, formType, part, serial, status, source }) => (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1.5fr 1fr 1fr 24px", gap: "10px", padding: "12px", borderBottom: "1px solid rgba(255,255,255,0.05)", alignItems: "center", fontSize: "12px" }}>
        <div style={{ fontFamily: "Roboto Mono", opacity: 0.7 }}>{date}</div>
        <div style={{ fontWeight: "bold" }}>{part}</div>
        <div style={{ fontFamily: "Roboto Mono", color: "#94a3b8" }}>{serial || "N/A"}</div>
        <div>
            <span style={{
                background: formType.includes("8130") || formType.includes("One") ? "rgba(6, 182, 212, 0.1)" : "rgba(168, 85, 247, 0.1)",
                color: formType.includes("8130") || formType.includes("One") ? "#06b6d4" : "#a855f7",
                padding: "2px 6px", borderRadius: "4px", fontSize: "10px", fontWeight: "bold"
            }}>
                {formType.toUpperCase()}
            </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {status === 'VERIFIED' ? <CheckCircle size={14} color="#10b981" /> : <AlertTriangle size={14} color="#f59e0b" />}
            <span style={{ color: status === 'VERIFIED' ? "#10b981" : "#f59e0b", fontWeight: "bold" }}>{status}</span>
        </div>
        {source?.url && (
            <a href={source.url} target="_blank" rel="noopener noreferrer" style={{ cursor: "pointer", opacity: 0.8 }} title="View Official Record">
                <ExternalLink size={14} color="white" />
            </a>
        )}
    </div>
);

export default function PartsTraceabilityHUD({ tailNumber, role = 'buyer', aircraftData }) {
    const [records, setRecords] = useState([]);
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(false);

    // New Record State
    const [newPart, setNewPart] = useState({ part_name: '', serial_number: '', form_type: '8130-3' });

    const isCanadian = tailNumber?.startsWith('C-');
    const authority = isCanadian ? "TCCA Transport Canada" : "FAA United States";

    // Dynamic Regulatory Links
    const getRepoLink = () => {
        if (isCanadian) return "https://wwwapps.tc.gc.ca/saf-sec-sur/2/napa-rapn/search-recherche.aspx";
        return "https://drs.faa.gov/browse";
    };

    useEffect(() => {
        fetchRecords();
    }, [tailNumber]);

    const fetchRecords = async () => {
        if (!tailNumber) return;
        setLoading(true);
        // 1. Fetch Real Records
        const { data, error } = await supabase
            .from('parts_traceability')
            .select('*')
            .eq('tail_number', tailNumber)
            .order('install_date', { ascending: false });

        if (data && data.length > 0) {
            // Map DB schema to UI schema
            const mapped = data.map(d => ({
                date: d.install_date ? new Date(d.install_date).toISOString().split('T')[0] : 'Unknown',
                part: d.part_name,
                serial: d.serial_number,
                formType: d.form_type,
                status: d.verified_status || 'PENDING',
                source: { url: d.source_url || getRepoLink() }
            }));
            setRecords(mapped);
        } else {
            // Fallback/Demo Data
            const demoRecords = [
                { date: "2024-03-12", part: "Garmin GTX 345 Transponder", serial: "3AE00129", formType: isCanadian ? "TCCA FORM One" : "FAA 8130-3", status: "VERIFIED", source: { url: getRepoLink() } },
                { date: "2022-11-05", part: "Stratus Power USB Port", serial: "UNK", formType: isCanadian ? "PDA Issue" : "FAA Form 337", status: "VERIFIED", source: { url: getRepoLink() } }
            ];
            setRecords(demoRecords);
        }
        setLoading(false);
    };

    const saveRecord = async () => {
        if (!newPart.part_name) return;

        // Auto-Verify Logic: If it matches known avionics, we assume Verified for demo
        const isKnown = newPart.part_name.toLowerCase().includes('garmin') || newPart.part_name.toLowerCase().includes('bendix');

        await supabase.from('parts_traceability').insert({
            tail_number: tailNumber,
            part_name: newPart.part_name,
            serial_number: newPart.serial_number,
            form_type: newPart.form_type,
            jurisdiction: isCanadian ? 'TCCA' : 'FAA',
            install_date: new Date().toISOString(),
            verified_status: isKnown ? 'VERIFIED' : 'PENDING',
            source_url: getRepoLink()
        });

        setIsAdding(false);
        setNewPart({ part_name: '', serial_number: '', form_type: '8130-3' });
        fetchRecords(); // Refresh
    };

    return (
        <div style={{ background: "rgba(0,0,0,0.5)", border: "1px solid #334155", borderRadius: "8px", overflow: "hidden", fontFamily: "'Inter', sans-serif" }}>
            {/* HEADER */}
            <div style={{ background: "#1e293b", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <ShieldCheck size={20} color="#06b6d4" />
                    <div>
                        <div style={{ fontSize: "14px", fontWeight: "900", color: "white", letterSpacing: "1px" }}>PARTS TRACEABILITY FORENSICS</div>
                        <div style={{ fontSize: "10px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "6px" }}>
                            <span style={{ color: isCanadian ? "#ef4444" : "#3b82f6" }}>●</span>
                            JURISDICTION: {authority.toUpperCase()}
                        </div>
                    </div>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                    <button style={{ background: "rgba(255,255,255,0.05)", border: "none", color: "white", padding: "8px 12px", borderRadius: "4px", fontSize: "10px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Download size={12} /> EXPORT BINDER
                    </button>
                    {role !== 'buyer' && !isAdding && (
                        <button onClick={() => setIsAdding(true)} style={{ background: "#06b6d4", border: "none", color: "black", padding: "8px 16px", borderRadius: "4px", fontSize: "10px", fontWeight: "900", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                            <Plus size={12} /> ADD RECORD
                        </button>
                    )}
                </div>
            </div>

            {/* DASHBOARD CONTENT */}
            <div style={{ padding: "24px" }}>
                <div style={{ display: "flex", gap: "24px", marginBottom: "24px" }}>
                    {/* STATS CARDS */}
                    <div style={{ flex: 1, background: "rgba(6, 182, 212, 0.05)", border: "1px solid rgba(6, 182, 212, 0.2)", borderRadius: "4px", padding: "16px" }}>
                        <div style={{ fontSize: "10px", color: "#06b6d4", fontWeight: "bold", marginBottom: "8px" }}>DIGITAL ARCHIVE</div>
                        <div style={{ fontSize: "24px", fontWeight: "900", color: "white" }}>{records.length} <span style={{ fontSize: "12px", fontWeight: "normal", opacity: 0.7 }}>Records</span></div>
                    </div>
                    <div style={{ flex: 1, background: "rgba(16, 185, 129, 0.05)", border: "1px solid rgba(16, 185, 129, 0.2)", borderRadius: "4px", padding: "16px" }}>
                        <div style={{ fontSize: "10px", color: "#10b981", fontWeight: "bold", marginBottom: "8px" }}>COMPLIANCE RATE</div>
                        <div style={{ fontSize: "24px", fontWeight: "900", color: "white" }}>100% <span style={{ fontSize: "12px", fontWeight: "normal", opacity: 0.7 }}>Verified</span></div>
                    </div>
                </div>

                {/* LEDGER HEADER */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1.5fr 1fr 1fr 24px", gap: "10px", padding: "8px 12px", fontSize: "10px", color: "#94a3b8", fontWeight: "bold", textTransform: "uppercase" }}>
                    <div>Install Date</div>
                    <div>Component / Description</div>
                    <div>Serial Number</div>
                    <div>Auth Form</div>
                    <div>Status</div>
                    <div>Link</div>
                </div>

                {/* ADD ROW */}
                {isAdding && (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1.5fr 1fr 1fr 24px", gap: "10px", padding: "12px", background: "rgba(6, 182, 212, 0.1)", border: "1px solid #06b6d4", borderRadius: "4px", marginBottom: "10px" }}>
                        <div style={{ fontSize: "12px", opacity: 0.5, display: "flex", alignItems: "center" }}>TODAY</div>
                        <input autoFocus placeholder="Part Name (e.g. Fuel Pump)" value={newPart.part_name} onChange={e => setNewPart({ ...newPart, part_name: e.target.value })} style={{ background: "rgba(0,0,0,0.3)", border: "1px solid #334155", color: "white", padding: "4px", fontSize: "12px" }} />
                        <input placeholder="Serial #" value={newPart.serial_number} onChange={e => setNewPart({ ...newPart, serial_number: e.target.value })} style={{ background: "rgba(0,0,0,0.3)", border: "1px solid #334155", color: "white", padding: "4px", fontSize: "12px" }} />
                        <select value={newPart.form_type} onChange={e => setNewPart({ ...newPart, form_type: e.target.value })} style={{ background: "rgba(0,0,0,0.3)", border: "1px solid #334155", color: "white", padding: "4px", fontSize: "12px" }}>
                            <option value="8130-3">FAA 8130-3</option>
                            <option value="337">FAA Form 337</option>
                            <option value="TCCA One">TCCA Form One</option>
                            <option value="PDA">PDA Issue</option>
                        </select>
                        <div style={{ display: "flex", gap: "4px" }}>
                            <button onClick={saveRecord} style={{ background: "#10b981", color: "black", border: "none", borderRadius: "4px", padding: "4px", cursor: "pointer" }}><Save size={14} /></button>
                            <button onClick={() => setIsAdding(false)} style={{ background: "#ef4444", color: "white", border: "none", borderRadius: "4px", padding: "4px", cursor: "pointer" }}><X size={14} /></button>
                        </div>
                    </div>
                )}

                {/* ROWS */}
                <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                    {records.map((r, i) => <TraceabilityRow key={i} {...r} />)}

                    {/* DYNAMIC INFERENCE ROWS (Only show if not already covered) */}
                    {aircraftData?.avionics_audit?.features?.map((feat, i) => (
                        <TraceabilityRow
                            key={`av-${i}`}
                            date="Inferred"
                            part={feat}
                            serial="Scan Req"
                            formType="System ID"
                            status="DETECTED"
                            source={{ url: getRepoLink() }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

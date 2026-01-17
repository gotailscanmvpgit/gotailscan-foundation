
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image, Svg, Path, Circle } from '@react-pdf/renderer';
import { createTw } from 'react-pdf-tailwind';

// Setup Tailwind
const tw = createTw({
    theme: {
        extend: {
            colors: {
                accent: '#FF5F1F', // Safety Orange
                dark: '#050505',
                card: '#121212',
                gray: '#71717a',
                success: '#22c55e',
                fail: '#ef4444',
                warn: '#eab308'
            }
        }
    }
});

// --- COMPONENTS ---

const Header = ({ id, tail }) => (
    <View style={tw('flex flex-row justify-between items-center border-b border-gray-100 pb-6 mb-8')}>
        <View>
            <View style={tw('flex flex-row items-center gap-2')}>
                <Text style={tw('text-2xl font-black text-black tracking-tighter')}>GO<Text style={tw('text-accent')}>TAIL</Text>SCAN</Text>
            </View>
            <Text style={tw('text-[7px] text-gray-400 tracking-[4px] uppercase mt-1')}>Forensic Intelligence Unit // Classified Report</Text>
        </View>
        <View style={tw('items-end')}>
            <Text style={tw('text-[8px] text-gray-400 uppercase font-bold')}>Tracking ID</Text>
            <Text style={tw('text-[10px] font-bold text-black')}>{id}</Text>
            <Text style={tw('text-[8px] text-accent uppercase font-bold mt-1')}>Asset Verified: {tail}</Text>
        </View>
    </View>
);

const Footer = ({ page, total }) => (
    <View style={tw('absolute bottom-8 left-12 right-12 flex flex-row justify-between border-t border-gray-100 pt-4')}>
        <View>
            <Text style={tw('text-[7px] text-gray-400')}>GOTAILSCAN FORENSIC AUDIT © 2024</Text>
            <Text style={tw('text-[6px] text-gray-300')}>The data contained herein is compiled from federal registries and ADS-B feeds. Not for legal use.</Text>
        </View>
        <Text style={tw('text-[8px] text-gray-400 font-bold')}>Page {page} of {total}</Text>
    </View>
);

const SectionTitle = ({ title, subtitle }) => (
    <View style={tw('mb-4 mt-2')}>
        <View style={tw('flex flex-row items-center gap-2 mb-1')}>
            <View style={tw('w-1.5 h-1.5 bg-accent rounded-full')} />
            <Text style={tw('text-[10px] font-black uppercase text-black tracking-widest')}>{title}</Text>
        </View>
        {subtitle && <Text style={tw('text-[7px] text-gray-400 ml-3.5 uppercase tracking-wider')}>{subtitle}</Text>}
    </View>
);

const AuditCard = ({ status, reason, pts, detail }) => {
    const color = status === 'positive' ? 'success' : status === 'negative' ? 'fail' : 'warn';
    return (
        <View style={tw('flex flex-row border border-gray-100 rounded-sm mb-2 p-3 items-center')}>
            <View style={tw(`w-1 h-8 bg-${color} mr-4`)} />
            <View style={tw('flex-1')}>
                <Text style={tw('text-[9px] font-bold text-black uppercase mb-0.5')}>{reason}</Text>
                {detail && <Text style={tw('text-[7px] text-gray-400 italic')}>{detail}</Text>}
            </View>
            <View style={tw(`bg-${color} bg-opacity-10 px-2 py-1 rounded`)}>
                <Text style={tw(`text-[8px] font-bold text-${color}`)}>{pts}</Text>
            </View>
        </View>
    );
};

// --- PAGES ---

const PageOne = ({ data }) => {
    const scoreColor = data.confidence_score >= 85 ? '#22c55e' : data.confidence_score >= 70 ? '#eab308' : '#ef4444';

    return (
        <Page size="A4" style={tw('p-12 bg-white relative')}>
            <Header id={`X-RAY-${data.tail_number}-${Date.now().toString().slice(-6)}`} tail={data.tail_number} />

            {/* CONFIDENCE OVERVIEW */}
            <View style={tw('flex flex-row gap-8 mb-10 items-center')}>
                <View style={tw('w-1/3 items-center')}>
                    <View style={{ ...tw('w-32 h-32 rounded-full border-[10px] flex items-center justify-center'), borderColor: scoreColor + '20' }}>
                        <Text style={{ ...tw('text-4xl font-black'), color: scoreColor }}>{data.confidence_score}</Text>
                        <Text style={tw('text-[8px] font-bold text-gray-400 uppercase')}>Trust Score</Text>
                    </View>
                </View>
                <View style={tw('w-2/3')}>
                    <Text style={tw('text-[8px] text-gray-400 uppercase tracking-widest mb-1')}>System Verdict</Text>
                    <Text style={{ ...tw('text-3xl font-black mb-3'), color: scoreColor }}>
                        {data.confidence_score >= 85 ? 'INVESTOR GRADE' : data.confidence_score >= 70 ? 'STANDARD AUDIT' : 'CRITICAL RED FLAG'}
                    </Text>
                    <Text style={tw('text-[10px] text-gray-500 leading-relaxed font-medium')}>
                        Automated forensic audit of registration {data.tail_number} completed. Registry analysis indicates {data.confidence_score >= 85 ? 'minimal safety or technical friction' : 'significant historical anomalies'}. See technical breakdown on Page 2 for specific risk mitigations.
                    </Text>
                </View>
            </View>

            {/* AIRCRAFT IDENTITY BOARD */}
            <SectionTitle title="Asset Identification" subtitle="Registry verified identity & ownership" />
            <View style={tw('bg-gray-50 p-6 rounded-lg mb-8')}>
                <View style={tw('flex flex-row mb-6')}>
                    <View style={tw('flex-1')}>
                        <Text style={tw('text-[7px] uppercase font-bold text-gray-400 mb-1')}>Make / Model</Text>
                        <Text style={tw('text-sm font-bold text-black')}>{data.aircraft_details?.year} {data.aircraft_details?.make_model}</Text>
                    </View>
                    <View style={tw('flex-1')}>
                        <Text style={tw('text-[7px] uppercase font-bold text-gray-400 mb-1')}>Serial Number</Text>
                        <Text style={tw('text-sm font-bold text-black')}>{data.aircraft_details?.serial || 'UNKNOWN'}</Text>
                    </View>
                </View>
                <View style={tw('flex flex-row')}>
                    <View style={tw('flex-1')}>
                        <Text style={tw('text-[7px] uppercase font-bold text-gray-400 mb-1')}>Registered Owner</Text>
                        <Text style={tw('text-[11px] font-medium text-black')}>{data.aircraft_details?.owner || 'PRIVATE OWNER'}</Text>
                    </View>
                    <View style={tw('w-32')}>
                        <Text style={tw('text-[7px] uppercase font-bold text-gray-400 mb-1')}>Base Port</Text>
                        <Text style={tw('text-[11px] font-medium text-black')}>{data.aircraft_details?.city}, {data.aircraft_details?.state}</Text>
                    </View>
                </View>
            </View>

            {/* HISTORICAL AUDIT TRAIL */}
            <SectionTitle title="Historical Audit Trail" subtitle="Federal findings & registry friction" />
            <View style={tw('space-y-2')}>
                {(data.audit_results || []).map((r, i) => (
                    <AuditCard key={i} status={r.status} reason={r.reason} pts={r.points} detail={r.significance} />
                ))}
            </View>

            <Footer page={1} total={3} />
        </Page>
    );
}

const PageTwo = ({ data }) => (
    <Page size="A4" style={tw('p-12 bg-white relative')}>
        <Header id="INTEL-AI" tail={data.tail_number} />

        {/* AI BRAIN SECTION - THE "WOW" FEATURE */}
        <View style={tw('bg-black p-10 rounded-xl mb-8 relative')}>
            <View style={tw('flex flex-row items-center gap-4 mb-6')}>
                <View style={tw('w-12 h-12 bg-accent bg-opacity-20 rounded-lg items-center justify-center border border-accent border-opacity-30')}>
                    <Text style={tw('text-2xl')}>🧠</Text>
                </View>
                <View>
                    <Text style={tw('text-[8px] text-accent font-black tracking-widest uppercase')}>Forensic Intelligence Analyst v2.0</Text>
                    <Text style={tw('text-lg font-bold text-white uppercase mt-0.5')}>Active Risk Profiling Verdict</Text>
                </View>
                <View style={tw('flex-1 items-end')}>
                    <View style={tw('bg-accent px-3 py-1 rounded')}>
                        <Text style={tw('text-[8px] font-black text-white uppercase tracking-widest')}>{data.ai_intelligence?.risk_profile}</Text>
                    </View>
                </View>
            </View>

            <View style={tw('border-l-4 border-accent pl-6 py-2')}>
                <Text style={tw('text-xl font-black text-white uppercase mb-3 tracking-tight')}>
                    Verdict: {data.ai_intelligence?.audit_verdict}
                </Text>
                <Text style={tw('text-xs text-gray-300 leading-relaxed italic font-medium')}>
                    "{data.ai_intelligence?.technical_advisory}"
                </Text>
            </View>
        </View>

        {/* MARKET & UTILIZATION BOARD */}
        <View style={tw('flex flex-row gap-6 mb-8')}>
            <View style={tw('flex-1 bg-gray-50 rounded-lg p-6 border border-gray-100')}>
                <SectionTitle title="Market Intelligence" subtitle="Estimated asset liquidity" />
                <View style={tw('mt-2')}>
                    <Text style={tw('text-[7px] text-gray-400 uppercase font-bold mb-1')}>Current Market Est.</Text>
                    <Text style={tw('text-3xl font-black text-black')}>${data.valuation?.estimated_value?.toLocaleString()}</Text>
                    <View style={tw('flex flex-row justify-between mt-4')}>
                        <Text style={tw('text-[8px] font-bold text-accent')}>{data.valuation?.market_trend} TREND</Text>
                        <Text style={tw('text-[8px] text-gray-400')}>Confidence: {data.valuation?.confidence_interval}</Text>
                    </View>
                </View>
            </View>
            <View style={tw('w-1/3 bg-gray-50 rounded-lg p-6 border border-gray-100')}>
                <SectionTitle title="Dormancy Index" />
                <View style={tw('mt-2 items-center')}>
                    <Text style={tw('text-[24px] font-black text-black')}>{data.flight_data?.total_hours_12m || 0}</Text>
                    <Text style={tw('text-[8px] font-bold text-gray-400 uppercase')}>Tracked Hours (12m)</Text>
                    <View style={tw('mt-4 h-1 w-full bg-gray-200 rounded-full')}>
                        <View style={{ ...tw('h-full bg-accent rounded-full'), width: `${Math.min((data.flight_data?.total_hours_12m || 0) / 3, 100)}%` }} />
                    </View>
                    <Text style={tw('text-[6px] text-gray-400 mt-2')}>Fleet Average: 150 Hrs</Text>
                </View>
            </View>
        </View>

        {/* LIEN & TITLE BOARD */}
        <SectionTitle title="Financial Exposure Audit" subtitle="Lien & Title Encumbrance Status" />
        <View style={tw(`p-6 rounded-lg flex flex-row items-center border ${data.forensic_records?.liens_found ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`)}>
            <View style={tw(`w-10 h-10 rounded-full items-center justify-center mr-6 ${data.forensic_records?.liens_found ? 'bg-red-200' : 'bg-green-200'}`)}>
                <Text style={tw(`font-bold text-lg ${data.forensic_records?.liens_found ? 'text-red-700' : 'text-green-700'}`)}>
                    {data.forensic_records?.liens_found ? '!' : '✓'}
                </Text>
            </View>
            <View>
                <Text style={tw(`text-sm font-black uppercase ${data.forensic_records?.liens_found ? 'text-red-700' : 'text-green-700'}`)}>
                    {data.forensic_records?.liens_found ? 'ACTIVE LIENS DETECTED' : 'CLEAR TITLE VERIFIED'}
                </Text>
                <Text style={tw(`text-[8px] mt-1 ${data.forensic_records?.liens_found ? 'text-red-600' : 'text-green-600'}`)}>
                    {data.forensic_records?.liens_found
                        ? 'System detected active financial filings. Legal Title Search (8050-3) required for closing.'
                        : 'No active encumbrances detected across monitored financial registry nodes.'}
                </Text>
            </View>
        </View>

        <Footer page={2} total={3} />
    </Page>
);

const PageThree = ({ data }) => (
    <Page size="A4" style={tw('p-12 bg-white relative')}>
        <Header id="FED-RECORDS" tail={data.tail_number} />

        <SectionTitle title="Technical Forensic Vault" subtitle="Government database record audit" />

        {/* RECORDS BOARD */}
        <View style={tw('flex flex-row bg-gray-100 p-2 mb-2 font-bold')}>
            <Text style={tw('text-[7px] uppercase text-gray-500 flex-1')}>Record ID</Text>
            <Text style={tw('text-[7px] uppercase text-gray-500 w-24 text-center')}>Type</Text>
            <Text style={tw('text-[7px] uppercase text-gray-500 w-24 text-right')}>Date</Text>
        </View>

        {/* NTSB Records */}
        {(data.source_data?.ntsb || []).map((r, i) => (
            <View key={`ntsb-${i}`} style={tw('flex flex-row border-b border-gray-50 p-2')}>
                <Text style={tw('text-[8px] font-bold text-black flex-1')}>{r.id || `NTSB-EVENT-${i}`}</Text>
                <Text style={tw('text-[8px] text-red-600 font-bold w-24 text-center')}>ACCIDENT</Text>
                <Text style={tw('text-[8px] text-gray-400 w-24 text-right')}>{r.date}</Text>
            </View>
        ))}

        {/* CADORS Records */}
        {(data.source_data?.cadors || []).map((r, i) => (
            <View key={`cadors-${i}`} style={tw('flex flex-row border-b border-gray-50 p-2')}>
                <Text style={tw('text-[8px] font-bold text-black flex-1')}>{r.id || `CADORS-S-${i}`}</Text>
                <Text style={tw('text-[8px] text-orange-600 font-bold w-24 text-center')}>INCIDENT (CA)</Text>
                <Text style={tw('text-[8px] text-gray-400 w-24 text-right')}>{r.date}</Text>
            </View>
        ))}

        {/* SDR Records */}
        {(data.source_data?.sdr || []).slice(0, 15).map((r, i) => (
            <View key={`sdr-${i}`} style={tw('flex flex-row border-b border-gray-50 p-2')}>
                <Text style={tw('text-[8px] font-bold text-black flex-1')}>{r.id || `SDR-MAINT-${i}`}</Text>
                <Text style={tw('text-[8px] text-gray-500 w-24 text-center')}>MAINTENANCE</Text>
                <Text style={tw('text-[8px] text-gray-400 w-24 text-right')}>{r.date}</Text>
            </View>
        ))}

        {/* LEGEND/DISCLAIMER */}
        <View style={tw('mt-auto p-6 bg-gray-50 rounded border border-gray-100')}>
            <Text style={tw('text-[8px] font-black text-black uppercase mb-1')}>Legal Disclosure</Text>
            <Text style={tw('text-[7px] text-gray-400 leading-relaxed font-medium')}>
                This report is an automated intelligence summary. It is not an official government transcript. Records are matched by Registration (N-Number/C-Mark) and serial block. GOTAILSCAN does not guarantee the 100% accuracy of third-party government feeds. Always verify with a certified A&P mechanic and professional Title Search broker.
            </Text>
        </View>

        <Footer page={3} total={3} />
    </Page>
);

const DiligenceReportDocument = ({ data }) => (
    <Document>
        <PageOne data={data} />
        <PageTwo data={data} />
        <PageThree data={data} />
    </Document>
);

export default DiligenceReportDocument;

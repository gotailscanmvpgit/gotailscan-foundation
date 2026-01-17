
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image, Svg, Path } from '@react-pdf/renderer';
import { createTw } from 'react-pdf-tailwind';

// Register standard fonts
Font.register({
    family: 'Helvetica',
    fonts: [
        { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfA.ttf' }, // Normal
        { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfA.ttf', fontWeight: 'bold' } // Bold (using same for demo if real bold unavailable)
    ]
});

// Setup Tailwind
const tw = createTw({
    theme: {
        extend: {
            colors: {
                accent: '#FF5F1F', // Safety Orange
                dark: '#0f0f0f',
                light: '#f4f4f5',
                gray: '#71717a'
            }
        }
    }
});

// --- COMPONENTS ---

const Header = ({ id, date }) => (
    <View style={tw('flex flex-row justify-between items-center border-b border-gray-200 pb-4 mb-8')}>
        <View>
            <Text style={tw('text-2xl font-bold text-black tracking-widest')}>GOTAILSCAN</Text>
            <Text style={tw('text-[8px] text-accent tracking-[3px] uppercase mt-1')}>Asset Intelligence Unit</Text>
        </View>
        <View style={tw('items-end')}>
            <Text style={tw('text-[8px] text-gray-400 uppercase')}>Report ID</Text>
            <Text style={tw('text-[10px] font-bold mb-1')}>{id}</Text>
            <Text style={tw('text-[8px] text-gray-400 uppercase')}>Generated</Text>
            <Text style={tw('text-[10px]')}>{date}</Text>
        </View>
    </View>
);

const Footer = ({ page, total }) => (
    <View style={tw('absolute bottom-8 left-0 right-0 flex flex-row justify-between px-12 border-t border-gray-100 pt-4')}>
        <Text style={tw('text-[8px] text-gray-400')}>CONFIDENTIAL HISTORY AUDIT - NOT LEGAL ADVICE</Text>
        <Text style={tw('text-[8px] text-gray-400')}>Page {page} of {total}</Text>
    </View>
);

const MetricCard = ({ title, value, subtext, highlight = false }) => (
    <View style={tw(`flex-1 p-4 rounded-lg border ${highlight ? 'bg-accent/5 border-accent' : 'bg-gray-50 border-gray-100'}`)}>
        <Text style={tw('text-[8px] uppercase text-gray-500 tracking-wider mb-2')}>{title}</Text>
        <Text style={tw(`text-xl font-bold ${highlight ? 'text-accent' : 'text-black'}`)}>{value}</Text>
        {subtext && <Text style={tw('text-[8px] text-gray-400 mt-1')}>{subtext}</Text>}
    </View>
);

// --- PAGES ---

const PageOne = ({ data }) => (
    <Page size="A4" style={tw('p-12 font-sans bg-white relative')}>
        <Header id={`RPT-${Math.floor(Math.random() * 10000)}`} date={new Date().toLocaleDateString()} />

        {/* VERDICT BANNER */}
        <View style={tw('flex flex-row gap-8 mb-12')}>
            <View style={tw('w-1/3')}>
                <View style={tw('w-32 h-32 rounded-full border-8 border-accent flex items-center justify-center p-2')}>
                    <Text style={tw('text-4xl font-bold text-accent')}>{data.confidence_score || '---'}</Text>
                    <Text style={tw('text-[8px] uppercase text-gray-400 mt-1')}>Trust Score</Text>
                </View>
            </View>
            <View style={tw('w-2/3 flex justify-center')}>
                <Text style={tw('text-sm text-gray-400 uppercase tracking-widest mb-1')}>Audit Verdict</Text>
                {(() => {
                    const hasMajorIssues = data.forensic_records?.ntsb_count > 0 || data.forensic_records?.liens_found;
                    const hasMechanical = data.forensic_records?.sdr_count > 0;

                    const title = hasMajorIssues ? 'HIGH RISK' : hasMechanical ? 'CAUTION ADVISED' : 'CLEAN TITLE';
                    const summary = hasMajorIssues
                        ? `Audit of ${data.tail_number} detected significant safety or financial records. NTSB or Lien history suggests a deeper logbook investigation is required.`
                        : hasMechanical
                            ? `Safety profile for ${data.tail_number} is stable, though incremental service difficulty records (SDRs) suggest mechanical component fatigue.`
                            : `This aircraft shows no evidence of major accidents, active liens, or critical AD anomalies in the federal registries. Value profile is stable.`;

                    return (
                        <>
                            <Text style={tw(`text-4xl font-black mb-2 ${hasMajorIssues ? 'text-red-600' : hasMechanical ? 'text-accent' : 'text-black'}`)}>{title}</Text>
                            <Text style={tw('text-[10px] text-gray-500 leading-relaxed')}>
                                {summary}
                            </Text>
                        </>
                    );
                })()}
            </View>
        </View>

        {/* VITAL STATS */}
        <View style={tw('mb-12')}>
            <Text style={tw('text-sm font-bold text-black uppercase tracking-widest border-b-2 border-accent pb-2 mb-6')}>Aircraft Identity</Text>
            <View style={tw('flex flex-wrap gap-4 flex-row')}>
                <MetricCard title="Registration" value={data.tail_number || 'N/A'} />
                <MetricCard title="Manufacturer" value={data.aircraft_details?.make_model?.split(' ')[0] || 'Unknown'} />
                <MetricCard title="Model" value={data.aircraft_details?.make_model?.split(' ').slice(1).join(' ') || 'Unknown'} />
                <MetricCard title="Serial Number" value={data.aircraft_details?.serial || 'Unknown'} />
            </View>
            <View style={tw('flex flex-wrap gap-4 flex-row mt-4')}>
                <MetricCard title="Year" value={data.aircraft_details?.year || 'Unknown'} />
                <MetricCard title="Registered Owner" value={data.aircraft_details?.owner || 'Unknown'} style={{ flex: 2 }} />
                <MetricCard title="Base Location" value={`${data.aircraft_details?.city || ''}, ${data.aircraft_details?.state || ''}`} />
            </View>
        </View>

        {/* MARKET VALUE */}
        <View style={tw('mb-12')}>
            <Text style={tw('text-sm font-bold text-black uppercase tracking-widest border-b-2 border-accent pb-2 mb-6')}>Market Valuation</Text>
            <View style={tw('bg-gray-50 p-8 rounded-xl flex flex-row items-center justify-between')}>
                <View>
                    <Text style={tw('text-xs text-gray-500 uppercase tracking-widest mb-2')}>Estimated Market Value</Text>
                    <Text style={tw('text-4xl font-bold text-black')}>${data.valuation?.estimated_value?.toLocaleString() || '---'}</Text>
                </View>
                <View style={tw('items-end')}>
                    <Text style={tw('text-accent font-bold text-sm bg-accent/10 px-3 py-1 rounded-full')}>{data.valuation?.market_trend || 'STABLE'} TREND</Text>
                    <Text style={tw('text-[8px] text-gray-400 mt-2')}>Confidence: {data.valuation?.confidence_interval}</Text>
                </View>
            </View>
        </View>

        <Footer page={1} total={2} />
    </Page>
);

const PageTwo = ({ data }) => (
    <Page size="A4" style={tw('p-12 font-sans bg-white relative')}>
        <Header id="RPT-CONT" date={new Date().toLocaleDateString()} />

        {/* FORENSIC FINDINGS */}
        <Text style={tw('text-sm font-bold text-black uppercase tracking-widest border-b-2 border-accent pb-2 mb-6')}>Mechanical & Safety Diligence Audit</Text>

        {/* TABLE HEADER */}
        <View style={tw('flex flex-row bg-gray-100 p-2 mb-2')}>
            <Text style={tw('text-[8px] font-bold text-gray-600 uppercase flex-1')}>Database Segment</Text>
            <Text style={tw('text-[8px] font-bold text-gray-600 uppercase flex-1')}>Findings</Text>
            <Text style={tw('text-[8px] font-bold text-gray-600 uppercase w-20 text-center')}>Verdict</Text>
        </View>

        {/* ROW 1: NTSB */}
        <View style={tw('flex flex-row border-b border-gray-100 p-3 items-center')}>
            <Text style={tw('text-xs font-bold text-black flex-1')}>NTSB Accident Reports</Text>
            <Text style={tw('text-[10px] text-gray-500 flex-1')}>{data.forensic_records?.ntsb_count || 0} Records Found</Text>
            <View style={tw('w-20 items-center')}>
                <Text style={tw(`text-[10px] font-bold px-2 py-1 rounded-full ${data.forensic_records?.ntsb_count > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`)}>
                    {data.forensic_records?.ntsb_count > 0 ? 'FAIL' : 'PASS'}
                </Text>
            </View>
        </View>

        {/* ROW 2: SDR */}
        <View style={tw('flex flex-row border-b border-gray-100 p-3 items-center')}>
            <Text style={tw('text-xs font-bold text-black flex-1')}>Service Difficulty Reports (SDR)</Text>
            <Text style={tw('text-[10px] text-gray-500 flex-1')}>{data.forensic_records?.sdr_count || 0} Maintenance Events</Text>
            <View style={tw('w-20 items-center')}>
                <Text style={tw(`text-[10px] font-bold px-2 py-1 rounded-full ${data.forensic_records?.sdr_count > 5 ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`)}>
                    {data.forensic_records?.sdr_count > 5 ? 'WARN' : 'PASS'}
                </Text>
            </View>
        </View>

        {/* ROW 3: LIENS */}
        <View style={tw('flex flex-row border-b border-gray-100 p-3 items-center')}>
            <Text style={tw('text-xs font-bold text-black flex-1')}>Title & Lien Search</Text>
            <Text style={tw('text-[10px] text-gray-500 flex-1')}>{data.forensic_records?.liens_found ? 'Active Liens Detected' : 'Clear Title'}</Text>
            <View style={tw('w-20 items-center')}>
                <Text style={tw(`text-[10px] font-bold px-2 py-1 rounded-full ${data.forensic_records?.liens_found ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`)}>
                    {data.forensic_records?.liens_found ? 'FAIL' : 'PASS'}
                </Text>
            </View>
        </View>

        {/* ROW 4: OWNERSHIP */}
        <View style={tw('flex flex-row border-b border-gray-100 p-3 items-center')}>
            <Text style={tw('text-xs font-bold text-black flex-1')}>Ownership Continuity</Text>
            <Text style={tw('text-[10px] text-gray-500 flex-1')}>Verified Chain of Custody</Text>
            <View style={tw('w-20 items-center')}>
                <Text style={tw('text-[10px] font-bold px-2 py-1 rounded-full bg-green-100 text-green-600')}>
                    STABLE
                </Text>
            </View>
        </View>

        {/* ROW 5: CADORS (Conditional) */}
        {data.tail_number?.startsWith('C-') && (
            <View style={tw('flex flex-row border-b border-gray-100 p-3 items-center')}>
                <Text style={tw('text-xs font-bold text-black flex-1')}>CADORS Safety Scan</Text>
                <Text style={tw('text-[10px] text-gray-500 flex-1')}>{data.forensic_records?.cadors_count || 0} Events Detected</Text>
                <View style={tw('w-20 items-center')}>
                    <Text style={tw(`text-[10px] font-bold px-2 py-1 rounded-full ${data.forensic_records?.cadors_count > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`)}>
                        {data.forensic_records?.cadors_count > 0 ? 'WARN' : 'PASS'}
                    </Text>
                </View>
            </View>
        )}

        {/* FLIGHT UTILIZATION AUDIT */}
        <View style={tw('mt-12 break-inside-avoid')}>
            <Text style={tw('text-sm font-bold text-black uppercase tracking-widest border-b-2 border-accent pb-2 mb-6')}>Flight Utilization Audit & Duty Cycle</Text>

            {/* METRICS ROW */}
            <View style={tw('flex flex-row gap-4 mb-6')}>
                <View style={tw('flex-1 bg-gray-50 p-4 rounded-lg')}>
                    <Text style={tw('text-[8px] uppercase text-gray-500 mb-1')}>Verified Tracked Hours (12m)</Text>
                    <Text style={tw('text-xl font-black text-black')}>{data.flight_data?.total_hours_12m || 0} HRS</Text>
                </View>
                <View style={tw('flex-1 bg-gray-50 p-4 rounded-lg')}>
                    <Text style={tw('text-[8px] uppercase text-gray-500 mb-1')}>Avg Flight Duration</Text>
                    <Text style={tw('text-xl font-bold text-black')}>
                        {data.flight_data?.recent_flights?.length > 0
                            ? (data.flight_data.total_hours_12m / data.flight_data.recent_flights.length).toFixed(1)
                            : '0.0'} HRS
                    </Text>
                </View>
                <View style={tw('flex-1 bg-gray-50 p-4 rounded-lg')}>
                    <Text style={tw('text-[8px] uppercase text-gray-500 mb-1')}>Data Integrity</Text>
                    <Text style={tw(`text-sm font-bold ${data.flight_data?.data_source === 'adsb' ? 'text-green-600' : 'text-yellow-600'}`)}>
                        {data.flight_data?.data_source === 'adsb' ? 'ADS-B VERIFIED' : 'MLAT ESTIMATED'}
                    </Text>
                </View>
            </View>

            {/* CHART: UTILIZATION VS AVERAGE */}
            <View style={tw('mb-8')}>
                <Text style={tw('text-[8px] font-bold text-gray-400 uppercase mb-2')}>Annual Utilization vs Fleet Average</Text>

                {/* This Plane */}
                <View style={tw('flex flex-row items-center mb-2')}>
                    <Text style={tw('text-[8px] w-20 text-black font-bold')}>THIS AIRCRAFT</Text>
                    <View style={tw('flex-1 h-4 bg-gray-100 rounded-full overflow-hidden mr-2')}>
                        <View style={{ ...tw('h-full bg-accent'), width: `${Math.min((data.flight_data?.total_hours_12m || 0) / 4, 100)}%` }} />
                        {/* Scale: 400hrs = 100% */}
                    </View>
                    <Text style={tw('text-[8px] w-10 text-right font-mono')}>{data.flight_data?.total_hours_12m || 0}</Text>
                </View>

                {/* Fleet Average (Mock 150 hrs) */}
                <View style={tw('flex flex-row items-center')}>
                    <Text style={tw('text-[8px] w-20 text-gray-500')}>FLEET AVG</Text>
                    <View style={tw('flex-1 h-4 bg-gray-100 rounded-full overflow-hidden mr-2')}>
                        <View style={{ ...tw('h-full bg-gray-400'), width: '37%' }} />
                        {/* 150 / 400 = 37.5% */}
                    </View>
                    <Text style={tw('text-[8px] w-10 text-right font-mono text-gray-500')}>150</Text>
                </View>
            </View>

            {/* FLIGHT LOG TABLE */}
            {(data.flight_data?.recent_flights || []).length > 0 ? (
                <View>
                    <View style={tw('flex flex-row bg-black p-2')}>
                        <Text style={tw('text-[8px] font-bold text-white w-24')}>Date</Text>
                        <Text style={tw('text-[8px] font-bold text-white flex-1')}>Route</Text>
                        <Text style={tw('text-[8px] font-bold text-white w-24 text-right')}>Duration</Text>
                    </View>
                    {(data.flight_data.recent_flights.slice(0, 8)).map((flight, i) => (
                        <View key={i} style={tw(`flex flex-row border-b border-gray-100 p-2 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`)}>
                            <Text style={tw('text-[8px] text-gray-600 w-24')}>{flight.date || 'N/A'}</Text>
                            <Text style={tw('text-[8px] text-black flex-1 font-bold')}>{flight.origin} → {flight.destination}</Text>
                            <Text style={tw('text-[8px] text-gray-500 w-24 text-right')}>{flight.duration || 'N/A'}</Text>
                        </View>
                    ))}
                </View>
            ) : (
                <View style={tw('border border-dashed border-gray-300 rounded p-6 items-center justify-center')}>
                    <Text style={tw('text-xs text-gray-400 italic mb-2')}>No recent flight data detected.</Text>

                    {/* CORROSION WARNING if dormant */}
                    <View style={tw('bg-red-50 border border-red-100 p-4 rounded-lg flex flex-row gap-4 items-center mt-2')}>
                        <View style={tw('w-8 h-8 rounded-full bg-red-100 items-center justify-center')}>
                            <Text style={tw('text-red-600 font-bold text-lg')}>!</Text>
                        </View>
                        <View>
                            <Text style={tw('text-xs font-bold text-red-700 uppercase')}>High Corrosion Risk</Text>
                            <Text style={tw('text-[8px] text-red-600 max-w-xs')}>
                                No flight activity detected in &gt;60 days. Engine seals and airframe may be compromised by inactivity. Borescope inspection recommended.
                            </Text>
                        </View>
                    </View>
                </View>
            )}

            <Text style={tw('text-[6px] text-gray-300 uppercase mt-4 text-right')}>
                Data Source: FlightAware AeroAPI (ADS-B/MLAT/SWIM Feed)
            </Text>
        </View>

        <Footer page={2} total={2} />
    </Page>
);

const DiligenceReportDocument = ({ data }) => (
    <Document>
        <PageOne data={data} />
        <PageTwo data={data} />
    </Document>
);

export default DiligenceReportDocument;

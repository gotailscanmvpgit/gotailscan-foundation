export default function AircraftIdentityCard({ aircraftDetails, cardStyle }) {
    if (!aircraftDetails) return null;

    return (
        <div style={{ ...cardStyle, marginBottom: '24px', background: 'linear-gradient(to right, rgba(249, 115, 22, 0.1), transparent)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '2px solid rgba(249, 115, 22, 0.2)' }}>
                <div style={{ fontSize: '24px' }}>✈️</div>
                <h3 style={{ fontSize: '22px', fontWeight: '900', color: 'white', textTransform: 'uppercase', margin: 0 }}>AIRCRAFT IDENTITY</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                {/* Year */}
                <div style={{ background: 'rgba(0, 0, 0, 0.6)', padding: '16px', borderRadius: '8px', border: '2px solid rgba(255, 255, 255, 0.1)' }}>
                    <div style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>YEAR</div>
                    <div style={{ fontSize: '32px', fontWeight: '900', color: 'white' }}>
                        {aircraftDetails.year || 'N/A'}
                    </div>
                </div>

                {/* Make/Model */}
                <div style={{ background: 'rgba(0, 0, 0, 0.6)', padding: '16px', borderRadius: '8px', border: '2px solid rgba(249, 115, 22, 0.3)' }}>
                    <div style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>MAKE/MODEL</div>
                    <div style={{ fontSize: '18px', fontWeight: '900', color: '#f97316', textTransform: 'uppercase', wordBreak: 'break-word' }}>
                        {aircraftDetails.make_model || 'UNKNOWN'}
                    </div>
                    {aircraftDetails.manufacturer_code && (
                        <div style={{ fontSize: '9px', color: '#6b7280', marginTop: '4px', fontFamily: 'monospace' }}>
                            MFR: {aircraftDetails.manufacturer_code}
                        </div>
                    )}
                </div>

                {/* Serial Number */}
                <div style={{ background: 'rgba(0, 0, 0, 0.6)', padding: '16px', borderRadius: '8px', border: '2px solid rgba(255, 255, 255, 0.1)' }}>
                    <div style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>SERIAL NUMBER</div>
                    <div style={{ fontSize: '18px', fontWeight: '900', color: 'white', fontFamily: 'monospace' }}>
                        {aircraftDetails.serial || 'N/A'}
                    </div>
                </div>
            </div>
        </div>
    );
}

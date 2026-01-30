import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet's default icon path issues in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom icons for origin (Green) and destination (Red)
const originIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const destIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const FlightMap = ({ flightData }) => {
    // Extract flight path data
    // We look for the first flight that has valid coordinates
    const flights = flightData?.raw_json?.flights || [];
    const validFlight = flights.find(f =>
        f.origin_lat && f.origin_lon && f.dest_lat && f.dest_lon
    );

    if (!validFlight) {
        return (
            <div style={{
                height: '400px',
                background: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '8px',
                border: '1px solid #334155',
                flexDirection: 'column',
                gap: '16px'
            }}>
                <div style={{ fontSize: '48px', opacity: 0.5 }}>🌍</div>
                <div style={{ color: '#94a3b8', fontFamily: 'monospace' }}>
                    NO GEOSPATIAL TELEMETRY AVAILABLE
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                    FlightAware ADS-B Tracking Inactive or Privacy Blocked
                </div>
            </div>
        );
    }

    const startPos = [validFlight.origin_lat, validFlight.origin_lon];
    const endPos = [validFlight.dest_lat, validFlight.dest_lon];
    const centerPos = [
        (startPos[0] + endPos[0]) / 2,
        (startPos[1] + endPos[1]) / 2
    ];

    return (
        <div style={{ height: '400px', width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #334155' }}>
            <MapContainer
                center={centerPos}
                zoom={4}
                style={{ height: '100%', width: '100%', background: '#0f172a' }}
                scrollWheelZoom={false}
            >
                {/* Dark Matter Tiles for Forensic Look */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                <Marker position={startPos} icon={originIcon}>
                    <Popup>
                        <strong>ORIGIN: {validFlight.origin}</strong><br />
                        Departed: {validFlight.date}
                    </Popup>
                </Marker>

                <Marker position={endPos} icon={destIcon}>
                    <Popup>
                        <strong>DESTINATION: {validFlight.destination}</strong><br />
                        Est. Arrival: {validFlight.duration}
                    </Popup>
                </Marker>

                <Polyline
                    positions={[startPos, endPos]}
                    pathOptions={{ color: '#06b6d4', weight: 3, dashArray: '10, 10', opacity: 0.8 }}
                />
            </MapContainer>

            <div style={{
                background: '#1e293b',
                padding: '12px',
                borderTop: '1px solid #334155',
                display: 'flex',
                justifyContent: 'space-between',
                fontFamily: "'Roboto Mono', monospace",
                fontSize: '12px'
            }}>
                <div style={{ color: '#94a3b8' }}>LATEST FLIGHT: <span style={{ color: 'white', fontWeight: 'bold' }}>{validFlight.origin} ➝ {validFlight.destination}</span></div>
                <div style={{ color: '#06b6d4', fontWeight: 'bold' }}>LIVE ADS-B SOURCE</div>
            </div>
        </div>
    );
};

export default FlightMap;

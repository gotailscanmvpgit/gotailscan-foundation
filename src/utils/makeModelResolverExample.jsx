/**
 * Example: Using the Make/Model Resolver in a Dashboard Component
 * 
 * This shows how to integrate the intelligent make/model resolution
 * into your existing dashboards (Buyer, Seller, Mechanic)
 */

import React, { useState, useEffect } from 'react';
import { resolveMakeModel, isCleanMakeModel } from '../utils/makeModelResolver';

export function ExampleUsage() {
    const [result, setResult] = useState(null); // Your scan result
    const [resolvedMakeModel, setResolvedMakeModel] = useState({
        value: 'Loading...',
        source: 'unknown',
        confidence: 'unknown'
    });

    // Resolve make/model when result changes
    useEffect(() => {
        if (!result?.aircraft_details) return;

        const aircraftData = result.aircraft_details;

        // Check if we need to resolve
        if (!isCleanMakeModel(aircraftData.make_model)) {
            console.log('🔍 Make/Model needs resolution...');

            resolveMakeModel(aircraftData).then(resolved => {
                setResolvedMakeModel({
                    value: resolved.make_model,
                    source: resolved.source,
                    confidence: resolved.confidence,
                    manufacturer: resolved.manufacturer
                });
            });
        } else {
            // Already clean, use as-is
            setResolvedMakeModel({
                value: aircraftData.make_model,
                source: 'registry',
                confidence: 'high'
            });
        }
    }, [result]);

    return (
        <div>
            <h3>Aircraft Make/Model</h3>
            <div>
                <strong>{resolvedMakeModel.value}</strong>

                {/* Show confidence indicator */}
                {resolvedMakeModel.confidence !== 'high' && (
                    <span style={{
                        marginLeft: '8px',
                        fontSize: '10px',
                        color: resolvedMakeModel.confidence === 'medium' ? '#eab308' : '#ef4444'
                    }}>
                        {resolvedMakeModel.source === 'ai' ? '🤖 AI-Resolved' : '⚠️ Unverified'}
                    </span>
                )}
            </div>

            {/* Optional: Show source for transparency */}
            <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>
                Source: {resolvedMakeModel.source}
                {resolvedMakeModel.manufacturer && ` | Manufacturer: ${resolvedMakeModel.manufacturer}`}
            </div>
        </div>
    );
}

/**
 * Integration into existing getCleanMakeModel() function
 * Replace the existing function in MinimalBuyerTest.jsx with this:
 */
export function getCleanMakeModelWithResolver(aircraftDetails, resolvedData) {
    // If we have resolved data, use it
    if (resolvedData && resolvedData.value !== 'Loading...') {
        return resolvedData.value;
    }

    // Fallback to original logic
    if (!aircraftDetails?.make_model) return 'N/A';
    const raw = aircraftDetails.make_model;

    if (raw.includes('ACFT-CODE') || raw.includes('SERIES-CONFIRMED')) {
        return 'Data Not Available';
    }

    return raw;
}

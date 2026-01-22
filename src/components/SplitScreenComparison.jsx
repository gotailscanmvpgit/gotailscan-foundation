import React, { useState } from 'react';

export default function SplitScreenComparison({ tcAdData, ocrData }) {
    const [highlightMismatches, setHighlightMismatches] = useState(true);

    // Compare TC_AD_Registry with OCR_Processed_Logs
    const compareData = () => {
        if (!tcAdData || !ocrData) return [];

        const comparisons = [];

        // Simulate comparison logic
        tcAdData.forEach((tcItem, index) => {
            const ocrMatch = ocrData.find(o => o.ad_number === tcItem.ad_number);
            const isMatch = ocrMatch && ocrMatch.compliance_date === tcItem.compliance_date;

            comparisons.push({
                id: index,
                adNumber: tcItem.ad_number,
                tcDate: tcItem.compliance_date,
                ocrDate: ocrMatch?.compliance_date || 'NOT FOUND',
                isMatch,
                tcDescription: tcItem.description,
                ocrDescription: ocrMatch?.description || 'N/A'
            });
        });

        return comparisons;
    };

    const comparisons = compareData();
    const mismatchCount = comparisons.filter(c => !c.isMatch).length;

    return (
        <div style={{ background: 'rgba(0,0,0,0.6)', border: '2px solid rgba(249, 115, 22, 0.3)', borderRadius: '12px', padding: '24px' }}>
            {/* Header */}
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ fontSize: '20px', fontWeight: '900', color: 'white', textTransform: 'uppercase', margin: 0 }}>
                        Split-Screen Comparison
                    </h3>
                    <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>
                        TC AD Registry vs. OCR Processed Logs
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase' }}>
                        Mismatches: <span style={{ color: mismatchCount > 0 ? '#ef4444' : '#10b981', fontWeight: 'bold', fontSize: '14px' }}>{mismatchCount}</span>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={highlightMismatches}
                            onChange={(e) => setHighlightMismatches(e.target.checked)}
                            style={{ width: '16px', height: '16px' }}
                        />
                        <span style={{ fontSize: '12px', color: 'white' }}>Highlight Mismatches</span>
                    </label>
                </div>
            </div>

            {/* Split Screen Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', overflow: 'hidden' }}>
                {/* Left Column Header */}
                <div style={{ background: 'rgba(59, 130, 246, 0.2)', padding: '12px', borderBottom: '2px solid rgba(59, 130, 246, 0.4)' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        📋 TC AD Registry
                    </div>
                </div>

                {/* Right Column Header */}
                <div style={{ background: 'rgba(249, 115, 22, 0.2)', padding: '12px', borderBottom: '2px solid rgba(249, 115, 22, 0.4)' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#f97316', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        🔍 OCR Processed Logs
                    </div>
                </div>

                {/* Data Rows */}
                {comparisons.length === 0 ? (
                    <>
                        <div style={{ background: 'rgba(0,0,0,0.4)', padding: '32px', textAlign: 'center', color: '#6b7280' }}>
                            No TC AD data available
                        </div>
                        <div style={{ background: 'rgba(0,0,0,0.4)', padding: '32px', textAlign: 'center', color: '#6b7280' }}>
                            No OCR data available
                        </div>
                    </>
                ) : (
                    comparisons.map((comp) => (
                        <React.Fragment key={comp.id}>
                            {/* Left Cell */}
                            <div style={{
                                background: highlightMismatches && !comp.isMatch ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0,0,0,0.4)',
                                padding: '16px',
                                borderLeft: highlightMismatches && !comp.isMatch ? '4px solid #ef4444' : 'none'
                            }}>
                                <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'white', marginBottom: '8px' }}>
                                    {comp.adNumber}
                                </div>
                                <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>
                                    Compliance: <span style={{ color: 'white' }}>{comp.tcDate}</span>
                                </div>
                                <div style={{ fontSize: '10px', color: '#6b7280' }}>
                                    {comp.tcDescription}
                                </div>
                            </div>

                            {/* Right Cell */}
                            <div style={{
                                background: highlightMismatches && !comp.isMatch ? 'rgba(239, 68, 68, 0.1)' : 'rgba(0,0,0,0.4)',
                                padding: '16px',
                                borderRight: highlightMismatches && !comp.isMatch ? '4px solid #ef4444' : 'none'
                            }}>
                                <div style={{ fontSize: '13px', fontWeight: 'bold', color: comp.ocrDate === 'NOT FOUND' ? '#ef4444' : 'white', marginBottom: '8px' }}>
                                    {comp.adNumber}
                                </div>
                                <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>
                                    Compliance: <span style={{ color: comp.ocrDate === 'NOT FOUND' ? '#ef4444' : 'white' }}>{comp.ocrDate}</span>
                                </div>
                                <div style={{ fontSize: '10px', color: '#6b7280' }}>
                                    {comp.ocrDescription}
                                </div>
                                {!comp.isMatch && (
                                    <div style={{ marginTop: '8px', padding: '4px 8px', background: '#ef4444', color: 'black', fontSize: '9px', fontWeight: '900', borderRadius: '4px', display: 'inline-block' }}>
                                        MISMATCH
                                    </div>
                                )}
                            </div>
                        </React.Fragment>
                    ))
                )}
            </div>

            {/* Summary */}
            {mismatchCount > 0 && (
                <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: 'bold', marginBottom: '8px' }}>
                        ⚠ CRITICAL: {mismatchCount} Discrepancies Detected
                    </div>
                    <div style={{ fontSize: '11px', color: '#9ca3af', lineHeight: '1.6' }}>
                        Logbook records do not match Transport Canada AD Registry. Recommend manual verification before sign-off.
                    </div>
                </div>
            )}
        </div>
    );
}

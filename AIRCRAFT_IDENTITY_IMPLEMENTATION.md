# Aircraft Identity Card - Implementation Guide

## Status: Ready for Manual Implementation

Due to complex JSX fragment nesting, this needs to be added manually. Here's the exact code and location.

## File to Edit
`src/components/MechanicDashboardStandalone.jsx`

## Location
**Line 171-172** - After the search/upload panel closing div and before the Logbook/AD grid

## Current Code (Lines 171-172):
```jsx
                {result && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
```

## Replace With:
```jsx
                {result && (
                    <>
                        {/* Aircraft Identity Card */}
                        <div style={{ ...cardStyle, marginBottom: '24px', background: 'linear-gradient(to right, rgba(249, 115, 22, 0.1), transparent)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '2px solid rgba(249, 115, 22, 0.2)' }}>
                                <div style={{ fontSize: '24px' }}>✈️</div>
                                <h3 style={{ fontSize: '22px', fontWeight: '900', color: 'white', textTransform: 'uppercase', margin: 0 }}>AIRCRAFT IDENTITY</h3>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                                <div style={{ background: 'rgba(0, 0, 0, 0.6)', padding: '16px', borderRadius: '8px', border: '2px solid rgba(255, 255, 255, 0.1)' }}>
                                    <div style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>YEAR</div>
                                    <div style={{ fontSize: '32px', fontWeight: '900', color: 'white' }}>{result.aircraft_details?.year || 'N/A'}</div>
                                </div>
                                <div style={{ background: 'rgba(0, 0, 0, 0.6)', padding: '16px', borderRadius: '8px', border: '2px solid rgba(249, 115, 22, 0.3)' }}>
                                    <div style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>MAKE/MODEL</div>
                                    <div style={{ fontSize: '18px', fontWeight: '900', color: '#f97316', textTransform: 'uppercase', wordBreak: 'break-word' }}>{result.aircraft_details?.make_model || 'UNKNOWN'}</div>
                                </div>
                                <div style={{ background: 'rgba(0, 0, 0, 0.6)', padding: '16px', borderRadius: '8px', border: '2px solid rgba(255, 255, 255, 0.1)' }}>
                                    <div style={{ fontSize: '10px', color: '#9ca3af', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>SERIAL NUMBER</div>
                                    <div style={{ fontSize: '18px', fontWeight: '900', color: 'white', fontFamily: 'monospace' }}>{result.aircraft_details?.serial || 'N/A'}</div>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
```

## Also Update Line 283:
**Current:**
```jsx
                    </div>
                )}
```

**Replace With:**
```jsx
                        </div>
                    </>
                )}
```

## Step-by-Step:

1. Open `src/components/MechanicDashboardStandalone.jsx`
2. Go to line 171
3. Replace line 172 (`<div style={{ display: 'grid'...`) with the full Aircraft Identity card code above
4. Go to line 283 (it will be around line 306 after your edit)
5. Add `</div>` and `</>` before the `)}` 
6. Save the file
7. Run `npm run build`
8. If successful, run `vercel --prod`

## What This Does:

- Adds a prominent **Aircraft Identity** card at the top
- Displays **Year**, **Make/Model**, and **Serial Number** in 3 columns
- Uses orange theme matching the Mechanic Dashboard
- Data comes from `result.aircraft_details.serial` (not `serial_number`)

## Expected Result:

When you visit `https://www.gotailscan.com/mechanic?tail=N904GS&autostart=true`, you'll see:

```
AIRCRAFT IDENTITY
┌──────────┬──────────────┬──────────────┐
│   YEAR   │  MAKE/MODEL  │SERIAL NUMBER │
│   2015   │  CESSNA TTX  │  900EX-45    │
└──────────┴──────────────┴──────────────┘
```

Displayed in orange-themed cards above the Logbook Analysis and AD Compliance sections.

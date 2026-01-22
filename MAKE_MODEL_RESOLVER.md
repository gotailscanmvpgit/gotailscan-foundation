# Aircraft Make/Model Intelligent Resolution System

## Overview

This system intelligently resolves aircraft make and model information when FAA registry data is unclear, contains codes, or is incomplete. It uses a three-tier resolution strategy:

1. **Database Lookup** (Serial Number Cross-Reference)
2. **AI-Powered Resolution** (GPT-4 via Supabase Edge Function)
3. **Fallback Cleaning** (Registry data sanitization)

## Problem Statement

FAA registry data often contains unclear information like:
- `ACFT-CODE: 12345`
- `SERIES-CONFIRMED: XYZ789`
- `MODEL-TYPE-CERT-PENDING`
- Alphanumeric codes instead of human-readable names

This creates a poor user experience when displaying aircraft information.

## Solution Architecture

```
┌─────────────────────┐
│  FAA Registry Data  │
│  make_model: "???"  │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────┐
│  isCleanMakeModel()         │
│  Check if data is readable  │
└──────────┬──────────────────┘
           │
           ├─── Clean? ──────────► Use as-is
           │
           └─── Unclear? ────────┐
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │  Step 1: Database      │
                    │  Lookup by Serial #    │
                    └────────┬───────────────┘
                             │
                             ├─── Found? ──────► Return DB result
                             │
                             └─── Not Found ───┐
                                               │
                                               ▼
                                  ┌─────────────────────────┐
                                  │  Step 2: AI Resolution  │
                                  │  (Supabase Edge Fn)     │
                                  └────────┬────────────────┘
                                           │
                                           ├─── Success? ──► Return AI result
                                           │
                                           └─── Failed ────┐
                                                           │
                                                           ▼
                                              ┌────────────────────┐
                                              │  Step 3: Fallback  │
                                              │  Clean registry    │
                                              └────────────────────┘
```

## Files Created

### 1. `src/utils/makeModelResolver.js`
Main utility with resolution logic:
- `resolveMakeModel(aircraftData)` - Main resolution function
- `isCleanMakeModel(makeModel)` - Checks if data is clean
- `useMakeModelResolver(aircraftData)` - React hook for components

### 2. `supabase/functions/resolveMakeModel/index.ts`
Supabase Edge Function that uses GPT-4 to resolve make/model from context:
- Analyzes tail number, serial number, year, and registry data
- Returns structured JSON with confidence level
- Logs resolutions for analytics

### 3. `src/utils/makeModelResolverExample.jsx`
Example integration code showing how to use the resolver in dashboards

## Usage

### Basic Usage (Async)

```javascript
import { resolveMakeModel } from './utils/makeModelResolver';

const aircraftData = {
    make_model: 'ACFT-CODE: 12345',
    serial: '17280123',
    tail_number: 'N12345',
    year: 2015
};

const result = await resolveMakeModel(aircraftData);
console.log(result);
// {
//   make_model: "CESSNA 172S SKYHAWK",
//   source: "ai",
//   confidence: "high",
//   manufacturer: "Cessna"
// }
```

### React Hook Usage

```javascript
import { useMakeModelResolver } from './utils/makeModelResolver';

function AircraftDisplay({ aircraftData }) {
    const { makeModel, isLoading, source, confidence } = useMakeModelResolver(aircraftData);
    
    return (
        <div>
            <h3>{isLoading ? 'Resolving...' : makeModel}</h3>
            <small>Source: {source} | Confidence: {confidence}</small>
        </div>
    );
}
```

### Integration into Existing Dashboards

Replace the existing `getCleanMakeModel()` function in your dashboards:

```javascript
// OLD CODE (MinimalBuyerTest.jsx)
const getCleanMakeModel = () => {
    if (!result?.aircraft_details?.make_model) return 'N/A';
    const raw = result.aircraft_details.make_model;
    
    if (raw.includes('ACFT-CODE') || raw.includes('SERIES-CONFIRMED')) {
        return 'Data Not Available';
    }
    
    return raw;
};

// NEW CODE (with resolver)
const [resolvedMakeModel, setResolvedMakeModel] = useState('Loading...');

useEffect(() => {
    if (result?.aircraft_details) {
        resolveMakeModel(result.aircraft_details).then(resolved => {
            setResolvedMakeModel(resolved.make_model);
        });
    }
}, [result]);

// Then use: resolvedMakeModel instead of getCleanMakeModel()
```

## Database Schema (Optional)

To enable serial number lookups, create this table in Supabase:

```sql
CREATE TABLE aircraft_reference (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    serial_number TEXT UNIQUE NOT NULL,
    make_model TEXT NOT NULL,
    manufacturer TEXT,
    type_certificate TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_serial_number ON aircraft_reference(serial_number);
```

## Edge Function Deployment

Deploy the AI resolution function to Supabase:

```bash
cd supabase/functions
supabase functions deploy resolveMakeModel
```

Set the OpenAI API key:

```bash
supabase secrets set OPENAI_API_KEY=sk-your-key-here
```

## Configuration

The system requires:
1. **Supabase Project** (already configured)
2. **OpenAI API Key** (for AI resolution) - Optional but recommended
3. **Aircraft Reference Database** (optional, for serial number lookups)

## Confidence Levels

- **high**: Data from database or clean registry
- **medium**: AI-resolved with good context
- **low**: Cleaned registry data or limited context
- **none**: Unable to resolve

## Analytics

All AI resolutions are logged to `make_model_resolutions` table for:
- Monitoring resolution accuracy
- Improving the AI prompts
- Building training data for future ML models

## Benefits

1. **Better UX**: Users see "CESSNA 172S SKYHAWK" instead of "ACFT-CODE: 12345"
2. **Intelligent Fallback**: Multiple resolution strategies ensure data is always available
3. **Transparency**: Confidence levels and sources are exposed to users
4. **Analytics**: Track resolution patterns to improve the system
5. **Scalable**: Can add more resolution strategies (e.g., external APIs, ML models)

## Future Enhancements

- [ ] Add more aircraft databases (ICAO, EASA, etc.)
- [ ] Implement caching for frequently resolved serials
- [ ] Train custom ML model on resolution logs
- [ ] Add image recognition for logbook photos
- [ ] Integrate with manufacturer APIs

## Testing

Test with known problematic tail numbers:
- N30HQ (should resolve cleanly)
- N182MU (test AI resolution if registry is unclear)
- C-GJED (Canadian registration)

---

**Created**: 2026-01-21  
**Version**: 1.0.0  
**Status**: Ready for Integration

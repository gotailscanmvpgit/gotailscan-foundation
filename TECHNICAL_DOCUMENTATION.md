# GoTailScan - Complete Dashboard System Documentation

## 🎯 Project Overview

**GoTailScan** is an aviation forensics platform that consolidates aircraft data from 12+ regulatory databases into three purpose-driven, role-based dashboards. Each dashboard provides **High-Confidence Outcomes** tailored to specific user goals.

---

## 📐 Architecture

### Technology Stack
- **Frontend**: React 18 + Vite
- **Routing**: React Router DOM v6
- **Styling**: Inline styles (zero UI library dependencies)
- **Backend**: Supabase Edge Functions (Deno runtime)
- **Database**: PostgreSQL (via Supabase)
- **APIs**: FAA Registry, NTSB, CADORS, SDR, OFAC, UCC, Interpol

### File Structure
```
src/
├── App.jsx                              # Main router
├── main.jsx                             # React entry point
├── components/
│   ├── SimpleGateway.jsx                # Landing page (role selector)
│   ├── MinimalBuyerTest.jsx             # Buyer Dashboard
│   ├── SellerDashboardStandalone.jsx    # Seller Dashboard
│   ├── MechanicDashboardStandalone.jsx  # Mechanic Dashboard
│   └── Hero.jsx                         # Legacy (archived)
├── services/
│   └── scraperService.js                # API service layer
└── lib/
    └── supabaseClient.js                # Supabase config

supabase/functions/
└── orchestrateForensicScan/
    └── index.ts                         # Main backend orchestrator
```

---

## 🚪 Landing Page: Role Gateway

**File**: `SimpleGateway.jsx`  
**Route**: `/`

### Purpose
Intelligent user segmentation - directs users to their appropriate dashboard based on transaction role.

### Features
- **Three Role Cards**:
  1. **I'm Buying** (Green) → `/buyer`
  2. **I'm Selling** (Blue) → `/seller`
  3. **I'm a Mechanic** (Orange) → `/mechanic`
- Gradient background with animated grid
- Click-to-navigate cards
- Zero external dependencies

### Design Philosophy
- **First Impression**: Clean, professional, immediately actionable
- **Color Coding**: Consistent theme per role (green=risk, blue=value, orange=industrial)
- **Mobile Responsive**: Grid adapts to screen size

---

## 1️⃣ Buyer Dashboard - "The Risk Radar"

**File**: `MinimalBuyerTest.jsx`  
**Route**: `/buyer`  
**Color Theme**: Emerald/Yellow/Red (risk-based)

### Purpose
**Uncover hidden risks before purchase**

### Hero Metric: Risk Score (0-100)
- **Calculation**: `100 - confidence_score`
- **Color Coding**:
  - 0-30 (LOW): Green
  - 31-60 (MEDIUM): Yellow
  - 61-100 (HIGH): Red

### Key Panels

#### 1. Critical Alerts
Automatically flags:
- ⚠️ **Accident History** (NTSB reports > 0)
- ⚠️ **Active Liens** (UCC filings)
- ⚠️ **Sanctions Hits** (OFAC/Interpol)
- ⚠️ **Logbook Gaps** (missing annuals)
- ⚠️ **Dormancy** (aircraft idle > 12 months)

#### 2. Mission Fit
- **Value**: Estimated market value
- **Year**: Aircraft year
- **Tax Benefits**: Bonus depreciation calculator (if available)

#### 3. AI Advisory
- Technical recommendations from AI synthesis
- Risk profile assessment
- Purchase decision support

### Data Flow
```
User Input (Tail #) 
  → scraperService.scanTailNumber()
  → Supabase Edge Function
  → Multi-database correlation
  → Risk calculation
  → Display results
```

### Technical Implementation
- **Dynamic Import**: `await import('../services/scraperService')` to avoid blocking initial render
- **Named Export**: Accesses `module.scraperService.scanTailNumber()`
- **State Management**: React hooks (`useState` for tail number, loading, result, error)

---

## 2️⃣ Seller Dashboard - "The Value Vault"

**File**: `SellerDashboardStandalone.jsx`  
**Route**: `/seller`  
**Color Theme**: Blue (value/trust)

### Purpose
**Prove aircraft value and attract buyers**

### Hero Metric: Market Alpha Score (0-100)
Calculated from positive forensic markers:
- **+15**: Zero accident history
- **+10**: Clear title (no liens)
- **+15**: Complete logbooks (continuity > 80%)
- **+10**: Actively flown (low dormancy)
- **+10**: Low Hangar Queen Index (< 30)
- **+10**: Modern avionics (modernity > 70%)
- **+5**: Clear sanctions
- **+10**: Above-average mechanical condition
- **+10**: High market demand
- **+5**: Premium valuation (> $100k)

**Labels**:
- **80-100**: PREMIUM
- **65-79**: ABOVE AVERAGE
- **50-64**: COMPETITIVE
- **0-49**: BASELINE

### Key Panels

#### 1. Price Shield
Visual table of positive markers:
- ✓ Zero Accident History (green)
- ✓ Clear Title (green)
- ✓ Complete Logbooks (green)
- ✓ Actively Flown (green)
- ✓ Modern Avionics (blue)
- ✓ Low Corrosion Risk (blue)
- ✓ Clean Sanctions (blue)

#### 2. Market Demand (Simulated)
- **Active Buyers**: Number of buyers searching this model
- **Avg Days on Market**: Typical listing duration
- **Price Trend**: Market movement (+/- %)

#### 3. Market Positioning Statement
- AI-generated value proposition
- Highlights buyer tax incentives
- Technical advisory repurposed as marketing copy

### Use Case
**Scenario**: Seller wants to justify asking price  
**Outcome**: Market Alpha of 78 ("ABOVE AVERAGE") + 6 green shields = strong negotiating position

---

## 3️⃣ Mechanic Dashboard - "Audit Console"

**File**: `MechanicDashboardStandalone.jsx`  
**Route**: `/mechanic`  
**Color Theme**: Orange/Black (industrial/warning)

### Purpose
**Fast logbook analysis and AD compliance verification**

### Design Philosophy
- **Industrial UI**: High contrast, bold borders, large touch targets
- **Tablet-Optimized**: Designed for use in hangar environments
- **Information-Dense**: Maximum data in minimum space
- **Efficiency-First**: Quick scan → immediate actionable results

### Key Panels

#### 1. Logbook OCR Analysis
- **OCR Confidence**: % accuracy of text extraction
- **Pages Scanned**: Total logbook pages processed
- **Record Continuity**: 0-100 score with visual progress bar
- **Critical Gaps**: Missing annual inspections
- **Semantic Red Flags**: Keywords like "Prop Strike", "Hard Landing"

#### 2. AD Compliance Checklist
Auto-generated based on aircraft type:

**Status Codes**:
- **VERIFIED** (Green): Compliance confirmed
- **PENDING** (Yellow): Awaiting verification
- **OVERDUE** (Red): Past due date
- **CHECK** (Orange): Requires manual review
- **UNKNOWN** (Gray): Insufficient data

**Example ADs**:
- Cessna: Wing Spar Inspection (SID)
- Piper: Wing Attachment Inspection
- Cirrus: Parachute Repack
- Generic: ELT Battery, ADS-B Compliance

#### 3. Sign-Off Recommendation
- AI-generated advisory for A&P technicians
- Technical guidance based on findings
- Risk assessment for airworthiness

### Use Case
**Scenario**: Pre-purchase inspection  
**Outcome**: Mechanic identifies 2 overdue ADs + logbook gap → advises buyer to negotiate $15k reduction

---

## 🔄 Data Flow Architecture

### 1. User Input
```javascript
handleScan() / handleAudit()
  ↓
Dynamic import of scraperService
  ↓
module.scraperService.scanTailNumber(tailNumber)
```

### 2. Backend Orchestration
```
Supabase Edge Function: orchestrateForensicScan
  ↓
Parallel API calls:
  - FAA Registry (aircraft details)
  - NTSB (accident history)
  - CADORS (Canadian incidents)
  - SDR (service difficulty reports)
  - OFAC (sanctions)
  - UCC (liens)
  - Interpol (stolen aircraft)
  ↓
Data synthesis & AI analysis
  ↓
Return unified forensic report
```

### 3. Frontend Processing
```
Buyer Dashboard:
  - Calculate risk score
  - Extract red flags
  - Display mission fit

Seller Dashboard:
  - Calculate Market Alpha
  - Build Price Shield
  - Simulate buyer demand

Mechanic Dashboard:
  - Parse logbook data
  - Generate AD checklist
  - Display compliance status
```

---

## 🎨 Design System

### Color Palette

#### Buyer (Risk-Focused)
- **Primary**: Emerald (#10b981) - Low risk
- **Warning**: Yellow (#eab308) - Medium risk
- **Danger**: Red (#ef4444) - High risk
- **Background**: Slate gradient

#### Seller (Value-Focused)
- **Primary**: Blue (#3b82f6) - Trust/value
- **Success**: Emerald (#10b981) - Positive markers
- **Background**: Blue-slate gradient

#### Mechanic (Industrial)
- **Primary**: Orange (#f97316) - Warning/attention
- **Success**: Emerald (#10b981) - Verified
- **Danger**: Red (#ef4444) - Overdue
- **Background**: Pure black (#0a0a0a)

### Typography
- **Headers**: 900 weight, uppercase, tight tracking
- **Body**: 400 weight, 14px base
- **Labels**: 10px, uppercase, bold, wide tracking
- **Monospace**: Used for technical data (AI advisory, logbook details)

### Component Patterns

#### Card Style (Reusable)
```javascript
const cardStyle = {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    padding: '24px'
};
```

#### Button Patterns
- **Primary Action**: Solid color, bold text, uppercase
- **Secondary Action**: Transparent background, border
- **Disabled**: Gray background, not-allowed cursor

---

## 🔧 Technical Decisions

### Why Inline Styles?
1. **Zero Dependencies**: Shadcn UI was causing blank page issues
2. **No Build Complexity**: No Tailwind JIT compilation needed
3. **Explicit Control**: Every style is visible in component
4. **Performance**: No CSS parsing overhead

### Why Dynamic Imports?
```javascript
// ❌ Static import (blocks initial render)
import scraperService from '../services/scraperService';

// ✅ Dynamic import (loads on demand)
const module = await import('../services/scraperService');
```
**Benefit**: Landing page renders instantly, service loads only when user clicks "Scan"

### Why Named Exports?
```javascript
// scraperService.js
export const scraperService = { ... };

// Component
const module = await import('../services/scraperService');
module.scraperService.scanTailNumber();
```
**Reason**: Maintains existing API contract with Hero.jsx and other legacy components

---

## 📊 Data Schema

### Forensic Report Structure
```typescript
interface ForensicReport {
  tail_number: string;
  confidence_score: number;
  aircraft_details: {
    year: number;
    make_model: string;
    serial: string;
  };
  forensic_records: {
    ntsb_count: number;
    sdr_count: number;
    liens_found: boolean;
  };
  logbook_audit: {
    ocr_confidence: number;
    pages_processed: number;
    findings: {
      continuity_score: number;
      gaps: Array<{ flag: string; period: string }>;
      red_flags: Array<{ term: string; context: string }>;
    };
  };
  compliance_audit: {
    status: 'CLEAR' | 'FLAGGED';
    clearance_code: string;
  };
  ai_intelligence: {
    risk_profile: string;
    audit_verdict: string;
    technical_advisory: string;
    tax_strategy: {
      bonus_depreciation_rate: string;
      year_1_deduction: number;
    };
  };
  valuation: {
    estimated_value: number;
    currency: string;
  };
  dormancy_analysis: {
    dormancy_risk: 'LOW' | 'MEDIUM' | 'HIGH';
    last_flight_gap: number;
  };
  hangar_queen_index: number;
  avionics_audit: {
    modernity_score: number;
  };
  infrastructure_audit: {
    elt_406mhz: boolean;
  };
  market_velocity: {
    demand_index: number;
  };
  fleet_comparison: {
    mechanical_delta: number;
  };
}
```

---

## 🚀 Deployment Guide

### Prerequisites
- Node.js 18+
- Supabase account
- Environment variables configured

### Local Development
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Access at http://localhost:5173
```

### Build for Production
```bash
# Create optimized build
npm run build

# Preview production build
npm run preview
```

### Environment Variables
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Supabase Functions
```bash
# Deploy backend function
supabase functions deploy orchestrateForensicScan --no-verify-jwt
```

---

## 🧪 Testing Guide

### Manual Testing Checklist

#### Landing Page
- [ ] Three role cards visible
- [ ] Cards clickable and navigate correctly
- [ ] Responsive on mobile/tablet/desktop

#### Buyer Dashboard
- [ ] Search bar accepts input
- [ ] "Scan Risk Profile" button triggers API call
- [ ] Loading state displays during fetch
- [ ] Risk score calculates correctly
- [ ] Red flags populate based on data
- [ ] Mission fit displays value/year
- [ ] Tax benefits show if available
- [ ] AI advisory renders

#### Seller Dashboard
- [ ] Search bar accepts input
- [ ] "Generate Value Report" triggers API call
- [ ] Market Alpha score calculates (0-100)
- [ ] Price Shield displays green/blue markers
- [ ] Buyer demand shows simulated data
- [ ] Market positioning statement renders

#### Mechanic Dashboard
- [ ] Industrial UI renders correctly
- [ ] Search accepts tail number
- [ ] "AUDIT" button triggers scan
- [ ] Logbook analysis displays OCR data
- [ ] Continuity score shows progress bar
- [ ] AD checklist generates based on aircraft type
- [ ] Status colors match (green/yellow/red/orange)
- [ ] Quick stats calculate correctly
- [ ] Sign-off recommendation displays

### Test Data
```
Good Aircraft: C-GJED (low risk, high alpha)
Problem Aircraft: N12345 (if exists in NTSB)
```

---

## 📈 Future Enhancements

### Phase 2: Authentication
- [ ] User accounts (Supabase Auth)
- [ ] Saved searches
- [ ] Report history
- [ ] Role-based access control

### Phase 3: Real-Time Features
- [ ] Live AD database integration (FAA API)
- [ ] Real OCR processing (Tesseract.js / AWS Textract)
- [ ] Actual buyer interest tracking
- [ ] Email notifications for sellers

### Phase 4: Mobile App
- [ ] React Native version
- [ ] Offline mode for mechanics
- [ ] Camera integration for logbook scanning
- [ ] Push notifications

### Phase 5: SQL Optimization
- [ ] Postgres full-text search
- [ ] Materialized views for market alpha
- [ ] Indexed queries for performance
- [ ] Caching layer (Redis)

---

## 🐛 Known Issues & Limitations

### Current Limitations
1. **Simulated Data**: Buyer demand, some AD statuses are simulated
2. **No Real OCR**: Logbook analysis uses mock data
3. **Static AD List**: Checklist is hardcoded, not live from FAA
4. **No Authentication**: Open access (no user accounts)

### Browser Compatibility
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ IE11 not supported

---

## 📞 Support & Contribution

### Getting Help
- Check `DASHBOARD_GUIDE.md` for user-facing docs
- Review this file for technical details
- Check browser console for errors

### Code Style
- Use inline styles (no CSS files)
- Dynamic imports for services
- Functional components only
- Descriptive variable names

### Git Workflow
```bash
# Feature branch
git checkout -b feature/seller-enhancements

# Commit with clear messages
git commit -m "feat: add price trend visualization to seller dashboard"

# Push and create PR
git push origin feature/seller-enhancements
```

---

## 📄 License & Credits

**Built by**: GoTailScan Team  
**Platform**: Supabase + React + Vite  
**Data Sources**: FAA, NTSB, CADORS, SDR, OFAC, UCC, Interpol  
**Version**: 3.0 (Dashboard Consolidation)  
**Last Updated**: January 2026

---

## 🎯 Success Metrics

### Buyer Dashboard
- **Primary Goal**: Avoid bad purchases
- **Success Indicator**: Risk score < 30 OR clear identification of deal-breakers

### Seller Dashboard
- **Primary Goal**: Prove value and attract buyers
- **Success Indicator**: Alpha score > 65 + complete Price Shield

### Mechanic Dashboard
- **Primary Goal**: Fast, accurate compliance verification
- **Success Indicator**: All ADs verified, zero gaps, clear sign-off advisory

---

**End of Technical Documentation**

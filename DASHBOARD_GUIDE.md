# GoTailScan - Dashboard Consolidation Summary

## Overview
Transformed from a "list of tools" showcase into three purpose-driven, outcome-focused dashboards.

## Architecture

### Landing Page: Role Gateway (`/`)
- **Component**: `RoleGateway.jsx`
- **Purpose**: Intelligent user segmentation
- **Routes**:
  - "I'm Buying" → `/buyer`
  - "I'm Selling" → `/seller`
  - "I'm a Mechanic" → `/mechanic`

---

## Dashboard #1: Buyer's Console - "The Risk Radar" (`/buyer`)

### Hero Metric
**Risk Score** (0-100, inverse of confidence score)
- LOW (0-30): Green
- MEDIUM (31-60): Yellow  
- HIGH (61-100): Red

### Key Panels
1. **Critical Alerts**: Red flag detection
   - Accident history (NTSB)
   - Active liens (UCC)
   - Sanctions hits (OFAC)
   - Logbook gaps
   - Dormancy warnings

2. **Mission Fit HUD**
   - Range, speed, seats, useful load
   - Value assessment with tax write-off

3. **AI Advisory**
   - Technical recommendations
   - Risk profile assessment

### Design Focus
- Risk-first presentation
- High-contrast alerts
- Decision support for purchase go/no-go

---

## Dashboard #2: Seller's Console - "The Value Vault" (`/seller`)

### Hero Metric
**Market Alpha Score** (0-100)
Calculated from positive forensic markers:
- Zero accident history (+15)
- Clear title (+10)
- Complete logbooks (+15)
- Active aircraft (+10)
- Low hangar queen index (+10)
- Modern avionics (+10)
- Clear sanctions (+5)

Labels:
- PREMIUM (80+)
- ABOVE AVERAGE (65-79)
- COMPETITIVE (50-64)
- BASELINE (<50)

### Key Panels
1. **Price Shield**: Positive forensic markers table
   - Zero Accident History
   - Clear Title
   - Complete Logbooks
   - Actively Flown
   - Modern Equipment
   - Low Corrosion Risk

2. **Market Demand**
   - Estimated active buyers (simulated)
   - Days on market
   - Price movement trend

3. **Market Positioning Statement**
   - AI-generated value proposition
   - Buyer tax incentive highlight

### Design Focus
- Value-first presentation
- Positive reinforcement
- Lead generation mindset

---

## Dashboard #3: Mechanic's Audit Console (`/mechanic`)

### Design Philosophy
**Industrial/High-Utility** - Optimized for tablet use in hangar environments

### Key Features

1. **Logbook OCR Analysis**
   - OCR confidence percentage
   - Pages scanned count
   - Record continuity score (0-100)
   - Critical gap detection
   - Semantic red flags (e.g., "Prop Strike")

2. **AD Compliance Checklist**
   - Live AD lookup (simulated)
   - Status tracking:
     - VERIFIED: Green
     - PENDING: Yellow
     - OVERDUE: Red
     - CHECK: Orange
   - Due date tracking
   - Quick stats summary

3. **Upload Interface**
   - Direct logbook upload (PDF/JPG)
   - Connects to `logbooks` Supabase bucket
   - OCR processing queue

4. **Sign-Off Recommendation**
   - AI advisory for A&P technicians
   - Technical guidance display

### Design Characteristics
- High contrast (black background, bold borders)
- Large touch targets (tablet-friendly)
- Orange accent color (industrial/warning theme)
- Compact, information-dense layout
- Clear visual hierarchy

---

## Data Flow

### Buyer Flow
```
Search Tail # → Risk Analysis
↓
Extract negative signals:
- NTSB count → Accident risk
- Liens → Title risk
- Compliance status → Legal risk
- Dormancy → Mechanical risk
- Logbook gaps → Value risk
↓
Risk Score + Red Flags + AI Advisory
```

### Seller Flow
```
Search Tail # → Value Analysis
↓
Extract positive signals:
- Clean history → +Alpha
- Complete logs → +Alpha
- Active use → +Alpha
- Clear title → +Alpha
↓
Market Alpha Score + Price Shield + Demand
```

### Mechanic Flow
```
Upload/Audit Tail # → Compliance Analysis
↓
Process logbooks:
- OCR scan
- Gap detection
- Red flag extraction
↓
Cross-reference ADs:
- Aircraft type → AD database
- Status verification
↓
Checklist + Recommendations
```

---

## Technical Implementation

### Routing
- **Framework**: React Router DOM v6
- **Structure**:
  ```
  / → RoleGateway
  /buyer → BuyerDashboard
  /seller → SellerDashboard
  /mechanic → MechanicDashboard
  ```

### Data Service
All dashboards use:
```javascript
scraperService.fetchForensicData(tailNumber)
```
Returns the unified forensic report with all modules.

### Component Reusability
- **Buyer**: Filters for risk metrics
- **Seller**: Filters for value metrics
- **Mechanic**: Filters for compliance metrics

Same data source, different lenses.

---

## Next Steps

### Recommended Enhancements

1. **Authentication**
   - Mechanic invite system
   - Seller dashboard access control
   
2. **Real SQL Optimization**
   - Postgres full-text search on ADs
   - Materialized views for market alpha calculations
   
3. **File Upload**
   - Direct S3/Supabase Storage integration
   - Real OCR processing (Tesseract.js or AWS Textract)
   
4. **Live AD Database**
   - FAA AD API integration
   - Transport Canada CAWIS integration
   
5. **Lead Capture**
   - Buyer interest tracking on seller dashboard
   - Email notifications
   
6. **Mobile Optimization**
   - Mechanic dashboard responsive refinement
   - PWA for offline hangar use

---

## File Structure
```
src/
├── App.jsx (Updated with routing)
├── components/
│   ├── RoleGateway.jsx (New landing page)
│   ├── BuyerDashboard.jsx (Risk Radar)
│   ├── SellerDashboard.jsx (Value Vault)
│   ├── MechanicDashboard.jsx (Audit Console)
│   ├── Hero.jsx (Legacy - can be archived)
│   └── ...
└── services/
    └── scraperService.js (Unchanged)
```

---

## Success Metrics

### Buyer
- **Primary Goal**: Avoid bad purchases
- **Success**: Risk score < 30 or clear red flag identification

### Seller  
- **Primary Goal**: Prove value and attract buyers
- **Success**: Alpha score > 65, complete price shield

### Mechanic
- **Primary Goal**: Fast, accurate compliance verification
- **Success**: All ADs verified, zero gaps, sign-off advisory generated

---

*Built on GoTailScan Forensic Platform v3.0*

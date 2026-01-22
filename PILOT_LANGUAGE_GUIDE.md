# Pilot-Friendly Language Guide

## Language Philosophy
Replace technical jargon with everyday pilot talk. Speak like you're at the hangar, not reading a manual.

---

## ✅ COMPLETED CHANGES

### Landing Page (SimpleGateway.jsx)
- ✅ "Aviation Forensics Platform" → "Aircraft Background Checks"
- ✅ "High-Confidence Outcomes for Every Stakeholder" → "Know what you're buying, selling, or signing off on"
- ✅ "The Risk Radar" → "Pre-Buy Intelligence"
- ✅ "Uncover hidden risks..." → "Find the red flags before you write the check"
- ✅ "The Value Vault" → "Seller's Toolkit"
- ✅ "Prove your aircraft's value..." → "Show buyers why your plane is worth every penny"
- ✅ "Audit Console" → "A&P Toolkit"
- ✅ "Fast logbook analysis..." → "Quick logbook check and AD status for pre-buys"
- ✅ "Multi-Database Correlation" → "We Check Everything"
- ✅ "NTSB, CADORS, SDR..." → "Accident history, liens, sanctions, and 12+ databases"
- ✅ "AI Forensic Analysis" → "Smart Analysis"
- ✅ "Neural synthesis..." → "AI reads the logs and spots issues humans miss"
- ✅ "High-Confidence Outcomes" → "Know Before You Go"
- ✅ "Role-specific dashboards..." → "Get the full story before you buy, sell, or sign off"

---

## 🔄 RECOMMENDED CHANGES FOR DASHBOARDS

### Buyer Dashboard (MinimalBuyerTest.jsx)

#### Header
- "Buyer Mode" → "Pre-Buy Check"
- "The Risk Radar" → "What's Wrong With This Plane?"

#### Search Section
- "Scan Risk Profile" → "Run Background Check"
- "Scanning..." → "Checking..."

#### Results Section
- "Hero Metric" → "Bottom Line"
- "Risk Assessment" → "Should I Buy This Plane?"
- "Critical Alerts" → "Red Flags"
- "No Critical Issues Detected" → "Looks Clean"
- "Mission Fit" → "The Numbers"
- "AI Advisory" → "Our Take"

#### Red Flag Labels
- "Accident History" → "Crash History" or "Bent Metal"
- "Active Lien" → "Money Owed"
- "Sanctions Hit" → "Legal Issues"
- "Logbook Gaps" → "Missing Logbook Pages"
- "Dormant Aircraft" → "Been Sitting Too Long"

---

### Seller Dashboard (SellerDashboardStandalone.jsx)

#### Header
- "Seller Mode" → "Selling Mode"
- "The Value Vault" → "Prove Your Price"

#### Search Section
- "Generate Value Report" → "Show Me What It's Worth"
- "Analyzing..." → "Crunching numbers..."

#### Results Section
- "Hero Metric" → "Your Selling Power"
- "Market Alpha Score" → "How Good Is This Deal?"
- "Price Shield" → "Why It's Worth It"
- "Market Demand" → "Buyer Interest"
- "Market Positioning Statement" → "What To Tell Buyers"

#### Price Shield Items
- "Zero Accident History" → "Never Been Damaged"
- "Clear Title" → "No Money Owed"
- "Complete Logbooks" → "All Logs Since Day One"
- "Actively Flown" → "Flown Regularly"
- "Modern Avionics" → "Updated Panel"
- "Low Corrosion Risk" → "Hangared, Not Corroded"

---

### Mechanic Dashboard (MechanicDashboardStandalone.jsx)

#### Header
- "A&P MODE" → "MECHANIC MODE"
- "LOGBOOK AUDIT CONSOLE" → "PRE-BUY INSPECTION"

#### Search Section
- "Aircraft Tail Number" → "Tail Number"
- "AUDIT" → "INSPECT"
- "SCANNING..." → "CHECKING..."

#### Results Section
- "LOGBOOK ANALYSIS" → "LOGBOOK CHECK"
- "OCR CONFIDENCE" → "READ QUALITY"
- "PAGES SCANNED" → "PAGES CHECKED"
- "RECORD CONTINUITY" → "LOGBOOK COMPLETENESS"
- "CRITICAL GAPS" → "MISSING ENTRIES"
- "AD COMPLIANCE" → "AD STATUS"
- "SIGN-OFF RECOMMENDATION" → "AIRWORTHINESS CALL"

#### AD Status Labels
- "VERIFIED" → "DONE"
- "PENDING" → "NEEDS CHECK"
- "OVERDUE" → "PAST DUE"
- "CHECK" → "LOOK AT THIS"
- "UNKNOWN" → "NO DATA"

---

## 📝 WRITING STYLE GUIDE

### DO:
- ✅ "Crash history" instead of "NTSB incident reports"
- ✅ "Money owed" instead of "Active lien"
- ✅ "Missing pages" instead of "Logbook continuity gaps"
- ✅ "Been sitting" instead of "Dormancy analysis"
- ✅ "Bent metal" instead of "Structural damage"
- ✅ "Panel" instead of "Avionics suite"
- ✅ "Squawk" instead of "Maintenance discrepancy"
- ✅ "Annual" instead of "Annual inspection"
- ✅ "Logs" instead of "Maintenance records"
- ✅ "Hangar queen" (keep this - it's pilot slang!)

### DON'T:
- ❌ "Forensic correlation"
- ❌ "Neural synthesis"
- ❌ "Compliance audit"
- ❌ "Regulatory databases"
- ❌ "Stakeholder outcomes"
- ❌ "Market velocity"
- ❌ "Custody forensic"
- ❌ "SIGINT audit"

### TONE:
- **Conversational**: Like talking to another pilot at the FBO
- **Direct**: Get to the point
- **Honest**: Don't sugarcoat problems
- **Practical**: Focus on what matters for the decision

### EXAMPLES:

**Before**: "Multi-source regulatory database correlation reveals zero NTSB incident filings"
**After**: "No crash history found"

**Before**: "Logbook continuity analysis indicates temporal gaps in maintenance documentation"
**After**: "Missing some logbook pages"

**Before**: "Market alpha positioning indicates above-average valuation potential"
**After**: "This plane is worth more than average"

**Before**: "AD compliance verification status pending"
**After**: "Need to check if this AD was done"

---

## 🎯 PRIORITY CHANGES

### High Priority (User-Facing)
1. ✅ Landing page taglines
2. ✅ Card descriptions
3. Dashboard headers
4. Button labels
5. Result section titles

### Medium Priority (In-Dashboard)
6. Red flag labels
7. Status indicators
8. Metric names

### Low Priority (Technical)
9. Error messages
10. Loading states
11. Tooltips

---

## 📊 BEFORE/AFTER EXAMPLES

### Landing Page
**Before**: "High-Confidence Outcomes for Every Stakeholder"
**After**: "Know what you're buying, selling, or signing off on"

### Buyer Dashboard
**Before**: "Risk Assessment: 72/100 - HIGH RISK"
**After**: "Should I Buy This Plane? 72/100 - WALK AWAY"

### Seller Dashboard
**Before**: "Market Alpha Score: 85 - PREMIUM POSITIONING"
**After**: "How Good Is This Deal? 85 - BETTER THAN MOST"

### Mechanic Dashboard
**Before**: "AD Compliance Verification: 5 PENDING"
**After**: "AD Status: 5 NEED TO CHECK"

---

**Last Updated**: January 21, 2026
**Status**: Landing page complete, dashboards pending implementation

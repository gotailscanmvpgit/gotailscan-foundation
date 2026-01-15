# Plan: Paid Experience Refresh

## Objective
Elevate the "Paid Success" experience (`/success`) from a simple unlocked view to a premium, immersive **Forensic Command Center**. The goal is to make the user feel like they've unlocked a high-value, professional tool immediately after payment.

---

## 1. UX/UI Enhancements ("The Wow Factor")

### **A. "Forensic Command Center" Layout**
Instead of just un-blurring cards, transition the entire UI to a dedicated "Report Dashboard" mode.
- **Top Bar**: "CONFIDENTIAL // FORENSIC REPORT // [TAIL_NUMBER]"
- **Sticky Actions**: "Download PDF", "Share", "Refresh Data"
- **Dark Mode Enhancement**: Deeper blacks, brighter neon accents for data points.

### **B. New "Flight Path" Visualization**
Replace the static map image with a more dynamic visualization:
- **Interactive Globe/Map**: Use `react-leaflet` or `pigeon-maps` (lightweight) to show actual recent flight paths (mocked lat/long for now).
- **Animated Flight Lines**: Tracing the last 5 reported positions.

### **C. "Timeline of Truth" Component**
A vertical timeline component showing the aircraft's life story:
- **Manufacture Date**
- **Ownership Changes** (Churn alerts)
- **Incidents/Accidents** (Red flags)
- **Last Flight**

---

## 2. New Features for Paid Users

### **A. "Refresh Data" Capability** 🔄
*The core of the "Paid Refresh"*
- **Logic**: Markets change. Scans get old.
- **Feature**: A "REFRESH FORENSIC SCAN" button.
- **Policy**:
  - Free refresh within 24 hours.
  - Discounted refresh (50% off) after 24 hours.
- **Implementation**: Re-triggers `scraperService` and updates `flight_cache`.

### **B. PDF Report Generation** 📄
- **Library**: `react-pdf` or `jspdf`.
- **Content**: A professional, 3-page forensic dossier.
  - Page 1: Executive Summary & Risk Score.
  - Page 2: Incident History (NTSB/CADORS).
  - Page 3: Utilization & Valuation Logic.

### **C. "Share Secure Link"** 🔗
- Generate a obscure UUID link (e.g., `gotailscan.com/report/7x9d8f...`)
- Allow buyers to email this directly to partners/banks/mechanics.

---

## 3. Implementation Roadmap

### **Phase 1: UI Polish (Immediate)**
- [ ] Create `ForensicDashboard.jsx` component.
- [ ] Move "Success" logic out of `Hero.jsx` into this new distinct view.
- [ ] Add "Confidential" watermarks and professional branding.

### **Phase 2: Functional Depth (1-2 Days)**
- [ ] Implement "Refresh Data" button.
- [ ] Build "Timeline" visualization component.
- [ ] Mock up the PDF export function.

### **Phase 3: Persistence (Requires Auth)**
- [ ] Save reports to Supabase `reports` table.
- [ ] Create "My Hangar" to view past scans.

---

## 4. Immediate Action Item
**Refactor `Hero.jsx` to render a dedicated `PaidReportView` component when `isPaid` is true.** This separates the "Marketing/Sales" code from the "Product/App" code, allowing us to make the paid experience much richer without cluttering the landing page.

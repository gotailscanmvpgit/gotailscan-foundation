# GoTailScan - Quick Start Guide

## 🚀 Getting Started

### Access the App
```
http://localhost:5175
```

### Three Dashboards Available

#### 1. **Buyer Dashboard** (Green Card)
- **Route**: `/buyer`
- **Purpose**: Risk analysis before purchase
- **Test**: Enter `C-GJED` and click "Scan Risk Profile"

#### 2. **Seller Dashboard** (Blue Card)  
- **Route**: `/seller`
- **Purpose**: Prove aircraft value
- **Test**: Enter `C-GJED` and click "Generate Value Report"

#### 3. **Mechanic Dashboard** (Orange Card)
- **Route**: `/mechanic`
- **Purpose**: Logbook & AD compliance audit
- **Test**: Enter `C-GJED` and click "AUDIT"

---

## 📁 Key Files

### Components
```
src/components/
├── SimpleGateway.jsx                # Landing page
├── MinimalBuyerTest.jsx             # Buyer dashboard
├── SellerDashboardStandalone.jsx    # Seller dashboard
└── MechanicDashboardStandalone.jsx  # Mechanic dashboard
```

### Configuration
```
src/App.jsx                          # Router configuration
src/services/scraperService.js       # API service
```

### Documentation
```
TECHNICAL_DOCUMENTATION.md           # Full technical docs
DASHBOARD_GUIDE.md                   # User-facing guide
README.md                            # Project overview
```

---

## 🎯 What Each Dashboard Shows

### Buyer Dashboard
✅ **Risk Score** (0-100, color-coded)  
✅ **Critical Alerts** (accidents, liens, sanctions, gaps)  
✅ **Mission Fit** (value, year, tax benefits)  
✅ **AI Advisory** (technical recommendations)

### Seller Dashboard
✅ **Market Alpha Score** (0-100, market positioning)  
✅ **Price Shield** (positive forensic markers)  
✅ **Market Demand** (buyer interest, days on market)  
✅ **Value Proposition** (AI-generated marketing)

### Mechanic Dashboard
✅ **Logbook Analysis** (OCR confidence, continuity score)  
✅ **AD Compliance** (checklist with status codes)  
✅ **Quick Stats** (verified/pending/overdue counts)  
✅ **Sign-Off Recommendation** (AI advisory for A&P)

---

## 🔧 Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Deploy backend
supabase functions deploy orchestrateForensicScan --no-verify-jwt
```

---

## 🐛 Troubleshooting

### Blank Page
- Check browser console for errors
- Verify all imports use correct paths
- Ensure scraperService uses dynamic import

### API Errors
- Check Supabase function is deployed
- Verify environment variables are set
- Check network tab for failed requests

### Styling Issues
- All styles are inline (no external CSS)
- Check for typos in style objects
- Verify color values are valid

---

## 📊 Test Data

**Good Aircraft**: `C-GJED`
- Low risk score
- High market alpha
- Clean compliance

**Use for testing all three dashboards**

---

## ✅ Deployment Checklist

- [ ] All three dashboards render correctly
- [ ] Search functionality works
- [ ] Data displays properly
- [ ] Navigation between pages works
- [ ] Mobile responsive
- [ ] Backend function deployed
- [ ] Environment variables set

---

## 📞 Quick Reference

**Landing Page**: http://localhost:5175  
**Buyer**: http://localhost:5175/buyer  
**Seller**: http://localhost:5175/seller  
**Mechanic**: http://localhost:5175/mechanic  

**Backend Function**: `orchestrateForensicScan`  
**API Method**: `scraperService.scanTailNumber(tailNumber)`

---

**For detailed information, see `TECHNICAL_DOCUMENTATION.md`**

# goTailScan Production Deployment Guide

## ✅ Build Status
Production build completed successfully on 2026-01-21

**Build Output:**
- `dist/index.html` - 0.47 kB (gzipped: 0.30 kB)
- `dist/assets/index-CTW0-aeu.css` - 108.51 kB (gzipped: 16.03 kB)
- `dist/assets/scraperService-DBgNnoog.js` - 183.65 kB (gzipped: 50.14 kB)
- `dist/assets/index-C4oVZol4.js` - 313.40 kB (gzipped: 95.20 kB)

Total build time: 4.89s

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Deploy to production
vercel --prod

# Link to custom domain gotailscan.com
vercel domains add gotailscan.com
```

### Option 2: Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy to production
netlify deploy --prod --dir=dist

# Configure custom domain in Netlify dashboard
```

### Option 3: Manual Deployment
Upload the `dist/` folder contents to your web server:
- Ensure the server is configured for SPA routing (all routes → index.html)
- Configure SSL certificate for gotailscan.com
- Set up CDN if needed

## 🔧 Environment Variables Required

Ensure these are set in your production environment:

```env
VITE_SUPABASE_URL=https://gwwyzrzbkhnebmslpuzb.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

## 📋 Pre-Deployment Checklist

- [x] Production build completed
- [x] All telemetry features tested
- [x] Supabase functions deployed
- [x] JetBrains Mono font loaded
- [x] Command Interface implemented
- [x] Mission Profile instructions active
- [ ] Custom domain DNS configured
- [ ] SSL certificate verified
- [ ] Environment variables set

## 🌐 DNS Configuration for gotailscan.com

Add these DNS records at your domain registrar:

**For Vercel:**
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**For Netlify:**
```
Type: A
Name: @
Value: 75.2.60.5

Type: CNAME
Name: www
Value: <your-site-name>.netlify.app
```

## 🎯 Post-Deployment Verification

1. Visit https://gotailscan.com
2. Test Command Interface (search bar with lens switcher)
3. Verify all three dashboards:
   - Buyer: SalinityIndex + Dormancy Caution
   - Seller: MaintenanceAlpha + Certified Value Badge
   - Mechanic: Split-Screen Comparison
4. Test tail number searches (N30HQ, N182MU, C-GJED)
5. Verify Supabase function connectivity

## 📊 Features Deployed

### Landing Page
- Command Interface with omnisearch bar
- Mission Profile instructions (dynamic hover text)
- Lens switcher (Radar/Vault/Tools)
- Mechanic slide-up zone for logbook uploads
- JetBrains Mono font for logo

### Buyer Dashboard
- **SalinityIndex**: Coastal corrosion risk assessment
- **Dormancy Caution**: Aircraft inactivity alerts (>45 days)
- Risk scoring and red flag detection

### Seller Dashboard
- **MaintenanceAlpha**: Fleet comparison metric
- **Certified Value Badge**: AD compliance verification
- Market Alpha Score and Price Shield

### Mechanic Dashboard
- **Split-Screen Comparison**: TC AD Registry vs OCR logs
- Mismatch highlighting in red
- AD compliance checklist
- Logbook OCR analysis

## 🔐 Security Notes

- All API keys are environment variables (not in code)
- Supabase RLS policies active
- CORS configured for gotailscan.com
- HTTPS enforced

## 📞 Support

For deployment issues, check:
- Vercel Dashboard: https://vercel.com/dashboard
- Supabase Dashboard: https://supabase.com/dashboard/project/gwwyzrzbkhnebmslpuzb
- Build logs in `dist/` folder

---

**Deployment Date**: 2026-01-21  
**Version**: 1.0.0  
**Platform**: goTailScan Aviation Forensics

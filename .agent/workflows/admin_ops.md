---
description: Official Admin Dashboard and Operations Manual
---

# Admin Dashboard & Operations

This workflow provides a set of tools to administer `gotailscan.com` directly from the Antigravity chat interface.

## 🛠 Admin Tools

### System Health Check
Check the status of the database connection and core services.
```bash
node scripts/admin.cjs health
```

### View User Activity
See the last 10 searches performed on the platform.
```bash
node scripts/admin.cjs users
```

### System Statistics
View total counts of cached aircraft, forensic records, and users.
```bash
node scripts/admin.cjs stats
```

### Lookup / Scan Aircraft
Manually check the database for a specific tail number.
```bash
node scripts/admin.cjs scan <TAIL_NUMBER>
```
*(Replace `<TAIL_NUMBER>` with the actual tail, e.g., `N12345`)*

## 🔄 Emergency Operations

### Ingest FAA Master Database
If the cache is empty or stale, re-run the ingestion script.
```bash
node scripts/import_faa_db.cjs
```

### Sync Transaction History
If a payment is lost or not showing up, verify Stripe events (requires Stripe CLI):
```bash
stripe events list --limit 5
```

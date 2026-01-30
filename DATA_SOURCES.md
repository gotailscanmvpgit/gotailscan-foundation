
# 📂 Government Data Source Links

To enable real forensic data in your application, please download the following datasets and place them in the `database/` folder of your project root.

---

### 1. FAA Service Difficulty Reports (SDR)
*   **Description:** Tracks mechanical failures and maintenance defects reported by mechanics.
*   **Download URL:** [FAA SDR Database Download](httplease dwnload all this data sources 
ps://www.faa.gov/data_research/aviation_data_statistics/service_difficulty_reports)
*   **Action:** Download the "SDR Master" CSV file (usually named `SDR_Master_YYYY.csv`).
*   **Rename to:** `database/sdr_data.csv`
*   **Run Script:** `node scripts/import_forensic_sdr.cjs`

---

### 2. NTSB Aviation Accident Database
*   **Description:** Official record of US aviation accidents and incidents.
*   **Download URL:** [NTSB Microsoft Access Database](https://www.ntsb.gov/Pages/AviationQueryV2.aspx) (Look for "Download Data (Access MDB)")
    *   *Note: You may need to export the main `events` table to CSV using Microsoft Access or an MDB viewer tool.*
*   **Rename to:** `database/ntsb_incidents.csv`
*   **Run Script:** `node scripts/import_forensic_ntsb.cjs` (You may need to create this script based on the SDR one)

---

### 3. Transport Canada CADORS (Civil Aviation Daily Occurrence Reporting System)
*   **Description:** Canadian equivalent of NTSB/SDR combined. Tracks all aviation occurrences in Canada.
*   **Download URL:** [Government of Canada Open Data Portal - CADORS](https://search.open.canada.ca/en/od/id/40ec0575-d227-44d5-8378-05244e870024)
*   **Action:** Download the **"National"** CSV dataset.
*   **Rename to:** `database/cadors_aircraft.csv`
*   **Run Script:** `node scripts/import_forensic_cadors.cjs`

---

### 4. FAA Aircraft Registry (Master & ACFTREF)
*   **Description:** The complete US Aircraft Registry and Model Reference.
*   **Method 1 (Automatic Efficiency):**
    *   **Run Script:** `node scripts/extreme_delta_sync.cjs`
    *   **What it does:** Downloads the latest FAA zip, extracts MASTER.txt and ACFTREF.txt, and syncs both to Supabase. It uses conditional caching (Header Check) to only sync if data has changed.
*   **Method 2 (Manual):**
    *   **Download:** [FAA Releasable Database](https://www.faa.gov/licenses_certificates/aircraft_certification/aircraft_registry/releasable_aircraft_download)
    *   **Extract:** Place `MASTER.txt` and `ACFTREF.txt` in `database/`.
    *   **Run:** `node scripts/ingest_faa_master.cjs`

---

### 5. Transport Canada Civil Aircraft Register (CCAR)
*   **Description:** The complete Canadian Civil Aircraft Register.
*   **Run Script:** `node scripts/tc_delta_sync.cjs`
*   **What it does:** Automatically fetches the Canadian database, joins aircraft specs with owner data, and standardizes them with the `C-` prefix in our local mirror.

---

## ⚡ Extreme Efficiency: Pre-Syncing
To "warm the cache" for high-volume searches (like newest aircraft or popular models), use the pre-sync flag:
```bash
node scripts/extreme_delta_sync.cjs --pre-sync
```

**⚠️ Important:** These files can be large (hundreds of MBs). Ensure your database has enough storage space allocated.

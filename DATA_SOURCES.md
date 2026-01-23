
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

### 4. FAA Aircraft Registry (Master)
*   **Description:** The "Phone book" of all US active aircraft. You likely already have this, but updating it monthly is good practice.
*   **Download URL:** [FAA Releasable Aircraft Database](https://www.faa.gov/licenses_certificates/aircraft_certification/aircraft_registry/releasable_aircraft_download)
*   **File:** `MASTER.txt` (This is a CSV-like file)
*   **Rename to:** `database/MASTER.txt`
*   **Run Script:** `node scripts/ingest_faa_master.cjs`

---
**⚠️ Important:** These files can be large (hundreds of MBs). Ensure your database has enough storage space allocated.

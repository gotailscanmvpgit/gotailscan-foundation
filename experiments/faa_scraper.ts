
// EXPERIMENT: Fetching FAA Registry Data
// We will try to fetch the FAA Registry page for a known N-Number.
// N-Number to test: N12345 (Example)

import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

async function scrapeFAA(nNumber) {
    console.log(`Searching FAA Registry for ${nNumber}...`);

    // FAA Registry URL pattern (This is the standard public query URL)
    const url = `https://registry.faa.gov/aircraftinquiry/Search/NNumberResult?nNumberTxt=${nNumber}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`FAA Site returned ${response.status}`);
        }

        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, "text/html");

        // The FAA site uses specific IDs for data fields. 
        // We need to extract them.

        const make = doc.getElementById('ctl00_content_lblMfrName')?.textContent?.trim() || 'Unknown';
        const model = doc.getElementById('ctl00_content_lblModelName')?.textContent?.trim() || 'Unknown';
        const year = doc.getElementById('ctl00_content_lblMfrYear')?.textContent?.trim() || 'Unknown';
        const serial = doc.getElementById('ctl00_content_lblSerialNo')?.textContent?.trim() || 'Unknown';
        const owner = doc.getElementById('ctl00_content_lblName')?.textContent?.trim() || 'Unknown';

        console.log("--- FAA DATA FOUND ---");
        console.log("Make:", make);
        console.log("Model:", model);
        console.log("Year:", year);
        console.log("Serial:", serial);
        console.log("Owner:", owner);

        return { make, model, year, serial, owner };

    } catch (error) {
        console.error("Scrape failed:", error.message);
        return null;
    }
}

// Test Run
scrapeFAA("N12345");
scrapeFAA("N99999");

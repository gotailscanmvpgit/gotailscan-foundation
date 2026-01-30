---
description: Enhance the Buyer Dashboard with Mission Fit Intelligence
---

# Buyer Dashboard Enhancement: Mission Fit & HUD Integration

This workflow documents the process of upgrading the Buyer Dashboard to include a high-fidelity "Mission Fit" analysis and a G3000-inspired HUD interface.

1.  **Backend Logic Update (`orchestrateForensicScan/index.ts`)**:
    *   Import `getPerformanceProfile` from `buyerLogic.ts`.
    *   Integrate real aircraft performance data (Range, Cruise Speed, Useful Load) into the `mission_analysis` calculation.
    *   Implement dynamic scoring for "Mission Fit" based on user-implied mission profiles (e.g., "Cross-Country Business" vs. "Regional Family Trips").
    *   Return a structured `mission_analysis` object with verdict, detailed reasoning, and performance pillars.

2.  **Frontend Component Update (`BuyerSummaryHUD.jsx`)**:
    *   Create `BuyerSummaryHUD` component with a layout inspired by aviation avionics (Garmin 3000).
    *   Display Mission Fit, Risk Score, and Market Alpha in high-visibility circular gauges.
    *   Show a clear "Verdict" (e.g., "PRIME ACQUISITION", "HIGH RISK") based on the backend intelligence.
    *   Visualize key pillars: Safety, Economics, and Mission alignment.
    *   Ensure data keys match the backend response (e.g., `result.performance` for specs).

3.  **Dashboard Integration (`BuyerDashboard.jsx`)**:
    *   Replace fragment metrics with the new `BuyerSummaryHUD`.
    *   Ensure fallback to Critical Alerts and AI Intelligence detailed panels for deeper analysis.
    *   Maintain the "Red Flags" panel for critical safety warnings (NTSB accidents, active liens).

4.  **Verification**:
    *   Deploy the Edge Function: `npx supabase functions deploy orchestrateForensicScan`.
    *   Test with known tails (e.g., `N503DL`) to verify the Mission Fit score and HUD rendering.

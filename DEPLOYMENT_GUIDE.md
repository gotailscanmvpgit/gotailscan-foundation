# GoTailScan Deployment & Testing Guide

## 1. Local Testing (Limited)
Because the app uses serverless API functions (`/api/create-checkout-session`), the **payment buttons will NOT work** when running standard `npm run dev`.

- **Works Locally:** Text changes, Styles, Hero Animation, Search Input (Simulation).
- **Fails Locally:** "Order" Buttons (will show an API connection error), PDF Generation.

To test the **full payment flow locally**, you must use the Vercel CLI:
```bash
npm i -g vercel
vercel dev
```

## 2. Production Deployment (Vercel)
This is the recommended way to verify the entire system.

### Step-by-Step Verification:

1.  **Deploy:** Import repo to Vercel and wait for the green "Ready" state.
2.  **Verify Loading:** Open the production URL (e.g., `gotailscan-mvp.vercel.app`).
    *   *Check:* Do the animations load smoothly?
    *   *Check:* Is the "Mission Control" badge visible?
3.  **Verify Search:**
    *   Enter a test tail number: `N12345`.
    *   Click "Scan".
    *   *Success:* Should scroll down to the "Pricing Grid" with the "Pro Forensic" card glowing.
4.  **Verify Payments (The Critical Test):**
    *   Click "ORDER PRO FORENSIC" ($99).
    *   **Success:** You should be redirected to a **Stripe Checkout Page**.
    *   **Failure:** If it alerts "Payment system initializing", check your Vercel Environment Variables (`STRIPE_SECRET_KEY` missing).
    *   **Failure:** If it stays on the page or 404s, ensure `vercel.json` is present in the repo.

## 3. Stripe Logic Verification
The API has a smart fallback:
- **If Keys are Present:** Creates a REAL session (User can pay real money).
- **If Keys are Missing:** Simulates a "Loading..." delay and redirects to the Success page (Safe for testing navigation without paying).

**Recommendation:** For the first deployment, **do NOT** add the Stripe keys yet. Deploy and test the UI flow (it will use Simulation Mode). Once satisfied, add the keys to "Go Live".

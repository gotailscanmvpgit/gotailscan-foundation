
import { assertEquals, assert, assertAlmostEquals } from "https://deno.land/std@0.192.0/testing/asserts.ts";
import {
    predictSalesLikelihood,
    getTransparency,
    getJurisdictionProfile,
    calculateHQRI,
    getTaxBenefits
} from "./sellerLogic.ts";

Deno.test("Seller Logic - Sales Likelihood (Hunter)", () => {
    // Case 1: Dormant Owner, Long Ownership, High Demand
    // Dormancy: 7mo (+45), Ownership: 25yr (+25), DaysOnMarket: 10 (+10), Base: 15
    // Total: 15+45+25+10 = 95 -> LIKELY LISTING SOON
    const likely = predictSalesLikelihood(7, 25, 30, 10, "SN123");
    assertEquals(likely.score, 95);
    assertEquals(likely.label, "LIKELY LISTING SOON");
    assertEquals(likely.channel.method, "DIRECT_TO_OWNER");

    // Case 2: Active Owner, New Purchase, Cold Market
    // Dormancy: 0mo (0), Ownership: 0yr (+15 Flip risk?), DaysOnMarket: 100 (0), Base: 15
    // Total: 15+15 = 30 -> LONG TERM HOLD
    const hold = predictSalesLikelihood(0, 0, 5, 100, "SN999");
    assert(hold.score <= 35);
    assertEquals(hold.label, "LONG TERM HOLD");
});

Deno.test("Seller Logic - Transparency", () => {
    const trust = getTransparency("Wilmington Trust, Trustee");
    assertEquals(trust.label, "BLACK BOX");
    assertEquals(trust.score, 30);

    const llc = getTransparency("Acme Holdings LLC");
    assertEquals(llc.label, "TINTED BOX");

    const person = getTransparency("John Doe");
    assertEquals(person.label, "GLASS BOX");
});

Deno.test("Seller Logic - Jurisdiction", () => {
    const usa = getJurisdictionProfile("N12345");
    assertEquals(usa.authority, "FAA (USA)");
    assertEquals(usa.flag, "🇺🇸");

    const cad = getJurisdictionProfile("C-GABC");
    assertEquals(cad.authority, "TRANSPORT CANADA / NAV CANADA");
    assertEquals(cad.flag, "🇨🇦");
});

Deno.test("Seller Logic - Hangar Queen Risk (HQRI)", () => {
    const climate = { salinity: 'HIGH', uv_index: 'MODERATE' };

    // Turbine sitting for 2 months in salty air
    // Base: >1mo (+10). Salinity: *1.5. = 15.
    // Trigger: None (>2mo required for Salt trigger).
    // Wait, >2 months logic: if (dormancyMonths > 2) triggers.push("SALT AIR CORROSION");
    // Let's try 3 months.
    // Base: >1mo (+10). Score=10. Salt *1.5 = 15.

    // Let's try deep rot. 13 months.
    // Base: +10, +25, +40, +80 = 155? 
    // Wait, the logic is additive IF statements, not ELSE IF.
    // if (dormancyMonths > 1) score += 10;
    // if (dormancyMonths > 3) score += 25;
    // ...
    // So 13 months: 10 + 25 + 40 + 80 = 155.
    // Salt *1.5 = 232.
    // Cap at 100.

    const rot = calculateHQRI(13, climate, "Cessna Citation");
    assertEquals(rot.score, 100);
    assertEquals(rot.level, "CRITICAL");
    assert(rot.triggers.includes("SALT AIR CORROSION"));
    // Turbine seals? >12mo.
    assert(rot.triggers.includes("SEAL DRY ROT"));

    const pristine = calculateHQRI(0, { salinity: 'LOW' }, "PC-12");
    assertEquals(pristine.score, 0);
    assertEquals(pristine.level, "LOW");
});

Deno.test("Seller Logic - Tax Benefits", () => {
    // Current year logic depends on server time. 
    // Logic: 2025 -> 40%, 2026 -> 20%.
    // We are in 2026.
    const benefits = getTaxBenefits(1000000);
    // At turn 1 (2026-01-26), expected 20%.
    // 20% of 1M = 200k.
    assertEquals(benefits.bonus_depreciation_rate, "20%");
    assertEquals(benefits.year_1_deduction, 200000);
});


import { assertEquals, assert, assertAlmostEquals } from "https://deno.land/std@0.192.0/testing/asserts.ts";
import {
    createRandom,
    getBasePrice,
    getOperatingCosts,
    getMarketVelocity,
    getPerformanceProfile,
    analyzeAvionics,
    predictMaintenance,
    generateMarketHistory,
    getStateClimate,
    getCoordinates
} from "./buyerLogic.ts";

Deno.test("Logic Engine - Random Generator", () => {
    const random1 = createRandom("N12345");
    const val1 = random1(0);
    const val2 = random1(0);
    assertEquals(val1, val2, "Random generator must be deterministic");

    const random2 = createRandom("N99999");
    assert(random1(0) !== random2(0), "Different seeds should produce different values");
});

Deno.test("Logic Engine - Base Price", () => {
    assertEquals(getBasePrice("Cessna 172"), 185000);
    assertEquals(getBasePrice("Gulfstream G650"), 15000000);
    assertEquals(getBasePrice("Unknown Aircraft"), 250000);
});

Deno.test("Logic Engine - Operating Costs", () => {
    const costs = getOperatingCosts("Cirrus SR22");
    assertEquals(costs.fuel_type, "Avgas");
    assert(costs.total_hourly_direct > 0);

    const jetCosts = getOperatingCosts("Citation CJ3");
    assertEquals(jetCosts.fuel_type, "Jet-A");
    assert(jetCosts.total_hourly_direct > costs.total_hourly_direct);
});

Deno.test("Logic Engine - Market Velocity", () => {
    const vel = getMarketVelocity("Cessna 172");
    assertEquals(vel.liquidity, "HIGH");

    const slow = getMarketVelocity("Unknown");
    assertEquals(vel.liquidity, "HIGH"); // Wait, Cessna 172 is HIGH
});

Deno.test("Logic Engine - Performance Profile", () => {
    const perf = getPerformanceProfile("Pilatus PC-12");
    assertEquals(perf.cruise_speed, 280);
    assertEquals(perf.useful_load, 2800);
});

Deno.test("Logic Engine - Avionics Analysis", () => {
    const random = createRandom("TEST");

    const recent = analyzeAvionics(2020, "Cirrus SR22", random);
    assert(recent.score > 80, "New aircraft should have high avionics score");
    assertEquals(recent.verdict, "MARKET LEADER");

    const old = analyzeAvionics(1980, "Cessna 172", random);
    // Score based on year 1980 (<1996) is 30.
    // Verdict "OBSOLETE".
    assertEquals(old.score, 30);
    assertEquals(old.verdict, "OBSOLETE");
});

Deno.test("Logic Engine - Predictive Maintenance", () => {
    const dormancy = { last_flight_gap: 1 };
    const fleet = { top_reliability_issues: [] };

    const maint = predictMaintenance("Cessna 172", 1990, fleet, dormancy);
    assert(maint.pag_score >= 0 && maint.pag_score <= 100);
    assertEquals(maint.system_type, "PAG-AI (RECIPROCATING)");

    const turbineMaint = predictMaintenance("Citation X", 2010, fleet, dormancy);
    assertEquals(turbineMaint.system_type, "PAG-AI (TURBINE)");
});

Deno.test("Logic Engine - Market History", () => {
    const random = createRandom("HIST");
    const history = generateMarketHistory(500000, random); // 500k current value
    assertEquals(history.length, 6);

    // Sort logic in function: Pushes 2021, then 2022... then 2026.
    // So history[5] is 2026.
    assertEquals(history[5].year, new Date().getFullYear());
    assertEquals(history[0].year, new Date().getFullYear() - 5);

    // Check price stability
    assertAlmostEquals(history[5].price, 500000, 50000);
});

Deno.test("Logic Engine - Climate & Coordinates", () => {
    const fl = getStateClimate("FL");
    assertEquals(fl.salinity, "HIGH");

    const az = getStateClimate("AZ");
    assertEquals(az.salinity, "LOW");
    assertEquals(az.uv_index, "INTENSE");

    const coords = getCoordinates("NY", "USA");
    assert(coords.lat === 43.0);

    const defaultCoords = getCoordinates("XX", "Unknown");
    assert(defaultCoords.lat === 39.8);
});

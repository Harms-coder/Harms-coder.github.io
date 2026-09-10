/*
 * Selvtjek af skiveberegningen. Køres med `node scripts/plates.check.ts` (Node kan selv
 * fjerne typerne). Ingen testramme — det er den mindste ting, der fejler hvis logikken
 * knækker, og afrunding på 1,25/2,5 kg er nemt at ødelægge uden at opdage det.
 */
import assert from "node:assert/strict";
import { BAR_KG, formatPlates, isBarbellExercise, platesPerSide } from "../src/lib/plates.ts";

// Tom stang
assert.deepEqual(platesPerSide(20), { perSide: [], leftoverKg: 0 });

// Under stangens vægt giver ingen plan
assert.equal(platesPerSide(15), undefined);
assert.equal(platesPerSide(Number.NaN), undefined);

// 100 kg = 20 kg stang + 40 kg pr. side
assert.deepEqual(platesPerSide(100)?.perSide, [25, 15]);

// De små skiver: 102,5 kg → 41,25 pr. side
assert.deepEqual(platesPerSide(102.5)?.perSide, [25, 15, 1.25]);

// Afrunding: 61,25 kg → 20,625 pr. side kan ikke lægges præcist
const odd = platesPerSide(61.25);
assert.deepEqual(odd?.perSide, [20]);
assert.equal(odd?.leftoverKg, 1.25);

// Ingen flydende-tal-rester
for (let kg = BAR_KG; kg <= 300; kg += 1.25) {
  const plan = platesPerSide(kg);
  if (!plan) throw new Error(`ingen plan for ${kg}`);
  const sum = BAR_KG + plan.perSide.reduce((a, b) => a + b, 0) * 2 + plan.leftoverKg;
  assert.ok(Math.abs(sum - kg) < 1e-9, `${kg} kg gav ${sum}`);
  assert.ok(plan.leftoverKg >= 0 && plan.leftoverKg < 2.5, `urimelig rest ved ${kg}: ${plan.leftoverKg}`);
}

assert.equal(formatPlates([25, 15, 1.25]), "25 + 15 + 1,25");

// Heuristikken skal skelne stang fra håndvægt
assert.equal(isBarbellExercise("Flad bænkpres med vægtstang"), true);
assert.equal(isBarbellExercise("Squat med vægtstang"), true);
assert.equal(isBarbellExercise("Flad bænkpres med håndvægte"), false);
assert.equal(isBarbellExercise("Kettlebell swing"), false);
assert.equal(isBarbellExercise("Leg extension"), false);

console.log("plates.check.ts: alle tjek bestået");

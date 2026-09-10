/*
 * Selvtjek af appens rene beregninger. Køres med `npm run check` — Node fjerner selv
 * typerne, så der er ingen testramme og ingen ekstra afhængighed.
 *
 * Kun logik der er svær at se er gal med det blotte øje står her: dato-regler, streaks,
 * fremskrivning og skiveberegning. Ting man opdager med det samme i UI'et testes ikke.
 */
import assert from "node:assert/strict";
import { getWeekMonthKey, getWeekNumber, getWeekStart } from "../src/lib/date.ts";
import { BAR_KG, formatPlates, isBarbellExercise, platesPerSide } from "../src/lib/plates.ts";
import { computeProjectedGoalDate } from "../src/lib/projection.ts";
import { computeActivityWeekStreak, computeWeeklyStreak } from "../src/lib/streak.ts";
import type { BodyweightEntry, CardioEntry, WorkoutSession } from "../src/types/index.ts";

let checks = 0;
function check(name: string, fn: () => void) {
  fn();
  checks++;
  console.log(`  ✓ ${name}`);
}

console.log("Dato-regler");

check("ugen starter mandag", () => {
  // 2026-09-10 er en torsdag
  assert.equal(getWeekStart("2026-09-10"), "2026-09-07");
  // En søndag hører til ugen der startede mandagen før, ikke den følgende
  assert.equal(getWeekStart("2026-09-13"), "2026-09-07");
  assert.equal(getWeekStart("2026-09-07"), "2026-09-07");
});

check("ISO-ugenummer følger torsdagsreglen", () => {
  // 1. januar 2026 er en torsdag → uge 1
  assert.equal(getWeekNumber("2026-01-01"), 1);
  // 2027-01-01 er en fredag; den uge har sin torsdag i 2026 → uge 53
  assert.equal(getWeekNumber("2027-01-01"), 53);
  // 2024-12-30 er mandag i den uge hvis torsdag ligger i 2025 → uge 1
  assert.equal(getWeekNumber("2024-12-30"), 1);
});

check("en uge hører til den måned dens torsdag ligger i", () => {
  /*
   * Tilfældene her er valgt så onsdag og torsdag falder i HVER SIN måned — ellers tester
   * de ikke reglen. Et første forsøg brugte ugen 31. aug – 6. sep, hvor både onsdag og
   * torsdag ligger i september; det tjek bestod selv når reglen bevidst blev ændret til
   * onsdag, altså testede det ingenting.
   */
  // Ugen 28. sep – 4. okt 2026: onsdag er 30. september, torsdag er 1. oktober
  assert.equal(getWeekMonthKey("2026-09-28"), "2026-10");
  // Årsskifte: ugen 29. dec 2025 – 4. jan 2026 hører til januar
  assert.equal(getWeekMonthKey("2025-12-29"), "2026-01");
  // Ugen 28. apr – 4. maj 2025: onsdag er 30. april, torsdag er 1. maj
  assert.equal(getWeekMonthKey("2025-04-28"), "2025-05");
  // Og en uge midt i en måned skal stadig lande hvor den plejer
  assert.equal(getWeekMonthKey("2026-09-07"), "2026-09");
});

console.log("Streak");

const session = (date: string): WorkoutSession => ({
  id: date + Math.random(),
  date,
  startedAt: `${date}T10:00:00.000Z`,
  endedAt: `${date}T11:00:00.000Z`,
});

check("tæller sammenhængende uger bagud", () => {
  const sessions = [
    ...["2026-09-07", "2026-09-08"], // denne uge: 2
    ...["2026-08-31", "2026-09-01"], // forrige: 2
    ...["2026-08-24", "2026-08-25"], // og en til: 2
  ].map(session);
  assert.equal(computeWeeklyStreak(sessions, 2, "2026-09-07"), 3);
});

check("en uge under målet bryder streaken", () => {
  const sessions = [
    ...["2026-09-07", "2026-09-08"],
    "2026-08-31", // kun 1 træning — under målet på 2
    ...["2026-08-24", "2026-08-25"],
  ].map(session);
  assert.equal(computeWeeklyStreak(sessions, 2, "2026-09-07"), 1);
});

check("en igangværende uge under målet bryder ikke streaken", () => {
  // Mandag morgen, endnu ingen træning i denne uge — de foregående uger tæller stadig
  const sessions = [
    ...["2026-08-31", "2026-09-01"],
    ...["2026-08-24", "2026-08-25"],
  ].map(session);
  assert.equal(computeWeeklyStreak(sessions, 2, "2026-09-07"), 2);
});

check("uafsluttede træninger tæller ikke med", () => {
  const unfinished: WorkoutSession = {
    id: "x",
    date: "2026-09-07",
    startedAt: "2026-09-07T10:00:00.000Z",
  };
  assert.equal(computeWeeklyStreak([unfinished, session("2026-09-08")], 2, "2026-09-07"), 0);
});

check("mål på nul giver ingen streak", () => {
  assert.equal(computeWeeklyStreak([session("2026-09-07")], 0, "2026-09-07"), 0);
});

console.log("Aktivitets-streak i uger");

const run = (date: string): CardioEntry => ({
  id: "c" + date,
  date,
  activity: "Løb",
  distanceKm: 5,
  durationMin: 30,
});

check("styrke og cardio tæller begge som aktivitet", () => {
  // Uge 37: kun løb. Uge 36: kun styrke. Uge 35: begge dele.
  const sessions = ["2026-08-31", "2026-08-24"].map(session);
  const cardio = ["2026-09-09", "2026-08-26"].map(run);
  assert.equal(computeActivityWeekStreak(sessions, cardio, "2026-09-10"), 3);
});

check("en uge helt uden aktivitet bryder streaken", () => {
  // Uge 36 er tom
  const sessions = ["2026-09-07", "2026-08-24"].map(session);
  assert.equal(computeActivityWeekStreak(sessions, [], "2026-09-10"), 1);
});

check("en tom indeværende uge bryder ikke streaken", () => {
  // Intet endnu i uge 37, men uge 36 og 35 var aktive
  const sessions = ["2026-08-31", "2026-08-24"].map(session);
  assert.equal(computeActivityWeekStreak(sessions, [], "2026-09-10"), 2);
});

check("flere aktiviteter i samme uge tæller som én uge", () => {
  const sessions = ["2026-09-07", "2026-09-08", "2026-09-09"].map(session);
  assert.equal(computeActivityWeekStreak(sessions, [run("2026-09-10")], "2026-09-10"), 1);
});

check("uafsluttede træninger tæller ikke, men løbeture gør", () => {
  const unfinished: WorkoutSession = {
    id: "u",
    date: "2026-09-07",
    startedAt: "2026-09-07T10:00:00.000Z",
  };
  assert.equal(computeActivityWeekStreak([unfinished], [], "2026-09-10"), 0);
  assert.equal(computeActivityWeekStreak([unfinished], [run("2026-09-07")], "2026-09-10"), 1);
});

check("ingen aktivitet giver nul", () => {
  assert.equal(computeActivityWeekStreak([], [], "2026-09-10"), 0);
});

console.log("Vægt-fremskrivning");

const weigh = (date: string, weight: number): BodyweightEntry => ({ id: date, date, weight });

check("fremskriver en faldende trend mod et lavere mål", () => {
  // 1 kg ned over 10 dage; 2 kg tilbage til målet → ca. 20 dage frem
  const entries = [weigh("2026-09-01", 82), weigh("2026-09-11", 81)];
  assert.equal(computeProjectedGoalDate(entries, 79), "2026-10-01");
});

check("ingen dato når trenden går væk fra målet", () => {
  // Vægten stiger, men målet er lavere — der findes ingen dato
  const entries = [weigh("2026-09-01", 80), weigh("2026-09-11", 81)];
  assert.equal(computeProjectedGoalDate(entries, 78), undefined);
});

check("ingen dato ved flad eller for kort historik", () => {
  assert.equal(computeProjectedGoalDate([weigh("2026-09-01", 80)], 78), undefined);
  const flat = [weigh("2026-09-01", 80), weigh("2026-09-11", 80)];
  assert.equal(computeProjectedGoalDate(flat, 78), undefined);
});

check("ingen dato når den ligger urimeligt langt ude", () => {
  // 0,01 kg på 10 dage → over 10 år til målet
  const entries = [weigh("2026-09-01", 80), weigh("2026-09-11", 79.99)];
  assert.equal(computeProjectedGoalDate(entries, 70), undefined);
});

check("samme dato to gange giver ingen fremskrivning", () => {
  const entries = [weigh("2026-09-01", 82), weigh("2026-09-01", 81)];
  assert.equal(computeProjectedGoalDate(entries, 79), undefined);
});

console.log("Skiveberegning");

check("tom stang og vægte under stangen", () => {
  assert.deepEqual(platesPerSide(20), { perSide: [], leftoverKg: 0 });
  assert.equal(platesPerSide(15), undefined);
  assert.equal(platesPerSide(Number.NaN), undefined);
});

check("almindelige vægte", () => {
  assert.deepEqual(platesPerSide(100)?.perSide, [25, 15]);
  assert.deepEqual(platesPerSide(102.5)?.perSide, [25, 15, 1.25]);
});

check("vægt der ikke går op oplyses som rest", () => {
  const odd = platesPerSide(61.25);
  assert.deepEqual(odd?.perSide, [20]);
  assert.equal(odd?.leftoverKg, 1.25);
});

check("ingen flydende-tal-rester i hele spændet", () => {
  for (let kg = BAR_KG; kg <= 300; kg += 1.25) {
    const plan = platesPerSide(kg);
    if (!plan) throw new Error(`ingen plan for ${kg}`);
    const sum = BAR_KG + plan.perSide.reduce((a, b) => a + b, 0) * 2 + plan.leftoverKg;
    assert.ok(Math.abs(sum - kg) < 1e-9, `${kg} kg gav ${sum}`);
    assert.ok(plan.leftoverKg >= 0 && plan.leftoverKg < 2.5, `urimelig rest ved ${kg}`);
  }
});

check("stang skelnes fra håndvægt", () => {
  assert.equal(isBarbellExercise("Squat med vægtstang"), true);
  assert.equal(isBarbellExercise("Flad bænkpres med håndvægte"), false);
  assert.equal(isBarbellExercise("Kettlebell swing"), false);
  assert.equal(isBarbellExercise("Leg extension"), false);
  assert.equal(formatPlates([25, 15, 1.25]), "25 + 15 + 1,25");
});

console.log(`\n${checks} tjek bestået.`);

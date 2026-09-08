import { generateId } from "../lib/id";
import type { Exercise } from "../types";
import { getDb } from "./database";

export const EXERCISE_CATEGORIES = [
  "Bryst",
  "Ryg",
  "Ben",
  "Skuldre",
  "Biceps",
  "Triceps",
  "Mave",
  "Baller",
  "Underarme",
  "Helkrop",
] as const;

const DEFAULT_EXERCISES: { name: string; category: string }[] = [
  // Bryst
  { name: "Flad bænkpres med vægtstang", category: "Bryst" },
  { name: "Skrå bænkpres med vægtstang", category: "Bryst" },
  { name: "Flad bænkpres med håndvægte", category: "Bryst" },
  { name: "Skrå bænkpres med håndvægte", category: "Bryst" },
  { name: "Dips (bryst-fokus)", category: "Bryst" },
  { name: "Cable crossover", category: "Bryst" },
  { name: "Pec deck (fly-maskine)", category: "Bryst" },
  { name: "Armstrækninger", category: "Bryst" },
  { name: "Incline dumbbell fly", category: "Bryst" },
  { name: "Decline bænkpres", category: "Bryst" },
  // Ryg
  { name: "Dødløft", category: "Ryg" },
  { name: "Kropshævninger", category: "Ryg" },
  { name: "Lat pulldown", category: "Ryg" },
  { name: "Stående roning med vægtstang", category: "Ryg" },
  { name: "Enarmet roning med håndvægt", category: "Ryg" },
  { name: "Siddende cable-roning", category: "Ryg" },
  { name: "T-bar roning", category: "Ryg" },
  { name: "Rygrejsning", category: "Ryg" },
  { name: "Face pull", category: "Ryg" },
  { name: "Rumænsk dødløft", category: "Ryg" },
  // Ben
  { name: "Squat med vægtstang", category: "Ben" },
  { name: "Front squat", category: "Ben" },
  { name: "Benpres", category: "Ben" },
  { name: "Udfald", category: "Ben" },
  { name: "Goblet squat", category: "Ben" },
  { name: "Leg extension", category: "Ben" },
  { name: "Liggende leg curl", category: "Ben" },
  { name: "Bulgarian split squat", category: "Ben" },
  { name: "Sumo squat", category: "Ben" },
  { name: "Stående tåhæv", category: "Ben" },
  // Skuldre
  { name: "Military press", category: "Skuldre" },
  { name: "Dumbbell shoulder press", category: "Skuldre" },
  { name: "Sidelateral rejsning", category: "Skuldre" },
  { name: "Front raise", category: "Skuldre" },
  { name: "Rear delt fly", category: "Skuldre" },
  { name: "Arnold press", category: "Skuldre" },
  { name: "Upright row", category: "Skuldre" },
  { name: "Shrugs", category: "Skuldre" },
  { name: "Cable lateral raise", category: "Skuldre" },
  { name: "Landmine press", category: "Skuldre" },
  // Biceps
  { name: "Biceps curl med vægtstang", category: "Biceps" },
  { name: "Biceps curl med håndvægte", category: "Biceps" },
  { name: "Hammer curl", category: "Biceps" },
  { name: "Koncentreret curl", category: "Biceps" },
  { name: "Preacher curl", category: "Biceps" },
  { name: "Cable curl", category: "Biceps" },
  { name: "Incline dumbbell curl", category: "Biceps" },
  { name: "EZ-bar curl", category: "Biceps" },
  { name: "Spider curl", category: "Biceps" },
  { name: "21's biceps curl", category: "Biceps" },
  // Triceps
  { name: "Triceps pushdown", category: "Triceps" },
  { name: "Fransk pres", category: "Triceps" },
  { name: "Dips (triceps-fokus)", category: "Triceps" },
  { name: "Close-grip bænkpres", category: "Triceps" },
  { name: "Overhead triceps extension", category: "Triceps" },
  { name: "Triceps kickback", category: "Triceps" },
  { name: "Diamond push-ups", category: "Triceps" },
  { name: "Rope pushdown", category: "Triceps" },
  { name: "Bænk dips", category: "Triceps" },
  { name: "Ensidig triceps extension", category: "Triceps" },
  // Mave
  { name: "Situps", category: "Mave" },
  { name: "Crunches", category: "Mave" },
  { name: "Plank", category: "Mave" },
  { name: "Hængende benløft", category: "Mave" },
  { name: "Russian twist", category: "Mave" },
  { name: "Cable crunch", category: "Mave" },
  { name: "Mountain climbers", category: "Mave" },
  { name: "Ab wheel rollout", category: "Mave" },
  { name: "Sideplank", category: "Mave" },
  { name: "Bicycle crunches", category: "Mave" },
  // Baller
  { name: "Hip thrust", category: "Baller" },
  { name: "Glute bridge", category: "Baller" },
  { name: "Cable kickback", category: "Baller" },
  { name: "Sumo dødløft", category: "Baller" },
  { name: "Cable pull-through", category: "Baller" },
  { name: "Frog pumps", category: "Baller" },
  { name: "Step-ups", category: "Baller" },
  { name: "Curtsy lunge", category: "Baller" },
  { name: "Donkey kicks", category: "Baller" },
  { name: "Enbenet hip thrust", category: "Baller" },
  // Underarme
  { name: "Wrist curl", category: "Underarme" },
  { name: "Reverse wrist curl", category: "Underarme" },
  { name: "Farmer's walk", category: "Underarme" },
  { name: "Reverse curl", category: "Underarme" },
  { name: "Plate pinch hold", category: "Underarme" },
  { name: "Wrist roller", category: "Underarme" },
  { name: "Zottman curl", category: "Underarme" },
  { name: "Bag-ryggen wrist curl", category: "Underarme" },
  { name: "Grebstræning", category: "Underarme" },
  { name: "Omvendt greb curl med vægtstang", category: "Underarme" },
  // Helkrop
  { name: "Burpees", category: "Helkrop" },
  { name: "Kettlebell swing", category: "Helkrop" },
  { name: "Clean and press", category: "Helkrop" },
  { name: "Thrusters", category: "Helkrop" },
  { name: "Snatch", category: "Helkrop" },
  { name: "Turkish get-up", category: "Helkrop" },
  { name: "Man makers", category: "Helkrop" },
  { name: "Battle ropes", category: "Helkrop" },
  { name: "Box jumps", category: "Helkrop" },
  { name: "Slædeskub", category: "Helkrop" },
];

const SEED_FLAG_KEY = "traeningsapp:default-exercises-seeded";

/**
 * Seeder de 100 mest almindelige træningsøvelser én gang, første gang
 * appen åbnes med et tomt øvelsesbibliotek. Bruger et flag i localStorage
 * (ikke kun "er biblioteket tomt") så vi ikke ved et uheld gen-seeder,
 * hvis brugeren selv har slettet alle sine øvelser igen senere.
 */
export async function seedDefaultExercisesIfNeeded(): Promise<void> {
  if (typeof localStorage !== "undefined" && localStorage.getItem(SEED_FLAG_KEY)) return;

  const db = await getDb();
  const count = await db.count("exercises");
  if (count === 0) {
    const tx = db.transaction("exercises", "readwrite");
    const now = new Date().toISOString();
    await Promise.all([
      ...DEFAULT_EXERCISES.map((item) => {
        const exercise: Exercise = {
          id: generateId(),
          name: item.name,
          category: item.category,
          createdAt: now,
        };
        return tx.store.add(exercise);
      }),
      tx.done,
    ]);
  }

  if (typeof localStorage !== "undefined") {
    localStorage.setItem(SEED_FLAG_KEY, "1");
  }
}

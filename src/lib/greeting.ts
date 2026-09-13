/** Navnet i hilsenen på Oversigt. Appen er personlig; skift her hvis en anden installerer den. */
export const USER_NAME = "Lukas";

/** "Godmorgen", "God formiddag", "Godmiddag", "God eftermiddag", "God aften", "Godnat" efter klokkeslæt. */
export function greeting(hour: number): string {
  if (hour < 5) return "Godnat";
  if (hour < 10) return "Godmorgen";
  if (hour < 12) return "God formiddag";
  if (hour < 14) return "Godmiddag";
  if (hour < 18) return "God eftermiddag";
  return "God aften";
}

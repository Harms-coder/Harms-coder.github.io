import type { ComparisonKind } from "../../lib/weightComparisons";

/**
 * Rigtige billeder til vægt-sammenligningerne, fundet automatisk: læg en 320x320 gennemsigtig PNG
 * som src/assets/comparisons/<kind>.png (klargør med scripts/fit-image.py), så bruges den — og
 * sammenligningen foretrækker ting med billede. Ting uden billede viser den tegnede silhuet.
 */
const files = import.meta.glob<string>("../../assets/comparisons/*.png", {
  eager: true,
  query: "?url",
  import: "default",
});

export const COMPARISON_PHOTOS: Partial<Record<ComparisonKind, string>> = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [path.split("/").pop()!.replace(".png", ""), url]),
);

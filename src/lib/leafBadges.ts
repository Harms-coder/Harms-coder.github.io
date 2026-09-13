/*
 * Giver hver ikon-badge sit eget udsnit af bladet, så en række badges under hinanden ikke viser
 * det samme stykke åre. Otte udsnit roterer i DOM-rækkefølge; CSS'en (.cat-badge) læser --leaf-pos.
 * ponytail: en MutationObserver frem for at røre alle 17 steder, der tegner en badge.
 */
const SPOTS = ["12% 18%", "78% 22%", "40% 62%", "88% 74%", "22% 84%", "60% 10%", "6% 50%", "70% 46%"];

export function startLeafBadges(root: HTMLElement) {
  let next = 0;
  const assign = () => {
    for (const el of root.querySelectorAll<HTMLElement>(".cat-badge:not([data-leaf])")) {
      el.dataset.leaf = "";
      el.style.setProperty("--leaf-pos", SPOTS[next++ % SPOTS.length]);
    }
  };
  assign();
  // Én gennemgang pr. frame: et sideskift udløser hundredvis af mutationer på én gang.
  let frame = 0;
  new MutationObserver(() => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      assign();
    });
  }).observe(root, { childList: true, subtree: true });
}

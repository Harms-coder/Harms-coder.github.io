import logoMark from "../../assets/logo-mark.png";
import wordmark from "../../assets/wordmark.png";

/**
 * Tegner et delbart træningskort som PNG.
 *
 * Tegnet direkte på et canvas frem for at fotografere DOM'en: html2canvas o.l. er et tungt
 * afhængighedslag, og kortet skal alligevel have sit eget format (1080×1350, plads til logo
 * og luft) frem for at ligne skærmen. Farverne læses fra de samme CSS-variabler som resten af
 * appen, så kortet aldrig kommer ud af trit med temaet.
 */

const WIDTH = 1080;
const PADDING = 88;
const MAX_LINES = 7;
const LINE_HEIGHT = 62;
/* Kortets faste del: logo, dato, titel, nøgletal og stregen — alt før øvelseslisten. */
const HEADER_HEIGHT = 606;
/* Et kort med to øvelser skal stadig ligne et kort og ikke en strimmel. */
const MIN_HEIGHT = 1000;

export interface WorkoutCardInput {
  dateLabel: string;
  title: string;
  durationMin?: number;
  setCount: number;
  exerciseCount: number;
  /** Formateret på forhånd ("12,4 ton"), så kortet ikke skal kende formateringsreglerne. */
  kgLiftedLabel: string;
  lines: { name: string; detail: string }[];
}

function token(name: string): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || "#ffffff";
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Kunne ikke hente ${src}`));
    img.src = src;
  });
}

/** Skruer skriftstørrelsen ned, til tallet er inde i sin søjle — "6,8 ton" må ikke ende som "6,8 t…". */
function fitFont(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  weight: number,
  startSize: number,
): void {
  let size = startSize;
  ctx.font = `${weight} ${size}px Montserrat, sans-serif`;
  while (size > 24 && ctx.measureText(text).width > maxWidth) {
    size -= 2;
    ctx.font = `${weight} ${size}px Montserrat, sans-serif`;
  }
}

/** Klipper teksten med "…" hvis den er for bred — et navn må aldrig løbe ind i tallet ved siden af. */
function fit(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let cut = text;
  while (cut.length > 1 && ctx.measureText(`${cut}…`).width > maxWidth) {
    cut = cut.slice(0, -1);
  }
  return `${cut}…`;
}

export async function buildWorkoutCardPng(input: WorkoutCardInput): Promise<Blob> {
  const shownLines = input.lines.slice(0, MAX_LINES);
  const overflowCount = input.lines.length - shownLines.length;
  /* Højden følger antallet af øvelser, så et kort med tre øvelser ikke har en halv skærm tom plads. */
  const contentHeight =
    HEADER_HEIGHT + (shownLines.length + (overflowCount > 0 ? 1 : 0)) * LINE_HEIGHT;
  const HEIGHT = Math.max(MIN_HEIGHT, contentHeight + 48 + PADDING);

  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas kunne ikke oprettes");

  /* Uden dette tegnes første kort i en fallback-skrift, fordi Montserrat stadig hentes. */
  await document.fonts.ready;

  const bg = token("--color-bg");
  const surface = token("--color-surface");
  const text = token("--color-text");
  const muted = token("--color-text-muted");
  const secondary = token("--color-text-secondary");
  const gold = token("--color-gold-300");
  const border = token("--color-border-strong");

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  /* Samme varme glød som appens baggrund, så kortet ikke er en flad sort plade. */
  const glow = ctx.createRadialGradient(WIDTH / 2, 0, 0, WIDTH / 2, 0, HEIGHT * 0.8);
  glow.addColorStop(0, `${surface}`);
  glow.addColorStop(1, bg);
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const [mark, word] = await Promise.all([loadImage(logoMark), loadImage(wordmark)]);
  const markHeight = 72;
  const markWidth = (mark.width / mark.height) * markHeight;
  ctx.drawImage(mark, PADDING, PADDING, markWidth, markHeight);
  const wordHeight = 26;
  const wordWidth = (word.width / word.height) * wordHeight;
  ctx.drawImage(word, PADDING + markWidth + 24, PADDING + markHeight / 2 - wordHeight / 2, wordWidth, wordHeight);

  let y = PADDING + markHeight + 96;

  ctx.fillStyle = muted;
  ctx.font = "500 30px Montserrat, sans-serif";
  ctx.fillText(input.dateLabel.toUpperCase(), PADDING, y);

  y += 74;
  ctx.fillStyle = text;
  ctx.font = "700 68px Montserrat, sans-serif";
  ctx.fillText(fit(ctx, input.title, WIDTH - PADDING * 2), PADDING, y);

  /* Tre nøgletal på række — bredden deles ligeligt, så de står under hinanden i en fast rytme. */
  y += 96;
  const stats: [string, string][] = [
    [String(input.setCount), "SÆT"],
    [String(input.exerciseCount), "ØVELSER"],
    [input.kgLiftedLabel, "LØFTET"],
  ];
  if (input.durationMin !== undefined) stats.unshift([`${input.durationMin}`, "MIN"]);
  const columnWidth = (WIDTH - PADDING * 2) / stats.length;
  stats.forEach(([value, label], i) => {
    const x = PADDING + columnWidth * i;
    ctx.fillStyle = gold;
    fitFont(ctx, value, columnWidth - 24, 700, 62);
    ctx.fillText(value, x, y);
    ctx.fillStyle = muted;
    ctx.font = "500 24px Montserrat, sans-serif";
    ctx.fillText(label, x, y + 40);
  });

  y += 108;
  ctx.strokeStyle = border;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(PADDING, y);
  ctx.lineTo(WIDTH - PADDING, y);
  ctx.stroke();

  y += 72;
  for (const line of shownLines) {
    ctx.font = "500 34px Montserrat, sans-serif";
    ctx.fillStyle = secondary;
    ctx.textAlign = "right";
    const detailWidth = ctx.measureText(line.detail).width;
    ctx.fillText(line.detail, WIDTH - PADDING, y);

    ctx.textAlign = "left";
    ctx.fillStyle = text;
    ctx.font = "600 34px Montserrat, sans-serif";
    ctx.fillText(fit(ctx, line.name, WIDTH - PADDING * 2 - detailWidth - 40), PADDING, y);
    y += LINE_HEIGHT;
  }

  if (overflowCount > 0) {
    ctx.textAlign = "left";
    ctx.fillStyle = muted;
    ctx.font = "500 30px Montserrat, sans-serif";
    ctx.fillText(`+ ${overflowCount} øvelser mere`, PADDING, y);
  }

  ctx.textAlign = "left";
  ctx.fillStyle = muted;
  ctx.font = "500 26px Montserrat, sans-serif";
  ctx.fillText("VIGORRA", PADDING, HEIGHT - PADDING);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Kunne ikke lave billedet"))),
      "image/png",
    );
  });
}

export const chartTooltipStyle = {
  background: "var(--color-surface-2)",
  border: "1px solid var(--color-border)",
  borderRadius: 12,
  fontSize: 13,
};

export const chartAxisTick = { fill: "var(--color-text-muted)", fontSize: 11 };

/**
 * Markøren bag det punkt man rører. Recharts' standard er en næsten hvid, fyldt flade,
 * som dominerer et mørkt tema. Her er den kun en tynd kant om søjlen, så man kan se hvad
 * man rammer uden at søjlens egen farve forsvinder.
 */
export const chartBarCursor = {
  fill: "transparent",
  stroke: "rgba(255, 255, 255, 0.38)",
  strokeWidth: 1,
  radius: 4,
};

/** Samme tanke for linje- og fladediagrammer: en tynd lodret hjælpelinje frem for en flade. */
export const chartLineCursor = {
  stroke: "rgba(255, 255, 255, 0.28)",
  strokeWidth: 1,
};

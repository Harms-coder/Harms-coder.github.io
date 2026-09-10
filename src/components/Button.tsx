import type { ButtonHTMLAttributes, CSSProperties } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "md" | "sm";
/** Kategorifarve på primære knapper/aktive tilstande, så fladen matcher den handling den hører til. */
export type Tone =
  | "accent"
  | "strength"
  | "cardio"
  | "progress"
  | "record"
  | "goal"
  | "plan"
  | "body"
  | "library";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  tone?: Tone;
}

export const TONE_COLORS: Record<Tone, string> = {
  accent: "var(--color-accent)",
  strength: "var(--color-cat-strength)",
  cardio: "var(--color-cat-cardio)",
  progress: "var(--color-cat-progress)",
  record: "var(--color-cat-record)",
  goal: "var(--color-cat-goal)",
  plan: "var(--color-cat-plan)",
  body: "var(--color-cat-body)",
  library: "var(--color-cat-library)",
};

const variantClasses: Record<Variant, string> = {
  primary: "cat-fill text-(--color-text) active:opacity-80",
  secondary: "glass-fill text-(--color-text) active:opacity-80",
  danger: "bg-(--color-danger)/15 text-(--color-danger) active:opacity-80",
  ghost: "bg-transparent text-(--color-accent) active:opacity-60",
};

const sizeClasses: Record<Size, string> = {
  md: "min-h-11 rounded-xl px-4 text-[15px] font-semibold",
  sm: "min-h-8 rounded-full px-3.5 text-[12.5px] font-semibold",
};

export function Button({
  variant = "primary",
  size = "md",
  tone = "accent",
  className = "",
  style,
  ...props
}: ButtonProps) {
  return (
    <button
      style={{ "--badge-color": TONE_COLORS[tone], ...style } as CSSProperties}
      className={`transition-opacity disabled:opacity-40 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}

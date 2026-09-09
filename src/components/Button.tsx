import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantClasses: Record<Variant, string> = {
  primary: "accent-fill text-(--color-text) active:opacity-80",
  secondary: "glass-fill text-(--color-text) active:opacity-80",
  danger: "bg-(--color-danger)/15 text-(--color-danger) active:opacity-80",
  ghost: "bg-transparent text-(--color-accent) active:opacity-60",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`min-h-11 rounded-xl px-4 text-[15px] font-medium transition-opacity disabled:opacity-40 ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}

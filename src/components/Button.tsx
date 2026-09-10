import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "md" | "sm";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variantClasses: Record<Variant, string> = {
  primary: "accent-fill text-(--color-text) active:opacity-80",
  secondary: "glass-fill text-(--color-text) active:opacity-80",
  danger: "bg-(--color-danger)/15 text-(--color-danger) active:opacity-80",
  ghost: "bg-transparent text-(--color-accent) active:opacity-60",
};

const sizeClasses: Record<Size, string> = {
  md: "min-h-11 rounded-xl px-4 text-[15px] font-medium",
  sm: "min-h-8 rounded-full px-3.5 text-[12.5px] font-semibold",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`transition-opacity disabled:opacity-40 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}

import type { InputHTMLAttributes } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function TextField({ label, className = "", ...props }: TextFieldProps) {
  return (
    <label className="flex flex-col gap-1.5">
      {label && (
        <span className="text-[13px] font-medium text-(--color-text-muted)">
          {label}
        </span>
      )}
      <input
        className={`min-h-11 rounded-xl border border-(--color-border) bg-(--color-surface) px-3.5 text-base text-(--color-text) outline-none placeholder:text-(--color-text-muted) focus:border-(--color-accent) ${className}`}
        {...props}
      />
    </label>
  );
}

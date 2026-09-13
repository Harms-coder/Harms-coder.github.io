import { useNavigate } from "react-router-dom";
import { IconChevronLeft } from "./icons";

/** Tilbage-knap øverst til venstre på undersider. Går ét skridt tilbage; til Oversigt hvis der ikke er noget at gå tilbage til. */
export function BackButton({ className = "" }: { className?: string }) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      onClick={() => (window.history.length > 1 ? navigate(-1) : navigate("/"))}
      className={`glass-fill flex min-h-9 items-center gap-1 self-start rounded-xl pl-2 pr-3.5 text-[13px] font-medium text-(--color-text) active:opacity-70 ${className}`}
    >
      <IconChevronLeft className="h-4 w-4" />
      Tilbage
    </button>
  );
}

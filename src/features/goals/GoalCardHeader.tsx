import type { CSSProperties } from "react";
import { CardActions } from "../../components/CardActions";
import type { IconComponent } from "../../components/icons";

interface GoalCardHeaderProps {
  icon: IconComponent;
  title: string;
  /** Kategorifarve på badgen, så måltypen kan kendes på farven — fx var(--color-cat-cardio). */
  color: string;
  onEdit: () => void;
  onDelete: () => void;
}

/** Fælles overskrift til alle mål-kort: farvet ikon-badge, titel og 3-prikkers menu. */
export function GoalCardHeader({ icon: Icon, title, color, onEdit, onDelete }: GoalCardHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-2.5">
        <span
          className="cat-badge flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border"
          style={{ "--badge-color": color } as CSSProperties}
        >
          <Icon className="h-[18px] w-[18px]" style={{ color }} />
        </span>
        <span className="truncate text-[15px] font-semibold text-(--color-text)">{title}</span>
      </div>
      <CardActions onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
}

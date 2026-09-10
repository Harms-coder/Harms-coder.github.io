import { Button } from "../../components/Button";
import { TextField } from "../../components/TextField";

interface GoalTargetEditFormProps {
  target: string;
  onTargetChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

/** Delt "rediger mål-værdi"-formular, genbrugt af alle mål-korttyper. */
export function GoalTargetEditForm({
  target,
  onTargetChange,
  onSave,
  onCancel,
}: GoalTargetEditFormProps) {
  return (
    <div className="flex items-end gap-2">
      <TextField
        label="Mål"
        type="number"
        inputMode="decimal"
        value={target}
        onChange={(e) => onTargetChange(e.target.value)}
        className="flex-1"
      />
      <Button onClick={onSave}>Gem</Button>
      <Button variant="secondary" onClick={onCancel}>
        Annuller
      </Button>
    </div>
  );
}

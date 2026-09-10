import {
  IconSilhouetteAnimal,
  IconSilhouetteCar,
  IconSilhouettePerson,
  IconSilhouettePlane,
  IconSilhouetteTruck,
  IconSilhouetteWhale,
  type IconComponent,
} from "../../components/icons";
import type { ComparisonKind } from "../../lib/weightComparisons";

const SILHOUETTES: Record<ComparisonKind, IconComponent> = {
  person: IconSilhouettePerson,
  animal: IconSilhouetteAnimal,
  whale: IconSilhouetteWhale,
  car: IconSilhouetteCar,
  truck: IconSilhouetteTruck,
  plane: IconSilhouettePlane,
};

/** Stregtegning der matcher vægt-sammenligningen, fx en lastbil ved "5 lastbiler". */
export function ComparisonIllustration({ kind }: { kind: ComparisonKind }) {
  const Icon = SILHOUETTES[kind];
  return <Icon className="h-9 w-9 text-(--color-accent-glow)" />;
}

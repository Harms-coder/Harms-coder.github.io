import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import type { CategoryLoad } from "../lib/muscleBalance";

/*
 * Fordeling pr. muskelgruppe som cirkeldiagram (donut) med legende — bevidst anderledes end alle
 * de vandrette barer på siden. Importerer recharts, så komponenten må kun bruges fra sider,
 * der allerede lazy-loader chart-chunken (Progression).
 */
const SLICE_COLORS = [
  "var(--color-cat-progress)",
  "var(--color-cat-cardio)",
  "var(--color-cat-record)",
  "var(--color-cat-body)",
  "var(--color-text-secondary)",
  "var(--color-gold-700)",
  "var(--color-blue-dim)",
  "var(--color-mint-dim)",
];

export function MuscleBalance({ loads }: { loads: CategoryLoad[] }) {
  const totalSets = loads.reduce((sum, l) => sum + l.sets, 0);

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-36 w-36 flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={loads}
              dataKey="sets"
              nameKey="category"
              innerRadius="62%"
              outerRadius="100%"
              paddingAngle={2}
              stroke="none"
              isAnimationActive={false}
            >
              {loads.map((load, index) => (
                <Cell key={load.category} fill={SLICE_COLORS[index % SLICE_COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[22px] font-semibold leading-none text-(--color-text)">{totalSets}</span>
          <span className="mt-1 text-[11px] text-(--color-text-muted)">sæt</span>
        </div>
      </div>

      <ul className="flex min-w-0 flex-1 flex-col gap-2">
        {loads.map((load, index) => (
          <li key={load.category} className="flex items-center gap-2 text-[13px]">
            <span
              className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
              style={{ backgroundColor: SLICE_COLORS[index % SLICE_COLORS.length] }}
            />
            <span className="min-w-0 flex-1 truncate text-(--color-text)">{load.category}</span>
            <span className="flex-shrink-0 whitespace-nowrap text-[12px] text-(--color-text-muted)">
              {load.sets} sæt · {load.percent}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

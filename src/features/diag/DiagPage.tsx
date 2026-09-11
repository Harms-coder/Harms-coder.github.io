import { useEffect, useState } from "react";

/**
 * Midlertidig diagnose-side. Viser de faktiske mål fra enheden, så safe-area-problemer
 * kan afgøres med tal frem for gæt. Ikke i bundmenuen — nås via /diag.
 */
export function DiagPanel() {
  const [rows, setRows] = useState<[string, string][]>([]);

  useEffect(() => {
    function measure() {
      const probe = document.createElement("div");
      probe.style.cssText =
        "position:fixed;top:0;left:0;width:0;height:0;" +
        "padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px);" +
        "padding-left:env(safe-area-inset-left,0px);padding-right:env(safe-area-inset-right,0px);";
      document.body.appendChild(probe);
      const cs = getComputedStyle(probe);
      const inset = {
        top: cs.paddingTop,
        bottom: cs.paddingBottom,
        left: cs.paddingLeft,
        right: cs.paddingRight,
      };
      probe.remove();

      const nav = document.querySelector("nav")?.getBoundingClientRect();
      const root = document.getElementById("root");

      setRows([
        ["safe-area top", inset.top],
        ["safe-area bottom", inset.bottom],
        ["safe-area venstre/højre", `${inset.left} / ${inset.right}`],
        ["window.innerHeight", `${window.innerHeight}px`],
        ["visualViewport", `${Math.round(window.visualViewport?.height ?? 0)}px`],
        ["screen.height", `${window.screen.height}px`],
        ["#root højde", `${root?.clientHeight ?? 0}px`],
        ["menuens bund", nav ? `${Math.round(nav.bottom)}px` : "(ingen)"],
        ["menuens højde", nav ? `${Math.round(nav.height)}px` : "(ingen)"],
        ["afstand til bunden", nav ? `${Math.round(window.innerHeight - nav.bottom)}px` : "?"],
        ["standalone", String((window.navigator as { standalone?: boolean }).standalone ?? "?")],
        ["display-mode: standalone", String(window.matchMedia("(display-mode: standalone)").matches)],
        ["skærm minus viewport", `${window.screen.height - window.innerHeight}px`],
        ["window.screenY", `${window.screenY}px`],
        ["window.outerHeight", `${window.outerHeight}px`],
        ["devicePixelRatio", String(window.devicePixelRatio)],
      ]);
    }

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  return (
    <div className="flex flex-col rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
        {rows.map(([navn, vaerdi], i) => (
          <div
            key={navn}
            className={`flex items-center justify-between gap-3 py-2 ${
              i > 0 ? "border-t border-(--color-border)" : ""
            }`}
          >
            <span className="text-[13px] text-(--color-text-muted)">{navn}</span>
            <span className="text-[15px] font-semibold tabular-nums text-(--color-text)">
              {vaerdi}
            </span>
          </div>
        ))}
    </div>
  );
}

export function DiagPage() {
  return (
    <div className="flex flex-col gap-3 px-4 pt-6">
      <h1 className="text-(--color-text)">Diagnose</h1>
      <DiagPanel />
    </div>
  );
}

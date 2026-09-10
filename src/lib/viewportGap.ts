import { useEffect } from "react";

/**
 * iOS' black-translucent-statuslinje flytter websiden op under statuslinjen uden at gøre
 * viewporten tilsvarende højere. Resultatet er, at viewportens bund ligger et stykke over
 * skærmens kant, og alt der er fastgjort til bunden efterlader en stribe.
 *
 * Hvor stort det stykke er, kan kun måles på enheden — det afhænger af model og af hvordan
 * iOS har valgt at placere webviewet. Derfor sættes det som en CSS-variabel ved opstart og
 * ved hver ændring af størrelsen, frem for at blive gættet i CSS.
 *
 * Kun i den installerede app: i en browser med adresselinje er forskellen adresselinjens
 * højde, og at skubbe noget derned ville gemme det bag den.
 */
export function useViewportGap() {
  useEffect(() => {
    function measure() {
      const standalone =
        (window.navigator as { standalone?: boolean }).standalone === true ||
        window.matchMedia("(display-mode: standalone)").matches;

      const gap = standalone ? Math.max(0, window.screen.height - window.innerHeight) : 0;
      document.documentElement.style.setProperty("--viewport-gap", `${gap}px`);
    }

    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, []);
}

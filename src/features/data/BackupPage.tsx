import { useRef, useState } from "react";
import { Button } from "../../components/Button";
import { IconChevronLeft, IconDownload, IconTrash, IconUpload } from "../../components/icons";
import { PageBackdrop } from "../../components/PageBackdrop";
import {
  clearAllData,
  countRecords,
  createBackup,
  restoreBackup,
  validateBackup,
} from "../../db/backup";
import { Link } from "react-router-dom";

type Status = { kind: "idle" } | { kind: "ok"; text: string } | { kind: "error"; text: string };

function backupFilename(): string {
  return `vigorra-backup-${new Date().toISOString().slice(0, 10)}.json`;
}

export function BackupPage() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [busy, setBusy] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  async function handleExport() {
    setBusy(true);
    try {
      const backup = await createBackup();
      const json = JSON.stringify(backup);
      const file = new File([json], backupFilename(), { type: "application/json" });

      /*
       * På telefonen er delings-arket den pålidelige vej ud af appen ("Gem i Filer",
       * AirDrop, mail). En <a download> virker ikke altid i en installeret PWA, så den
       * bruges kun som fallback på computer.
       */
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: backupFilename() });
      } else {
        const url = URL.createObjectURL(file);
        const link = document.createElement("a");
        link.href = url;
        link.download = backupFilename();
        link.click();
        URL.revokeObjectURL(url);
      }
      setStatus({ kind: "ok", text: `${countRecords(backup)} poster gemt i ${backupFilename()}` });
    } catch (error) {
      // AbortError betyder bare at brugeren lukkede delings-arket — ikke en fejl at vise.
      if (error instanceof Error && error.name === "AbortError") setStatus({ kind: "idle" });
      else setStatus({ kind: "error", text: "Kunne ikke lave backup. Prøv igen." });
    } finally {
      setBusy(false);
    }
  }

  async function handleImport(file: File) {
    setBusy(true);
    try {
      const parsed: unknown = JSON.parse(await file.text());
      const { error, backup } = validateBackup(parsed);
      if (error || !backup) {
        setStatus({ kind: "error", text: error ?? "Filen kunne ikke læses." });
        return;
      }

      const total = countRecords(backup);
      const exported = new Date(backup.exportedAt).toLocaleDateString("da-DK");
      const confirmed = window.confirm(
        `Gendan ${total} poster fra backup taget ${exported}?\n\n` +
          "ALT hvad du har i appen lige nu bliver erstattet. Det kan ikke fortrydes.",
      );
      if (!confirmed) {
        setStatus({ kind: "idle" });
        return;
      }

      const restored = await restoreBackup(backup);
      setStatus({ kind: "ok", text: `${restored} poster gendannet. Genindlæser…` });
      setTimeout(() => window.location.assign("/"), 900);
    } catch {
      setStatus({ kind: "error", text: "Filen kunne ikke læses som en backup." });
    } finally {
      setBusy(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  async function handleClear() {
    const first = window.confirm(
      "Slet ALT i appen? Øvelser, træninger, sæt, cardio, kropsvægt, programmer og mål forsvinder.\n\n" +
        "Har du ikke gemt en backup, kan det ikke fortrydes.",
    );
    if (!first) return;
    // Andet trin: den slags handling skal ikke kunne ske ved et enkelt fejltryk.
    if (!window.confirm("Sidste advarsel — alt slettes permanent. Er du helt sikker?")) return;

    setBusy(true);
    try {
      await clearAllData();
      setStatus({ kind: "ok", text: "Alt er slettet. Genindlæser…" });
      setTimeout(() => window.location.assign("/"), 900);
    } catch {
      setStatus({ kind: "error", text: "Kunne ikke slette data." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <PageBackdrop image="/images/plan-mountains.jpg" imagePosition="center 55%" />

      <Link
        to="/"
        className="flex items-center gap-1 self-start text-[13px] font-medium text-(--color-text-secondary)"
      >
        <IconChevronLeft className="h-3.5 w-3.5" />
        Oversigt
      </Link>

      <div className="flex flex-col gap-1">
        <h1 className="text-(--color-text)">Backup</h1>
        <p className="text-[13px] text-(--color-text-secondary)">
          Dine data ligger kun på denne enhed. Gem en kopi et sikkert sted.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
        <div className="flex items-center gap-2.5">
          <span
            className="cat-badge flex h-9 w-9 items-center justify-center rounded-full border"
            style={{ "--badge-color": "var(--color-cat-progress)" } as React.CSSProperties}
          >
            <IconDownload className="h-[18px] w-[18px] text-(--color-cat-progress)" />
          </span>
          <span className="text-[15px] font-semibold text-(--color-text)">Gem en kopi</span>
        </div>
        <p className="text-[13px] text-(--color-text-muted)">
          Lægger hele din historik — øvelser, træninger, sæt, cardio, kropsvægt, programmer og
          mål — i én fil, du kan gemme i Filer eller sende til dig selv.
        </p>
        <Button tone="progress" onClick={handleExport} disabled={busy}>
          Gem backup
        </Button>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
        <div className="flex items-center gap-2.5">
          <span
            className="cat-badge flex h-9 w-9 items-center justify-center rounded-full border"
            style={{ "--badge-color": "var(--color-cat-record)" } as React.CSSProperties}
          >
            <IconUpload className="h-[18px] w-[18px] text-(--color-cat-record)" />
          </span>
          <span className="text-[15px] font-semibold text-(--color-text)">Gendan fra fil</span>
        </div>
        <p className="text-[13px] text-(--color-text-muted)">
          Indlæser en tidligere backup. Alt hvad du har i appen nu bliver erstattet, så brug den
          kun på en ny telefon eller hvis noget er gået tabt.
        </p>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleImport(file);
          }}
        />
        <Button
          variant="secondary"
          tone="record"
          onClick={() => fileInput.current?.click()}
          disabled={busy}
        >
          Vælg backup-fil
        </Button>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface) p-4 card-shadow">
        <div className="flex items-center gap-2.5">
          <span
            className="cat-badge flex h-9 w-9 items-center justify-center rounded-full border"
            style={{ "--badge-color": "var(--color-danger)" } as React.CSSProperties}
          >
            <IconTrash className="h-[18px] w-[18px] text-(--color-danger)" />
          </span>
          <span className="text-[15px] font-semibold text-(--color-text)">Slet alle data</span>
        </div>
        <p className="text-[13px] text-(--color-text-muted)">
          Tømmer appen helt. Brug den til at komme af med eksempeldata igen — gem en backup
          først, hvis der er noget, du vil kunne hente tilbage. De 100 standardøvelser
          kommer igen af sig selv.
        </p>
        <Button variant="danger" onClick={handleClear} disabled={busy}>
          Slet alle data
        </Button>
      </div>

      {status.kind !== "idle" && (
        <p
          className={`text-[13px] font-medium ${
            status.kind === "error" ? "text-(--color-danger)" : "text-(--color-success)"
          }`}
        >
          {status.text}
        </p>
      )}
    </div>
  );
}

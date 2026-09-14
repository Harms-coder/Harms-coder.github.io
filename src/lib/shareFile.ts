/**
 * Får en fil ud af appen. På telefonen er delings-arket den pålidelige vej ("Gem i Filer",
 * AirDrop, mail) — en <a download> virker ikke altid i en installeret PWA, så den bruges kun
 * som fallback på computer. Delt af backup og CSV-eksport.
 */
export async function shareOrDownload(file: File, title: string): Promise<void> {
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title });
    return;
  }
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.name;
  link.click();
  URL.revokeObjectURL(url);
}

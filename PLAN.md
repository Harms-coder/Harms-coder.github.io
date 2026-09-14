# Plan

Aftalt 2026-09-12 ud fra en gennemgang af, hvad de bedste træningsapps roses for (Hevy, Strong,
Fitbod, Strava), holdt op mod det appen allerede har. Rækkefølgen er den anbefalede: fundament
først, så det der bruges hver dag, så de store synlige ting. Krydses af, efterhånden som de laves.

Sig "vis mig planen" for at få status.

## Rækkefølge

- [x] **13 · Host appen over https** — gjort 2026-09-12: https://harms-coder.github.io/ (repo Harms-coder/Harms-coder.github.io). — GitHub (privat repo = automatisk sikkerhedskopi) + GitHub Pages,
      Service worker så appen virker offline og opdaterer sig selv; hvert push til main udgiver.
- [x] **1 · "Som sidst" med ét tryk** — gjort 2026-09-14: knappen "Som sidst: 80 kg × 8" ligger øverst i sæt-formularen
      og udfylder vægt og reps med sidste gangs sæt. Både i træningskortene og i den planlagte træning.
- [x] **12 · Fejring ved PR** — gjort 2026-09-14: guld-glød, konfetti og et "NY REKORD"-banner, når et sæt
      slår øvelsens rekord. Både i træningskortene og i den planlagte træning.
- [x] **11 · Milepæle for total løftet** — gjort 2026-09-14: kort på Oversigten med alt der nogensinde er
      løftet, sammenligningsbilledet ("7 blåhvaler"), nået milepæl og vej til den næste (1, 5, 10, 25, 50,
      100, 250, 500, 1.000 ton …).
- [x] **10 · Præstationsvæg** — gjort 2026-09-14: siden /praestationer (via Mere) viser de seks badges som
      trofæer, låst op eller ej, med tekst om hvad der skal til. Et netop oplåst trofæ popper frem og
      glimter én gang; hvad der er set, huskes i localStorage.
- [x] **2 · Supersæt** — gjort 2026-09-14: to øvelser i træk kan parres i programmet ("+ Supersæt"), og i
      den planlagte træning skiftes der automatisk til makkeren, når sættet er gemt. Hviletimeren kører
      imellem dem som før. Gælder den planlagte træning, ikke de løse træningskort.
- [x] **5 · Besked når hvilen er slut** — gjort 2026-09-14: hviletimeren har en "Giv besked"-knap, og når
      hvilen er slut kommer en systembesked via service workeren. Forbehold: appen har ingen push-server,
      så en telefon der har ligget låst længe, får først beskeden i det øjeblik appen åbnes igen.
      Ægte besked på låst skærm kræver en push-backend (VAPID) — ikke lavet.
- [x] **6 · Muskel-heatmap** — gjort 2026-09-14: "Muskelkort" på Progression viser krop forfra og bagfra,
      farvet efter volumen de sidste 7 dage (mint → guld), plus hårdest trænet og mest udhvilet
      ud fra dage siden sidst.
- [ ] **7 · Månedens opsummering** — "Din september": kg, træninger, PR'er, længste streak, mest
      trænede øvelse. *~30 min.*
- [ ] **8 · Del et træningskort som billede** — kort i appens design, delt via delingsarket. *~30 min.*
- [ ] **9 · Fremgangsfotos + kropsmål** — talje, arme osv. ved siden af kropsvægten; fotos gemmes i
      appens database og kommer med i backuppen. *~40 min.*
- [ ] **14 · CSV-eksport** — regnearksfil, én række pr. sæt (dato, øvelse, kg, gentagelser, type), til
      Excel/Numbers eller en træner. *~10 min.*

## Fravalgt (kan tages op igen)

- 3 · Opvarmningsberegner (40/60/80 %-sæt med skiver).
- 4 · Anstrengelse pr. sæt (RPE) → forslag om +2,5 kg næste gang.

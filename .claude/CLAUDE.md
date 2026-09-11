# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Personal, mobile-first PWA for logging strength training, cardio, and bodyweight. Local-only (no backend, no auth, no sync) — all data lives in IndexedDB in the browser. UI text is Danish; code (identifiers, comments) is English.

## Commands

```bash
npm run dev      # Vite dev server
npm run build    # tsc -b (type-check) && vite build — build fails on type errors
npm run lint     # oxlint
npm run preview  # preview a production build
```

There is no test suite / test runner configured.

## Architecture

**Stack:** React 19 + TypeScript + Vite, Tailwind CSS v4 (CSS-based `@theme` config, no `tailwind.config.js`), `react-router-dom`, `idb` (IndexedDB wrapper), `recharts` for charts.

**Data layer (`src/db/`):** One IndexedDB database (`traeningsapp`, versioned schema in `src/db/database.ts`). Each domain entity has its own module (`exercises.ts`, `sessions.ts`, `sets.ts`, `cardio.ts`, `bodyweight.ts`, `routines.ts`, `plannedWorkouts.ts`, `goals.ts`, `quotes.ts`) exposing typed CRUD functions built on `getDb()`. There is no global store/context — feature pages call these functions directly and refetch after each mutation. Domain types live in `src/types/index.ts`.

When adding a store or index, bump `DB_VERSION` and add a new `if (oldVersion < N)` block in the `upgrade()` callback — don't edit the existing version blocks.

**ID generation:** always use `generateId()` from `src/lib/id.ts`, never `crypto.randomUUID()` directly. `crypto.randomUUID` is unavailable in insecure contexts (e.g. opening the dev server from a phone via `http://<lan-ip>:5173`), which silently breaks every create action. `generateId()` falls back to a non-crypto unique string in that case.

**Date handling:** date-only values are stored as `YYYY-MM-DD` strings. Use `parseISODate()` / `toISODate()` from `src/lib/date.ts` to convert, not `new Date(isoString)` directly — that parses as UTC midnight and can shift the displayed day depending on the local timezone.

**Routing (`src/App.tsx`):** routes map 1:1 to `src/features/<name>/<Name>Page.tsx`. `ProgressionPage` and `BodyweightPage` are loaded via `React.lazy` because they pull in `recharts` (~350 kB); Vite splits this into a shared `chart` chunk. Follow the same lazy pattern for any new chart-heavy page rather than importing `recharts` at the top level.

**Design system:** single fixed theme (dark, premium, bronze/orange accent — not adaptive to OS light mode). Colors are CSS custom properties defined under `@theme` in `src/index.css` (`--color-bg`, `--color-surface`/`-2`/`-3`, `--color-accent`/`-bright`/`-glow`/`-dark`, `--color-text`/`-secondary`/`-muted`, `--color-success`, `--color-danger`, etc.), referenced from JSX as Tailwind arbitrary-value classes, e.g. `bg-(--color-surface)`, `text-(--color-text-muted)`. Change the palette by editing those tokens only — never hardcode a hex color in a component. Two shared utility classes carry the rest of the visual system and are applied via `className` rather than duplicated inline: `.card-shadow` (the drop shadow every card/tile uses) and `.accent-fill` (the bronze gradient + glow used on every primary button and every "active" pill/tab/segmented-control state). When adding a new card or active-state control, reuse these classes instead of hand-rolling the shadow/gradient again. All icons are hand-drawn inline SVGs in `src/components/icons.tsx` — no emoji and no icon library anywhere in the UI; add new icons there in the same style (24×24 viewBox, `stroke="currentColor"`, head/weight circles filled `currentColor` for a bolder look). `ExerciseIcon` (`src/components/ExerciseIcon.tsx`) picks a movement-specific pictogram via `src/lib/exerciseIcon.ts` (keyword + category matching over `getExerciseIcon`) rather than one generic glyph — see that file before adding new exercises whose movement doesn't already map cleanly. The weight-comparison silhouettes on the Overview ("Det svarer til ca. 4 elefanter") are generated: edit the shapes in `scripts/silhouettes.py` and run `python3 scripts/silhouettes.py`, which rewrites `src/features/overview/comparisonSilhouettes.ts` and a preview `scripts/silhouettes.html` — never hand-edit the generated path strings. `CardActions` (`src/components/CardActions.tsx`) is the shared 3-dot edit/delete menu used by every entry card (`ExerciseCard`, `RoutineCard`, `CardioEntryCard`, `BodyweightEntryCard`) instead of two standalone icon buttons — reuse it for any new editable/deletable card rather than re-adding bare edit/delete buttons.

**Fixed categories, not free text:** exercise categories (`EXERCISE_CATEGORIES` in `src/db/exerciseSeed.ts`) and cardio activity types (`CARDIO_ACTIVITIES` in `src/db/cardio.ts`) are closed enums driving chip-style pickers (`CategoryPicker`, `ActivityPicker`). Exercise search/filtering (by name + category) is centralized in `src/lib/exerciseFilter.ts` and shared by `ExercisePicker`, `ExerciseMultiSelect`, and `ExercisesPage` — extend that instead of duplicating filter logic.

**Default data:** `seedDefaultExercisesIfNeeded()` (`src/db/exerciseSeed.ts`) seeds 100 default exercises on first run. It's gated by a `localStorage` flag (not just "store is empty"), so it never re-seeds after a user deletes everything, and it's `await`ed in `main.tsx` *before* React renders — dispatching it from inside a component effect race with that component's own data fetch.

**PR tracking:** `maybeUpdatePr()` (`src/db/exercises.ts`) is called from `TrainingPage` after logging a `normal` or `1rm` set. `warmup`/`dropset` sets never count toward a PR.

**Scroll container:** `#root` is the only scrollable element (`html`/`body` are locked with `overflow: hidden`, plus `overscroll-behavior` tuning) — see `src/index.css`. This keeps the `position: fixed` bottom nav from jumping/disappearing during mobile rubber-band scrolling. Don't add `overflow`/height rules to `body` or `html`.

**PWA install assets:** `public/manifest.json` + `public/icon-180/192/512.png` (generated from `public/icon.svg`, a solid dumbbell mark on the accent color) power "Add to Home Screen" on iOS/Android — see `index.html`'s `apple-touch-icon`/`manifest` links. This makes the home-screen launch a standalone window with its own storage, separate from Safari or any in-app browser. Regenerate the PNGs from `icon.svg` (e.g. via `sips -s format png icon.svg --out icon-N.png -Z N`) if the mark or brand colors change.

**`/demo` route (`src/features/demo/DemoSeedPage.tsx`):** a dev-only page (not in the bottom nav) that generates ~1 year of synthetic history via `src/db/demoSeed.ts` (`WEEKS` constant controls the span), for visually testing what a populated app looks like. Not a real feature — don't add it to the bottom nav. Reachable via a small muted "Eksempeldata" text link at the bottom of `OverviewPage` — needed because the installed home-screen PWA (`display: standalone`) has no address bar to type a hidden route into.

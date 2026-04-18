# Atlas Quest — agent notes

A continent-based country guessing game. Vite + React + TypeScript + Tailwind + Zustand + sql.js. Local-first; no backend.

## Commands

```bash
npm run dev         # dev server on :5173 (host: true, so accessible on LAN)
npm run build       # tsc -b && vite build → ./dist
npm run typecheck   # strict TS
npm run preview     # preview the production build
```

There is no test suite yet. Lint = `tsc --noEmit`.

## Map of the codebase

```
src/
├── App.tsx                ← single AnimatePresence screen router (no routing lib)
├── data/
│   ├── continents.ts      ← per-continent metadata + d3-geo projection spec
│   └── countries.ts       ← 198 countries keyed by ISO 3166-1 NUMERIC string ("004", not "4")
├── lib/
│   ├── geo.ts             ← topojson loader, buildContinentMap(), zoom/pan math
│   ├── db.ts              ← sql.js + idb-keyval persistence, all SQL lives here
│   ├── scoring.ts         ← scoreRound() + formatters
│   ├── audio.ts           ← WebAudio synth (no asset files; mute via setMuted)
│   └── utils.ts           ← cn, pick, weightedPick, normalizeName, speakCountryName
├── store/
│   ├── gameStore.ts       ← state machine: screen, mode, session, round, history
│   └── settingsStore.ts   ← persisted to localStorage; toggles + haptic() helper
└── components/
    ├── ui/                ← Button, Card, Badge, Toggle, ProgressRing, Confetti, …
    ├── map/               ← ContinentMap (the SVG core), CountryList, useWorldTopology
    ├── game/              ← TargetPanel, GameHUD, RoundResult
    └── screens/           ← Home, ContinentSelect, ModeSelect, Game, SessionSummary, Stats, Settings
```

`@/*` resolves to `src/*` (configured in both `vite.config.ts` and `tsconfig.json` — keep them in sync).

## Domain rules — do not violate

- **Never display a country's name on the map before the player has guessed or revealed it.** That includes: rendered SVG `<text>` labels, the hover chip, tooltips, and post-zoom annotations. Names may appear on countries the player has already clicked (`wrongIds`), the `solvedId`, or `revealedId`. Anything else defeats the game. There is a regression test of one (manual): zoom to default, hover any country — chip should say *"Click to guess"*, never the name.
- The `aria-label` on each country path *does* include the name. This is intentional for screen-reader accessibility and is not visually rendered. Do not remove it.
- The country list sidebar shows all names — that's fine, it's a deliberate name→shape selector for dense regions.

## Country data ↔ topology coupling

`src/data/countries.ts` IDs are **ISO 3166-1 numeric, zero-padded to 3 chars** because that's what world-atlas's `countries-50m.json` uses for its feature `id` field. Any country added to `countries.ts` that doesn't have a matching feature in the topojson is silently dropped by `buildContinentMap()` — that's the desired behavior for tiny island states the dataset omits, but if you add a new country and it doesn't show up on the map, this is why.

Kosovo has no ISO numeric code and is intentionally absent.

## Persisted assets (bundled, not CDN)

- `public/data/countries-50m.json` — the world topology (~756 KB). Loader in `src/lib/geo.ts` uses this first, with jsdelivr/unpkg fallbacks. **Use `world-atlas@2`, never `@3` — v3 has never been published to npm.**
- `public/sql-wasm.wasm` — the sql.js WASM. Loader in `src/lib/db.ts` prefers this, with `https://sql.js.org/dist/sql-wasm.wasm` as fallback.

If `npm install` updates sql.js, recopy: `cp node_modules/sql.js/dist/sql-wasm.wasm public/sql-wasm.wasm`.

## State model

One Zustand store per concern, no React Context, no router. Screen transitions are driven by `useGame((s) => s.screen)`. Mutations go through actions on the store (`selectContinent`, `selectMode`, `startSession`, `pickTarget`, `guess`, `reveal`, `nextRound`, `endSessionNow`). Persisted writes are fire-and-forget from inside actions (`void recordRound(...)`) so the UI stays snappy.

When adding state, prefer extending `gameStore` over creating a new store unless the concern is genuinely orthogonal (settings is the only orthogonal one today).

## SQLite

All schema lives in the `SCHEMA` constant at the top of `src/lib/db.ts`. The DB is loaded lazily on first use, persisted to IndexedDB with a 300 ms debounce via `scheduleSave()`. Aggregates use `INSERT … ON CONFLICT DO UPDATE` so writes are O(1).

Schema is additive-only in spirit — if you need to change a column, write a migration in `getDb()` after the `db.exec(SCHEMA)` line. Do not silently change column types.

## Styling

- Tailwind v3 with custom tokens in `tailwind.config.js` (`ink-*` surfaces, `mist-*` text, `aurora-*` accents).
- Reusable component classes (`.glass`, `.glass-strong`, `.btn`, `.btn-primary`, `.chip`, `.kbd`, `.country`, `.ambient`, etc.) are defined in `src/index.css` under `@layer components`. Prefer these over reinventing surfaces.
- Numbers that change (scores, times) use `display-num` for tabular figures.

## Sound + haptics

- All sounds are WebAudio-synthesized in `src/lib/audio.ts`. **Do not add audio asset files** — the no-assets contract keeps bundle size small and avoids licensing.
- Haptics: call `haptic(pattern)` from `@/store/settingsStore`. It honors the user's haptic preference and silently no-ops where unsupported.

## Map gotchas

- `BASE_W=1200`, `BASE_H=720`. The viewport (`vp`) is the SVG `viewBox`; default is `0 0 1200 720` (zoomLevel 1.0). Zoom math is in `src/lib/geo.ts`.
- Drag-vs-click is distinguished by a 3 px movement threshold on `dragRef.current.moved`. If you wire new pointer behavior on `<svg>`, preserve that.
- Per-continent projections live in `data/continents.ts` (Mercator for tropical/island regions, Conic Conformal for mid-latitudes). When tuning, change `center`, `rotate`, and `parallels` here — `buildContinentMap()` handles `fitExtent`.

## Known follow-ups (not yet implemented)

- No achievements UI (schema room exists).
- No daily challenge.
- No PWA manifest / service worker — would make it fully offline-installable.
- No automated tests; scoring + gameStore transitions are the highest-value targets if adding them.

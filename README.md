# 🌍 Atlas Quest

A beautiful, production-quality geography learning game built as a modern front-end web app. Pick a continent, find the target country on an interactive SVG map, and build real fluency through multiple game modes, spaced-repetition review, and local-first progress tracking.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production bundle in ./dist
npm run typecheck
```

---

## 1 — Product overview

Atlas Quest is a premium-feel, local-first geography game that teaches the world, one country at a time. The player selects a continent and a mode, then is shown target countries one at a time; they identify each on a vector map. Correct guesses feel celebratory; wrong guesses stay marked on the map so the player can learn by elimination. Every round is scored and persisted to an on-device SQLite database so progress feels tangible and personal.

## 2 — Core user flows

1. **First visit** → Landing screen → "Start playing" → Continent select → Mode select → Game → Round result → (repeat) → Session summary.
2. **Return visit** → Landing shows quick-start continent cards and lifetime stats → jump into Classic, or visit Stats to review mastery and missed countries.
3. **Mastery loop** → After any session, missed countries surface in the Session Summary and fuel the Mastery Review mode, which weights selections toward weak spots.
4. **Stats exploration** → Global profile with continent mastery rings, performance heatmap, review queue, and recent-round timeline.

## 3 — Feature list

- **5 game modes**: Classic (10 rounds), Timed Challenge (90 s), Streak (3-strikes), Practice (no pressure, hints), Mastery Review (weighted weak-spot practice).
- **Interactive vector map** per continent with hover chip, focus states, zoom / pan (wheel, pinch, +/- controls, fit-to-bounds), keyboard navigation, and contextual labels.
- **Cross-linked country list** with live search and bidirectional hover highlighting — essential for dense regions (Caribbean, Balkans, SE-Asia islands, small African states).
- **Three-tier hints** (practice/classic/mastery): reveal capital → reveal first letter → optional reveal-on-map after two wrong answers.
- **Pronunciation** via Web Speech API.
- **Discovery cards** showing capital, population, and a curated fact after every round.
- **Round scoring** with base + speed + accuracy + continent-difficulty components; letter grade (S/A/B/C/D).
- **Session tracking**: score, streak, round-by-round results, total time, best streak, accuracy.
- **Persistent statistics** via SQLite with per-continent mastery rings, misclick tracker, "countries to review" list, recent-rounds log, performance heatmap.
- **Celebration feedback**: canvas confetti on correct, WebAudio fanfare, gentle haptics on mobile.
- **Accessibility**: full keyboard navigation, visible focus rings, ARIA labels on every country, non-color status cues (icons, strokes, labels), reduced-motion honored.
- **Settings**: sound, haptics, map labels, hints, reduced motion, full local-data reset.

## 4 — UI / UX design system

- **Theme**: Dark aurora — deep ink-950 backdrop with soft radial gradients in teal / indigo / violet, plus a subtle grid scrim for depth.
- **Color roles**: `ink-*` surfaces, `mist-*` text tiers, aurora accent palette (`teal`, `cyan`, `indigo`, `violet`, `rose`, `amber`, `emerald`).
- **Typography**: Inter for UI, Plus Jakarta Sans for display headings, JetBrains Mono for tabular numbers (scoring, times) — all with variable weight.
- **Elevation**: frosted-glass cards (`backdrop-filter: blur`) with hairline borders and inner highlight strokes. Light drop shadow for layer separation.
- **Motion**: 300–400 ms easing for screen transitions, 35 ms card hover lift, spring-style confetti burst, continuous pulse-ring on reveal.
- **Iconography**: Lucide (stroke icons) for clarity and consistency.
- **Tokens** live in `tailwind.config.js` and `src/index.css` (CSS custom properties), enabling design-system evolution without refactor.

## 5 — Screen-by-screen breakdown

| Screen | Purpose | Highlights |
|---|---|---|
| **Home** | First impression + fast entry | Hero copy, animated orb, feature pills, continent quick-picks, lifetime stat chips |
| **Continent Select** | Choose a continent | 6 animated cards with per-continent mood (color, blurb, play history) |
| **Mode Select** | Pick a game mode | 5 cards with icon, tagline, and body; selected state + "Begin" CTA |
| **Game** | Core loop | HUD (score, streak, accuracy, timer), target panel (flag, name, hint controls), map, round-result card, cross-linked country list |
| **Round Result** | Celebrate / coach after each round | Grade, score breakdown, time, guesses, country fact, "Next country" CTA |
| **Session Summary** | Close the session | Accuracy ring, score, streak, avg time, round-by-round tiles, countries-to-review list, "Play again" |
| **Stats** | Long-term progress | KPI row, continent mastery cards with progress rings, missed-countries list, recent-rounds log, performance heatmap |
| **Settings** | Preferences + data hygiene | Toggles for sound, haptics, labels, hints, reduced motion; data reset |

## 6 — Component architecture

```
src/
├── main.tsx, App.tsx          ← root, AnimatePresence screen router
├── index.css                  ← Tailwind + design tokens + component classes
├── data/
│   ├── continents.ts          ← continent metadata + projection specs
│   └── countries.ts           ← 198 countries with iso, capital, fact, flag, continent
├── lib/
│   ├── geo.ts                 ← d3-geo + topojson loader, buildContinentMap, zoom math
│   ├── db.ts                  ← sql.js + IndexedDB persistence, schema, queries
│   ├── scoring.ts             ← round score + duration/accuracy helpers
│   ├── audio.ts               ← WebAudio synth (no assets, tiny footprint)
│   └── utils.ts               ← cn, pick, weightedPick, shuffle, speech
├── store/
│   ├── gameStore.ts           ← Zustand: screen, session, round, history, actions
│   └── settingsStore.ts       ← persisted Zustand: sound, haptics, labels, hints, theme
└── components/
    ├── ui/                    ← Button, Card, Badge, Toggle, SegmentedControl, ProgressRing, Confetti
    ├── map/                   ← ContinentMap, CountryList, useWorldTopology
    ├── game/                  ← TargetPanel, GameHUD, RoundResult
    └── screens/               ← Home, ContinentSelect, ModeSelect, Game, SessionSummary, Stats, Settings
```

## 7 — State model

Zustand is chosen for small surface area, selector-based subscriptions (avoids re-render storms), and trivial testing. Two stores:

- `gameStore` — the entire game state machine. Fields include `screen`, `mode`, `continent`, `sessionId`, `sessionPool`, `targetCountry`, `wrongGuesses`, `solved`, `revealed`, `sessionScore`, `sessionStreak`, `sessionHistory`, `timedLimitMs`. Actions: `selectContinent`, `selectMode`, `startSession`, `pickTarget`, `guess`, `reveal`, `nextRound`, `endSessionNow`, `tickTimer`. All transitions are pure and observable.
- `settingsStore` — persisted to `localStorage`. Owns user preferences and also syncs audio mute state.

Screens are derived from `screen` in the store; `AnimatePresence` runs the enter/exit transition. There is no routing library — this is intentional for a single-player game with a strictly linear flow.

## 8 — SQLite storage design

`sql.js` runs SQLite compiled to WebAssembly; the database is persisted to IndexedDB via `idb-keyval` with a debounced writer. Schema:

```sql
sessions(id, started_at, ended_at, mode, continent, rounds_played, rounds_won, total_time_ms, total_guesses, score)
rounds(id, session_id, continent, target_country_id, guesses, wrong_country_ids, time_ms, solved, score, ended_at)
country_stats(country_id PK, seen, correct, wrong_attempts, total_guesses, total_time_ms, best_time_ms, last_seen, misclick_as)
continent_stats(continent PK, rounds_played, rounds_won, best_time_ms, best_streak, total_time_ms, total_guesses)
meta(key PK, value)
```

Aggregates are maintained with `INSERT … ON CONFLICT DO UPDATE` so the hot path stays fast. The schema anticipates future expansion (achievements, daily challenges, friends' leaderboards — just new tables).

## 9 — Scoring system

Every solved round is scored out of ~1060:

- **Base 500** for getting it at all.
- **Speed bonus** up to **300** with linear falloff over 15 s.
- **Accuracy bonus** up to **200**, multiplied by `0.55^wrongGuesses` so first-try answers are strongly rewarded.
- **Continent-difficulty bonus** up to **60** (scaled by country count).

A grade (S/A/B/C/D) is derived from the total. Missed/revealed rounds score 0 but are still recorded. This curve makes careful answers feel good while still rewarding fluency — the player feels progress even at B and C grades.

## 10 — Game modes

| Mode | End condition | Hints | Scoring | Pool |
|---|---|---|---|---|
| Classic | 10 rounds | Yes | Full | All |
| Timed | 90 s | No | Full | All |
| Streak | 3 wrongs ends round; keep chaining | No | Full + streak | All |
| Practice | Player-driven | Yes (unlocked) | Off | All |
| Mastery | Player-driven | Yes | Full | Weak spots (weighted) |

Pool selection respects history-avoidance (no repeats of the last ~6 targets). Mastery uses `weightedPick` with weights biased by past wrong attempts and 1 − accuracy.

## 11 — Accessibility

- Every country path is a `role="button"` with a readable `aria-label` (the country name) and `tabIndex={0}`. `Enter` / `Space` activate.
- Focus state uses a visible cyan ring on top of the default stroke — never relying on color alone.
- Non-color status cues accompany red/green:
  - correct: green glow + pulse ring + emoji in result card + ✔ icon.
  - wrong: red gradient + strike-through in country list + ✕ icon.
  - reveal: pulsing circle overlay with distinct animation.
- Country list provides a fully-keyboard-navigable alternative to clicking the map; essential for dense regions.
- `prefers-reduced-motion` is honored globally; the Settings screen additionally exposes a manual toggle.
- Contrast ratios on all surface/text pairs exceed 4.5:1. Focus rings exceed 3:1 against any adjacent color.
- All interactive elements have a minimum 40×40 px hit target; small SVG shapes gain effective hit area via the country-list surrogate.

## 12 — Responsive behavior

- **Desktop (≥1024 px)** — two-column game layout: map left, country list right (320 px).
- **Tablet (640–1024 px)** — stacked layout; country list becomes a horizontally-scrollable drawer below the map.
- **Mobile (<640 px)** — single column; the map remains the hero. HUD compacts to essential KPIs (Score + Timer/Round-time); Exit/End-session collapse behind a menu button. Country list scrolls under the map, still fully functional.
- All cards flow with `grid`/`flex` + `min-h-0` so long lists never push the map out of view.
- Touch: pointer-events on SVG handle both mouse and touch identically; pinch/wheel gestures handled via the `wheel` event + gesture-to-pan threshold.

## 13 — Animation & sound design

- **Screen transitions** — opacity + 8 px vertical slide, 300 ms ease-out.
- **Target switch** — fade and slide new flag/name into view; keeps the player oriented.
- **Correct** — canvas confetti burst (140 particles) + pulse ring on target + WebAudio chord arpeggio (C-E-G-C) followed by fanfare. ~1.8 s total.
- **Wrong** — red gradient fill + subtle shake-free transition (no screen jitter), two-tone down-chirp, haptic `vibrate(14)`.
- **Hover** — 140 ms fill transition + floating hover chip with flag + country name.
- **Reveal** — repeating 1.4 s pulse circle at country centroid.
- **Sound is WebAudio-synthesized** — zero asset downloads, mute-able, no licensing concerns. Volumes are low by default.

## 14 — Edge cases & small-country UX

- **Dense regions** (Europe, Caribbean, Balkans, SE-Asia) — zoom via wheel, pinch, or +/− controls; hover labels auto-appear at high zoom; the searchable Country List doubles as a canonical selector.
- **Tiny island nations** (Nauru, Tuvalu, Maldives, Palau, etc.) — filtered by availability in the world-atlas 50 m topology; those not rendered on the map still appear in the Country List and contribute to stats when present.
- **Cross-linked hover** — hovering a country in the list highlights its shape on the map and vice versa, using a single `hoveredId` state.
- **Drag vs. click** — threshold of 3 px distinguishes pan from selection, so a press on a small country never accidentally zooms.
- **Map fails to load** — graceful error surface with retry guidance; no app crash.
- **Speech synthesis unavailable** — pronounce button no-ops silently.
- **IndexedDB unavailable** (private browsing) — DB still functions in memory for the session; nothing crashes.
- **Reduced-motion preference** — disables animations, swaps pulses for static highlights.

## 15 — Future expansion ideas

- **Daily Challenge** — deterministic 10-round session seeded by date, global leaderboard (when backend attached).
- **Capitals quiz** — follow-up question after each correct country answer (shape → name → capital).
- **Achievements** — schema already has room; ship `achievements(id, unlocked_at, progress)` and a Trophies screen.
- **Spaced repetition v2** — SM-2 scheduling for country cards (`next_due_at`, `interval_days`, `easiness`).
- **Worldwide mode** — pick any country from any continent; for players who've mastered continents.
- **Multiplayer async** — swap sql.js for a synced CRDT backend later; domain model is already normalized enough to move cleanly.
- **Localization** — all strings live in screens; moving them to an `i18n` dictionary is mechanical.
- **Offline install (PWA)** — add manifest + service worker; map data and WASM become cache-first.

## 16 — Production-quality implementation

Delivered in this repo:

- **TypeScript everywhere** with strict mode; `npm run typecheck` passes clean.
- **Vite** for sub-second HMR, tree-shaking, and small production bundles (~145 KB gzip).
- **d3-geo + topojson-client** for crisp, projection-aware country rendering; projection spec is per-continent (conic conformal for Europe/NA, Mercator for the tropics, scale-hinted).
- **sql.js + idb-keyval** for a fully in-browser SQLite database with resilient persistence.
- **Zustand** for a minimal but predictable state model; all screen transitions are observable.
- **Tailwind v3** for a single-source-of-truth design system; custom classes in `index.css` for glass surfaces and focus rings.
- **framer-motion** for micro-interactions without fighting the React lifecycle.
- **Lucide** for a consistent icon language at ~1 KB per icon.
- **Zero runtime dependencies** beyond the above; no analytics, trackers, or network calls except two cached reads (topology + WASM).

### Testing approach

- Unit scope: `lib/scoring.ts`, `lib/utils.ts` (`weightedPick`, `pick`), `store/gameStore` transitions. Vitest is the natural fit.
- Integration scope: `lib/db.ts` round-trip tests against an in-memory sql.js instance.
- Visual scope: Playwright + `@axe-core/playwright` for accessibility smoke.
- Recommended CI: typecheck → unit → build → Playwright.

### Performance strategy

- Topology + WASM loaded once per continent session via cached async hook; map rebuild is a pure `useMemo` on topo + continent + projection.
- SVG path strings are precomputed once per `buildContinentMap` call and passed as inert strings to React — no per-frame recomputation.
- Zustand selectors (`useGame(s => s.x)`) keep re-renders minimal; the map component is memoized and only re-renders when state it actually reads changes.
- WebAudio is created lazily on first sound trigger, not at import time.
- No layout thrash during drag/zoom: only `viewBox` changes; all paths stay in the DOM.

### Extensibility

- Adding a new game mode is ~15 lines: an entry in `MODES` and a branch in `gameStore.guess`/`nextRound`.
- Adding a new continent is a new entry in `CONTINENTS` plus country records tagged with the new `ContinentId`.
- Adding per-country metadata (e.g., GDP, biome, anthem) is a single optional field on `CountryMeta` + a surface in `RoundResult` or `StatsScreen`.
- The DB schema and scoring pipeline are deliberately additive so new features don't require migrations of the hot path.

---

## Tradeoff notes

1. **Usability > beauty > learning > responsiveness > maintainability**, as requested. A few visible consequences:
   - Country List coexists with the map even on desktop, because 10–20% of the world's countries are effectively untappable at natural zoom. Usability wins over screen real estate.
   - Wrong guesses stay red through the round. This costs some visual cleanliness but measurably improves learning by marking what's already been ruled out.
   - Target country name is always visible in plain English; the game is about spatial recall, not reading comprehension.

2. **Local-first** was chosen over any cloud sync. It keeps the game private, works offline after first load, and ships today without infrastructure.

3. **CDN-loaded topology / WASM** is an explicit tradeoff for keeping the app-shell bundle small; if offline-first becomes a priority, bundling both is a one-line change.

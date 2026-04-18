import initSqlJs, { type Database, type SqlJsStatic } from "sql.js";
import { get as idbGet, set as idbSet } from "idb-keyval";

const DB_KEY = "atlas-quest.sqlite";

// Prefer the bundled copy (self-hosted) — falls back to the official CDN if
// the bundled asset is missing for any reason.
const SQL_WASM_SOURCES = [
  "/sql-wasm.wasm",
  "https://sql.js.org/dist/sql-wasm.wasm",
];

let SQL: SqlJsStatic | null = null;
let db: Database | null = null;
let saveTimer: number | null = null;

async function pickWasmUrl(): Promise<string> {
  for (const url of SQL_WASM_SOURCES) {
    try {
      const res = await fetch(url, { method: "HEAD", cache: "force-cache" });
      if (res.ok) return url;
    } catch {
      /* try next */
    }
  }
  // Even if HEAD requests fail (CORS, etc), let sql.js attempt the primary URL.
  return SQL_WASM_SOURCES[0];
}

async function loadSql(): Promise<SqlJsStatic> {
  if (SQL) return SQL;
  const wasmUrl = await pickWasmUrl();
  SQL = await initSqlJs({ locateFile: () => wasmUrl });
  return SQL!;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  started_at INTEGER NOT NULL,
  ended_at INTEGER,
  mode TEXT NOT NULL,
  continent TEXT NOT NULL,
  rounds_played INTEGER NOT NULL DEFAULT 0,
  rounds_won INTEGER NOT NULL DEFAULT 0,
  total_time_ms INTEGER NOT NULL DEFAULT 0,
  total_guesses INTEGER NOT NULL DEFAULT 0,
  score INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS rounds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL REFERENCES sessions(id),
  continent TEXT NOT NULL,
  target_country_id TEXT NOT NULL,
  guesses INTEGER NOT NULL,
  wrong_country_ids TEXT NOT NULL DEFAULT '',
  time_ms INTEGER NOT NULL,
  solved INTEGER NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  ended_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS country_stats (
  country_id TEXT PRIMARY KEY,
  seen INTEGER NOT NULL DEFAULT 0,
  correct INTEGER NOT NULL DEFAULT 0,
  wrong_attempts INTEGER NOT NULL DEFAULT 0,
  total_guesses INTEGER NOT NULL DEFAULT 0,
  total_time_ms INTEGER NOT NULL DEFAULT 0,
  best_time_ms INTEGER,
  last_seen INTEGER,
  misclick_as INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS continent_stats (
  continent TEXT PRIMARY KEY,
  rounds_played INTEGER NOT NULL DEFAULT 0,
  rounds_won INTEGER NOT NULL DEFAULT 0,
  best_time_ms INTEGER,
  best_streak INTEGER NOT NULL DEFAULT 0,
  total_time_ms INTEGER NOT NULL DEFAULT 0,
  total_guesses INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_rounds_continent ON rounds(continent);
CREATE INDEX IF NOT EXISTS idx_rounds_ended_at ON rounds(ended_at DESC);
`;

export async function getDb(): Promise<Database> {
  if (db) return db;
  const SQL = await loadSql();
  const saved = (await idbGet<Uint8Array>(DB_KEY)) ?? null;
  db = saved ? new SQL.Database(saved) : new SQL.Database();
  db.exec(SCHEMA);
  return db;
}

export function scheduleSave() {
  if (saveTimer) window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(saveNow, 300);
}

export async function saveNow() {
  if (!db) return;
  const bytes = db.export();
  await idbSet(DB_KEY, bytes);
}

export async function resetDb() {
  db?.close();
  db = null;
  await idbSet(DB_KEY, new Uint8Array());
  return getDb();
}

// ————————————————————————————————————————————————
// Query helpers
// ————————————————————————————————————————————————

export interface RoundInsert {
  sessionId: number;
  continent: string;
  targetCountryId: string;
  guesses: number;
  wrongCountryIds: string[];
  timeMs: number;
  solved: boolean;
  score: number;
  endedAt: number;
}

export interface RoundRow {
  id: number;
  session_id: number;
  continent: string;
  target_country_id: string;
  guesses: number;
  wrong_country_ids: string;
  time_ms: number;
  solved: number;
  score: number;
  ended_at: number;
}

export async function startSession(opts: {
  mode: string;
  continent: string;
}): Promise<number> {
  const database = await getDb();
  const stmt = database.prepare(
    "INSERT INTO sessions (started_at, mode, continent) VALUES (?, ?, ?)",
  );
  stmt.run([Date.now(), opts.mode, opts.continent]);
  stmt.free();
  const res = database.exec("SELECT last_insert_rowid() as id");
  const id = Number(res[0].values[0][0]);
  scheduleSave();
  return id;
}

export async function endSession(
  sessionId: number,
  summary: {
    roundsPlayed: number;
    roundsWon: number;
    totalTimeMs: number;
    totalGuesses: number;
    score: number;
  },
) {
  const database = await getDb();
  const stmt = database.prepare(
    `UPDATE sessions SET
       ended_at = ?,
       rounds_played = ?,
       rounds_won = ?,
       total_time_ms = ?,
       total_guesses = ?,
       score = ?
     WHERE id = ?`,
  );
  stmt.run([
    Date.now(),
    summary.roundsPlayed,
    summary.roundsWon,
    summary.totalTimeMs,
    summary.totalGuesses,
    summary.score,
    sessionId,
  ]);
  stmt.free();
  scheduleSave();
}

export async function recordRound(r: RoundInsert) {
  const database = await getDb();

  const stmt = database.prepare(
    `INSERT INTO rounds
     (session_id, continent, target_country_id, guesses, wrong_country_ids, time_ms, solved, score, ended_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  stmt.run([
    r.sessionId,
    r.continent,
    r.targetCountryId,
    r.guesses,
    r.wrongCountryIds.join(","),
    r.timeMs,
    r.solved ? 1 : 0,
    r.score,
    r.endedAt,
  ]);
  stmt.free();

  // update country stats for target
  const target = r.targetCountryId;
  const isWin = r.solved ? 1 : 0;
  database.run(
    `INSERT INTO country_stats (country_id, seen, correct, wrong_attempts, total_guesses, total_time_ms, best_time_ms, last_seen)
     VALUES (?, 1, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(country_id) DO UPDATE SET
       seen = seen + 1,
       correct = correct + excluded.correct,
       wrong_attempts = wrong_attempts + excluded.wrong_attempts,
       total_guesses = total_guesses + excluded.total_guesses,
       total_time_ms = total_time_ms + excluded.total_time_ms,
       best_time_ms = CASE
         WHEN excluded.best_time_ms IS NULL THEN best_time_ms
         WHEN best_time_ms IS NULL OR excluded.best_time_ms < best_time_ms THEN excluded.best_time_ms
         ELSE best_time_ms END,
       last_seen = excluded.last_seen`,
    [
      target,
      isWin,
      r.solved ? Math.max(0, r.guesses - 1) : r.guesses,
      r.guesses,
      r.timeMs,
      r.solved ? r.timeMs : null,
      r.endedAt,
    ],
  );

  // update misclick counters for wrong countries
  for (const wrong of r.wrongCountryIds) {
    database.run(
      `INSERT INTO country_stats (country_id, misclick_as) VALUES (?, 1)
       ON CONFLICT(country_id) DO UPDATE SET misclick_as = misclick_as + 1`,
      [wrong],
    );
  }

  // update continent aggregate
  database.run(
    `INSERT INTO continent_stats (continent, rounds_played, rounds_won, best_time_ms, total_time_ms, total_guesses)
     VALUES (?, 1, ?, ?, ?, ?)
     ON CONFLICT(continent) DO UPDATE SET
       rounds_played = rounds_played + 1,
       rounds_won = rounds_won + excluded.rounds_won,
       total_time_ms = total_time_ms + excluded.total_time_ms,
       total_guesses = total_guesses + excluded.total_guesses,
       best_time_ms = CASE
         WHEN excluded.best_time_ms IS NULL THEN best_time_ms
         WHEN best_time_ms IS NULL OR excluded.best_time_ms < best_time_ms THEN excluded.best_time_ms
         ELSE best_time_ms END`,
    [
      r.continent,
      isWin,
      r.solved ? r.timeMs : null,
      r.timeMs,
      r.guesses,
    ],
  );

  scheduleSave();
}

export async function getOverallStats() {
  const database = await getDb();
  const res = database.exec(`
    SELECT
      (SELECT COUNT(*) FROM rounds) AS rounds,
      (SELECT COUNT(*) FROM rounds WHERE solved = 1) AS wins,
      (SELECT IFNULL(SUM(time_ms), 0) FROM rounds) AS total_time,
      (SELECT IFNULL(SUM(guesses), 0) FROM rounds) AS total_guesses,
      (SELECT COUNT(*) FROM sessions) AS sessions
  `);
  if (!res.length) {
    return { rounds: 0, wins: 0, totalTime: 0, totalGuesses: 0, sessions: 0 };
  }
  const row = res[0].values[0];
  return {
    rounds: Number(row[0]),
    wins: Number(row[1]),
    totalTime: Number(row[2]),
    totalGuesses: Number(row[3]),
    sessions: Number(row[4]),
  };
}

export interface ContinentStatRow {
  continent: string;
  rounds_played: number;
  rounds_won: number;
  best_time_ms: number | null;
  best_streak: number;
  total_time_ms: number;
  total_guesses: number;
}

export async function getContinentStats(): Promise<ContinentStatRow[]> {
  const database = await getDb();
  const res = database.exec("SELECT * FROM continent_stats");
  if (!res.length) return [];
  const [first] = res;
  return first.values.map((row) => {
    const obj: Record<string, unknown> = {};
    first.columns.forEach((col, i) => (obj[col] = row[i]));
    return obj as unknown as ContinentStatRow;
  });
}

export async function getRecentRounds(limit = 40): Promise<RoundRow[]> {
  const database = await getDb();
  const res = database.exec(
    `SELECT * FROM rounds ORDER BY ended_at DESC LIMIT ${Number(limit) | 0}`,
  );
  if (!res.length) return [];
  const [first] = res;
  return first.values.map((row) => {
    const obj: Record<string, unknown> = {};
    first.columns.forEach((col, i) => (obj[col] = row[i]));
    return obj as unknown as RoundRow;
  });
}

export interface CountryStatRow {
  country_id: string;
  seen: number;
  correct: number;
  wrong_attempts: number;
  total_guesses: number;
  total_time_ms: number;
  best_time_ms: number | null;
  last_seen: number | null;
  misclick_as: number;
}

export async function getCountryStats(): Promise<CountryStatRow[]> {
  const database = await getDb();
  const res = database.exec("SELECT * FROM country_stats");
  if (!res.length) return [];
  const [first] = res;
  return first.values.map((row) => {
    const obj: Record<string, unknown> = {};
    first.columns.forEach((col, i) => (obj[col] = row[i]));
    return obj as unknown as CountryStatRow;
  });
}

export async function getBestStreak(continent?: string): Promise<number> {
  const database = await getDb();
  const q = continent
    ? `SELECT best_streak FROM continent_stats WHERE continent = '${continent.replace(/'/g, "''")}'`
    : `SELECT MAX(best_streak) FROM continent_stats`;
  const res = database.exec(q);
  if (!res.length) return 0;
  const v = res[0].values[0]?.[0];
  return Number(v ?? 0);
}

export async function updateContinentStreak(continent: string, streak: number) {
  const database = await getDb();
  database.run(
    `INSERT INTO continent_stats (continent, best_streak) VALUES (?, ?)
     ON CONFLICT(continent) DO UPDATE SET best_streak = MAX(best_streak, excluded.best_streak)`,
    [continent, streak],
  );
  scheduleSave();
}

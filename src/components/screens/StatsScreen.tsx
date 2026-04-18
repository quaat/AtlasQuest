import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Flame, Trophy, Clock, Target, Sparkles, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle, Stat } from "@/components/ui/Card";
import { useGame } from "@/store/gameStore";
import {
  getContinentStats,
  getCountryStats,
  getOverallStats,
  getRecentRounds,
  type ContinentStatRow,
  type CountryStatRow,
  type RoundRow,
} from "@/lib/db";
import { CONTINENTS, getContinent } from "@/data/continents";
import { COUNTRIES_BY_ID, getCountryById } from "@/data/countries";
import { formatDuration } from "@/lib/scoring";
import { ProgressRing } from "@/components/ui/ProgressRing";

interface Loaded {
  overall: { rounds: number; wins: number; totalTime: number; totalGuesses: number; sessions: number };
  continents: ContinentStatRow[];
  countries: CountryStatRow[];
  recent: RoundRow[];
}

export function StatsScreen() {
  const goHome = useGame((s) => s.goHome);
  const [data, setData] = useState<Loaded | null>(null);

  useEffect(() => {
    (async () => {
      const [overall, continents, countries, recent] = await Promise.all([
        getOverallStats(),
        getContinentStats(),
        getCountryStats(),
        getRecentRounds(30),
      ]);
      setData({ overall, continents, countries, recent });
    })();
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-white/10 border-t-aurora-cyan animate-spin" />
      </div>
    );
  }

  const accuracy = data.overall.rounds ? Math.round((data.overall.wins / data.overall.rounds) * 100) : 0;
  const avgGuesses = data.overall.rounds ? data.overall.totalGuesses / data.overall.rounds : 0;
  const avgTime = data.overall.wins ? data.overall.totalTime / data.overall.wins : 0;

  const byContinent: Record<string, ContinentStatRow> = {};
  data.continents.forEach((c) => (byContinent[c.continent] = c));

  // Top missed countries
  const missed = data.countries
    .filter((s) => s.seen > 0 && s.wrong_attempts > 0)
    .map((s) => {
      const meta = COUNTRIES_BY_ID.get(s.country_id);
      const accuracy = s.correct / Math.max(1, s.seen);
      return { row: s, meta, accuracy };
    })
    .filter((x) => x.meta)
    .sort((a, b) => {
      const aScore = a.row.wrong_attempts - a.accuracy;
      const bScore = b.row.wrong_attempts - b.accuracy;
      return bScore - aScore;
    })
    .slice(0, 12);

  return (
    <div className="relative min-h-screen px-5 py-10">
      <div className="ambient" />
      <div className="relative z-10 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="sm" onClick={goHome} iconLeft={<ArrowLeft size={14} />}>
            Home
          </Button>
          <div className="chip">
            <Sparkles size={12} className="text-amber-300" /> {data.overall.sessions} session{data.overall.sessions === 1 ? "" : "s"}
          </div>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight"
        >
          Your cartographer profile
        </motion.h1>
        <p className="text-mist-300 mt-2">
          Progress across every continent, round, and country.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          <Card>
            <Stat label="Rounds played" value={data.overall.rounds} tint="#22D3EE" />
          </Card>
          <Card>
            <Stat label="Accuracy" value={`${accuracy}%`} tint="#34D399" sub={`${data.overall.wins} correct`} />
          </Card>
          <Card>
            <Stat label="Avg time" value={formatDuration(avgTime)} tint="#FBBF24" sub="on wins" />
          </Card>
          <Card>
            <Stat label="Avg guesses" value={avgGuesses.toFixed(2)} tint="#A78BFA" sub="per round" />
          </Card>
        </div>

        {/* Continent mastery */}
        <Card className="mt-4">
          <CardTitle title="Continent mastery" subtitle="How well you know each region" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {CONTINENTS.map((c) => {
              const s = byContinent[c.id];
              const plays = s?.rounds_played ?? 0;
              const wins = s?.rounds_won ?? 0;
              const acc = plays ? wins / plays : 0;
              return (
                <div
                  key={c.id}
                  className="rounded-xl border border-white/10 bg-white/5 p-4 flex items-center gap-4 relative overflow-hidden"
                >
                  <div
                    className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-30 blur-2xl"
                    style={{ background: c.accent }}
                  />
                  <ProgressRing
                    value={acc}
                    size={72}
                    stroke={8}
                    color={c.accent}
                    label={`${Math.round(acc * 100)}%`}
                    sublabel={c.emoji}
                  />
                  <div className="min-w-0">
                    <div className="font-semibold text-mist-50">{c.name}</div>
                    <div className="text-xs text-mist-400">
                      {plays} plays · {wins} correct
                    </div>
                    <div className="text-xs text-mist-400 mt-1 flex items-center gap-1">
                      <Flame size={12} className="text-rose-300" /> Best streak {s?.best_streak ?? 0}
                    </div>
                    {s?.best_time_ms && (
                      <div className="text-xs text-mist-400 flex items-center gap-1">
                        <Clock size={12} /> Best time {formatDuration(s.best_time_ms)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          {/* Countries to review */}
          <Card>
            <CardTitle
              title={<span className="flex items-center gap-2"><AlertTriangle size={16} className="text-amber-300" /> Countries to review</span>}
              subtitle="Most commonly missed or slowest"
            />
            {missed.length ? (
              <div className="flex flex-col divide-y divide-white/5">
                {missed.map(({ row, meta, accuracy }) => (
                  <div key={row.country_id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-2">
                      <span>{meta?.flag}</span>
                      <div>
                        <div className="text-sm font-medium text-mist-50">{meta?.name}</div>
                        <div className="text-[11px] text-mist-400">
                          {row.seen} seen · {row.correct} correct · {row.wrong_attempts} wrong
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="display-num font-semibold text-mist-100">
                        {Math.round(accuracy * 100)}%
                      </div>
                      {row.best_time_ms && (
                        <div className="text-[11px] text-mist-400">
                          {formatDuration(row.best_time_ms)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-mist-400">
                No struggle zones yet. Play some rounds to see where to focus.
              </div>
            )}
          </Card>

          <Card>
            <CardTitle
              title={<span className="flex items-center gap-2"><Trophy size={16} className="text-amber-300" /> Recent rounds</span>}
              subtitle="Your last 30 attempts across all sessions"
            />
            {data.recent.length ? (
              <div className="flex flex-col divide-y divide-white/5">
                {data.recent.map((r) => {
                  const meta = getCountryById(r.target_country_id);
                  const cont = getContinent((r.continent as any) ?? "europe");
                  return (
                    <div key={r.id} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span>{meta?.flag}</span>
                        <div className="min-w-0">
                          <div className="text-sm text-mist-50 truncate">{meta?.name ?? r.target_country_id}</div>
                          <div className="text-[11px] text-mist-400">
                            {cont.emoji} {cont.name} · {r.guesses} guess{r.guesses === 1 ? "" : "es"}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`display-num text-sm font-semibold ${r.solved ? "text-emerald-300" : "text-rose-300"}`}>
                          {r.solved ? `+${r.score}` : "missed"}
                        </div>
                        <div className="text-[11px] text-mist-400 flex items-center justify-end gap-1">
                          <Clock size={10} /> {formatDuration(r.time_ms)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-mist-400">
                No rounds yet — start a session to fill this in.
              </div>
            )}
          </Card>
        </div>

        <Card className="mt-4">
          <CardTitle
            title={<span className="flex items-center gap-2"><Target size={16} className="text-cyan-300" /> Performance heatmap</span>}
            subtitle="Colored by how well you know each seen country"
          />
          <CountryHeatmap stats={data.countries} />
        </Card>
      </div>
    </div>
  );
}

function CountryHeatmap({ stats }: { stats: CountryStatRow[] }) {
  const byContinent: Record<string, CountryStatRow[]> = {};
  stats.forEach((s) => {
    const meta = COUNTRIES_BY_ID.get(s.country_id);
    if (!meta) return;
    (byContinent[meta.continent] ??= []).push(s);
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {CONTINENTS.map((c) => {
        const arr = byContinent[c.id] ?? [];
        if (!arr.length) return (
          <div key={c.id}>
            <div className="text-xs text-mist-400 mb-2">{c.emoji} {c.name} — no data yet</div>
          </div>
        );
        const sorted = arr.slice().sort((a, b) => {
          const ma = COUNTRIES_BY_ID.get(a.country_id)!.name;
          const mb = COUNTRIES_BY_ID.get(b.country_id)!.name;
          return ma.localeCompare(mb);
        });
        return (
          <div key={c.id}>
            <div className="text-xs text-mist-400 mb-2">
              {c.emoji} {c.name}
            </div>
            <div className="flex flex-wrap gap-1">
              {sorted.map((s) => {
                const meta = COUNTRIES_BY_ID.get(s.country_id)!;
                const acc = s.correct / Math.max(1, s.seen);
                const hue = Math.round(140 * acc); // 0 red -> 140 green
                const bg = `hsl(${hue} 70% 45% / 0.4)`;
                const border = `hsl(${hue} 70% 55% / 0.9)`;
                return (
                  <div
                    key={s.country_id}
                    title={`${meta.name} — ${Math.round(acc * 100)}% · ${s.seen} seen`}
                    className="rounded-md px-1.5 py-1 text-[11px] border"
                    style={{ background: bg, borderColor: border }}
                  >
                    {meta.shortName ?? meta.name}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

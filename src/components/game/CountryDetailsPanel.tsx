import type { CountryMeta } from "@/data/countries";

interface Props {
  country: CountryMeta | null;
  continentName: string;
}

function formatPopulation(populationInMillions?: number) {
  if (populationInMillions === undefined) return "Not listed";
  const digits = populationInMillions < 1 ? 3 : populationInMillions < 10 ? 2 : 1;
  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
  }).format(populationInMillions)} million`;
}

export function CountryDetailsPanel({ country, continentName }: Props) {
  if (!country) {
    return (
      <div className="glass rounded-2xl p-4 sm:p-5">
        <div className="text-[11px] uppercase tracking-[0.15em] text-mist-400">
          Country details
        </div>
        <div className="mt-2 text-sm text-mist-300 leading-relaxed">
          Select any country on the map or in the list to study its capital,
          population, and key fact for {continentName}.
        </div>
      </div>
    );
  }

  return (
    <div className="glass-strong rounded-2xl p-4 sm:p-5 relative overflow-hidden">
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background:
            "radial-gradient(280px 180px at 100% 0%, rgba(34,211,238,0.28), transparent 60%)",
        }}
      />

      <div className="relative">
        <div className="text-[11px] uppercase tracking-[0.15em] text-mist-400">
          Country details
        </div>

        <div className="mt-2 flex items-start gap-3">
          <div className="text-3xl leading-none" aria-hidden>
            {country.flag}
          </div>
          <div className="min-w-0">
            <h3 className="font-display text-xl sm:text-2xl font-extrabold leading-tight">
              {country.name}
            </h3>
            {country.shortName && (
              <div className="text-xs text-mist-400 mt-0.5">
                Also known as {country.shortName}
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 xs:grid-cols-2 gap-2.5">
          <Detail label="Capital" value={country.capital} />
          <Detail label="Population" value={formatPopulation(country.population)} />
        </div>

        <div className="mt-3 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-mist-200 leading-relaxed">
          {country.fact}
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 p-2.5">
      <div className="text-[10px] uppercase tracking-[0.15em] text-mist-400">{label}</div>
      <div className="mt-0.5 text-sm font-semibold text-mist-100">{value}</div>
    </div>
  );
}

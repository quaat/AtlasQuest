import { cn } from "@/lib/utils";

interface Option<T extends string> {
  value: T;
  label: React.ReactNode;
  hint?: string;
}

interface Props<T extends string> {
  value: T;
  onChange: (v: T) => void;
  options: Option<T>[];
  className?: string;
  size?: "sm" | "md";
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  className,
  size = "md",
}: Props<T>) {
  return (
    <div
      role="radiogroup"
      className={cn(
        "inline-flex items-center gap-1 rounded-xl p-1 glass hairline",
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={cn(
              "relative rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora-cyan/60",
              size === "sm" ? "text-xs px-2.5 py-1" : "text-sm px-3 py-1.5",
              active
                ? "bg-gradient-to-b from-white/12 to-white/6 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]"
                : "text-mist-300 hover:text-white hover:bg-white/5",
            )}
            title={opt.hint}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

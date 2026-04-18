import { cn } from "@/lib/utils";

interface Props {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  description?: string;
  id?: string;
}

export function Toggle({ checked, onChange, label, description, id }: Props) {
  return (
    <label
      htmlFor={id}
      className="flex items-center justify-between gap-4 cursor-pointer select-none py-2"
    >
      <div>
        {label && <div className="text-sm font-medium text-mist-50">{label}</div>}
        {description && (
          <div className="text-xs text-mist-400 mt-0.5">{description}</div>
        )}
      </div>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-10 shrink-0 cursor-pointer rounded-full transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora-cyan/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950",
          checked ? "bg-cyan-500" : "bg-white/10 border border-white/10",
        )}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform",
            checked ? "translate-x-5" : "translate-x-0.5 translate-y-[1px]",
          )}
        />
      </button>
    </label>
  );
}

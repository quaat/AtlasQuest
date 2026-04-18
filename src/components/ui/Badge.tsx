import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Tone = "default" | "success" | "error" | "warn" | "primary" | "accent";

const toneMap: Record<Tone, string> = {
  default: "bg-white/6 border-white/10 text-mist-200",
  success:
    "bg-emerald-500/15 border-emerald-400/30 text-emerald-200",
  error: "bg-rose-500/15 border-rose-400/30 text-rose-200",
  warn: "bg-amber-500/15 border-amber-400/30 text-amber-200",
  primary: "bg-cyan-500/15 border-cyan-400/30 text-cyan-200",
  accent: "bg-violet-500/15 border-violet-400/30 text-violet-200",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ tone = "default", className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        toneMap[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}

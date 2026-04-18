import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "glass rounded-2xl p-5 relative overflow-hidden",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  title,
  subtitle,
  right,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div className="mb-3 flex items-start justify-between gap-3">
      <div>
        <div className="text-sm font-semibold text-mist-100">{title}</div>
        {subtitle && <div className="text-xs text-mist-400 mt-0.5">{subtitle}</div>}
      </div>
      {right}
    </div>
  );
}

export function Stat({
  label,
  value,
  sub,
  tint,
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  tint?: string;
}) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-[0.12em] text-mist-400">
        {label}
      </div>
      <div
        className="display-num text-2xl font-bold mt-1"
        style={tint ? { color: tint } : undefined}
      >
        {value}
      </div>
      {sub && <div className="text-xs text-mist-400 mt-0.5">{sub}</div>}
    </div>
  );
}

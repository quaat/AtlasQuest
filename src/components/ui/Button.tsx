import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "danger" | "subtle";
type Size = "sm" | "md" | "lg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const sizeMap: Record<Size, string> = {
  sm: "text-xs px-3 py-1.5 rounded-lg",
  md: "text-sm px-4 py-2.5 rounded-xl",
  lg: "text-base px-5 py-3 rounded-xl",
};

const variantMap: Record<Variant, string> = {
  primary: "btn-primary",
  ghost: "btn-ghost",
  danger: "btn-danger",
  subtle:
    "bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-mist-100",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = "ghost", size = "md", iconLeft, iconRight, children, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      className={cn(
        "btn inline-flex items-center justify-center gap-2 font-semibold transition-all select-none",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aurora-cyan/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        sizeMap[size],
        variantMap[variant],
        className,
      )}
      {...rest}
    >
      {iconLeft}
      {children}
      {iconRight}
    </button>
  );
});

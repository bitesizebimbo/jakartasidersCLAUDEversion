import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type BadgeVariant = "default" | "ink" | "signal" | "outline";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  default: "bg-grey-100 text-ink border border-grey-200",
  ink: "bg-ink text-paper border border-ink",
  signal: "bg-signal text-paper border border-signal",
  outline: "bg-transparent text-ink border border-ink",
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider",
        VARIANT_CLASSES[variant],
        className
      )}
      {...props}
    />
  );
}

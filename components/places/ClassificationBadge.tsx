import { Flame, Gem } from "lucide-react";
import type { PlaceClassification } from "@/types/place";
import { cn } from "@/lib/utils/cn";

const CONFIG: Record<
  PlaceClassification,
  { label: string; icon: typeof Flame; className: string }
> = {
  VIRAL: { label: "VIRAL ↑", icon: Flame, className: "bg-signal text-paper border-signal" },
  HIDDEN_GEM: { label: "GEM ◇", icon: Gem, className: "bg-transparent text-ink border-ink" },
  WATCHLIST: { label: "WATCHLIST", icon: Gem, className: "bg-grey-100 text-grey-500 border-grey-300" },
};

export function ClassificationBadge({
  classification,
  size = "md",
  className,
}: {
  classification: PlaceClassification;
  size?: "sm" | "md";
  className?: string;
}) {
  const { label, icon: Icon, className: variantClass } = CONFIG[classification];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border font-mono font-semibold uppercase tracking-wider",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        variantClass,
        className
      )}
    >
      <Icon size={size === "sm" ? 11 : 13} strokeWidth={2} />
      {label}
    </span>
  );
}

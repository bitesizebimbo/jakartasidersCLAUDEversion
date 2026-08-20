import { formatScore } from "@/lib/utils/format";
import { cn } from "@/lib/utils/cn";

export function GemScore({
  score,
  size = "md",
  className,
}: {
  score: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-grey-500">
        Gem Score
      </span>
      <span
        className={cn(
          "font-mono font-semibold tabular-nums text-ink",
          size === "sm" && "text-lg",
          size === "md" && "text-2xl",
          size === "lg" && "text-4xl"
        )}
      >
        {formatScore(score)}
        <span className="text-grey-400"> / 100</span>
      </span>
    </div>
  );
}

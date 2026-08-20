import { cn } from "@/lib/utils/cn";

export function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "shrink-0 border px-3 py-1.5 text-xs font-medium uppercase tracking-wide transition-colors",
        active
          ? "border-ink bg-ink text-paper"
          : "border-grey-300 bg-paper text-grey-600 hover:border-ink hover:text-ink"
      )}
    >
      {label}
    </button>
  );
}

"use client";

import { NEIGHBORHOODS, type NeighborhoodSlug } from "@/types/place";
import { cn } from "@/lib/utils/cn";
import { track } from "@/lib/analytics";

const FEATURED_ORDER: NeighborhoodSlug[] = [
  "blok-m",
  "senopati",
  "kemang",
  "cipete",
  "cilandak",
  "pondok-indah",
  "scbd",
  "menteng",
  "tebet",
  "pik",
];

export function NeighborhoodSelector({
  active,
  onSelect,
}: {
  active: NeighborhoodSlug | null;
  onSelect: (slug: NeighborhoodSlug | null) => void;
}) {
  const ordered = [
    ...FEATURED_ORDER,
    ...NEIGHBORHOODS.map((n) => n.slug).filter((s) => !FEATURED_ORDER.includes(s)),
  ];

  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar" role="tablist" aria-label="Neighborhoods">
      {ordered.map((slug) => {
        const neighborhood = NEIGHBORHOODS.find((n) => n.slug === slug)!;
        const isActive = active === slug;
        return (
          <button
            key={slug}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => {
              const next = isActive ? null : slug;
              onSelect(next);
              if (next) track("neighborhood_selected", { neighborhood: next });
            }}
            className={cn(
              "shrink-0 whitespace-nowrap border px-3 py-1.5 text-xs font-medium uppercase tracking-wide transition-colors",
              isActive
                ? "border-ink bg-ink text-paper"
                : "border-grey-300 bg-paper text-grey-600 hover:border-ink hover:text-ink"
            )}
          >
            {neighborhood.name}
          </button>
        );
      })}
    </div>
  );
}

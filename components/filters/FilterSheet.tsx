"use client";

import type { ReactNode } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { FilterChip } from "./FilterChip";
import {
  BEVERAGE_TYPES,
  CUISINE_SLUGS,
  PLACE_TYPES,
  PRICE_LABELS,
  type CuisineSlug,
  type PlaceType,
  type PriceLevel,
} from "@/types/place";
import {
  DEFAULT_FILTERS,
  countActiveFilters,
  type AudienceFilter,
  type DiscoveryStatus,
  type DistanceFilter,
  type PlaceFilters,
} from "@/types/filters";
import { titleCase } from "@/lib/utils/format";
import { track } from "@/lib/analytics";

const STATUS_OPTIONS: { value: DiscoveryStatus; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "VIRAL", label: "Viral" },
  { value: "HIDDEN_GEM", label: "Hidden Gems" },
];

const AUDIENCE_OPTIONS: { value: NonNullable<AudienceFilter>; label: string }[] = [
  { value: "MOSTLY_LOCAL", label: "Mostly Locals" },
  { value: "MIXED", label: "Mixed" },
  { value: "MOSTLY_TOURIST", label: "Mostly Tourists" },
];

const DISTANCE_OPTIONS: { value: NonNullable<DistanceFilter>; label: string }[] = [
  { value: 1, label: "< 1 km" },
  { value: 3, label: "< 3 km" },
  { value: 5, label: "< 5 km" },
  { value: 10, label: "< 10 km" },
];

const PRICE_OPTIONS: PriceLevel[] = [1, 2, 3, 4];

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function FilterSheet({
  open,
  onOpenChange,
  filters,
  onChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: PlaceFilters;
  onChange: (filters: PlaceFilters) => void;
}) {
  function update(patch: Partial<PlaceFilters>) {
    const next = { ...filters, ...patch };
    onChange(next);
    track("filter_changed", { ...patch } as Record<string, string | number | boolean | null>);
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Filters"
      className="max-w-lg sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2"
    >
      <div className="flex flex-col gap-6 px-5 pb-8 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide">Filters</h2>
          <button
            type="button"
            onClick={() => onChange(DEFAULT_FILTERS)}
            className="font-mono text-xs uppercase tracking-wide text-grey-500 hover:text-ink"
          >
            Clear all ({countActiveFilters(filters)})
          </button>
        </div>

        <FilterSection title="Discovery status">
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((opt) => (
              <FilterChip
                key={opt.value}
                label={opt.label}
                active={filters.status === opt.value}
                onClick={() => update({ status: opt.value })}
              />
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Place type">
          <div className="flex flex-wrap gap-2">
            {PLACE_TYPES.map((opt) => (
              <FilterChip
                key={opt.value}
                label={opt.label}
                active={filters.placeTypes.includes(opt.value)}
                onClick={() =>
                  update({ placeTypes: toggle<PlaceType>(filters.placeTypes, opt.value) })
                }
              />
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Beverage">
          <div className="flex flex-wrap gap-2">
            {BEVERAGE_TYPES.map((opt) => (
              <FilterChip
                key={opt.value}
                label={opt.label}
                active={filters.beverage === opt.value}
                onClick={() =>
                  update({ beverage: filters.beverage === opt.value ? null : opt.value })
                }
              />
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Cuisine">
          <div className="flex flex-wrap gap-2">
            {CUISINE_SLUGS.map((slug) => (
              <FilterChip
                key={slug}
                label={titleCase(slug)}
                active={filters.cuisines.includes(slug)}
                onClick={() => update({ cuisines: toggle<CuisineSlug>(filters.cuisines, slug) })}
              />
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Price">
          <div className="flex flex-wrap gap-2">
            {PRICE_OPTIONS.map((level) => (
              <FilterChip
                key={level}
                label={PRICE_LABELS[level]}
                active={filters.priceLevels.includes(level)}
                onClick={() => update({ priceLevels: toggle<PriceLevel>(filters.priceLevels, level) })}
              />
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Audience">
          <div className="flex flex-wrap gap-2">
            {AUDIENCE_OPTIONS.map((opt) => (
              <FilterChip
                key={opt.value}
                label={opt.label}
                active={filters.audience === opt.value}
                onClick={() => update({ audience: filters.audience === opt.value ? null : opt.value })}
              />
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Distance">
          <div className="flex flex-wrap gap-2">
            {DISTANCE_OPTIONS.map((opt) => (
              <FilterChip
                key={opt.value}
                label={opt.label}
                active={filters.distanceKm === opt.value}
                onClick={() =>
                  update({ distanceKm: filters.distanceKm === opt.value ? null : opt.value })
                }
              />
            ))}
          </div>
        </FilterSection>

        <Button variant="primary" className="w-full" onClick={() => onOpenChange(false)}>
          Show results
        </Button>
      </div>
    </BottomSheet>
  );
}

function FilterSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-grey-500">{title}</h3>
      {children}
    </section>
  );
}

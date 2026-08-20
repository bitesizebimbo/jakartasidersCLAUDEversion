"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import type { Coordinates } from "@/types/geo";
import type { PlaceWithDistance } from "@/types/place";
import { useSearchPlaces } from "@/hooks/useSearchPlaces";
import { PRICE_LABELS } from "@/types/place";
import { titleCase } from "@/lib/utils/format";
import { track } from "@/lib/analytics";

export function SearchBar({
  origin,
  onSelectPlace,
  placeholder = "Search ramen, Cipete, coffee, Padang…",
}: {
  origin: Coordinates | null;
  onSelectPlace: (place: PlaceWithDistance) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const { data: results, isFetching } = useSearchPlaces(query, origin);
  const trackedRef = useRef("");

  useEffect(() => {
    if (results && query.trim() && trackedRef.current !== query.trim()) {
      trackedRef.current = query.trim();
      track("search_performed", { query: query.trim(), resultCount: results.length });
    }
  }, [results, query]);

  const showResults = focused && query.trim().length > 0;

  return (
    <div className="relative w-full">
      <div className="flex h-12 items-center gap-2 border border-ink bg-paper px-3 shadow-sm">
        <Search size={17} strokeWidth={1.75} className="shrink-0 text-grey-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder={placeholder}
          aria-label="Search places, cuisines, or neighborhoods"
          className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-grey-400"
        />
        {query && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={() => setQuery("")}
            className="text-grey-400 hover:text-ink"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {showResults && (
        <div className="absolute inset-x-0 top-[calc(100%+6px)] max-h-80 overflow-y-auto border border-ink bg-paper shadow-lg">
          {isFetching && (
            <p className="px-4 py-3 font-mono text-xs uppercase tracking-wide text-grey-500">
              Searching…
            </p>
          )}
          {!isFetching && results?.length === 0 && (
            <div className="px-4 py-4 text-center">
              <p className="font-mono text-xs uppercase tracking-wide text-grey-500">Nothing here yet</p>
              <p className="mt-1 text-xs text-grey-500">Try a different dish, cuisine, or neighborhood.</p>
            </div>
          )}
          <ul>
            {results?.slice(0, 8).map((place) => (
              <li key={place.id}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    onSelectPlace(place);
                    setQuery("");
                  }}
                  className="flex w-full items-center justify-between gap-3 border-b border-grey-100 px-4 py-2.5 text-left last:border-b-0 hover:bg-grey-50"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{place.name}</span>
                    <span className="block truncate text-xs text-grey-500">
                      {titleCase(place.neighborhood)} · {PRICE_LABELS[place.priceLevel]}
                    </span>
                  </span>
                  <span className="shrink-0 font-mono text-[10px] uppercase tracking-wide text-grey-400">
                    {place.classification === "VIRAL" ? "Viral" : place.classification === "HIDDEN_GEM" ? "Gem" : ""}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

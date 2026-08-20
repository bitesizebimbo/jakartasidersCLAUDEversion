"use client";

import { useState } from "react";
import { Bookmark, LayoutGrid, Map as MapIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "@/hooks/useAuthModal";
import { useSavedPlacesWithDetails } from "@/hooks/useSavedPlaces";
import { useCollectionPlaces } from "@/hooks/useCollections";
import { CollectionsRail } from "@/components/saved/CollectionsRail";
import { SavedMapView } from "@/components/saved/SavedMapView";
import { PlaceCard } from "@/components/places/PlaceCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { PlaceRowSkeletonList } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils/cn";

export default function SavedPage() {
  const { user, loading, isConfigured } = useAuth();
  const { openModal } = useAuthModal();
  const [viewMode, setViewMode] = useState<"cards" | "map">("cards");
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);

  const { data: allSaved, isLoading: allLoading } = useSavedPlacesWithDetails();
  const { data: collectionPlaces, isLoading: collectionLoading } = useCollectionPlaces(activeCollectionId);

  const places = activeCollectionId ? collectionPlaces : allSaved;
  const isLoading = activeCollectionId ? collectionLoading : allLoading;

  if (!isConfigured) {
    return (
      <main className="flex min-h-0 flex-1 items-center justify-center px-6">
        <EmptyState
          icon={<Bookmark size={22} strokeWidth={1.5} />}
          title="SAVING ISN'T CONFIGURED YET"
          description="This environment doesn't have Supabase configured, so saved places and collections aren't available yet."
        />
      </main>
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-0 flex-1 flex-col gap-6 pt-[calc(env(safe-area-inset-top)+20px)]">
        <PlaceRowSkeletonList />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="flex min-h-0 flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center border border-ink">
          <Bookmark size={20} strokeWidth={1.5} />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-xl font-semibold tracking-tight">SIGN IN TO SEE YOUR SAVES</h1>
          <p className="max-w-xs text-sm text-grey-600">
            Save places while browsing the map or Explore, then find them all here.
          </p>
        </div>
        <div className="w-full max-w-xs">
          <GoogleSignInButton redirectTo="/saved" />
        </div>
        <Button variant="ghost" size="sm" onClick={() => openModal("/saved")}>
          Or open sign-in
        </Button>
      </main>
    );
  }

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-8">
      <header className="flex flex-col gap-4 border-b border-ink px-4 pb-4 pt-[calc(env(safe-area-inset-top)+20px)]">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold tracking-tight">SAVED</h1>
          <div className="flex border border-ink">
            <button
              type="button"
              aria-label="Card view"
              aria-pressed={viewMode === "cards"}
              onClick={() => setViewMode("cards")}
              className={cn("flex h-9 w-9 items-center justify-center", viewMode === "cards" && "bg-ink text-paper")}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              type="button"
              aria-label="Map view"
              aria-pressed={viewMode === "map"}
              onClick={() => setViewMode("map")}
              className={cn("flex h-9 w-9 items-center justify-center border-l border-ink", viewMode === "map" && "bg-ink text-paper")}
            >
              <MapIcon size={16} />
            </button>
          </div>
        </div>
        <CollectionsRail activeId={activeCollectionId} onSelect={setActiveCollectionId} />
      </header>

      <div className="flex-1 px-4 pt-4">
        {isLoading ? (
          <PlaceRowSkeletonList />
        ) : !places || places.length === 0 ? (
          <EmptyState
            title="NOTHING SAVED YET"
            description={
              activeCollectionId
                ? "Add places to this collection from any place page."
                : "Tap the bookmark icon on any place to save it here."
            }
          />
        ) : viewMode === "map" ? (
          <SavedMapView places={places} />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {places.map((place) => (
              <PlaceCard key={place.id} place={place} className="w-full" />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

"use client";

import { useState } from "react";
import { Check, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useAuth } from "@/hooks/useAuth";
import {
  useCollections,
  useCreateCollection,
  useToggleCollectionPlace,
} from "@/hooks/useCollections";

function usePlaceCollectionIds(placeId: string, enabled: boolean) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["collection-places", "for-place", placeId, user?.id],
    queryFn: async (): Promise<string[]> => {
      const res = await fetch(`/api/collections/for-place?placeId=${placeId}`);
      if (!res.ok) return [];
      const json = await res.json();
      return json.collectionIds ?? [];
    },
    enabled: enabled && Boolean(user),
  });
}

export function CollectionPicker({
  open,
  onOpenChange,
  placeId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placeId: string;
}) {
  const { data: collections, isLoading } = useCollections();
  const { data: placeCollectionIds } = usePlaceCollectionIds(placeId, open);
  const createCollection = useCreateCollection();
  const toggle = useToggleCollectionPlace();
  const [newName, setNewName] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!newName.trim()) return;
    setError(null);
    try {
      await createCollection.mutateAsync(newName.trim());
      setNewName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't create collection");
    }
  }

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Add to collection"
      className="max-w-md sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2"
    >
      <div className="flex flex-col gap-4 px-5 pb-8 pt-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide">Add to collection</h2>

        {isLoading && <p className="text-xs text-grey-500">Loading collections…</p>}

        {!isLoading && collections && collections.length === 0 && (
          <EmptyState
            title="No collections yet"
            description="Create your first collection below — e.g. Date Night, Coffee, Cheap Eats."
          />
        )}

        <ul className="flex flex-col divide-y divide-grey-200 border border-grey-200">
          {collections?.map((collection) => {
            const inCollection = Boolean(placeCollectionIds?.includes(collection.id));
            return (
              <li key={collection.id}>
                <button
                  type="button"
                  onClick={() =>
                    toggle.mutate({ collectionId: collection.id, placeId, inCollection })
                  }
                  className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-grey-50"
                >
                  <span>
                    {collection.name}
                    <span className="ml-2 font-mono text-xs text-grey-400">
                      {collection.placeCount ?? 0}
                    </span>
                  </span>
                  {inCollection && <Check size={16} strokeWidth={2} />}
                </button>
              </li>
            );
          })}
        </ul>

        <div className="flex gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="New collection name"
            aria-label="New collection name"
            className="h-11 flex-1 border border-grey-300 bg-paper px-3 text-sm outline-none focus:border-ink"
          />
          <Button
            variant="outline"
            onClick={handleCreate}
            disabled={createCollection.isPending || !newName.trim()}
            aria-label="Create collection"
          >
            <Plus size={16} />
          </Button>
        </div>
        {error && <p className="text-xs text-signal">{error}</p>}
      </div>
    </BottomSheet>
  );
}

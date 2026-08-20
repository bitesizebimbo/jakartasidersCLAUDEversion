"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import type { Collection } from "@/types/collection";
import {
  useCollections,
  useCreateCollection,
  useDeleteCollection,
  useRenameCollection,
} from "@/hooks/useCollections";
import { cn } from "@/lib/utils/cn";

export function CollectionsRail({
  activeId,
  onSelect,
}: {
  activeId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const { data: collections } = useCollections();
  const createCollection = useCreateCollection();
  const renameCollection = useRenameCollection();
  const deleteCollection = useDeleteCollection();

  const [creating, setCreating] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  async function handleCreate() {
    if (!draftName.trim()) return;
    await createCollection.mutateAsync(draftName.trim()).catch(() => null);
    setDraftName("");
    setCreating(false);
  }

  async function handleRename(collection: Collection) {
    if (!editName.trim() || editName.trim() === collection.name) {
      setEditingId(null);
      return;
    }
    await renameCollection.mutateAsync({ id: collection.id, name: editName.trim() });
    setEditingId(null);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => onSelect(null)}
        className={cn(
          "border px-3 py-1.5 text-xs font-medium uppercase tracking-wide",
          activeId === null ? "border-ink bg-ink text-paper" : "border-grey-300 text-grey-600 hover:border-ink"
        )}
      >
        All Saved
      </button>

      {collections?.map((collection) =>
        editingId === collection.id ? (
          <span key={collection.id} className="flex items-center gap-1 border border-ink px-1.5 py-1">
            <input
              autoFocus
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRename(collection)}
              className="w-28 bg-transparent text-xs outline-none"
            />
            <button type="button" aria-label="Save name" onClick={() => handleRename(collection)}>
              <Pencil size={12} />
            </button>
          </span>
        ) : (
          <span
            key={collection.id}
            className={cn(
              "group flex items-center gap-1.5 border px-3 py-1.5 text-xs font-medium uppercase tracking-wide",
              activeId === collection.id
                ? "border-ink bg-ink text-paper"
                : "border-grey-300 text-grey-600 hover:border-ink"
            )}
          >
            <button type="button" onClick={() => onSelect(collection.id)}>
              {collection.name} <span className="font-mono opacity-60">{collection.placeCount ?? 0}</span>
            </button>
            <button
              type="button"
              aria-label={`Rename ${collection.name}`}
              onClick={() => {
                setEditingId(collection.id);
                setEditName(collection.name);
              }}
              className="opacity-50 hover:opacity-100"
            >
              <Pencil size={11} />
            </button>
            <button
              type="button"
              aria-label={`Delete ${collection.name}`}
              onClick={() => {
                if (confirm(`Delete "${collection.name}"?`)) {
                  deleteCollection.mutate(collection.id);
                  if (activeId === collection.id) onSelect(null);
                }
              }}
              className="opacity-50 hover:opacity-100"
            >
              <Trash2 size={11} />
            </button>
          </span>
        )
      )}

      {creating ? (
        <span className="flex items-center gap-1 border border-ink px-1.5 py-1">
          <input
            autoFocus
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="Collection name"
            className="w-28 bg-transparent text-xs outline-none"
          />
          <button type="button" aria-label="Create collection" onClick={handleCreate}>
            <Plus size={12} />
          </button>
          <button type="button" aria-label="Cancel" onClick={() => setCreating(false)}>
            <X size={12} />
          </button>
        </span>
      ) : (
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="flex items-center gap-1 border border-dashed border-grey-300 px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-grey-500 hover:border-ink hover:text-ink"
        >
          <Plus size={12} /> New
        </button>
      )}
    </div>
  );
}

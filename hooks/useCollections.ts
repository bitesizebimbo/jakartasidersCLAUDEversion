"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Collection } from "@/types/collection";
import type { PlaceWithDistance } from "@/types/place";
import { useAuth } from "@/hooks/useAuth";
import { track } from "@/lib/analytics";

async function fetchCollections(): Promise<Collection[]> {
  const res = await fetch("/api/collections");
  if (!res.ok) return [];
  const json = await res.json();
  return json.collections ?? [];
}

export function useCollections() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["collections", user?.id],
    queryFn: fetchCollections,
    enabled: Boolean(user),
    staleTime: 15_000,
  });
}

export function useCollectionPlaces(collectionId: string | null) {
  return useQuery({
    queryKey: ["collection-places", collectionId],
    queryFn: async (): Promise<PlaceWithDistance[]> => {
      const res = await fetch(`/api/collections/${collectionId}/places`);
      if (!res.ok) return [];
      const json = await res.json();
      return json.places ?? [];
    },
    enabled: Boolean(collectionId),
  });
}

export function useCreateCollection() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error ?? "Failed to create collection");
      }
      return res.json();
    },
    onSuccess: () => {
      track("collection_created");
      queryClient.invalidateQueries({ queryKey: ["collections", user?.id] });
    },
  });
}

export function useRenameCollection() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const res = await fetch(`/api/collections/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to rename collection");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["collections", user?.id] }),
  });
}

export function useDeleteCollection() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/collections/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete collection");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["collections", user?.id] }),
  });
}

export function useToggleCollectionPlace() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      collectionId,
      placeId,
      inCollection,
    }: {
      collectionId: string;
      placeId: string;
      inCollection: boolean;
    }) => {
      const res = await fetch(
        inCollection
          ? `/api/collections/${collectionId}/places/${placeId}`
          : `/api/collections/${collectionId}/places`,
        {
          method: inCollection ? "DELETE" : "POST",
          headers: inCollection ? undefined : { "Content-Type": "application/json" },
          body: inCollection ? undefined : JSON.stringify({ placeId }),
        }
      );
      if (!res.ok) throw new Error("Failed to update collection");
    },
    onSuccess: (_data, { inCollection }) => {
      if (!inCollection) track("collection_place_added");
      queryClient.invalidateQueries({ queryKey: ["collections", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["collection-places"] });
    },
  });
}

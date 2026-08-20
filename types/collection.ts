export interface SavedPlace {
  id: string;
  userId: string;
  placeId: string;
  createdAt: string;
}

export interface Collection {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  placeCount?: number;
}

export interface CollectionPlace {
  collectionId: string;
  placeId: string;
  createdAt: string;
}

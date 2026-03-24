'use client';

import { useState, useCallback, useEffect } from 'react';
import type { ApiCollection, ApiRequest, ApiFolder } from '@/types';
import { useStorage } from './useStorage';
import { createEmptyCollection, createEmptyRequest, createEmptyFolder } from '@/lib/utils';

export function useCollections() {
  const storage = useStorage();
  const [collections, setCollections] = useState<ApiCollection[]>([]);

  useEffect(() => {
    setCollections(storage.getCollections());
  }, [storage]);

  const persist = useCallback(
    (updated: ApiCollection[]) => {
      setCollections(updated);
      storage.saveCollections(updated);
    },
    [storage]
  );

  const addCollection = useCallback(
    (name?: string) => {
      const col = createEmptyCollection(name);
      persist([...collections, col]);
      return col;
    },
    [collections, persist]
  );

  const deleteCollection = useCallback(
    (id: string) => {
      persist(collections.filter((c) => c.id !== id));
    },
    [collections, persist]
  );

  const renameCollection = useCallback(
    (id: string, name: string) => {
      persist(
        collections.map((c) => (c.id === id ? { ...c, name } : c))
      );
    },
    [collections, persist]
  );

  const addRequestToCollection = useCallback(
    (collectionId: string, name?: string) => {
      const req = createEmptyRequest(name);
      persist(
        collections.map((c) =>
          c.id === collectionId
            ? { ...c, requests: [...c.requests, req] }
            : c
        )
      );
      return req;
    },
    [collections, persist]
  );

  const addFolderToCollection = useCallback(
    (collectionId: string, name?: string) => {
      const folder = createEmptyFolder(name);
      persist(
        collections.map((c) =>
          c.id === collectionId
            ? { ...c, folders: [...c.folders, folder] }
            : c
        )
      );
      return folder;
    },
    [collections, persist]
  );

  const updateRequest = useCallback(
    (collectionId: string, request: ApiRequest) => {
      persist(
        collections.map((c) => {
          if (c.id !== collectionId) return c;
          return {
            ...c,
            requests: c.requests.map((r) => (r.id === request.id ? request : r)),
            folders: c.folders.map((f) => ({
              ...f,
              requests: f.requests.map((r) => (r.id === request.id ? request : r)),
            })),
          };
        })
      );
    },
    [collections, persist]
  );

  const deleteRequest = useCallback(
    (collectionId: string, requestId: string) => {
      persist(
        collections.map((c) => {
          if (c.id !== collectionId) return c;
          return {
            ...c,
            requests: c.requests.filter((r) => r.id !== requestId),
            folders: c.folders.map((f) => ({
              ...f,
              requests: f.requests.filter((r) => r.id !== requestId),
            })),
          };
        })
      );
    },
    [collections, persist]
  );

  const importCollection = useCallback(
    (collection: ApiCollection) => {
      persist([...collections, collection]);
    },
    [collections, persist]
  );

  return {
    collections,
    addCollection,
    deleteCollection,
    renameCollection,
    addRequestToCollection,
    addFolderToCollection,
    updateRequest,
    deleteRequest,
    importCollection,
  };
}

'use client';

import { useState, useCallback, useEffect } from 'react';
import type { HistoryEntry, ApiRequest, ApiResponse } from '@/types';
import { useStorage } from './useStorage';
import { generateId } from '@/lib/utils';

export function useRequestHistory() {
  const storage = useStorage();
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setHistory(storage.getHistory());
  }, [storage]);

  const addEntry = useCallback(
    (request: ApiRequest, response: ApiResponse) => {
      const entry: HistoryEntry = {
        id: generateId(),
        request,
        response,
        timestamp: Date.now(),
      };
      storage.addHistory(entry);
      setHistory(storage.getHistory());
      return entry;
    },
    [storage]
  );

  const clearHistory = useCallback(() => {
    storage.clearHistory();
    setHistory([]);
  }, [storage]);

  return { history, addEntry, clearHistory };
}

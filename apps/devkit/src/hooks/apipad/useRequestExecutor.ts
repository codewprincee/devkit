'use client';

import { useState, useCallback } from 'react';
import type { ApiRequest, ApiResponse } from '@/types/apipad';
import { TauriExecutor, FetchExecutor, type RequestExecutor } from '@/lib/apipad/http';
import { interpolateRequest } from '@/lib/apipad/interpolation';
import { isTauri } from '@/lib/tauri';

function getExecutor(): RequestExecutor {
  return isTauri() ? new TauriExecutor() : new FetchExecutor();
}

export function useRequestExecutor(
  activeVariables: Record<string, string>,
  onHistory: (request: ApiRequest, response: ApiResponse) => void
) {
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const sendRequest = useCallback(
    async (request: ApiRequest) => {
      setLoading(true);
      setResponse(null);

      try {
        const interpolated = interpolateRequest(request, activeVariables);
        const res = await getExecutor().execute(interpolated);
        setResponse(res);
        onHistory(request, res);
        return res;
      } finally {
        setLoading(false);
      }
    },
    [activeVariables, onHistory]
  );

  const clearResponse = useCallback(() => {
    setResponse(null);
  }, []);

  return { response, loading, sendRequest, clearResponse };
}

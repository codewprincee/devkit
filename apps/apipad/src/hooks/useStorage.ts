'use client';

import { useMemo } from 'react';
import { LocalStorageAdapter } from '@/lib/storage';

export function useStorage() {
  const adapter = useMemo(() => new LocalStorageAdapter(), []);
  return adapter;
}

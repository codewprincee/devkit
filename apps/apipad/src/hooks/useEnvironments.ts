'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import type { ApiEnvironment, KeyValuePair } from '@/types';
import { useStorage } from './useStorage';
import { generateId } from '@/lib/utils';

export function useEnvironments() {
  const storage = useStorage();
  const [environments, setEnvironments] = useState<ApiEnvironment[]>([]);

  useEffect(() => {
    setEnvironments(storage.getEnvironments());
  }, [storage]);

  const persist = useCallback(
    (updated: ApiEnvironment[]) => {
      setEnvironments(updated);
      storage.saveEnvironments(updated);
    },
    [storage]
  );

  const addEnvironment = useCallback(
    (name: string) => {
      const env: ApiEnvironment = {
        id: generateId(),
        name,
        variables: [],
        isActive: environments.length === 0,
      };
      persist([...environments, env]);
      return env;
    },
    [environments, persist]
  );

  const deleteEnvironment = useCallback(
    (id: string) => {
      persist(environments.filter((e) => e.id !== id));
    },
    [environments, persist]
  );

  const setActiveEnvironment = useCallback(
    (id: string) => {
      persist(
        environments.map((e) => ({
          ...e,
          isActive: e.id === id,
        }))
      );
    },
    [environments, persist]
  );

  const updateEnvironmentVariables = useCallback(
    (id: string, variables: KeyValuePair[]) => {
      persist(
        environments.map((e) => (e.id === id ? { ...e, variables } : e))
      );
    },
    [environments, persist]
  );

  const activeVariables = useMemo(() => {
    const active = environments.find((e) => e.isActive);
    if (!active) return {};
    const vars: Record<string, string> = {};
    for (const v of active.variables) {
      if (v.enabled && v.key) {
        vars[v.key] = v.value;
      }
    }
    return vars;
  }, [environments]);

  return {
    environments,
    addEnvironment,
    deleteEnvironment,
    setActiveEnvironment,
    updateEnvironmentVariables,
    activeVariables,
  };
}

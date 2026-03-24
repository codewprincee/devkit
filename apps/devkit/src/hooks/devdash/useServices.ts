'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { ServiceStatus } from '@/types/devdash';
import {
  tauriGetDockerContainers,
  tauriDockerAction,
  tauriGetDockerLogs,
  tauriGetMongoStatus,
  tauriGetRedisStatus,
  tauriGetPostgresStatus,
  tauriGetNodeProcesses,
  tauriGetSystemInfo,
} from '@/lib/devdash/tauri-bridge';

const EMPTY_DOCKER: ServiceStatus['docker'] = { containers: [] };
const EMPTY_MONGO: ServiceStatus['mongo'] = {
  connected: false,
  version: '',
  databases: [],
};
const EMPTY_REDIS: ServiceStatus['redis'] = {
  connected: false,
  version: '',
  memoryUsed: '0',
  memoryMax: '0',
  keyCount: 0,
  uptime: '0s',
};
const EMPTY_POSTGRES: ServiceStatus['postgres'] = {
  connected: false,
  version: '',
  databases: [],
};
const EMPTY_NODE: ServiceStatus['node'] = { processes: [] };
const EMPTY_SYSTEM: ServiceStatus['system'] = {
  cpuUsage: 0,
  cpuCores: 0,
  memoryUsed: 0,
  memoryTotal: 0,
  diskUsed: 0,
  diskTotal: 0,
  hostname: '',
  os: '',
  uptime: '0s',
};

export function useServices(pollInterval = 10000) {
  const [services, setServices] = useState<ServiceStatus>({
    docker: EMPTY_DOCKER,
    mongo: EMPTY_MONGO,
    redis: EMPTY_REDIS,
    postgres: EMPTY_POSTGRES,
    node: EMPTY_NODE,
    system: EMPTY_SYSTEM,
  });
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [dockerResult, mongoResult, redisResult, postgresResult, nodeResult, systemResult] =
        await Promise.allSettled([
          tauriGetDockerContainers()
            .then((containers) => ({
              containers: containers || [],
            }))
            .catch((err) => ({
              containers: [],
              error: String(err),
            })),
          tauriGetMongoStatus()
            .then((status) => status || { ...EMPTY_MONGO, error: 'Tauri not available' })
            .catch((err) => ({ ...EMPTY_MONGO, error: String(err) })),
          tauriGetRedisStatus()
            .then((status) => status || { ...EMPTY_REDIS, error: 'Tauri not available' })
            .catch((err) => ({ ...EMPTY_REDIS, error: String(err) })),
          tauriGetPostgresStatus()
            .then((status) => status || { ...EMPTY_POSTGRES, error: 'Tauri not available' })
            .catch((err) => ({ ...EMPTY_POSTGRES, error: String(err) })),
          tauriGetNodeProcesses()
            .then((processes) => ({
              processes: processes || [],
            }))
            .catch((err) => ({
              processes: [],
              error: String(err),
            })),
          tauriGetSystemInfo()
            .then((info) => info || { ...EMPTY_SYSTEM, error: 'Tauri not available' })
            .catch((err) => ({ ...EMPTY_SYSTEM, error: String(err) })),
        ]);

      setServices({
        docker:
          dockerResult.status === 'fulfilled'
            ? dockerResult.value
            : { ...EMPTY_DOCKER, error: 'Failed to fetch' },
        mongo:
          mongoResult.status === 'fulfilled'
            ? mongoResult.value
            : { ...EMPTY_MONGO, error: 'Failed to fetch' },
        redis:
          redisResult.status === 'fulfilled'
            ? redisResult.value
            : { ...EMPTY_REDIS, error: 'Failed to fetch' },
        postgres:
          postgresResult.status === 'fulfilled'
            ? postgresResult.value
            : { ...EMPTY_POSTGRES, error: 'Failed to fetch' },
        node:
          nodeResult.status === 'fulfilled'
            ? nodeResult.value
            : { ...EMPTY_NODE, error: 'Failed to fetch' },
        system:
          systemResult.status === 'fulfilled'
            ? systemResult.value
            : { ...EMPTY_SYSTEM, error: 'Failed to fetch' },
      });
      setLastRefresh(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  const dockerAction = useCallback(
    async (id: string, action: 'start' | 'stop' | 'restart') => {
      const result = await tauriDockerAction(id, action);
      return result || `Container ${action} sent`;
    },
    []
  );

  const getDockerLogs = useCallback(async (id: string) => {
    const result = await tauriGetDockerLogs(id);
    return result || 'No logs available';
  }, []);

  useEffect(() => {
    fetchAll();

    intervalRef.current = setInterval(fetchAll, pollInterval);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchAll, pollInterval]);

  return {
    services,
    loading,
    lastRefresh,
    refresh: fetchAll,
    dockerAction,
    getDockerLogs,
  };
}

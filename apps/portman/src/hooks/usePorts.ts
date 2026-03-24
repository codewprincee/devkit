import { useState, useEffect, useCallback, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { PortProcess, SystemStats } from "../types";

const REFRESH_INTERVAL = 5000;

export function usePorts() {
  const [ports, setPorts] = useState<PortProcess[]>([]);
  const [stats, setStats] = useState<SystemStats>({
    total_listening: 0,
    total_established: 0,
    unique_processes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);

    try {
      const [portsData, statsData] = await Promise.all([
        invoke<PortProcess[]>("get_ports"),
        invoke<SystemStats>("get_system_stats"),
      ]);
      setPorts(portsData);
      setStats(statsData);
    } catch (err) {
      console.error("Failed to fetch port data:", err);
    } finally {
      setLoading(false);
      if (isManual) {
        setTimeout(() => setRefreshing(false), 600);
      }
    }
  }, []);

  const refresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  const killProcess = useCallback(
    async (pid: number): Promise<string> => {
      const result = await invoke<string>("kill_process", { pid });
      await fetchData(false);
      return result;
    },
    [fetchData],
  );

  const searchPort = useCallback(async (port: number): Promise<PortProcess[]> => {
    return invoke<PortProcess[]>("search_port", { port });
  }, []);

  useEffect(() => {
    fetchData(false);

    intervalRef.current = setInterval(() => {
      fetchData(false);
    }, REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchData]);

  return {
    ports,
    stats,
    loading,
    refreshing,
    refresh,
    killProcess,
    searchPort,
  };
}

'use client';

import { useState, useCallback, useMemo } from "react";
import { invoke } from "@/lib/tauri";
import { usePorts } from "@/hooks/usePorts";
import { StatsCard } from "./StatsCard";
import { SearchBar } from "./SearchBar";
import { FilterTabs } from "./FilterTabs";
import { PortTable } from "./PortTable";
import { ToastContainer } from "./Toast";
import { KillConfirmDialog } from "./KillConfirmDialog";
import { DetailPanel } from "./DetailPanel";
import type {
  PortProcess,
  StateFilter,
  SortConfig,
  SortField,
  Toast,
} from "@/types/portman";
import styles from "./portman.module.css";

interface PortManAppProps {
  active: boolean;
}

export function PortManApp({ active }: PortManAppProps) {
  const { ports, stats, loading, refreshing, refresh, killProcess } =
    usePorts(active);

  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState<StateFilter>("ALL");
  const [sort, setSort] = useState<SortConfig>({
    field: "port",
    direction: "asc",
  });
  const [killTargets, setKillTargets] = useState<PortProcess[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [selectedPids, setSelectedPids] = useState<Set<number>>(new Set());
  const [detailPort, setDetailPort] = useState<PortProcess | null>(null);

  const addToast = useCallback(
    (message: string, type: "success" | "error") => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, type }]);
    },
    [],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleSort = useCallback(
    (field: SortField) => {
      setSort((prev) => ({
        field,
        direction:
          prev.field === field && prev.direction === "asc" ? "desc" : "asc",
      }));
    },
    [],
  );

  const handleKillRequest = useCallback((port: PortProcess) => {
    setKillTargets([port]);
  }, []);

  const handleBulkKillRequest = useCallback(() => {
    const selected = ports.filter((p) => selectedPids.has(p.pid));
    if (selected.length > 0) {
      setKillTargets(selected);
    }
  }, [ports, selectedPids]);

  const handleKillConfirm = useCallback(async () => {
    if (killTargets.length === 0) return;
    const targets = [...killTargets];
    setKillTargets([]);

    if (targets.length === 1) {
      const { pid, process_name, port } = targets[0];
      try {
        await killProcess(pid);
        addToast(`Killed ${process_name} (PID ${pid}) on port ${port}`, "success");
        setSelectedPids((prev) => {
          const next = new Set(prev);
          next.delete(pid);
          return next;
        });
      } catch {
        addToast(`Failed to kill ${process_name} (PID ${pid})`, "error");
      }
    } else {
      const pids = targets.map((t) => t.pid);
      try {
        await invoke<string[]>("kill_processes", { pids });
        addToast(`Killed ${targets.length} processes`, "success");
        setSelectedPids(new Set());
      } catch {
        addToast(`Failed to kill some processes`, "error");
      }
    }
  }, [killTargets, killProcess, addToast]);

  const handleKillCancel = useCallback(() => {
    setKillTargets([]);
  }, []);

  const handleToggleSelect = useCallback((pid: number) => {
    setSelectedPids((prev) => {
      const next = new Set(prev);
      if (next.has(pid)) {
        next.delete(pid);
      } else {
        next.add(pid);
      }
      return next;
    });
  }, []);

  const filteredPorts = useMemo(() => {
    let result = ports;

    if (search) {
      result = result.filter((p) => String(p.port).includes(search));
    }

    if (stateFilter !== "ALL") {
      result = result.filter((p) => p.state === stateFilter);
    }

    result = [...result].sort((a, b) => {
      const field = sort.field;
      const dir = sort.direction === "asc" ? 1 : -1;
      const aVal = a[field];
      const bVal = b[field];

      if (typeof aVal === "number" && typeof bVal === "number") {
        return (aVal - bVal) * dir;
      }
      return String(aVal).localeCompare(String(bVal)) * dir;
    });

    return result;
  }, [ports, search, stateFilter, sort]);

  const handleSelectAll = useCallback(() => {
    const allPids = filteredPorts.map((p) => p.pid);
    const allSelected = allPids.every((pid) => selectedPids.has(pid));
    if (allSelected) {
      setSelectedPids(new Set());
    } else {
      setSelectedPids(new Set(allPids));
    }
  }, [filteredPorts, selectedPids]);

  const filterCounts = useMemo(
    () => ({
      all: ports.length,
      listening: ports.filter((p) => p.state === "LISTEN").length,
      established: ports.filter((p) => p.state === "ESTABLISHED").length,
    }),
    [ports],
  );

  return (
    <div className={`${styles.app} ${detailPort ? styles.hasDetail : ""}`}>
      <header className={styles.topbar}>
        <div className={styles.topbarBrand}>
          <svg
            className={styles.topbarLogo}
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            aria-hidden="true"
          >
            <rect x="2" y="4" width="24" height="20" rx="4" stroke="url(#pm-logo-grad)" strokeWidth="2" />
            <circle cx="8" cy="14" r="2" fill="url(#pm-logo-grad)" />
            <rect x="12" y="12" width="10" height="4" rx="2" fill="url(#pm-logo-grad)" opacity="0.5" />
            <defs>
              <linearGradient id="pm-logo-grad" x1="2" y1="4" x2="26" y2="24">
                <stop stopColor="#6366f1" />
                <stop offset="1" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
          <h1 className={styles.topbarTitle}>PortMan</h1>
        </div>

        <div className={styles.topbarActions}>
          <SearchBar value={search} onChange={setSearch} />
          <button
            className={`${styles.btnRefresh} ${refreshing ? styles.spinning : ""}`}
            onClick={refresh}
            aria-label="Refresh port data"
            title="Refresh"
            type="button"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M13.65 2.35v3.79h-3.79M2.35 13.65v-3.79h3.79" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3.51 5.5a5.25 5.25 0 0 1 8.68-1.15L13.65 6.14M2.35 9.86l1.46 1.79a5.25 5.25 0 0 0 8.68-1.15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </header>

      <main className={styles.content}>
        <div className={styles.statsRow}>
          <StatsCard label="Listening Ports" value={stats.total_listening} icon="listening" color="#16a34a" />
          <StatsCard label="Established" value={stats.total_established} icon="link" color="#d97706" />
          <StatsCard label="Active Processes" value={stats.unique_processes} icon="cpu" color="#6366f1" />
        </div>

        <div className={styles.tableToolbar}>
          <div className={styles.toolbarLeft}>
            <FilterTabs active={stateFilter} onChange={setStateFilter} counts={filterCounts} />
            {selectedPids.size > 0 && (
              <button className={styles.btnBulkKill} onClick={handleBulkKillRequest} type="button">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M10.5 3.5L3.5 10.5M3.5 3.5l7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                Kill {selectedPids.size} selected
              </button>
            )}
          </div>
          <span className={styles.tableCount}>
            {filteredPorts.length} connection{filteredPorts.length !== 1 ? "s" : ""}
          </span>
        </div>

        <PortTable
          ports={filteredPorts}
          loading={loading}
          sort={sort}
          selectedPids={selectedPids}
          onSort={handleSort}
          onKill={handleKillRequest}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAll}
          onShowDetail={setDetailPort}
        />
      </main>

      {detailPort && (
        <DetailPanel
          port={detailPort}
          onClose={() => setDetailPort(null)}
          onKill={(p) => {
            setDetailPort(null);
            handleKillRequest(p);
          }}
        />
      )}

      {killTargets.length > 0 && (
        <KillConfirmDialog
          targets={killTargets.map((t) => ({
            pid: t.pid,
            processName: t.process_name,
            port: t.port,
          }))}
          onConfirm={handleKillConfirm}
          onCancel={handleKillCancel}
        />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />

      <div className={styles.autoRefreshIndicator} aria-live="polite">
        <span className={styles.pulseDot} />
        Auto-refreshing
      </div>
    </div>
  );
}

import { useCallback } from "react";
import type { PortProcess, SortConfig, SortField } from "@/types/portman";
import styles from "./portman.module.css";

interface PortTableProps {
  ports: PortProcess[];
  loading: boolean;
  sort: SortConfig;
  selectedPids: Set<number>;
  onSort: (field: SortField) => void;
  onKill: (port: PortProcess) => void;
  onToggleSelect: (pid: number) => void;
  onSelectAll: () => void;
  onShowDetail: (port: PortProcess) => void;
}

const COLUMNS: { label: string; field: SortField }[] = [
  { label: "Port", field: "port" },
  { label: "Process", field: "process_name" },
  { label: "PID", field: "pid" },
  { label: "Protocol", field: "protocol" },
  { label: "State", field: "state" },
  { label: "CPU %", field: "cpu_usage" },
  { label: "Memory", field: "memory_mb" },
  { label: "User", field: "user" },
];

function StateBadge({ state }: { state: string }) {
  const className =
    state === "LISTEN"
      ? `${styles.badge} ${styles.badgeListen}`
      : state === "ESTABLISHED"
        ? `${styles.badge} ${styles.badgeEstablished}`
        : `${styles.badge} ${styles.badgeUnknown}`;

  return <span className={className}>{state}</span>;
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <div className={`${styles.tableRow} ${styles.skeletonRow}`} key={i}>
          <div className={`${styles.tableCell} ${styles.cellCheckbox}`}>
            <div className={styles.skeleton} style={{ width: 16, height: 16 }} />
          </div>
          {COLUMNS.map((col) => (
            <div className={styles.tableCell} key={col.field}>
              <div className={styles.skeleton} />
            </div>
          ))}
          <div className={styles.tableCell}>
            <div className={`${styles.skeleton} ${styles.skeletonBtn}`} />
          </div>
        </div>
      ))}
    </>
  );
}

function EmptyState() {
  return (
    <div className={styles.emptyState}>
      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
        className={styles.emptyStateIcon}
        aria-hidden="true"
      >
        <rect x="8" y="16" width="48" height="32" rx="4" stroke="currentColor" strokeWidth="2" />
        <circle cx="20" cy="32" r="3" fill="currentColor" opacity="0.3" />
        <circle cx="32" cy="32" r="3" fill="currentColor" opacity="0.3" />
        <circle cx="44" cy="32" r="3" fill="currentColor" opacity="0.3" />
        <path d="M24 52h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <h3 className={styles.emptyStateTitle}>No ports found</h3>
      <p className={styles.emptyStateText}>
        No active port connections match your current filters. Try adjusting
        your search or filter criteria.
      </p>
    </div>
  );
}

function SortIndicator({
  field,
  sort,
}: {
  field: SortField;
  sort: SortConfig;
}) {
  if (sort.field !== field) {
    return <span className={`${styles.sortIndicator} ${styles.sortInactive}`} aria-hidden="true" />;
  }

  return (
    <span className={`${styles.sortIndicator} ${styles.sortActive}`} aria-hidden="true">
      {sort.direction === "asc" ? (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M6 3L10 8H2L6 3Z" fill="currentColor" />
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M6 9L2 4H10L6 9Z" fill="currentColor" />
        </svg>
      )}
    </span>
  );
}

export function PortTable({
  ports,
  loading,
  sort,
  selectedPids,
  onSort,
  onKill,
  onToggleSelect,
  onSelectAll,
  onShowDetail,
}: PortTableProps) {
  const handleHeaderClick = useCallback(
    (field: SortField) => {
      onSort(field);
    },
    [onSort],
  );

  const allSelected = ports.length > 0 && ports.every((p) => selectedPids.has(p.pid));
  const someSelected = ports.some((p) => selectedPids.has(p.pid));

  return (
    <div className={styles.tableContainer}>
      <div className={styles.tableHeader} role="row">
        <div className={`${styles.tableHead} ${styles.tableHeadCheckbox}`}>
          <input
            type="checkbox"
            className={styles.checkbox}
            checked={allSelected}
            ref={(el) => {
              if (el) el.indeterminate = someSelected && !allSelected;
            }}
            onChange={onSelectAll}
            aria-label="Select all"
          />
        </div>
        {COLUMNS.map((col) => (
          <button
            key={col.field}
            className={`${styles.tableHead} ${sort.field === col.field ? styles.sorted : ""}`}
            onClick={() => handleHeaderClick(col.field)}
            type="button"
            aria-sort={
              sort.field === col.field
                ? sort.direction === "asc"
                  ? "ascending"
                  : "descending"
                : "none"
            }
          >
            {col.label}
            <SortIndicator field={col.field} sort={sort} />
          </button>
        ))}
        <div className={`${styles.tableHead} ${styles.tableHeadActions}`}>Actions</div>
      </div>

      <div className={styles.tableBody} role="rowgroup">
        {loading ? (
          <SkeletonRows />
        ) : ports.length === 0 ? (
          <EmptyState />
        ) : (
          ports.map((port) => (
            <div
              className={`${styles.tableRow} ${selectedPids.has(port.pid) ? styles.selected : ""}`}
              key={`${port.pid}-${port.port}-${port.protocol}`}
              role="row"
              onClick={() => onShowDetail(port)}
              style={{ cursor: "pointer" }}
            >
              <div className={`${styles.tableCell} ${styles.cellCheckbox}`} role="cell" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={selectedPids.has(port.pid)}
                  onChange={() => onToggleSelect(port.pid)}
                  aria-label={`Select ${port.process_name}`}
                />
              </div>
              <div className={`${styles.tableCell} ${styles.cellPort}`} role="cell">
                {port.port}
              </div>
              <div className={`${styles.tableCell} ${styles.cellProcess}`} role="cell" title={port.command}>
                {port.process_name}
              </div>
              <div className={`${styles.tableCell} ${styles.cellMono}`} role="cell">
                {port.pid}
              </div>
              <div className={`${styles.tableCell} ${styles.cellMono}`} role="cell">
                {port.protocol.toUpperCase()}
              </div>
              <div className={styles.tableCell} role="cell">
                <StateBadge state={port.state} />
              </div>
              <div className={`${styles.tableCell} ${styles.cellMono}`} role="cell">
                {port.cpu_usage.toFixed(1)}
              </div>
              <div className={`${styles.tableCell} ${styles.cellMono}`} role="cell">
                {port.memory_mb.toFixed(1)} MB
              </div>
              <div className={`${styles.tableCell} ${styles.cellUser}`} role="cell">
                {port.user}
              </div>
              <div className={`${styles.tableCell} ${styles.cellActions}`} role="cell" onClick={(e) => e.stopPropagation()}>
                <button
                  className={styles.btnKill}
                  onClick={() => onKill(port)}
                  title={`Kill ${port.process_name} (PID ${port.pid})`}
                  aria-label={`Kill process ${port.process_name} with PID ${port.pid}`}
                  type="button"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M10.5 3.5L3.5 10.5M3.5 3.5l7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                  Kill
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

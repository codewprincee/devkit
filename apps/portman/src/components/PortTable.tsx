import { useCallback } from "react";
import type { PortProcess, SortConfig, SortField } from "../types";

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
      ? "badge badge-listen"
      : state === "ESTABLISHED"
        ? "badge badge-established"
        : "badge badge-unknown";

  return <span className={className}>{state}</span>;
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, i) => (
        <div className="table-row skeleton-row" key={i}>
          <div className="table-cell cell-checkbox">
            <div className="skeleton" style={{ width: 16, height: 16 }} />
          </div>
          {COLUMNS.map((col) => (
            <div className="table-cell" key={col.field}>
              <div className="skeleton" />
            </div>
          ))}
          <div className="table-cell">
            <div className="skeleton skeleton-btn" />
          </div>
        </div>
      ))}
    </>
  );
}

function EmptyState() {
  return (
    <div className="empty-state">
      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
        className="empty-state-icon"
        aria-hidden="true"
      >
        <rect
          x="8"
          y="16"
          width="48"
          height="32"
          rx="4"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="20" cy="32" r="3" fill="currentColor" opacity="0.3" />
        <circle cx="32" cy="32" r="3" fill="currentColor" opacity="0.3" />
        <circle cx="44" cy="32" r="3" fill="currentColor" opacity="0.3" />
        <path
          d="M24 52h16"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <h3 className="empty-state-title">No ports found</h3>
      <p className="empty-state-text">
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
    return <span className="sort-indicator sort-inactive" aria-hidden="true" />;
  }

  return (
    <span className="sort-indicator sort-active" aria-hidden="true">
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
    <div className="table-container">
      <div className="table-header" role="row">
        <div className="table-head table-head-checkbox">
          <input
            type="checkbox"
            className="checkbox"
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
            className={`table-head ${sort.field === col.field ? "sorted" : ""}`}
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
        <div className="table-head table-head-actions">Actions</div>
      </div>

      <div className="table-body" role="rowgroup">
        {loading ? (
          <SkeletonRows />
        ) : ports.length === 0 ? (
          <EmptyState />
        ) : (
          ports.map((port) => (
            <div
              className={`table-row ${selectedPids.has(port.pid) ? "selected" : ""}`}
              key={`${port.pid}-${port.port}-${port.protocol}`}
              role="row"
              onClick={() => onShowDetail(port)}
              style={{ cursor: "pointer" }}
            >
              <div className="table-cell cell-checkbox" role="cell" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={selectedPids.has(port.pid)}
                  onChange={() => onToggleSelect(port.pid)}
                  aria-label={`Select ${port.process_name}`}
                />
              </div>
              <div className="table-cell cell-port" role="cell">
                {port.port}
              </div>
              <div className="table-cell cell-process" role="cell" title={port.command}>
                {port.process_name}
              </div>
              <div className="table-cell cell-mono" role="cell">
                {port.pid}
              </div>
              <div className="table-cell cell-mono" role="cell">
                {port.protocol.toUpperCase()}
              </div>
              <div className="table-cell" role="cell">
                <StateBadge state={port.state} />
              </div>
              <div className="table-cell cell-mono" role="cell">
                {port.cpu_usage.toFixed(1)}
              </div>
              <div className="table-cell cell-mono" role="cell">
                {port.memory_mb.toFixed(1)} MB
              </div>
              <div className="table-cell cell-user" role="cell">
                {port.user}
              </div>
              <div className="table-cell cell-actions" role="cell" onClick={(e) => e.stopPropagation()}>
                <button
                  className="btn btn-kill"
                  onClick={() => onKill(port)}
                  title={`Kill ${port.process_name} (PID ${port.pid})`}
                  aria-label={`Kill process ${port.process_name} with PID ${port.pid}`}
                  type="button"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M10.5 3.5L3.5 10.5M3.5 3.5l7 7"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
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

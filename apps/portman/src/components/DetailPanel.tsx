import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import type { PortProcess, ProcessDetail } from "../types";

interface DetailPanelProps {
  port: PortProcess;
  onClose: () => void;
  onKill: (port: PortProcess) => void;
}

export function DetailPanel({ port, onClose, onKill }: DetailPanelProps) {
  const [detail, setDetail] = useState<ProcessDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    invoke<ProcessDetail>("get_process_detail", { pid: port.pid })
      .then(setDetail)
      .catch(() => setDetail(null))
      .finally(() => setLoading(false));
  }, [port.pid]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="detail-panel">
      <div className="detail-header">
        <div className="detail-header-info">
          <h2 className="detail-title">{port.process_name}</h2>
          <span className="detail-subtitle">PID {port.pid} &middot; Port {port.port}</span>
        </div>
        <button className="btn-icon" onClick={onClose} aria-label="Close" type="button">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M13.5 4.5L4.5 13.5M4.5 4.5l9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="detail-body">
        <div className="detail-section">
          <h3 className="detail-section-title">Connection</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Port</span>
              <span className="detail-value accent">{port.port}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Protocol</span>
              <span className="detail-value">{port.protocol.toUpperCase()}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">State</span>
              <span className={`badge ${port.state === "LISTEN" ? "badge-listen" : port.state === "ESTABLISHED" ? "badge-established" : "badge-unknown"}`}>
                {port.state}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">User</span>
              <span className="detail-value">{port.user}</span>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3 className="detail-section-title">Performance</h3>
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">CPU Usage</span>
              <span className="detail-value">
                <span className="detail-bar-wrap">
                  <span className="detail-bar" style={{ width: `${Math.min(port.cpu_usage, 100)}%`, background: port.cpu_usage > 80 ? "var(--red)" : port.cpu_usage > 50 ? "var(--yellow)" : "var(--green)" }} />
                </span>
                {port.cpu_usage.toFixed(1)}%
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Memory</span>
              <span className="detail-value">{port.memory_mb.toFixed(1)} MB</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="detail-section">
            <div className="detail-loading">Loading details...</div>
          </div>
        ) : detail ? (
          <>
            <div className="detail-section">
              <h3 className="detail-section-title">Process Info</h3>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Parent PID</span>
                  <span className="detail-value">{detail.ppid}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Threads</span>
                  <span className="detail-value">{detail.threads}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Open Files</span>
                  <span className="detail-value">{detail.open_files}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Uptime</span>
                  <span className="detail-value">{detail.elapsed || "—"}</span>
                </div>
              </div>
            </div>

            <div className="detail-section">
              <h3 className="detail-section-title">Started</h3>
              <p className="detail-mono">{detail.started}</p>
            </div>

            <div className="detail-section">
              <h3 className="detail-section-title">Full Command</h3>
              <pre className="detail-command">{detail.full_command || port.command || "—"}</pre>
            </div>
          </>
        ) : null}
      </div>

      <div className="detail-footer">
        <button className="btn btn-danger" onClick={() => onKill(port)} type="button">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M10.5 3.5L3.5 10.5M3.5 3.5l7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Kill Process
        </button>
      </div>
    </div>
  );
}

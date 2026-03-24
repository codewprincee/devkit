import { useEffect, useState } from "react";
import { invoke } from "@/lib/tauri";
import type { PortProcess, ProcessDetail } from "@/types/portman";
import styles from "./portman.module.css";

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
    <div className={styles.detailPanel}>
      <div className={styles.detailHeader}>
        <div className={styles.detailHeaderInfo}>
          <h2 className={styles.detailTitle}>{port.process_name}</h2>
          <span className={styles.detailSubtitle}>PID {port.pid} &middot; Port {port.port}</span>
        </div>
        <button className={styles.btnIcon} onClick={onClose} aria-label="Close" type="button">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M13.5 4.5L4.5 13.5M4.5 4.5l9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className={styles.detailBody}>
        <div className={styles.detailSection}>
          <h3 className={styles.detailSectionTitle}>Connection</h3>
          <div className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Port</span>
              <span className={`${styles.detailValue} ${styles.detailValueAccent}`}>{port.port}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Protocol</span>
              <span className={styles.detailValue}>{port.protocol.toUpperCase()}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>State</span>
              <span className={`${styles.badge} ${port.state === "LISTEN" ? styles.badgeListen : port.state === "ESTABLISHED" ? styles.badgeEstablished : styles.badgeUnknown}`}>
                {port.state}
              </span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>User</span>
              <span className={styles.detailValue}>{port.user}</span>
            </div>
          </div>
        </div>

        <div className={styles.detailSection}>
          <h3 className={styles.detailSectionTitle}>Performance</h3>
          <div className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>CPU Usage</span>
              <span className={styles.detailValue}>
                <span className={styles.detailBarWrap}>
                  <span className={styles.detailBar} style={{ width: `${Math.min(port.cpu_usage, 100)}%`, background: port.cpu_usage > 80 ? "var(--red)" : port.cpu_usage > 50 ? "var(--yellow)" : "var(--green)" }} />
                </span>
                {port.cpu_usage.toFixed(1)}%
              </span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Memory</span>
              <span className={styles.detailValue}>{port.memory_mb.toFixed(1)} MB</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className={styles.detailSection}>
            <div className={styles.detailLoading}>Loading details...</div>
          </div>
        ) : detail ? (
          <>
            <div className={styles.detailSection}>
              <h3 className={styles.detailSectionTitle}>Process Info</h3>
              <div className={styles.detailGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Parent PID</span>
                  <span className={styles.detailValue}>{detail.ppid}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Threads</span>
                  <span className={styles.detailValue}>{detail.threads}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Open Files</span>
                  <span className={styles.detailValue}>{detail.open_files}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Uptime</span>
                  <span className={styles.detailValue}>{detail.elapsed || "—"}</span>
                </div>
              </div>
            </div>

            <div className={styles.detailSection}>
              <h3 className={styles.detailSectionTitle}>Started</h3>
              <p className={styles.detailMono}>{detail.started}</p>
            </div>

            <div className={styles.detailSection}>
              <h3 className={styles.detailSectionTitle}>Full Command</h3>
              <pre className={styles.detailCommand}>{detail.full_command || port.command || "—"}</pre>
            </div>
          </>
        ) : null}
      </div>

      <div className={styles.detailFooter}>
        <button className={`${styles.btn} ${styles.btnDanger}`} onClick={() => onKill(port)} type="button">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M10.5 3.5L3.5 10.5M3.5 3.5l7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Kill Process
        </button>
      </div>
    </div>
  );
}

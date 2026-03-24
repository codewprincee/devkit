import { useEffect, useRef } from "react";
import styles from "./portman.module.css";

interface KillConfirmDialogProps {
  targets: { pid: number; processName: string; port: number }[];
  onConfirm: () => void;
  onCancel: () => void;
}

export function KillConfirmDialog({
  targets,
  onConfirm,
  onCancel,
}: KillConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onCancel();
  };

  const isBulk = targets.length > 1;

  return (
    <div
      className={styles.dialogBackdrop}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="kill-dialog-title"
    >
      <div className={styles.dialog}>
        <div className={styles.dialogIcon}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M12 9v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 id="kill-dialog-title" className={styles.dialogTitle}>
          {isBulk ? `Kill ${targets.length} Processes` : "Kill Process"}
        </h2>
        {isBulk ? (
          <div className={styles.dialogBody}>
            <p style={{ marginBottom: 8 }}>Are you sure you want to kill these processes?</p>
            <div className={styles.dialogList}>
              {targets.map((t) => (
                <div key={t.pid} className={styles.dialogListItem}>
                  <strong>{t.processName}</strong>
                  <span>PID {t.pid} &middot; Port {t.port}</span>
                </div>
              ))}
            </div>
            <p style={{ marginTop: 8 }}>This action cannot be undone.</p>
          </div>
        ) : (
          <p className={styles.dialogBody}>
            Are you sure you want to kill{" "}
            <strong>{targets[0].processName}</strong> (PID {targets[0].pid}) on port{" "}
            <strong>{targets[0].port}</strong>? This action cannot be undone.
          </p>
        )}
        <div className={styles.dialogActions}>
          <button
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={onCancel}
            ref={cancelRef}
            type="button"
          >
            Cancel
          </button>
          <button
            className={`${styles.btn} ${styles.btnDanger}`}
            onClick={onConfirm}
            type="button"
          >
            {isBulk ? `Kill ${targets.length} Processes` : "Kill Process"}
          </button>
        </div>
      </div>
    </div>
  );
}

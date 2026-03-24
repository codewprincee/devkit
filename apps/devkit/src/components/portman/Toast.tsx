import { useEffect } from "react";
import type { Toast as ToastType } from "@/types/portman";
import styles from "./portman.module.css";

interface ToastContainerProps {
  toasts: ToastType[];
  onRemove: (id: string) => void;
}

const TOAST_DURATION = 3500;

function ToastItem({
  toast,
  onRemove,
}: {
  toast: ToastType;
  onRemove: (id: string) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), TOAST_DURATION);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const icon =
    toast.type === "success" ? (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M13.5 4.5L6 12L2.5 8.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ) : (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M10.5 5.5L5.5 10.5M5.5 5.5l5 5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    );

  return (
    <div
      className={`${styles.toast} ${toast.type === "success" ? styles.toastSuccess : styles.toastError}`}
      role="alert"
      aria-live="assertive"
    >
      <span className={styles.toastIcon}>{icon}</span>
      <span className={styles.toastMessage}>{toast.message}</span>
      <button
        className={styles.toastClose}
        onClick={() => onRemove(toast.id)}
        aria-label="Dismiss notification"
        type="button"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path
            d="M9 3L3 9M3 3l6 6"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className={styles.toastContainer} aria-label="Notifications">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

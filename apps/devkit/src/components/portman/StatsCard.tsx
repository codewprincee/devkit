import { useEffect, useRef, useState } from "react";
import styles from "./portman.module.css";

interface StatsCardProps {
  label: string;
  value: number;
  icon: "listening" | "link" | "cpu";
  color: string;
}

function useAnimatedCounter(target: number, duration = 400): number {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);
  const fromRef = useRef(0);

  useEffect(() => {
    fromRef.current = current;
    startRef.current = null;

    const animate = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);

      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(fromRef.current + (target - fromRef.current) * eased);
      setCurrent(value);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return current;
}

function IconSvg({ icon }: { icon: string }) {
  switch (icon) {
    case "listening":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 12a10 10 0 0 1 18-6" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="M12 2v2" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
          <path d="M12 14v8" />
        </svg>
      );
    case "link":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 7h2a5 5 0 0 1 0 10h-2" />
          <path d="M9 17H7a5 5 0 0 1 0-10h2" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      );
    case "cpu":
      return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <rect x="9" y="9" width="6" height="6" rx="1" />
          <path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" />
        </svg>
      );
    default:
      return null;
  }
}

export function StatsCard({ label, value, icon, color }: StatsCardProps) {
  const displayValue = useAnimatedCounter(value);

  return (
    <div className={styles.statsCard} style={{ "--card-accent": color } as React.CSSProperties}>
      <div className={styles.statsCardIcon}>
        <IconSvg icon={icon} />
      </div>
      <div className={styles.statsCardContent}>
        <span className={styles.statsCardValue}>{displayValue}</span>
        <span className={styles.statsCardLabel}>{label}</span>
      </div>
    </div>
  );
}

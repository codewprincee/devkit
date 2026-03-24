import type { StateFilter } from "@/types/portman";
import styles from "./portman.module.css";

interface FilterTabsProps {
  active: StateFilter;
  onChange: (filter: StateFilter) => void;
  counts: { all: number; listening: number; established: number };
}

const FILTERS: { label: string; value: StateFilter }[] = [
  { label: "All", value: "ALL" },
  { label: "Listening", value: "LISTEN" },
  { label: "Established", value: "ESTABLISHED" },
];

export function FilterTabs({ active, onChange, counts }: FilterTabsProps) {
  const getCount = (filter: StateFilter): number => {
    switch (filter) {
      case "ALL":
        return counts.all;
      case "LISTEN":
        return counts.listening;
      case "ESTABLISHED":
        return counts.established;
    }
  };

  return (
    <div className={styles.filterTabs} role="tablist" aria-label="Filter by connection state">
      {FILTERS.map((filter) => (
        <button
          key={filter.value}
          className={`${styles.filterTab} ${active === filter.value ? styles.filterTabActive : ""}`}
          onClick={() => onChange(filter.value)}
          role="tab"
          aria-selected={active === filter.value}
          type="button"
        >
          {filter.label}
          <span className={styles.filterTabCount}>{getCount(filter.value)}</span>
        </button>
      ))}
    </div>
  );
}

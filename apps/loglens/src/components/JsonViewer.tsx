'use client';

import { useState, useCallback } from 'react';

interface JsonViewerProps {
  data: unknown;
}

export function JsonViewer({ data }: JsonViewerProps) {
  const [expanded, setExpanded] = useState(false);

  const toggle = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  const formatted = (() => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  })();

  return (
    <span className="inline-flex items-start gap-1">
      <button
        onClick={toggle}
        className="inline-flex items-center gap-0.5 rounded bg-violet-100 px-1.5 py-0.5 text-[10px] font-semibold text-violet-700 hover:bg-violet-200 transition-colors flex-shrink-0 mt-px"
        aria-label={expanded ? 'Collapse JSON' : 'Expand JSON'}
        aria-expanded={expanded}
      >
        <svg
          className={`h-2.5 w-2.5 transition-transform ${expanded ? 'rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        JSON
      </button>
      {expanded && (
        <pre className="mt-1 rounded-md border border-violet-200 bg-violet-50 p-2 text-[11px] leading-relaxed text-violet-900 overflow-x-auto max-w-2xl whitespace-pre font-mono">
          {formatted}
        </pre>
      )}
    </span>
  );
}

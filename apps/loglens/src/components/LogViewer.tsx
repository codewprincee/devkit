'use client';

import { useRef, useEffect, useCallback } from 'react';
import type { LogLine, LogLevel } from '@/types';
import { JsonViewer } from './JsonViewer';

interface LogViewerProps {
  lines: LogLine[];
  autoScroll: boolean;
  searchQuery: string;
  searchIsRegex: boolean;
  onToggleBookmark: (lineId: number) => void;
  onScrollToLine?: (lineId: number) => void;
}

const LEVEL_STYLES: Record<LogLevel, { bg: string; badge: string; text: string }> = {
  error: {
    bg: 'bg-red-50',
    badge: 'bg-red-100 text-red-700',
    text: 'text-red-900',
  },
  warn: {
    bg: 'bg-amber-50',
    badge: 'bg-amber-100 text-amber-700',
    text: 'text-amber-900',
  },
  info: {
    bg: 'bg-blue-50',
    badge: 'bg-blue-100 text-blue-700',
    text: 'text-blue-800',
  },
  debug: {
    bg: 'bg-gray-50',
    badge: 'bg-gray-200 text-gray-600',
    text: 'text-gray-600',
  },
  trace: {
    bg: 'bg-gray-50',
    badge: 'bg-gray-100 text-gray-500',
    text: 'text-gray-500',
  },
  unknown: {
    bg: '',
    badge: '',
    text: 'text-gray-800',
  },
};

function highlightMatches(
  text: string,
  query: string,
  isRegex: boolean
): React.ReactNode {
  if (!query.trim()) return text;

  try {
    const regex = isRegex ? new RegExp(`(${query})`, 'gi') : null;
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const safeRegex = regex || new RegExp(`(${escapedQuery})`, 'gi');

    const parts = text.split(safeRegex);
    if (parts.length <= 1) return text;

    return parts.map((part, i) => {
      if (safeRegex.test(part)) {
        // Reset lastIndex since we used .test() with global flag
        safeRegex.lastIndex = 0;
        return (
          <mark
            key={i}
            className="bg-yellow-200 text-yellow-900 rounded-sm px-0.5"
          >
            {part}
          </mark>
        );
      }
      // Also reset for the non-matching check
      safeRegex.lastIndex = 0;
      return part;
    });
  } catch {
    return text;
  }
}

export function LogViewer({
  lines,
  autoScroll,
  searchQuery,
  searchIsRegex,
  onToggleBookmark,
}: LogViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isUserScrolling = useRef(false);
  const prevLineCount = useRef(lines.length);

  // Auto-scroll when new lines arrive
  useEffect(() => {
    if (autoScroll && lines.length > prevLineCount.current && !isUserScrolling.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
    prevLineCount.current = lines.length;
  }, [lines.length, autoScroll]);

  // Detect user scroll
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    isUserScrolling.current = !isAtBottom;
  }, []);

  const gutterWidth = String(lines.length).length;

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-auto font-mono text-xs leading-5 bg-white"
      onScroll={handleScroll}
      role="log"
      aria-label="Log output"
      aria-live="polite"
    >
      {lines.length === 0 ? (
        <div className="flex items-center justify-center h-full text-sm text-gray-400">
          No log lines to display
        </div>
      ) : (
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line) => {
              const style = LEVEL_STYLES[line.level];
              return (
                <tr
                  key={line.id}
                  className={`group border-b border-gray-100 hover:bg-gray-50 ${style.bg} ${
                    line.bookmarked ? 'bg-yellow-50 border-l-2 border-l-yellow-400' : ''
                  }`}
                >
                  {/* Gutter: line number + bookmark */}
                  <td className="sticky left-0 w-px whitespace-nowrap border-r border-gray-200 bg-gray-50 px-1 text-right align-top select-none">
                    <div className="flex items-center gap-0.5">
                      {/* Bookmark star */}
                      <button
                        onClick={() => onToggleBookmark(line.id)}
                        className={`p-0.5 rounded transition-all ${
                          line.bookmarked
                            ? 'text-amber-500'
                            : 'text-transparent group-hover:text-gray-300 hover:!text-amber-400'
                        }`}
                        aria-label={line.bookmarked ? 'Remove bookmark' : 'Add bookmark'}
                      >
                        <svg
                          className="h-3 w-3"
                          fill={line.bookmarked ? 'currentColor' : 'none'}
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                          />
                        </svg>
                      </button>

                      {/* Line number */}
                      <span
                        className="text-gray-400 tabular-nums"
                        style={{ minWidth: `${gutterWidth}ch` }}
                      >
                        {line.id + 1}
                      </span>
                    </div>
                  </td>

                  {/* Level badge */}
                  <td className="w-px whitespace-nowrap px-1.5 align-top pt-0.5">
                    {line.level !== 'unknown' && (
                      <span
                        className={`inline-block rounded px-1.5 py-px text-[10px] font-semibold uppercase leading-tight ${style.badge}`}
                      >
                        {line.level}
                      </span>
                    )}
                  </td>

                  {/* Log content */}
                  <td className={`px-2 py-0.5 whitespace-pre-wrap break-all ${style.text}`}>
                    <span>
                      {searchQuery
                        ? highlightMatches(line.text, searchQuery, searchIsRegex)
                        : line.text}
                    </span>
                    {line.isJson && line.jsonData !== undefined && (
                      <div className="mt-0.5">
                        <JsonViewer data={line.jsonData} />
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      <div ref={bottomRef} />
    </div>
  );
}

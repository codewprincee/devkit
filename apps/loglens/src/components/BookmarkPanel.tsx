'use client';

import type { LogLine } from '@/types';

interface BookmarkPanelProps {
  bookmarks: LogLine[];
  onJumpToLine: (lineId: number) => void;
  onRemoveBookmark: (lineId: number) => void;
  onClose: () => void;
}

const LEVEL_BADGE: Record<string, string> = {
  error: 'bg-red-100 text-red-700',
  warn: 'bg-amber-100 text-amber-700',
  info: 'bg-blue-100 text-blue-700',
  debug: 'bg-gray-200 text-gray-600',
  trace: 'bg-gray-100 text-gray-500',
  unknown: 'bg-gray-100 text-gray-500',
};

export function BookmarkPanel({
  bookmarks,
  onJumpToLine,
  onRemoveBookmark,
  onClose,
}: BookmarkPanelProps) {
  return (
    <div className="flex h-full w-72 flex-col border-l border-gray-200 bg-white">
      {/* Panel header */}
      <div className="flex items-center justify-between border-b border-gray-200 px-3 py-2">
        <div className="flex items-center gap-1.5">
          <svg
            className="h-4 w-4 text-amber-500"
            fill="currentColor"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
            />
          </svg>
          <span className="text-xs font-semibold text-gray-900">
            Bookmarks ({bookmarks.length})
          </span>
        </div>
        <button
          onClick={onClose}
          className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          aria-label="Close bookmarks panel"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Bookmark list */}
      <div className="flex-1 overflow-y-auto">
        {bookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 px-4">
            <svg
              className="h-8 w-8 text-gray-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
              />
            </svg>
            <p className="text-xs text-gray-400 text-center">
              No bookmarks yet. Click the star icon next to a log line to bookmark it.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {bookmarks.map((line) => (
              <li key={line.id} className="group">
                <button
                  onClick={() => onJumpToLine(line.id)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] tabular-nums text-gray-400">
                      Line {line.id + 1}
                    </span>
                    {line.level !== 'unknown' && (
                      <span
                        className={`rounded px-1 py-px text-[10px] font-semibold uppercase leading-tight ${LEVEL_BADGE[line.level]}`}
                      >
                        {line.level}
                      </span>
                    )}
                    {line.timestamp && (
                      <span className="text-[10px] text-gray-400 truncate">
                        {line.timestamp}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-mono text-gray-700 line-clamp-2 break-all leading-tight">
                    {line.text}
                  </p>
                </button>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveBookmark(line.id);
                    }}
                    className="rounded p-0.5 text-gray-400 hover:text-red-500 transition-colors"
                    aria-label="Remove bookmark"
                  >
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

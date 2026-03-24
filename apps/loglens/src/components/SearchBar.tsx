'use client';

import { useRef, useEffect, useCallback } from 'react';
import type { SearchState } from '@/types';

interface SearchBarProps {
  search: SearchState;
  onUpdateSearch: (query: string, isRegex: boolean) => void;
  onNavigateMatch: (direction: 'next' | 'prev') => void;
  onClose: () => void;
}

export function SearchBar({
  search,
  onUpdateSearch,
  onNavigateMatch,
  onClose,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter') {
        if (e.shiftKey) {
          onNavigateMatch('prev');
        } else {
          onNavigateMatch('next');
        }
      }
    },
    [onClose, onNavigateMatch]
  );

  const isValidRegex = (() => {
    if (!search.isRegex || !search.query) return true;
    try {
      new RegExp(search.query);
      return true;
    } catch {
      return false;
    }
  })();

  return (
    <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-2 animate-[fadeIn_0.15s_ease-out]">
      <div className="relative flex-1 max-w-md">
        <svg
          className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={search.query}
          onChange={(e) => onUpdateSearch(e.target.value, search.isRegex)}
          onKeyDown={handleKeyDown}
          placeholder={search.isRegex ? 'Regex pattern...' : 'Search log lines...'}
          className={`w-full rounded-md border py-1.5 pl-8 pr-3 text-xs font-mono
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
            ${
              !isValidRegex
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300 bg-white'
            }`}
          aria-label="Search log lines"
        />
      </div>

      {/* Regex toggle */}
      <button
        onClick={() => onUpdateSearch(search.query, !search.isRegex)}
        className={`rounded-md px-2 py-1.5 text-xs font-mono font-medium transition-colors ${
          search.isRegex
            ? 'bg-indigo-100 text-indigo-700'
            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
        }`}
        aria-label="Toggle regex mode"
        title="Toggle regex mode"
      >
        .*
      </button>

      {/* Match count and navigation */}
      {search.query && (
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500 tabular-nums min-w-[4rem] text-center">
            {search.matchCount > 0
              ? `${search.currentMatch} / ${search.matchCount}`
              : 'No matches'}
          </span>
          <button
            onClick={() => onNavigateMatch('prev')}
            disabled={search.matchCount === 0}
            className="rounded p-1 text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous match"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
            </svg>
          </button>
          <button
            onClick={() => onNavigateMatch('next')}
            disabled={search.matchCount === 0}
            className="rounded p-1 text-gray-500 hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Next match"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        </div>
      )}

      {/* Close search */}
      <button
        onClick={onClose}
        className="rounded p-1 text-gray-500 hover:bg-gray-200 transition-colors"
        aria-label="Close search"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

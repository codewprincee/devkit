'use client';

import { useState, useMemo } from 'react';
import type { EnvFile, DiffResult } from '@/types';
import { diffEnvFiles } from '@/lib/diff';

interface DiffViewProps {
  files: EnvFile[];
}

const statusColors = {
  added: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-700',
    label: 'Added',
  },
  removed: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-700',
    badge: 'bg-red-100 text-red-700',
    label: 'Removed',
  },
  changed: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-700',
    label: 'Changed',
  },
  same: {
    bg: 'bg-gray-50/50',
    border: 'border-gray-100',
    text: 'text-gray-500',
    badge: 'bg-gray-100 text-gray-500',
    label: 'Same',
  },
};

export function DiffView({ files }: DiffViewProps) {
  const [leftPath, setLeftPath] = useState<string>(files[0]?.path ?? '');
  const [rightPath, setRightPath] = useState<string>(files[1]?.path ?? files[0]?.path ?? '');
  const [showSame, setShowSame] = useState(true);

  const leftFile = files.find((f) => f.path === leftPath);
  const rightFile = files.find((f) => f.path === rightPath);

  const diff: DiffResult | null = useMemo(() => {
    if (!leftFile || !rightFile) return null;
    return diffEnvFiles(leftFile.variables, rightFile.variables);
  }, [leftFile, rightFile]);

  const filteredEntries = useMemo(() => {
    if (!diff) return [];
    return showSame ? diff.entries : diff.entries.filter((e) => e.status !== 'same');
  }, [diff, showSame]);

  if (files.length < 2) {
    return (
      <div className="flex flex-1 items-center justify-center p-12">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
          </svg>
          <p className="mt-3 text-sm text-gray-500">
            Need at least 2 .env files to compare
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* File selectors */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-4 sm:px-6 py-3 border-b border-gray-200 bg-gray-50/50">
        <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
          <label className="text-xs font-medium text-gray-500 whitespace-nowrap">Left</label>
          <select
            value={leftPath}
            onChange={(e) => setLeftPath(e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-mono text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            aria-label="Left file for comparison"
          >
            {files.map((f) => (
              <option key={f.path} value={f.path}>{f.name}</option>
            ))}
          </select>
        </div>

        <svg className="hidden sm:block h-4 w-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
        </svg>

        <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
          <label className="text-xs font-medium text-gray-500 whitespace-nowrap">Right</label>
          <select
            value={rightPath}
            onChange={(e) => setRightPath(e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-mono text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            aria-label="Right file for comparison"
          >
            {files.map((f) => (
              <option key={f.path} value={f.path}>{f.name}</option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
          <input
            type="checkbox"
            checked={showSame}
            onChange={(e) => setShowSame(e.target.checked)}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          Show same
        </label>
      </div>

      {/* Summary */}
      {diff && (
        <div className="flex flex-wrap items-center gap-2 px-4 sm:px-6 py-2.5 border-b border-gray-100">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
            +{diff.added} added
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
            -{diff.removed} removed
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
            ~{diff.changed} changed
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
            ={diff.same} same
          </span>
        </div>
      )}

      {/* Diff table */}
      <div className="flex-1 overflow-auto">
        {diff && filteredEntries.length > 0 ? (
          <table className="w-full text-sm" role="table">
            <thead className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 sm:px-6 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 w-16">
                  Status
                </th>
                <th className="px-4 sm:px-6 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Key
                </th>
                <th className="px-4 sm:px-6 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {leftFile?.name ?? 'Left'}
                </th>
                <th className="px-4 sm:px-6 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {rightFile?.name ?? 'Right'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEntries.map((entry) => {
                const colors = statusColors[entry.status];
                return (
                  <tr key={entry.key} className={`${colors.bg} transition-colors`}>
                    <td className="px-4 sm:px-6 py-2">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${colors.badge}`}>
                        {colors.label}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-2 font-mono text-xs font-medium text-gray-900">
                      {entry.key}
                    </td>
                    <td className="px-4 sm:px-6 py-2 font-mono text-xs max-w-[200px] truncate">
                      {entry.leftValue !== undefined ? (
                        <span className={entry.status === 'removed' ? 'text-red-600 font-medium' : 'text-gray-600'}>
                          {entry.leftValue || <span className="italic text-gray-300">empty</span>}
                        </span>
                      ) : (
                        <span className="text-gray-300">--</span>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-2 font-mono text-xs max-w-[200px] truncate">
                      {entry.rightValue !== undefined ? (
                        <span className={entry.status === 'added' ? 'text-emerald-600 font-medium' : entry.status === 'changed' ? 'text-amber-600 font-medium' : 'text-gray-600'}>
                          {entry.rightValue || <span className="italic text-gray-300">empty</span>}
                        </span>
                      ) : (
                        <span className="text-gray-300">--</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="flex items-center justify-center h-full p-12 text-sm text-gray-400">
            {diff ? 'No differences found' : 'Select two files to compare'}
          </div>
        )}
      </div>
    </div>
  );
}

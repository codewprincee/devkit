'use client';

import { useState, useCallback } from 'react';

interface EmptyStateProps {
  onOpenFile: () => void;
}

export function EmptyState({ onOpenFile }: EmptyStateProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      // In Tauri, file drag-drop is handled at the native level.
      // For the web preview, we just trigger the open dialog.
      onOpenFile();
    },
    [onOpenFile]
  );

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8">
      <div
        className={`
          flex flex-col items-center gap-6 rounded-2xl border-2 border-dashed
          px-16 py-12 transition-colors
          ${
            dragOver
              ? 'border-indigo-400 bg-indigo-50'
              : 'border-gray-200 bg-gray-50/50'
          }
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Icon */}
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-200">
          <svg
            className="h-8 w-8 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
        </div>

        {/* Title */}
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Welcome to LogLens
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Open a log file to get started. Supports .log, .txt, .out, and .err files.
          </p>
        </div>

        {/* Open button */}
        <button
          onClick={onOpenFile}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:from-indigo-600 hover:to-violet-700 transition-all"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776"
            />
          </svg>
          Open Log File
        </button>

        {/* Drag-drop hint */}
        <p className="text-xs text-gray-400">
          or drag and drop a file here
        </p>

        {/* Feature highlights */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4">
          {[
            { label: 'Real-time tailing', icon: 'M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0l-3.75-3.75M17.25 21l3.75-3.75' },
            { label: 'Color-coded levels', icon: 'M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42' },
            { label: 'Regex search', icon: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z' },
            { label: 'JSON pretty-print', icon: 'M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5' },
          ].map((feature) => (
            <div key={feature.label} className="flex items-center gap-2">
              <svg
                className="h-3.5 w-3.5 text-indigo-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d={feature.icon} />
              </svg>
              <span className="text-xs text-gray-600">{feature.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

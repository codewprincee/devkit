'use client';

import { useCallback, useState, useRef } from 'react';

interface EmptyStateProps {
  isSupported: boolean;
  onOpenProject: () => void;
  onDropFiles: (files: File[]) => void;
}

export function EmptyState({ isSupported, onOpenProject, onDropFiles }: EmptyStateProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragCountRef = useRef(0);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCountRef.current++;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCountRef.current--;
    if (dragCountRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCountRef.current = 0;
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        onDropFiles(files);
      }
    },
    [onDropFiles]
  );

  return (
    <div
      className="flex flex-1 items-center justify-center p-6 sm:p-12"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div
        className={`
          flex max-w-lg flex-col items-center rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center
          transition-all duration-200
          ${isDragging
            ? 'border-indigo-400 bg-indigo-50 scale-[1.02]'
            : 'border-gray-200 bg-white'
          }
        `}
      >
        <div className={`
          flex h-16 w-16 items-center justify-center rounded-2xl transition-colors
          ${isDragging ? 'bg-indigo-100' : 'bg-gradient-to-br from-indigo-50 to-violet-50'}
        `}>
          <svg
            className={`h-8 w-8 transition-colors ${isDragging ? 'text-indigo-600' : 'text-indigo-400'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        </div>

        <h2 className="mt-5 text-xl font-semibold text-gray-900">
          {isDragging ? 'Drop your files here' : 'Welcome to EnvGuard'}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-500 max-w-sm">
          {isDragging
            ? 'Release to load your .env files'
            : 'Manage, compare, and validate your environment variables. Everything runs locally in your browser - your secrets never leave your machine.'
          }
        </p>

        {!isDragging && (
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
            {isSupported && (
              <button
                onClick={onOpenProject}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:from-indigo-600 hover:to-violet-600 hover:shadow-md active:scale-[0.98]"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
                </svg>
                Open Project Folder
              </button>
            )}
            <span className="text-xs text-gray-400">
              or drag & drop .env files here
            </span>
          </div>
        )}

        {!isDragging && (
          <div className="mt-8 grid grid-cols-2 gap-4 text-left w-full max-w-sm">
            {[
              { label: 'View & Edit', desc: 'Browse and modify variables' },
              { label: 'Compare', desc: 'Side-by-side diff view' },
              { label: 'Validate', desc: 'Check for common issues' },
              { label: 'Generate', desc: 'Create .env.example files' },
            ].map((feature) => (
              <div
                key={feature.label}
                className="rounded-lg border border-gray-100 bg-gray-50/50 p-3"
              >
                <p className="text-xs font-medium text-gray-900">{feature.label}</p>
                <p className="mt-0.5 text-[10px] text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        )}

        {!isSupported && !isDragging && (
          <div className="mt-6 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-xs text-amber-700 max-w-sm">
            <p className="font-medium">Limited browser support</p>
            <p className="mt-1">
              Your browser doesn't support the File System Access API.
              Use Chrome or Edge for the full experience, or drag & drop files above.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

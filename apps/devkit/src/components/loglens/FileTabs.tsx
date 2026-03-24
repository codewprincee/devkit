'use client';

import type { LogFile } from '@/types/loglens';

interface FileTabsProps {
  files: LogFile[];
  activeFileId: string | null;
  onSelectFile: (id: string) => void;
  onCloseFile: (id: string) => void;
}

export function FileTabs({
  files,
  activeFileId,
  onSelectFile,
  onCloseFile,
}: FileTabsProps) {
  if (files.length === 0) return null;

  return (
    <div className="flex items-center gap-0.5 border-b border-gray-200 bg-gray-50 px-2 overflow-x-auto">
      {files.map((file) => {
        const isActive = file.id === activeFileId;
        return (
          <div
            key={file.id}
            className={`
              group flex items-center gap-1.5 px-3 py-2 text-xs font-medium
              cursor-pointer select-none border-b-2 transition-colors
              ${
                isActive
                  ? 'border-indigo-500 text-indigo-700 bg-white'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }
            `}
            onClick={() => onSelectFile(file.id)}
            role="tab"
            aria-selected={isActive}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelectFile(file.id);
              }
            }}
          >
            {/* File icon */}
            <svg className="h-3.5 w-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>

            <span className="max-w-32 truncate">{file.name}</span>

            {/* Tailing indicator */}
            {file.tailing && (
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-[pulse-dot_1.5s_ease-in-out_infinite]" />
            )}

            {/* Line count */}
            <span className="text-[10px] text-gray-400">{file.totalLines}</span>

            {/* Close button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCloseFile(file.id);
              }}
              className="ml-0.5 rounded p-0.5 opacity-0 group-hover:opacity-100 hover:bg-gray-200 transition-all"
              aria-label={`Close ${file.name}`}
            >
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}

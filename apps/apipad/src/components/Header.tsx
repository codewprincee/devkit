'use client';

import type { ApiEnvironment } from '@/types';

interface HeaderProps {
  environments: ApiEnvironment[];
  onSetActiveEnvironment: (id: string) => void;
  onImport: () => void;
}

export function Header({ environments, onSetActiveEnvironment, onImport }: HeaderProps) {
  const active = environments.find((e) => e.isActive);

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 py-2.5">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </div>
          <h1 className="text-sm font-semibold text-gray-900">API Pad</h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {environments.length > 0 && (
          <select
            value={active?.id || ''}
            onChange={(e) => onSetActiveEnvironment(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            aria-label="Active environment"
          >
            {environments.map((env) => (
              <option key={env.id} value={env.id}>{env.name}</option>
            ))}
          </select>
        )}

        <button
          onClick={onImport}
          className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          Import
        </button>
      </div>
    </header>
  );
}

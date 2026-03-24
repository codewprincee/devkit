'use client';

import { type ReactNode } from 'react';

interface ServiceCardProps {
  name: string;
  icon: ReactNode;
  status: 'connected' | 'disconnected' | 'warning' | 'loading';
  statusText: string;
  error?: string;
  children: ReactNode;
}

function statusDot(status: ServiceCardProps['status']) {
  switch (status) {
    case 'connected':
      return <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-[pulse-dot_2s_ease-in-out_infinite]" />;
    case 'disconnected':
      return <span className="h-2.5 w-2.5 rounded-full bg-red-500" />;
    case 'warning':
      return <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-[pulse-dot_2s_ease-in-out_infinite]" />;
    case 'loading':
      return <span className="h-2.5 w-2.5 rounded-full bg-gray-300 animate-pulse" />;
  }
}

function statusBadge(status: ServiceCardProps['status'], text: string) {
  const colors = {
    connected: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    disconnected: 'bg-red-50 text-red-700 border-red-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    loading: 'bg-gray-50 text-gray-500 border-gray-200',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${colors[status]}`}>
      {statusDot(status)}
      {text}
    </span>
  );
}

export function ServiceCard({ name, icon, status, statusText, error, children }: ServiceCardProps) {
  return (
    <div className="animate-[fadeIn_0.3s_ease-out] rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-50 to-violet-50 text-indigo-600">
            {icon}
          </div>
          <h2 className="text-sm font-semibold text-gray-900">{name}</h2>
        </div>
        {statusBadge(status, statusText)}
      </div>

      {error && (
        <div className="mx-5 mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-700">
          <p className="font-medium">Error</p>
          <p className="mt-0.5 font-mono">{error}</p>
        </div>
      )}

      <div className="p-5">
        {children}
      </div>
    </div>
  );
}

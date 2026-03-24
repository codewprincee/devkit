'use client';

import type { RedisStatus } from '@/types';
import { ServiceCard } from './ServiceCard';

interface RedisPanelProps {
  data: RedisStatus & { error?: string };
}

function parseMemory(mem: string): number {
  const match = mem.match(/([\d.]+)\s*(B|K|M|G|T)?/i);
  if (!match) return 0;
  const value = parseFloat(match[1]);
  const unit = (match[2] || 'B').toUpperCase();
  const multipliers: Record<string, number> = { B: 1, K: 1024, M: 1048576, G: 1073741824, T: 1099511627776 };
  return value * (multipliers[unit] || 1);
}

function MemoryGauge({ used, max }: { used: string; max: string }) {
  const usedBytes = parseMemory(used);
  const maxBytes = parseMemory(max);
  const percentage = maxBytes > 0 ? Math.min((usedBytes / maxBytes) * 100, 100) : 0;
  const hasMax = maxBytes > 0;

  const strokeColor = percentage > 80
    ? 'stroke-red-500'
    : percentage > 60
      ? 'stroke-amber-500'
      : 'stroke-indigo-500';

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-20 w-20">
        <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
          <circle
            cx="40"
            cy="40"
            r="32"
            fill="none"
            className="stroke-gray-100"
            strokeWidth="8"
          />
          {hasMax && (
            <circle
              cx="40"
              cy="40"
              r="32"
              fill="none"
              className={strokeColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(percentage / 100) * 201} 201`}
            />
          )}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-semibold text-gray-900">
            {hasMax ? `${Math.round(percentage)}%` : used}
          </span>
        </div>
      </div>
      <p className="mt-1.5 text-[10px] text-gray-500 font-medium">Memory</p>
      <p className="text-[10px] text-gray-400">{used} / {max || 'unlimited'}</p>
    </div>
  );
}

export function RedisPanel({ data }: RedisPanelProps) {
  const status = data.error
    ? 'disconnected' as const
    : data.connected
      ? 'connected' as const
      : 'disconnected' as const;
  const statusText = data.error
    ? 'Not available'
    : data.connected
      ? `v${data.version}`
      : 'Disconnected';

  return (
    <ServiceCard
      name="Redis"
      icon={
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
        </svg>
      }
      status={status}
      statusText={statusText}
      error={data.error}
    >
      {!data.connected && !data.error ? (
        <p className="text-sm text-gray-500 text-center py-4">
          Redis is not connected. Ensure redis-cli is installed and Redis is running.
        </p>
      ) : data.connected ? (
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="grid grid-cols-2 gap-3 flex-1">
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <p className="text-lg font-semibold text-gray-900">
                  {data.keyCount.toLocaleString()}
                </p>
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Keys</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 text-center">
                <p className="text-lg font-semibold text-gray-900">{data.uptime}</p>
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Uptime</p>
              </div>
            </div>
            <div className="ml-4">
              <MemoryGauge used={data.memoryUsed} max={data.memoryMax} />
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 p-3">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              Details
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Version</span>
                <span className="font-mono text-gray-900">{data.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Memory Used</span>
                <span className="font-mono text-gray-900">{data.memoryUsed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Max Memory</span>
                <span className="font-mono text-gray-900">{data.memoryMax || 'Unlimited'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Key Count</span>
                <span className="font-mono text-gray-900">{data.keyCount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </ServiceCard>
  );
}

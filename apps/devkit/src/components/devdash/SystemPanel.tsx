'use client';

import type { SystemInfo } from '@/types/devdash';
import { ServiceCard } from './ServiceCard';

interface SystemPanelProps {
  data: SystemInfo & { error?: string };
}

function CircularGauge({
  value,
  max,
  label,
  unit,
  formatValue,
}: {
  value: number;
  max: number;
  label: string;
  unit?: string;
  formatValue?: (v: number, m: number) => string;
}) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;

  const strokeColor = percentage > 85
    ? 'stroke-red-500'
    : percentage > 65
      ? 'stroke-amber-500'
      : 'stroke-indigo-500';

  const display = formatValue
    ? formatValue(value, max)
    : `${Math.round(percentage)}%`;

  return (
    <div className="flex flex-col items-center">
      <div className="relative h-24 w-24">
        <svg className="h-24 w-24 -rotate-90" viewBox="0 0 96 96">
          <circle
            cx="48"
            cy="48"
            r="40"
            fill="none"
            className="stroke-gray-100"
            strokeWidth="8"
          />
          <circle
            cx="48"
            cy="48"
            r="40"
            fill="none"
            className={strokeColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(percentage / 100) * 251.3} 251.3`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-bold text-gray-900">{display}</span>
          {unit && <span className="text-[10px] text-gray-400">{unit}</span>}
        </div>
      </div>
      <p className="mt-2 text-xs font-medium text-gray-700">{label}</p>
    </div>
  );
}

function formatGb(bytes: number): string {
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb >= 1) return `${gb.toFixed(1)} GB`;
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(0)} MB`;
}

function formatUptime(uptime: string): string {
  return uptime;
}

export function SystemPanel({ data }: SystemPanelProps) {
  const status = data.error
    ? 'disconnected' as const
    : 'connected' as const;
  const statusText = data.error
    ? 'Not available'
    : data.hostname || 'System';

  return (
    <ServiceCard
      name="System Overview"
      icon={
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z" />
        </svg>
      }
      status={status}
      statusText={statusText}
      error={data.error}
    >
      {data.error ? null : (
        <div className="space-y-5">
          <div className="flex items-center justify-around">
            <CircularGauge
              value={data.cpuUsage}
              max={100}
              label="CPU"
              unit={`${data.cpuCores} cores`}
            />
            <CircularGauge
              value={data.memoryUsed}
              max={data.memoryTotal}
              label="Memory"
              unit={formatGb(data.memoryTotal)}
              formatValue={(v, m) => {
                const pct = m > 0 ? Math.round((v / m) * 100) : 0;
                return `${pct}%`;
              }}
            />
            <CircularGauge
              value={data.diskUsed}
              max={data.diskTotal}
              label="Disk"
              unit={formatGb(data.diskTotal)}
              formatValue={(v, m) => {
                const pct = m > 0 ? Math.round((v / m) * 100) : 0;
                return `${pct}%`;
              }}
            />
          </div>

          <div className="rounded-lg bg-gray-50 p-3">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              System Details
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Hostname</span>
                <span className="font-mono text-gray-900">{data.hostname}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">OS</span>
                <span className="font-mono text-gray-900 truncate max-w-[120px]">{data.os}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">CPU Cores</span>
                <span className="font-mono text-gray-900">{data.cpuCores}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Uptime</span>
                <span className="font-mono text-gray-900">{formatUptime(data.uptime)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Memory</span>
                <span className="font-mono text-gray-900">{formatGb(data.memoryUsed)} / {formatGb(data.memoryTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Disk</span>
                <span className="font-mono text-gray-900">{formatGb(data.diskUsed)} / {formatGb(data.diskTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </ServiceCard>
  );
}

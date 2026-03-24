'use client';

import type { NodeProcess } from '@/types/devdash';
import { ServiceCard } from './ServiceCard';

interface NodePanelProps {
  processes: NodeProcess[];
  error?: string;
}

export function NodePanel({ processes, error }: NodePanelProps) {
  const total = processes.length;
  const totalCpu = processes.reduce((sum, p) => sum + p.cpuPercent, 0);
  const totalMem = processes.reduce((sum, p) => sum + p.memoryMb, 0);

  const status = error
    ? 'disconnected' as const
    : total > 0
      ? 'connected' as const
      : 'warning' as const;
  const statusText = error
    ? 'Not available'
    : `${total} process${total !== 1 ? 'es' : ''}`;

  return (
    <ServiceCard
      name="Node.js Processes"
      icon={
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
        </svg>
      }
      status={status}
      statusText={statusText}
      error={error}
    >
      {processes.length === 0 && !error ? (
        <p className="text-sm text-gray-500 text-center py-4">
          No Node.js processes detected.
        </p>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-gray-50 p-3 text-center">
              <p className="text-lg font-semibold text-gray-900">{total}</p>
              <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Processes</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 text-center">
              <p className="text-lg font-semibold text-gray-900">{totalCpu.toFixed(1)}%</p>
              <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Total CPU</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 text-center">
              <p className="text-lg font-semibold text-gray-900">{totalMem.toFixed(0)} MB</p>
              <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Total Memory</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs" role="table">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-2 pr-3 font-medium text-gray-500">PID</th>
                  <th className="pb-2 pr-3 font-medium text-gray-500">Name</th>
                  <th className="pb-2 pr-3 font-medium text-gray-500">Port</th>
                  <th className="pb-2 pr-3 font-medium text-gray-500 text-right">CPU</th>
                  <th className="pb-2 pr-3 font-medium text-gray-500 text-right">Memory</th>
                  <th className="pb-2 font-medium text-gray-500 text-right">Uptime</th>
                </tr>
              </thead>
              <tbody>
                {processes.map((proc) => (
                  <tr key={proc.pid} className="border-b border-gray-50 last:border-0">
                    <td className="py-2 pr-3">
                      <span className="font-mono text-gray-500">{proc.pid}</span>
                    </td>
                    <td className="py-2 pr-3">
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate max-w-[160px]">{proc.name}</p>
                        <p className="font-mono text-[10px] text-gray-400 truncate max-w-[160px]" title={proc.command}>
                          {proc.command}
                        </p>
                      </div>
                    </td>
                    <td className="py-2 pr-3">
                      {proc.port ? (
                        <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-mono font-medium text-indigo-700">
                          :{proc.port}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-2 pr-3 text-right">
                      <span className={`font-mono ${proc.cpuPercent > 80 ? 'text-red-600 font-medium' : proc.cpuPercent > 50 ? 'text-amber-600' : 'text-gray-900'}`}>
                        {proc.cpuPercent.toFixed(1)}%
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-right">
                      <span className={`font-mono ${proc.memoryMb > 500 ? 'text-red-600 font-medium' : proc.memoryMb > 200 ? 'text-amber-600' : 'text-gray-900'}`}>
                        {proc.memoryMb.toFixed(0)} MB
                      </span>
                    </td>
                    <td className="py-2 text-right">
                      <span className="font-mono text-gray-500">{proc.uptime}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </ServiceCard>
  );
}

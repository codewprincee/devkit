'use client';

import { useState, useCallback } from 'react';
import type { DockerContainer } from '@/types/devdash';
import { ServiceCard } from './ServiceCard';

interface DockerPanelProps {
  containers: DockerContainer[];
  error?: string;
  onAction: (id: string, action: 'start' | 'stop' | 'restart') => Promise<string>;
  onGetLogs: (id: string) => Promise<string>;
  onToast: (text: string, type: 'success' | 'error' | 'info') => void;
}

function stateColor(state: DockerContainer['state']) {
  switch (state) {
    case 'running':
      return 'bg-emerald-500';
    case 'stopped':
      return 'bg-red-500';
    case 'paused':
      return 'bg-amber-500';
  }
}

function stateBadgeColor(state: DockerContainer['state']) {
  switch (state) {
    case 'running':
      return 'bg-emerald-50 text-emerald-700';
    case 'stopped':
      return 'bg-red-50 text-red-700';
    case 'paused':
      return 'bg-amber-50 text-amber-700';
  }
}

export function DockerPanel({ containers, error, onAction, onGetLogs, onToast }: DockerPanelProps) {
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [logsOpen, setLogsOpen] = useState<string | null>(null);
  const [logs, setLogs] = useState('');
  const [logsLoading, setLogsLoading] = useState(false);

  const handleAction = useCallback(async (id: string, action: 'start' | 'stop' | 'restart') => {
    setActionLoading((prev) => ({ ...prev, [id]: true }));
    try {
      const result = await onAction(id, action);
      onToast(result || `Container ${action} successful`, 'success');
    } catch (err) {
      onToast(`Failed to ${action} container: ${err}`, 'error');
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: false }));
    }
  }, [onAction, onToast]);

  const handleViewLogs = useCallback(async (id: string) => {
    if (logsOpen === id) {
      setLogsOpen(null);
      setLogs('');
      return;
    }
    setLogsOpen(id);
    setLogsLoading(true);
    try {
      const logContent = await onGetLogs(id);
      setLogs(logContent);
    } catch (err) {
      setLogs(`Error fetching logs: ${err}`);
    } finally {
      setLogsLoading(false);
    }
  }, [logsOpen, onGetLogs]);

  const running = containers.filter((c) => c.state === 'running').length;
  const total = containers.length;
  const status = error
    ? 'disconnected' as const
    : total === 0
      ? 'warning' as const
      : 'connected' as const;
  const statusText = error
    ? 'Not available'
    : `${running}/${total} running`;

  return (
    <ServiceCard
      name="Docker Containers"
      icon={
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" />
        </svg>
      }
      status={status}
      statusText={statusText}
      error={error}
    >
      {containers.length === 0 && !error ? (
        <p className="text-sm text-gray-500 text-center py-4">
          No Docker containers found. Make sure Docker is running.
        </p>
      ) : (
        <div className="space-y-2">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs" role="table">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-2 pr-4 font-medium text-gray-500">Container</th>
                  <th className="pb-2 pr-4 font-medium text-gray-500">Image</th>
                  <th className="pb-2 pr-4 font-medium text-gray-500">Status</th>
                  <th className="pb-2 pr-4 font-medium text-gray-500">Ports</th>
                  <th className="pb-2 font-medium text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {containers.map((container) => (
                  <tr key={container.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full flex-shrink-0 ${stateColor(container.state)}`} />
                        <span className="font-mono font-medium text-gray-900 truncate max-w-[140px]">
                          {container.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className="font-mono text-gray-600 truncate max-w-[120px] block">
                        {container.image}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${stateBadgeColor(container.state)}`}>
                        {container.state}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className="font-mono text-gray-500 truncate max-w-[100px] block">
                        {container.ports || '-'}
                      </span>
                    </td>
                    <td className="py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        {container.state === 'running' ? (
                          <>
                            <button
                              onClick={() => handleAction(container.id, 'stop')}
                              disabled={actionLoading[container.id]}
                              className="rounded p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                              title="Stop"
                              aria-label={`Stop ${container.name}`}
                            >
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleAction(container.id, 'restart')}
                              disabled={actionLoading[container.id]}
                              className="rounded p-1 text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors disabled:opacity-40"
                              title="Restart"
                              aria-label={`Restart ${container.name}`}
                            >
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                              </svg>
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleAction(container.id, 'start')}
                            disabled={actionLoading[container.id]}
                            className="rounded p-1 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors disabled:opacity-40"
                            title="Start"
                            aria-label={`Start ${container.name}`}
                          >
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => handleViewLogs(container.id)}
                          className={`rounded p-1 transition-colors ${logsOpen === container.id ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                          title="View logs"
                          aria-label={`View logs for ${container.name}`}
                        >
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {logsOpen && (
            <div className="mt-3 rounded-lg border border-gray-200 bg-gray-900 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-400">
                  Container Logs
                </span>
                <button
                  onClick={() => { setLogsOpen(null); setLogs(''); }}
                  className="text-gray-500 hover:text-gray-300 transition-colors"
                  aria-label="Close logs"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <pre className="text-xs text-gray-300 font-mono overflow-x-auto max-h-48 overflow-y-auto whitespace-pre-wrap">
                {logsLoading ? 'Loading logs...' : logs || 'No logs available'}
              </pre>
            </div>
          )}
        </div>
      )}
    </ServiceCard>
  );
}

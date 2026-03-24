'use client';

import type { PostgresStatus } from '@/types/devdash';
import { ServiceCard } from './ServiceCard';

interface PostgresPanelProps {
  data: PostgresStatus & { error?: string };
}

export function PostgresPanel({ data }: PostgresPanelProps) {
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

  const totalDbs = data.databases.length;
  const totalTables = data.databases.reduce((sum, db) => sum + db.tables, 0);

  return (
    <ServiceCard
      name="PostgreSQL"
      icon={
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 0v1.5c0 .621-.504 1.125-1.125 1.125m1.125-2.625c-.621 0-1.125.504-1.125 1.125m0 0v1.5c0 .621.504 1.125 1.125 1.125" />
        </svg>
      }
      status={status}
      statusText={statusText}
      error={data.error}
    >
      {!data.connected && !data.error ? (
        <p className="text-sm text-gray-500 text-center py-4">
          PostgreSQL is not connected. Ensure psql is installed and Postgres is running.
        </p>
      ) : data.connected ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-gray-50 p-3 text-center">
              <p className="text-lg font-semibold text-gray-900">{totalDbs}</p>
              <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Databases</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 text-center">
              <p className="text-lg font-semibold text-gray-900">{totalTables}</p>
              <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Tables</p>
            </div>
          </div>

          {data.databases.length > 0 && (
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                Databases
              </h3>
              <div className="space-y-1">
                {data.databases.map((db) => (
                  <div
                    key={db.name}
                    className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                      <span className="font-mono text-xs font-medium text-gray-900 truncate">
                        {db.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 text-[10px] text-gray-500">
                      <span>{db.tables} tables</span>
                      <span className="font-mono">{db.size}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </ServiceCard>
  );
}

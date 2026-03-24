'use client';

import type { MongoStatus } from '@/types';
import { ServiceCard } from './ServiceCard';

interface MongoPanelProps {
  data: MongoStatus & { error?: string };
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

export function MongoPanel({ data }: MongoPanelProps) {
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
  const totalCollections = data.databases.reduce((sum, db) => sum + db.collections, 0);
  const totalSize = data.databases.reduce((sum, db) => sum + db.sizeOnDisk, 0);

  return (
    <ServiceCard
      name="MongoDB"
      icon={
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
        </svg>
      }
      status={status}
      statusText={statusText}
      error={data.error}
    >
      {!data.connected && !data.error ? (
        <p className="text-sm text-gray-500 text-center py-4">
          MongoDB is not connected. Ensure mongosh is installed and MongoDB is running.
        </p>
      ) : data.connected ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-gray-50 p-3 text-center">
              <p className="text-lg font-semibold text-gray-900">{totalDbs}</p>
              <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Databases</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 text-center">
              <p className="text-lg font-semibold text-gray-900">{totalCollections}</p>
              <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Collections</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3 text-center">
              <p className="text-lg font-semibold text-gray-900">{formatBytes(totalSize)}</p>
              <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Total Size</p>
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
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                      <span className="font-mono text-xs font-medium text-gray-900 truncate">
                        {db.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 text-[10px] text-gray-500">
                      <span>{db.collections} collections</span>
                      <span className="font-mono">{formatBytes(db.sizeOnDisk)}</span>
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

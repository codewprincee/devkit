'use client';

import { useState } from 'react';
import type { ServiceTab } from '@/types/devdash';
import { useServices } from '@/hooks/devdash/useServices';
import { useToast } from '@/hooks/useToast';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { DockerPanel } from './DockerPanel';
import { MongoPanel } from './MongoPanel';
import { RedisPanel } from './RedisPanel';
import { PostgresPanel } from './PostgresPanel';
import { NodePanel } from './NodePanel';
import { SystemPanel } from './SystemPanel';
import { EmptyState } from './EmptyState';
import { ToastContainer } from './Toast';

export default function DevDashApp() {
  const {
    services,
    loading,
    lastRefresh,
    refresh,
    dockerAction,
    getDockerLogs,
  } = useServices();

  const { toasts, addToast, removeToast } = useToast();

  const [activeTab, setActiveTab] = useState<ServiceTab>('system');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleRefresh = async () => {
    try {
      await refresh();
      addToast('All services refreshed', 'success');
    } catch {
      addToast('Failed to refresh services', 'error');
    }
  };

  const handleDockerAction = async (id: string, action: 'start' | 'stop' | 'restart') => {
    const result = await dockerAction(id, action);
    setTimeout(refresh, 1500);
    return result;
  };

  return (
    <div className="flex h-full flex-col bg-white">
      <Header
        loading={loading}
        lastRefresh={lastRefresh}
        onRefresh={handleRefresh}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          services={services}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {!lastRefresh && !loading ? (
            <EmptyState onRefresh={handleRefresh} />
          ) : loading && !lastRefresh ? (
            <div className="flex flex-1 items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <svg className="h-8 w-8 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <p className="text-sm text-gray-500">Scanning services...</p>
              </div>
            </div>
          ) : (
          <div className="mx-auto max-w-4xl space-y-4">
            {activeTab === 'docker' && (
              <DockerPanel
                containers={services.docker.containers}
                error={services.docker.error}
                onAction={handleDockerAction}
                onGetLogs={getDockerLogs}
                onToast={addToast}
              />
            )}
            {activeTab === 'mongo' && <MongoPanel data={services.mongo} />}
            {activeTab === 'redis' && <RedisPanel data={services.redis} />}
            {activeTab === 'postgres' && <PostgresPanel data={services.postgres} />}
            {activeTab === 'node' && (
              <NodePanel processes={services.node.processes} error={services.node.error} />
            )}
            {activeTab === 'system' && <SystemPanel data={services.system} />}
          </div>
          )}
        </main>
      </div>

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

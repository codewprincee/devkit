'use client';

import { useState } from 'react';
import type { ServiceTab } from '@/types';
import { useServices } from '@/hooks/useServices';
import { useToast } from '@/hooks/useToast';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { DockerPanel } from '@/components/DockerPanel';
import { MongoPanel } from '@/components/MongoPanel';
import { RedisPanel } from '@/components/RedisPanel';
import { PostgresPanel } from '@/components/PostgresPanel';
import { NodePanel } from '@/components/NodePanel';
import { SystemPanel } from '@/components/SystemPanel';
import { ToastContainer } from '@/components/Toast';

export default function Home() {
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
    <div className="flex h-screen flex-col bg-white">
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

            {activeTab === 'mongo' && (
              <MongoPanel data={services.mongo} />
            )}

            {activeTab === 'redis' && (
              <RedisPanel data={services.redis} />
            )}

            {activeTab === 'postgres' && (
              <PostgresPanel data={services.postgres} />
            )}

            {activeTab === 'node' && (
              <NodePanel
                processes={services.node.processes}
                error={services.node.error}
              />
            )}

            {activeTab === 'system' && (
              <SystemPanel data={services.system} />
            )}
          </div>
        </main>
      </div>

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

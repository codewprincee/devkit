'use client';

import type { ServiceTab, ServiceStatus } from '@/types';

interface SidebarProps {
  activeTab: ServiceTab;
  onSelectTab: (tab: ServiceTab) => void;
  services: ServiceStatus;
  open: boolean;
  onClose: () => void;
}

interface NavItem {
  id: ServiceTab;
  label: string;
  icon: React.ReactNode;
  badge: () => string;
  isConnected: () => boolean;
}

export function Sidebar({ activeTab, onSelectTab, services, open, onClose }: SidebarProps) {
  const navItems: NavItem[] = [
    {
      id: 'docker',
      label: 'Docker',
      icon: (
        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-2.25-1.313M21 7.5v2.25m0-2.25l-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3l2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75l2.25-1.313M12 21.75V19.5m0 2.25l-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" />
        </svg>
      ),
      badge: () => {
        const running = services.docker.containers.filter((c) => c.state === 'running').length;
        return `${running}/${services.docker.containers.length}`;
      },
      isConnected: () => services.docker.containers.length > 0 && !services.docker.error,
    },
    {
      id: 'mongo',
      label: 'MongoDB',
      icon: (
        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
        </svg>
      ),
      badge: () => `${services.mongo.databases.length} dbs`,
      isConnected: () => services.mongo.connected,
    },
    {
      id: 'redis',
      label: 'Redis',
      icon: (
        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
        </svg>
      ),
      badge: () => `${services.redis.keyCount} keys`,
      isConnected: () => services.redis.connected,
    },
    {
      id: 'postgres',
      label: 'PostgreSQL',
      icon: (
        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 0v1.5c0 .621-.504 1.125-1.125 1.125m1.125-2.625c-.621 0-1.125.504-1.125 1.125m0 0v1.5c0 .621.504 1.125 1.125 1.125" />
        </svg>
      ),
      badge: () => `${services.postgres.databases.length} dbs`,
      isConnected: () => services.postgres.connected,
    },
    {
      id: 'node',
      label: 'Node.js',
      icon: (
        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
        </svg>
      ),
      badge: () => `${services.node.processes.length}`,
      isConnected: () => services.node.processes.length > 0 && !services.node.error,
    },
    {
      id: 'system',
      label: 'System',
      icon: (
        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25z" />
        </svg>
      ),
      badge: () => `${Math.round(services.system.cpuUsage)}%`,
      isConnected: () => !services.system.error,
    },
  ];

  const content = (
    <div className="flex h-full flex-col">
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Services
        </h2>
        <p className="mt-1 text-xs text-gray-400">
          Monitor your dev stack
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto p-2" aria-label="Service navigation">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isSelected = activeTab === item.id;
            const connected = item.isConnected();
            return (
              <li key={item.id}>
                <button
                  onClick={() => {
                    onSelectTab(item.id);
                    onClose();
                  }}
                  className={`
                    flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm
                    transition-colors group
                    ${isSelected
                      ? 'bg-indigo-50 text-indigo-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                  aria-current={isSelected ? 'page' : undefined}
                >
                  <span className={`flex-shrink-0 ${isSelected ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}`}>
                    {item.icon}
                  </span>
                  <span className="flex-1 truncate">{item.label}</span>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span
                      className={`
                        rounded-full px-1.5 py-0.5 text-[10px] font-medium
                        ${isSelected
                          ? 'bg-indigo-100 text-indigo-600'
                          : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                        }
                      `}
                    >
                      {item.badge()}
                    </span>
                    <span
                      className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                        connected ? 'bg-emerald-500' : 'bg-gray-300'
                      }`}
                    />
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-gray-200 p-3">
        <p className="text-[10px] text-gray-400 text-center">
          Auto-refreshes every 10 seconds
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-56 border-r border-gray-200 bg-white
          transform transition-transform duration-200 ease-out lg:hidden
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
        aria-label="Service sidebar"
      >
        {content}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex lg:w-56 lg:flex-shrink-0 lg:flex-col border-r border-gray-200 bg-gray-50/50"
        aria-label="Service sidebar"
      >
        {content}
      </aside>
    </>
  );
}

'use client';

import type { RequestTab } from '@/types';

interface RequestTabsProps {
  activeTab: RequestTab;
  onChangeTab: (tab: RequestTab) => void;
}

const tabs: { id: RequestTab; label: string }[] = [
  { id: 'params', label: 'Params' },
  { id: 'headers', label: 'Headers' },
  { id: 'body', label: 'Body' },
  { id: 'auth', label: 'Auth' },
];

export function RequestTabs({ activeTab, onChangeTab }: RequestTabsProps) {
  return (
    <div className="border-b border-gray-200 bg-gray-50/50">
      <nav className="flex gap-0 px-4 -mb-px" aria-label="Request tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`
                inline-flex items-center border-b-2 px-3 py-2 text-xs font-medium
                transition-colors whitespace-nowrap
                ${isActive
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }
              `}
              aria-current={isActive ? 'page' : undefined}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

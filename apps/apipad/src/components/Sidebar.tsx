'use client';

import { useState } from 'react';
import type { SidebarTab, ApiCollection, ApiEnvironment, HistoryEntry, ApiRequest, KeyValuePair } from '@/types';
import { CollectionTree } from './CollectionTree';
import { EnvironmentSelector } from './EnvironmentSelector';
import { getMethodColor, formatTime } from '@/lib/utils';

interface SidebarProps {
  collections: ApiCollection[];
  environments: ApiEnvironment[];
  history: HistoryEntry[];
  activeRequestId: string | null;
  onSelectRequest: (collectionId: string, request: ApiRequest) => void;
  onAddRequest: (collectionId: string) => void;
  onAddFolder: (collectionId: string) => void;
  onAddCollection: () => void;
  onDeleteCollection: (id: string) => void;
  onReplayHistory: (entry: HistoryEntry) => void;
  onClearHistory: () => void;
  onAddEnvironment: (name: string) => void;
  onDeleteEnvironment: (id: string) => void;
  onSetActiveEnvironment: (id: string) => void;
  onUpdateEnvironmentVariables: (id: string, variables: KeyValuePair[]) => void;
}

const sidebarTabs: { id: SidebarTab; label: string }[] = [
  { id: 'collections', label: 'Collections' },
  { id: 'history', label: 'History' },
  { id: 'environments', label: 'Env' },
];

export function Sidebar({
  collections,
  environments,
  history,
  activeRequestId,
  onSelectRequest,
  onAddRequest,
  onAddFolder,
  onAddCollection,
  onDeleteCollection,
  onReplayHistory,
  onClearHistory,
  onAddEnvironment,
  onDeleteEnvironment,
  onSetActiveEnvironment,
  onUpdateEnvironmentVariables,
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<SidebarTab>('collections');

  return (
    <aside className="flex flex-col w-64 border-r border-gray-200 bg-white shrink-0">
      {/* Tab bar */}
      <div className="flex border-b border-gray-200">
        {sidebarTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-2 py-2 text-[11px] font-medium transition-colors ${
                isActive
                  ? 'text-indigo-600 border-b-2 border-indigo-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'collections' && (
          <CollectionTree
            collections={collections}
            activeRequestId={activeRequestId}
            onSelectRequest={onSelectRequest}
            onAddRequest={onAddRequest}
            onAddFolder={onAddFolder}
            onDeleteCollection={onDeleteCollection}
            onAddCollection={onAddCollection}
          />
        )}

        {activeTab === 'history' && (
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">History</span>
              {history.length > 0 && (
                <button
                  onClick={onClearHistory}
                  className="text-[10px] text-red-500 hover:text-red-600 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex-1 overflow-auto py-1">
              {history.length === 0 && (
                <div className="px-3 py-6 text-center text-[11px] text-gray-400">
                  No history yet
                </div>
              )}
              {history.map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => onReplayHistory(entry)}
                  className="flex items-center gap-2 px-3 py-1.5 w-full text-left hover:bg-gray-50 transition-colors"
                >
                  <span className={`text-[10px] font-bold ${getMethodColor(entry.request.method)} w-8`}>
                    {entry.request.method.slice(0, 3)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-gray-700 truncate">{entry.request.url}</div>
                    <div className="text-[10px] text-gray-400">
                      {entry.response.status} &middot; {formatTime(entry.response.time)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'environments' && (
          <EnvironmentSelector
            environments={environments}
            onAdd={onAddEnvironment}
            onDelete={onDeleteEnvironment}
            onSetActive={onSetActiveEnvironment}
            onUpdateVariables={onUpdateEnvironmentVariables}
          />
        )}
      </div>
    </aside>
  );
}

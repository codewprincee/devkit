'use client';

import { useState } from 'react';
import type { ApiCollection, ApiRequest } from '@/types';
import { getMethodColor } from '@/lib/utils';

interface CollectionTreeProps {
  collections: ApiCollection[];
  activeRequestId: string | null;
  onSelectRequest: (collectionId: string, request: ApiRequest) => void;
  onAddRequest: (collectionId: string) => void;
  onAddFolder: (collectionId: string) => void;
  onDeleteCollection: (id: string) => void;
  onAddCollection: () => void;
}

export function CollectionTree({
  collections,
  activeRequestId,
  onSelectRequest,
  onAddRequest,
  onAddFolder,
  onDeleteCollection,
  onAddCollection,
}: CollectionTreeProps) {
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(
    new Set(collections.map((c) => c.id))
  );
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const toggleCollection = (id: string) => {
    setExpandedCollections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleFolder = (id: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Collections</span>
        <button
          onClick={onAddCollection}
          className="rounded p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
          aria-label="Add collection"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-auto py-1">
        {collections.length === 0 && (
          <div className="px-3 py-6 text-center text-[11px] text-gray-400">
            No collections yet
          </div>
        )}

        {collections.map((col) => (
          <div key={col.id}>
            {/* Collection header */}
            <div className="group flex items-center gap-1 px-2 py-1 hover:bg-gray-50 cursor-pointer">
              <button onClick={() => toggleCollection(col.id)} className="p-0.5">
                <svg className={`h-3 w-3 text-gray-400 transition-transform ${expandedCollections.has(col.id) ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
              <svg className="h-3.5 w-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
              </svg>
              <span className="flex-1 text-xs font-medium text-gray-700 truncate">{col.name}</span>
              <div className="hidden group-hover:flex items-center gap-0.5">
                <button
                  onClick={(e) => { e.stopPropagation(); onAddRequest(col.id); }}
                  className="rounded p-0.5 text-gray-400 hover:text-indigo-600 transition-colors"
                  title="Add request"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteCollection(col.id); }}
                  className="rounded p-0.5 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete collection"
                >
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Collection content */}
            {expandedCollections.has(col.id) && (
              <div className="ml-4">
                {col.folders.map((folder) => (
                  <div key={folder.id}>
                    <button
                      onClick={() => toggleFolder(folder.id)}
                      className="flex items-center gap-1 px-2 py-1 w-full hover:bg-gray-50"
                    >
                      <svg className={`h-3 w-3 text-gray-400 transition-transform ${expandedFolders.has(folder.id) ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                      <svg className="h-3 w-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                      </svg>
                      <span className="text-[11px] text-gray-600 truncate">{folder.name}</span>
                    </button>
                    {expandedFolders.has(folder.id) && folder.requests.map((req) => (
                      <button
                        key={req.id}
                        onClick={() => onSelectRequest(col.id, req)}
                        className={`flex items-center gap-2 px-4 py-1 w-full text-left hover:bg-gray-50 ${
                          activeRequestId === req.id ? 'bg-indigo-50' : ''
                        }`}
                      >
                        <span className={`text-[10px] font-bold ${getMethodColor(req.method)} w-8`}>{req.method.slice(0, 3)}</span>
                        <span className="text-[11px] text-gray-600 truncate">{req.name}</span>
                      </button>
                    ))}
                  </div>
                ))}

                {col.requests.map((req) => (
                  <button
                    key={req.id}
                    onClick={() => onSelectRequest(col.id, req)}
                    className={`flex items-center gap-2 px-2 py-1 w-full text-left hover:bg-gray-50 ${
                      activeRequestId === req.id ? 'bg-indigo-50' : ''
                    }`}
                  >
                    <span className={`text-[10px] font-bold ${getMethodColor(req.method)} w-8`}>{req.method.slice(0, 3)}</span>
                    <span className="text-[11px] text-gray-600 truncate">{req.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

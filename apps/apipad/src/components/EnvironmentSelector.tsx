'use client';

import { useState } from 'react';
import type { ApiEnvironment, KeyValuePair } from '@/types';
import { KeyValueEditor } from './KeyValueEditor';

interface EnvironmentSelectorProps {
  environments: ApiEnvironment[];
  onAdd: (name: string) => void;
  onDelete: (id: string) => void;
  onSetActive: (id: string) => void;
  onUpdateVariables: (id: string, variables: KeyValuePair[]) => void;
}

export function EnvironmentSelector({
  environments,
  onAdd,
  onDelete,
  onSetActive,
  onUpdateVariables,
}: EnvironmentSelectorProps) {
  const [newName, setNewName] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleAdd = () => {
    if (!newName.trim()) return;
    onAdd(newName.trim());
    setNewName('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-gray-100">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
          placeholder="New environment..."
          className="flex-1 rounded border border-gray-300 bg-white px-2 py-1 text-[11px] text-gray-700 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button
          onClick={handleAdd}
          disabled={!newName.trim()}
          className="rounded p-1 text-indigo-600 hover:bg-indigo-50 transition-colors disabled:opacity-50"
          aria-label="Add environment"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-auto py-1">
        {environments.length === 0 && (
          <div className="px-3 py-6 text-center text-[11px] text-gray-400">
            No environments yet
          </div>
        )}

        {environments.map((env) => (
          <div key={env.id} className="border-b border-gray-50">
            <div className="group flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50">
              <button
                onClick={() => onSetActive(env.id)}
                className={`h-2.5 w-2.5 rounded-full border-2 ${
                  env.isActive ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'
                }`}
                title={env.isActive ? 'Active' : 'Set active'}
              />
              <button
                onClick={() => setExpandedId(expandedId === env.id ? null : env.id)}
                className="flex-1 text-left text-xs text-gray-700 truncate"
              >
                {env.name}
              </button>
              <span className="text-[10px] text-gray-400">{env.variables.length} vars</span>
              <button
                onClick={() => onDelete(env.id)}
                className="hidden group-hover:block rounded p-0.5 text-gray-400 hover:text-red-600 transition-colors"
                aria-label="Delete environment"
              >
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {expandedId === env.id && (
              <div className="px-3 py-2 bg-gray-50/50">
                <KeyValueEditor
                  pairs={env.variables}
                  onChange={(vars) => onUpdateVariables(env.id, vars)}
                  keyPlaceholder="Variable name"
                  valuePlaceholder="Value"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

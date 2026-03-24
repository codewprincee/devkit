'use client';

import { useState, useMemo, useCallback } from 'react';
import type { EnvFile, EnvVariable } from '@/types/envguard';
import { serializeEnv } from '@/lib/envguard/parser';

interface VariableTableProps {
  file: EnvFile;
  onUpdateFile: (updater: (file: EnvFile) => EnvFile) => void;
  onToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  onSave?: () => void;
}

export function VariableTable({ file, onUpdateFile, onToast, onSave }: VariableTableProps) {
  const [search, setSearch] = useState('');
  const [revealedKeys, setRevealedKeys] = useState<Set<string>>(new Set());
  const [editingCell, setEditingCell] = useState<{ key: string; field: 'key' | 'value' } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [newKey, setNewKey] = useState('');
  const [newVal, setNewVal] = useState('');
  const [showAddRow, setShowAddRow] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return file.variables;
    const q = search.toLowerCase();
    return file.variables.filter((v) => v.key.toLowerCase().includes(q));
  }, [file.variables, search]);

  const toggleReveal = useCallback((key: string) => {
    setRevealedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const isSensitive = useCallback((key: string) => {
    const k = key.toLowerCase();
    return (
      k.includes('secret') ||
      k.includes('password') ||
      k.includes('token') ||
      k.includes('key') ||
      k.includes('api') ||
      k.includes('auth') ||
      k.includes('private')
    );
  }, []);

  const maskValue = useCallback((value: string) => {
    if (value.length === 0) return '';
    if (value.length <= 4) return '*'.repeat(value.length);
    return value.slice(0, 2) + '*'.repeat(Math.min(value.length - 4, 20)) + value.slice(-2);
  }, []);

  const startEdit = useCallback((key: string, field: 'key' | 'value', currentValue: string) => {
    setEditingCell({ key, field });
    setEditValue(currentValue);
  }, []);

  const commitEdit = useCallback(() => {
    if (!editingCell) return;

    onUpdateFile((f) => {
      const newVars = f.variables.map((v) => {
        if (v.key !== editingCell.key) return v;
        if (editingCell.field === 'value') {
          return { ...v, value: editValue, raw: `${v.key}=${editValue}` };
        }
        if (editingCell.field === 'key') {
          return { ...v, key: editValue, raw: `${editValue}=${v.value}` };
        }
        return v;
      });
      return { ...f, variables: newVars, raw: serializeEnv(newVars) };
    });

    setEditingCell(null);
    setEditValue('');
  }, [editingCell, editValue, onUpdateFile]);

  const cancelEdit = useCallback(() => {
    setEditingCell(null);
    setEditValue('');
  }, []);

  const deleteVariable = useCallback(
    (key: string) => {
      onUpdateFile((f) => {
        const newVars = f.variables.filter((v) => v.key !== key);
        return { ...f, variables: newVars, raw: serializeEnv(newVars) };
      });
      onToast(`Deleted ${key}`, 'info');
    },
    [onUpdateFile, onToast]
  );

  const addVariable = useCallback(() => {
    if (!newKey.trim()) return;

    onUpdateFile((f) => {
      const exists = f.variables.some((v) => v.key === newKey.trim());
      if (exists) {
        onToast(`Key "${newKey}" already exists`, 'error');
        return f;
      }
      const newVar: EnvVariable = {
        key: newKey.trim(),
        value: newVal,
        line: f.variables.length + 1,
        raw: `${newKey.trim()}=${newVal}`,
      };
      const newVars = [...f.variables, newVar];
      return { ...f, variables: newVars, raw: serializeEnv(newVars) };
    });

    setNewKey('');
    setNewVal('');
    setShowAddRow(false);
    onToast(`Added ${newKey}`, 'success');
  }, [newKey, newVal, onUpdateFile, onToast]);

  const copyToClipboard = useCallback(
    async (text: string, label: string) => {
      try {
        await navigator.clipboard.writeText(text);
        onToast(`Copied ${label}`, 'success');
      } catch {
        onToast('Failed to copy', 'error');
      }
    },
    [onToast]
  );

  const downloadFile = useCallback(() => {
    const content = serializeEnv(file.variables);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
    onToast(`Downloaded ${file.name}`, 'success');
  }, [file, onToast]);

  const exportJson = useCallback(() => {
    const obj: Record<string, string> = {};
    for (const v of file.variables) obj[v.key] = v.value;
    const json = JSON.stringify(obj, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name.replace(/\.env.*/, '') + '.env.json';
    a.click();
    URL.revokeObjectURL(url);
    onToast('Exported as JSON', 'success');
  }, [file, onToast]);

  const copyAllAsText = useCallback(async () => {
    const content = serializeEnv(file.variables);
    try {
      await navigator.clipboard.writeText(content);
      onToast('Copied all variables', 'success');
    } catch {
      onToast('Failed to copy', 'error');
    }
  }, [file, onToast]);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-4 sm:px-6 py-3 border-b border-gray-200 bg-gray-50/50">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Filter variables..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-1.5 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            aria-label="Filter variables by key name"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowAddRow(true)}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add
          </button>
          {onSave && (
            <button
              onClick={onSave}
              className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:from-indigo-600 hover:to-violet-600 transition-all"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              Save
            </button>
          )}
          <button
            onClick={downloadFile}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download
          </button>
          <button
            onClick={exportJson}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            JSON
          </button>
          <button
            onClick={copyAllAsText}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
            </svg>
            Copy All
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm" role="table">
          <thead className="sticky top-0 z-10 bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 sm:px-6 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 w-10">
                #
              </th>
              <th className="px-4 sm:px-6 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Key
              </th>
              <th className="px-4 sm:px-6 py-2 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Value
              </th>
              <th className="px-4 sm:px-6 py-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 w-28">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {showAddRow && (
              <tr className="bg-indigo-50/50">
                <td className="px-4 sm:px-6 py-2">
                  <span className="text-xs text-gray-400">new</span>
                </td>
                <td className="px-4 sm:px-6 py-2">
                  <input
                    type="text"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value.toUpperCase())}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addVariable();
                      if (e.key === 'Escape') { setShowAddRow(false); setNewKey(''); setNewVal(''); }
                    }}
                    placeholder="VARIABLE_NAME"
                    className="w-full rounded border border-indigo-300 bg-white px-2 py-1 font-mono text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    autoFocus
                    aria-label="New variable key"
                  />
                </td>
                <td className="px-4 sm:px-6 py-2">
                  <input
                    type="text"
                    value={newVal}
                    onChange={(e) => setNewVal(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addVariable();
                      if (e.key === 'Escape') { setShowAddRow(false); setNewKey(''); setNewVal(''); }
                    }}
                    placeholder="value"
                    className="w-full rounded border border-indigo-300 bg-white px-2 py-1 font-mono text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    aria-label="New variable value"
                  />
                </td>
                <td className="px-4 sm:px-6 py-2 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={addVariable}
                      className="rounded p-1 text-emerald-600 hover:bg-emerald-50 transition-colors"
                      aria-label="Save new variable"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </button>
                    <button
                      onClick={() => { setShowAddRow(false); setNewKey(''); setNewVal(''); }}
                      className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                      aria-label="Cancel"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {filtered.map((v) => {
              const isRevealed = revealedKeys.has(v.key);
              const sensitive = isSensitive(v.key);
              const isEditingKey = editingCell?.key === v.key && editingCell?.field === 'key';
              const isEditingValue = editingCell?.key === v.key && editingCell?.field === 'value';

              return (
                <tr key={v.key + v.line} className="group hover:bg-gray-50/80 transition-colors">
                  <td className="px-4 sm:px-6 py-2">
                    <span className="font-mono text-[10px] text-gray-400">{v.line}</span>
                  </td>
                  <td className="px-4 sm:px-6 py-2">
                    {isEditingKey ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commitEdit();
                          if (e.key === 'Escape') cancelEdit();
                        }}
                        onBlur={commitEdit}
                        className="w-full rounded border border-indigo-300 bg-white px-2 py-0.5 font-mono text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        autoFocus
                        aria-label="Edit key"
                      />
                    ) : (
                      <button
                        onClick={() => startEdit(v.key, 'key', v.key)}
                        className="text-left font-mono text-xs font-medium text-gray-900 hover:text-indigo-600 transition-colors cursor-text"
                        title="Click to edit key"
                      >
                        {v.key}
                      </button>
                    )}
                  </td>
                  <td className="px-4 sm:px-6 py-2 max-w-xs">
                    {isEditingValue ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commitEdit();
                          if (e.key === 'Escape') cancelEdit();
                        }}
                        onBlur={commitEdit}
                        className="w-full rounded border border-indigo-300 bg-white px-2 py-0.5 font-mono text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        autoFocus
                        aria-label="Edit value"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEdit(v.key, 'value', v.value)}
                          className="text-left font-mono text-xs text-gray-600 hover:text-gray-900 transition-colors truncate max-w-[300px] cursor-text"
                          title="Click to edit value"
                        >
                          {v.value === '' ? (
                            <span className="italic text-gray-300">empty</span>
                          ) : sensitive && !isRevealed ? (
                            <span className="text-gray-400">{maskValue(v.value)}</span>
                          ) : (
                            v.value
                          )}
                        </button>
                        {sensitive && v.value !== '' && (
                          <button
                            onClick={() => toggleReveal(v.key)}
                            className="flex-shrink-0 rounded p-0.5 text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label={isRevealed ? 'Hide value' : 'Show value'}
                            title={isRevealed ? 'Hide' : 'Reveal'}
                          >
                            {isRevealed ? (
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                              </svg>
                            ) : (
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            )}
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-4 sm:px-6 py-2 text-right">
                    <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => copyToClipboard(v.key, 'key')}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                        title="Copy key"
                        aria-label="Copy key"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                        </svg>
                      </button>
                      <button
                        onClick={() => copyToClipboard(v.value, 'value')}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                        title="Copy value"
                        aria-label="Copy value"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08M15.75 18.75v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5A3.375 3.375 0 006.375 7.5H6m7.5-3.75h-.375c-.621 0-1.125.504-1.125 1.125v.375" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteVariable(v.key)}
                        className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Delete"
                        aria-label="Delete variable"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-400">
                  {search
                    ? 'No variables match your filter'
                    : 'No variables in this file'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Status bar */}
      <div className="border-t border-gray-200 bg-gray-50/50 px-4 sm:px-6 py-2 flex items-center justify-between text-xs text-gray-500">
        <span>
          {filtered.length} variable{filtered.length !== 1 ? 's' : ''}
          {search && ` (filtered from ${file.variables.length})`}
        </span>
        <span className="font-mono">{file.name}</span>
      </div>
    </div>
  );
}

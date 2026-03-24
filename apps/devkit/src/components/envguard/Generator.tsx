'use client';

import { useState, useMemo, useCallback } from 'react';
import type { EnvFile } from '@/types/envguard';
import { generateExample } from '@/lib/envguard/parser';

interface GeneratorProps {
  files: EnvFile[];
  selectedFile: string | null;
  onToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}

export function Generator({ files, selectedFile, onToast }: GeneratorProps) {
  const [withComments, setWithComments] = useState(true);
  const [sourcePath, setSourcePath] = useState<string>(selectedFile ?? files[0]?.path ?? '');

  const sourceFile = files.find((f) => f.path === sourcePath);

  const preview = useMemo(() => {
    if (!sourceFile) return '';
    return generateExample(sourceFile.variables, withComments);
  }, [sourceFile, withComments]);

  const download = useCallback(() => {
    if (!preview) return;
    const blob = new Blob([preview], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '.env.example';
    a.click();
    URL.revokeObjectURL(url);
    onToast('Downloaded .env.example', 'success');
  }, [preview, onToast]);

  const copyToClipboard = useCallback(async () => {
    if (!preview) return;
    try {
      await navigator.clipboard.writeText(preview);
      onToast('Copied to clipboard', 'success');
    } catch {
      onToast('Failed to copy', 'error');
    }
  }, [preview, onToast]);

  if (files.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-12">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <p className="mt-3 text-sm text-gray-500">
            Open a project to generate .env.example
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Options */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-4 sm:px-6 py-3 border-b border-gray-200 bg-gray-50/50">
        <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
          <label className="text-xs font-medium text-gray-500 whitespace-nowrap">Source</label>
          <select
            value={sourcePath}
            onChange={(e) => setSourcePath(e.target.value)}
            className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-mono text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            aria-label="Source file"
          >
            {files.map((f) => (
              <option key={f.path} value={f.path}>{f.name}</option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
          <input
            type="checkbox"
            checked={withComments}
            onChange={(e) => setWithComments(e.target.checked)}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          Add comments
        </label>

        <div className="flex items-center gap-2">
          <button
            onClick={download}
            disabled={!preview}
            className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:from-indigo-600 hover:to-violet-600 transition-all disabled:opacity-50"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download .env.example
          </button>
          <button
            onClick={copyToClipboard}
            disabled={!preview}
            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
            </svg>
            Copy
          </button>
        </div>
      </div>

      {/* Info */}
      {sourceFile && (
        <div className="px-4 sm:px-6 py-2 border-b border-gray-100 text-xs text-gray-500">
          Generating from <span className="font-mono font-medium">{sourceFile.name}</span>
          {' '}&middot;{' '}
          {sourceFile.variables.length} variable{sourceFile.variables.length !== 1 ? 's' : ''}
          {' '}&middot;{' '}
          All values will be stripped
        </div>
      )}

      {/* Preview */}
      <div className="flex-1 overflow-auto p-4 sm:p-6">
        <div className="rounded-lg border border-gray-200 bg-gray-900 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-700">
            <span className="text-xs font-mono text-gray-400">.env.example</span>
            <span className="text-[10px] text-gray-500">preview</span>
          </div>
          <pre className="p-4 overflow-auto text-sm font-mono leading-relaxed text-gray-300 whitespace-pre-wrap">
            {preview || 'No variables to generate'}
          </pre>
        </div>
      </div>
    </div>
  );
}

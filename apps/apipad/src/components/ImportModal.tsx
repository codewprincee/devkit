'use client';

import { useState, useCallback } from 'react';
import type { ApiCollection } from '@/types';
import { importPostmanCollection } from '@/lib/import-postman';
import { importInsomniaCollection } from '@/lib/import-insomnia';

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
  onImport: (collection: ApiCollection) => void;
  onToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}

export function ImportModal({ open, onClose, onImport, onToast }: ImportModalProps) {
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      try {
        const text = await file.text();
        const data = JSON.parse(text);

        let collection: ApiCollection;

        if (data.info && data.item) {
          collection = importPostmanCollection(text);
          onToast(`Imported Postman collection: ${collection.name}`, 'success');
        } else if (data.resources) {
          collection = importInsomniaCollection(text);
          onToast(`Imported Insomnia collection: ${collection.name}`, 'success');
        } else {
          onToast('Unrecognized file format. Expected Postman v2.1 or Insomnia v4.', 'error');
          return;
        }

        onImport(collection);
        onClose();
      } catch {
        onToast('Failed to parse import file', 'error');
      }
    },
    [onImport, onClose, onToast]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900">Import Collection</h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragOver ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300'
          }`}
        >
          <svg className="mx-auto h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <p className="mt-2 text-sm text-gray-600">Drop a JSON file here</p>
          <p className="text-xs text-gray-400 mt-1">Supports Postman v2.1 and Insomnia v4 exports</p>

          <label className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9.75m3 0h.008v.008H15v-.008zm-3 0h.008v.008H12v-.008zm-3 0h.008v.008H9v-.008z" />
            </svg>
            Choose File
            <input type="file" accept=".json" onChange={handleFileInput} className="hidden" />
          </label>
        </div>
      </div>
    </div>
  );
}

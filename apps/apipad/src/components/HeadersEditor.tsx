'use client';

import type { KeyValuePair } from '@/types';
import { KeyValueEditor } from './KeyValueEditor';

interface HeadersEditorProps {
  headers: KeyValuePair[];
  onChange: (headers: KeyValuePair[]) => void;
}

export function HeadersEditor({ headers, onChange }: HeadersEditorProps) {
  return (
    <div className="p-4">
      <div className="text-xs font-medium text-gray-500 mb-2">Request Headers</div>
      <KeyValueEditor
        pairs={headers}
        onChange={onChange}
        keyPlaceholder="Header name"
        valuePlaceholder="Value"
      />
    </div>
  );
}

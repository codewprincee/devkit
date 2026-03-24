'use client';

import type { KeyValuePair } from '@/types';
import { KeyValueEditor } from './KeyValueEditor';

interface ParamsEditorProps {
  params: KeyValuePair[];
  onChange: (params: KeyValuePair[]) => void;
}

export function ParamsEditor({ params, onChange }: ParamsEditorProps) {
  return (
    <div className="p-4">
      <div className="text-xs font-medium text-gray-500 mb-2">Query Parameters</div>
      <KeyValueEditor
        pairs={params}
        onChange={onChange}
        keyPlaceholder="Parameter name"
        valuePlaceholder="Value"
      />
    </div>
  );
}

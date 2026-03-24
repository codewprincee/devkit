'use client';

import type { KeyValuePair } from '@/types';

interface KeyValueEditorProps {
  pairs: KeyValuePair[];
  onChange: (pairs: KeyValuePair[]) => void;
  keyPlaceholder?: string;
  valuePlaceholder?: string;
}

export function KeyValueEditor({
  pairs,
  onChange,
  keyPlaceholder = 'Key',
  valuePlaceholder = 'Value',
}: KeyValueEditorProps) {
  const updatePair = (index: number, field: keyof KeyValuePair, value: string | boolean) => {
    const updated = pairs.map((p, i) =>
      i === index ? { ...p, [field]: value } : p
    );
    onChange(updated);
  };

  const addPair = () => {
    onChange([...pairs, { key: '', value: '', enabled: true }]);
  };

  const removePair = (index: number) => {
    onChange(pairs.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-1.5">
      {pairs.map((pair, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={pair.enabled}
            onChange={(e) => updatePair(i, 'enabled', e.target.checked)}
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
          />
          <input
            type="text"
            value={pair.key}
            onChange={(e) => updatePair(i, 'key', e.target.value)}
            placeholder={keyPlaceholder}
            className="flex-1 rounded border border-gray-300 bg-white px-2 py-1 text-xs font-mono text-gray-700 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <input
            type="text"
            value={pair.value}
            onChange={(e) => updatePair(i, 'value', e.target.value)}
            placeholder={valuePlaceholder}
            className="flex-1 rounded border border-gray-300 bg-white px-2 py-1 text-xs font-mono text-gray-700 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            onClick={() => removePair(i)}
            className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
            aria-label="Remove"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
      <button
        onClick={addPair}
        className="self-start inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 transition-colors mt-1"
      >
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
        Add
      </button>
    </div>
  );
}

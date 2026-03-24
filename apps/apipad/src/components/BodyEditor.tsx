'use client';

interface BodyEditorProps {
  body: string;
  bodyType: 'json' | 'form' | 'raw' | 'none';
  onBodyChange: (body: string) => void;
  onBodyTypeChange: (type: 'json' | 'form' | 'raw' | 'none') => void;
}

const bodyTypes = [
  { id: 'none' as const, label: 'None' },
  { id: 'json' as const, label: 'JSON' },
  { id: 'raw' as const, label: 'Raw' },
  { id: 'form' as const, label: 'Form' },
];

export function BodyEditor({ body, bodyType, onBodyChange, onBodyTypeChange }: BodyEditorProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100">
        {bodyTypes.map((bt) => (
          <button
            key={bt.id}
            onClick={() => onBodyTypeChange(bt.id)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              bodyType === bt.id
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            {bt.label}
          </button>
        ))}
      </div>

      {bodyType === 'none' ? (
        <div className="flex-1 flex items-center justify-center text-xs text-gray-400 p-4">
          No body for this request
        </div>
      ) : (
        <textarea
          value={body}
          onChange={(e) => onBodyChange(e.target.value)}
          placeholder={bodyType === 'json' ? '{\n  "key": "value"\n}' : 'Request body...'}
          className="flex-1 w-full p-4 text-xs font-mono text-gray-700 placeholder:text-gray-400 focus:outline-none resize-none bg-white"
          spellCheck={false}
        />
      )}
    </div>
  );
}

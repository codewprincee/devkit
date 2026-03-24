'use client';

interface EmptyStateProps {
  onCreateCollection: () => void;
  onImport: () => void;
}

export function EmptyState({ onCreateCollection, onImport }: EmptyStateProps) {
  return (
    <div className="flex flex-1 items-center justify-center p-12">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-lg">
          <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-2">API Pad</h2>
        <p className="text-sm text-gray-500 mb-8">
          Build, test, and debug APIs. Create a collection to get started, or import from Postman/Insomnia.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={onCreateCollection}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:from-indigo-600 hover:to-violet-600 transition-all"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Collection
          </button>
          <button
            onClick={onImport}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            Import
          </button>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 text-left">
          {[
            { title: 'Send Requests', desc: 'GET, POST, PUT, DELETE and more' },
            { title: 'Collections', desc: 'Organize and save your requests' },
            { title: 'Environments', desc: 'Use {{variables}} in your URLs' },
            { title: 'History', desc: 'Automatic request history tracking' },
          ].map((f) => (
            <div key={f.title} className="rounded-lg border border-gray-200 p-3">
              <div className="text-xs font-semibold text-gray-700">{f.title}</div>
              <div className="text-[11px] text-gray-500 mt-0.5">{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

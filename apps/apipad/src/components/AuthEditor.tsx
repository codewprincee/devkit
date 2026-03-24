'use client';

import type { ApiAuth } from '@/types';

interface AuthEditorProps {
  auth: ApiAuth;
  onChange: (auth: ApiAuth) => void;
}

const authTypes = [
  { id: 'none' as const, label: 'No Auth' },
  { id: 'bearer' as const, label: 'Bearer Token' },
  { id: 'basic' as const, label: 'Basic Auth' },
  { id: 'apikey' as const, label: 'API Key' },
];

export function AuthEditor({ auth, onChange }: AuthEditorProps) {
  return (
    <div className="p-4 flex flex-col gap-4">
      <div>
        <div className="text-xs font-medium text-gray-500 mb-2">Auth Type</div>
        <div className="flex items-center gap-2">
          {authTypes.map((at) => (
            <button
              key={at.id}
              onClick={() => onChange({ ...auth, type: at.id })}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                auth.type === at.id
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              {at.label}
            </button>
          ))}
        </div>
      </div>

      {auth.type === 'bearer' && (
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Token</label>
          <input
            type="text"
            value={auth.token || ''}
            onChange={(e) => onChange({ ...auth, token: e.target.value })}
            placeholder="Enter bearer token..."
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-mono text-gray-700 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      )}

      {auth.type === 'basic' && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Username</label>
            <input
              type="text"
              value={auth.username || ''}
              onChange={(e) => onChange({ ...auth, username: e.target.value })}
              placeholder="Username"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-700 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Password</label>
            <input
              type="password"
              value={auth.password || ''}
              onChange={(e) => onChange({ ...auth, password: e.target.value })}
              placeholder="Password"
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-700 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      )}

      {auth.type === 'apikey' && (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Key</label>
              <input
                type="text"
                value={auth.key || ''}
                onChange={(e) => onChange({ ...auth, key: e.target.value })}
                placeholder="X-API-Key"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-mono text-gray-700 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Value</label>
              <input
                type="text"
                value={auth.value || ''}
                onChange={(e) => onChange({ ...auth, value: e.target.value })}
                placeholder="api-key-value"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-mono text-gray-700 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Add to</label>
            <div className="flex gap-2">
              {(['header', 'query'] as const).map((loc) => (
                <button
                  key={loc}
                  onClick={() => onChange({ ...auth, addTo: loc })}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    (auth.addTo || 'header') === loc
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {loc === 'header' ? 'Header' : 'Query Param'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {auth.type === 'none' && (
        <div className="text-xs text-gray-400">
          No authentication will be applied to this request.
        </div>
      )}
    </div>
  );
}

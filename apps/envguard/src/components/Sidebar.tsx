'use client';

import type { EnvFile } from '@/types';

interface SidebarProps {
  files: EnvFile[];
  selectedFile: string | null;
  onSelectFile: (path: string) => void;
  open: boolean;
  onClose: () => void;
}

function fileIcon(name: string) {
  if (name.includes('example') || name.includes('sample')) {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold bg-amber-100 text-amber-700">
        EX
      </span>
    );
  }
  if (name.includes('production')) {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold bg-red-100 text-red-700">
        PR
      </span>
    );
  }
  if (name.includes('development')) {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold bg-blue-100 text-blue-700">
        DV
      </span>
    );
  }
  if (name.includes('test')) {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold bg-purple-100 text-purple-700">
        TS
      </span>
    );
  }
  if (name.includes('local')) {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold bg-green-100 text-green-700">
        LC
      </span>
    );
  }
  if (name.includes('staging')) {
    return (
      <span className="flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold bg-orange-100 text-orange-700">
        ST
      </span>
    );
  }
  return (
    <span className="flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold bg-indigo-100 text-indigo-700">
      EN
    </span>
  );
}

export function Sidebar({ files, selectedFile, onSelectFile, open, onClose }: SidebarProps) {
  const content = (
    <div className="flex h-full flex-col">
      <div className="px-4 py-3 border-b border-gray-200">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Environment Files
        </h2>
        {files.length > 0 && (
          <p className="mt-1 text-xs text-gray-400">
            {files.length} file{files.length !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      {files.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <p className="text-sm text-gray-400 text-center leading-relaxed">
            Open a project folder or drop .env files to get started
          </p>
        </div>
      ) : (
        <nav className="flex-1 overflow-y-auto p-2" aria-label="Environment files">
          <ul className="space-y-0.5">
            {files.map((file) => {
              const isSelected = file.path === selectedFile;
              return (
                <li key={file.path}>
                  <button
                    onClick={() => {
                      onSelectFile(file.path);
                      onClose();
                    }}
                    className={`
                      flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm
                      transition-colors group
                      ${isSelected
                        ? 'bg-indigo-50 text-indigo-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                    aria-current={isSelected ? 'page' : undefined}
                  >
                    {fileIcon(file.name)}
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-xs truncate">{file.name}</p>
                      {file.path !== file.name && (
                        <p className="text-[10px] text-gray-400 truncate mt-0.5">
                          {file.path}
                        </p>
                      )}
                    </div>
                    <span
                      className={`
                        flex-shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-medium
                        ${isSelected
                          ? 'bg-indigo-100 text-indigo-600'
                          : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                        }
                      `}
                    >
                      {file.variables.length}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 border-r border-gray-200 bg-white
          transform transition-transform duration-200 ease-out lg:hidden
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
        aria-label="Sidebar"
      >
        {content}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex lg:w-64 lg:flex-shrink-0 lg:flex-col border-r border-gray-200 bg-gray-50/50"
        aria-label="Sidebar"
      >
        {content}
      </aside>
    </>
  );
}

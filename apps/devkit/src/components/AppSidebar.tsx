'use client';

export type ToolId = 'portman' | 'envguard' | 'apipad' | 'loglens' | 'devdash';

const tools: { id: ToolId; label: string; icon: React.ReactNode }[] = [
  {
    id: 'portman',
    label: 'PortMan',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="3" />
        <circle cx="8" cy="12" r="2" />
        <line x1="12" y1="10" x2="20" y2="10" />
        <line x1="12" y1="14" x2="20" y2="14" />
      </svg>
    ),
  },
  {
    id: 'envguard',
    label: 'EnvGuard',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    id: 'apipad',
    label: 'API Pad',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
      </svg>
    ),
  },
  {
    id: 'loglens',
    label: 'LogLens',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    id: 'devdash',
    label: 'DevDash',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
];

interface AppSidebarProps {
  activeTool: ToolId;
  onChangeTool: (tool: ToolId) => void;
}

export function AppSidebar({ activeTool, onChangeTool }: AppSidebarProps) {
  return (
    <aside className="flex w-[60px] flex-col items-center bg-gray-950 py-4 gap-2 shrink-0">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 mb-4">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 17l6-6-6-6" />
          <line x1="12" y1="19" x2="20" y2="19" />
        </svg>
      </div>

      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onChangeTool(tool.id)}
          title={tool.label}
          className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
            activeTool === tool.id
              ? 'bg-white/15 text-white'
              : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
          }`}
        >
          {tool.icon}
        </button>
      ))}
    </aside>
  );
}

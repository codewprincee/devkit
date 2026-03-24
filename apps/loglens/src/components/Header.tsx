'use client';

interface HeaderProps {
  onOpenFile: () => void;
  onToggleSearch: () => void;
  onToggleTailing: () => void;
  onToggleAutoScroll: () => void;
  onToggleBookmarks: () => void;
  onReload: () => void;
  searchOpen: boolean;
  tailing: boolean;
  autoScroll: boolean;
  bookmarksOpen: boolean;
  hasFile: boolean;
}

export function Header({
  onOpenFile,
  onToggleSearch,
  onToggleTailing,
  onToggleAutoScroll,
  onToggleBookmarks,
  onReload,
  searchOpen,
  tailing,
  autoScroll,
  bookmarksOpen,
  hasFile,
}: HeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2.5">
      <div className="flex items-center gap-3">
        {/* App logo and title */}
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <h1 className="text-sm font-semibold text-gray-900">LogLens</h1>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {/* Open file button */}
        <button
          onClick={onOpenFile}
          className="flex items-center gap-1.5 rounded-md bg-gradient-to-r from-indigo-500 to-violet-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:from-indigo-600 hover:to-violet-700 transition-all"
          aria-label="Open log file"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
          </svg>
          Open File
        </button>

        {hasFile && (
          <>
            {/* Search toggle */}
            <button
              onClick={onToggleSearch}
              className={`rounded-md p-1.5 transition-colors ${
                searchOpen
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
              aria-label="Toggle search"
              title="Search (Ctrl+F)"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>

            {/* Tail toggle */}
            <button
              onClick={onToggleTailing}
              className={`flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                tailing
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
              aria-label={tailing ? 'Stop tailing' : 'Start tailing'}
              title="Toggle live tail"
            >
              {tailing && (
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-[pulse-dot_1.5s_ease-in-out_infinite]" />
              )}
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0l-3.75-3.75M17.25 21l3.75-3.75" />
              </svg>
              {tailing ? 'Tailing' : 'Tail'}
            </button>

            {/* Auto-scroll toggle */}
            <button
              onClick={onToggleAutoScroll}
              className={`rounded-md p-1.5 transition-colors ${
                autoScroll
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
              aria-label={autoScroll ? 'Disable auto-scroll' : 'Enable auto-scroll'}
              title="Toggle auto-scroll"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
              </svg>
            </button>

            {/* Bookmarks toggle */}
            <button
              onClick={onToggleBookmarks}
              className={`rounded-md p-1.5 transition-colors ${
                bookmarksOpen
                  ? 'bg-amber-100 text-amber-700'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              }`}
              aria-label="Toggle bookmarks panel"
              title="Bookmarks"
            >
              <svg className="h-4 w-4" fill={bookmarksOpen ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
            </button>

            {/* Reload */}
            <button
              onClick={onReload}
              className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              aria-label="Reload file"
              title="Reload"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
              </svg>
            </button>
          </>
        )}
      </div>
    </header>
  );
}

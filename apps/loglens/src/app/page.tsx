'use client';

import { useState, useCallback, useEffect } from 'react';
import { useLogFile } from '@/hooks/useLogFile';
import { useToast } from '@/hooks/useToast';
import { Header } from '@/components/Header';
import { FileTabs } from '@/components/FileTabs';
import { SearchBar } from '@/components/SearchBar';
import { LogViewer } from '@/components/LogViewer';
import { BookmarkPanel } from '@/components/BookmarkPanel';
import { EmptyState } from '@/components/EmptyState';
import { ToastContainer } from '@/components/Toast';

export default function Home() {
  const {
    files,
    activeFileId,
    activeFile,
    search,
    autoScroll,
    setActiveFileId,
    setAutoScroll,
    openFile,
    closeFile,
    toggleTailing,
    toggleBookmark,
    updateSearch,
    navigateMatch,
    getFilteredLines,
    getBookmarkedLines,
    reloadFile,
  } = useLogFile();

  const { toasts, addToast, removeToast } = useToast();

  const [searchOpen, setSearchOpen] = useState(false);
  const [bookmarksOpen, setBookmarksOpen] = useState(false);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey;

      // Ctrl/Cmd + O: Open file
      if (isMeta && e.key === 'o') {
        e.preventDefault();
        handleOpenFile();
      }

      // Ctrl/Cmd + F: Toggle search
      if (isMeta && e.key === 'f') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }

      // Ctrl/Cmd + B: Toggle bookmarks
      if (isMeta && e.key === 'b') {
        e.preventDefault();
        setBookmarksOpen((prev) => !prev);
      }

      // Ctrl/Cmd + R: Reload file
      if (isMeta && e.key === 'r') {
        e.preventDefault();
        handleReload();
      }

      // Escape: Close search
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFile]);

  const handleOpenFile = useCallback(async () => {
    try {
      await openFile();
      addToast('File opened', 'success');
    } catch {
      addToast('Failed to open file', 'error');
    }
  }, [openFile, addToast]);

  const handleToggleTailing = useCallback(async () => {
    try {
      await toggleTailing();
      if (activeFile?.tailing) {
        addToast('Stopped tailing', 'info');
      } else {
        addToast('Started tailing', 'success');
      }
    } catch {
      addToast('Failed to toggle tailing', 'error');
    }
  }, [toggleTailing, activeFile, addToast]);

  const handleReload = useCallback(async () => {
    try {
      await reloadFile();
      addToast('File reloaded', 'success');
    } catch {
      addToast('Failed to reload file', 'error');
    }
  }, [reloadFile, addToast]);

  const handleCloseSearch = useCallback(() => {
    setSearchOpen(false);
    updateSearch('', false);
  }, [updateSearch]);

  const handleJumpToLine = useCallback((_lineId: number) => {
    // Scroll the log viewer to the target line.
    // The LogViewer uses a table-based layout, so we find the row by line id
    // and scroll it into view.
    const row = document.querySelector(`[data-line-id="${_lineId}"]`);
    if (row) {
      row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const hasFiles = files.length > 0;
  const filteredLines = getFilteredLines(activeFile);
  const bookmarkedLines = getBookmarkedLines();

  return (
    <div className="flex h-screen flex-col bg-white">
      <Header
        onOpenFile={handleOpenFile}
        onToggleSearch={() => setSearchOpen((prev) => !prev)}
        onToggleTailing={handleToggleTailing}
        onToggleAutoScroll={() => setAutoScroll(!autoScroll)}
        onToggleBookmarks={() => setBookmarksOpen((prev) => !prev)}
        onReload={handleReload}
        searchOpen={searchOpen}
        tailing={activeFile?.tailing ?? false}
        autoScroll={autoScroll}
        bookmarksOpen={bookmarksOpen}
        hasFile={hasFiles}
      />

      {hasFiles ? (
        <>
          <FileTabs
            files={files}
            activeFileId={activeFileId}
            onSelectFile={setActiveFileId}
            onCloseFile={closeFile}
          />

          {searchOpen && (
            <SearchBar
              search={search}
              onUpdateSearch={updateSearch}
              onNavigateMatch={navigateMatch}
              onClose={handleCloseSearch}
            />
          )}

          <div className="flex flex-1 overflow-hidden">
            <LogViewer
              lines={filteredLines}
              autoScroll={autoScroll}
              searchQuery={search.query}
              searchIsRegex={search.isRegex}
              onToggleBookmark={toggleBookmark}
              onScrollToLine={handleJumpToLine}
            />

            {bookmarksOpen && (
              <BookmarkPanel
                bookmarks={bookmarkedLines}
                onJumpToLine={handleJumpToLine}
                onRemoveBookmark={toggleBookmark}
                onClose={() => setBookmarksOpen(false)}
              />
            )}
          </div>

          {/* Status bar */}
          <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-1">
            <div className="flex items-center gap-3 text-[11px] text-gray-500">
              {activeFile && (
                <>
                  <span className="font-mono">{activeFile.path}</span>
                  <span className="text-gray-300">|</span>
                  <span>{activeFile.totalLines.toLocaleString()} lines</span>
                  {search.query && (
                    <>
                      <span className="text-gray-300">|</span>
                      <span>{search.matchCount.toLocaleString()} matches</span>
                    </>
                  )}
                  {bookmarkedLines.length > 0 && (
                    <>
                      <span className="text-gray-300">|</span>
                      <span>{bookmarkedLines.length} bookmarks</span>
                    </>
                  )}
                </>
              )}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-gray-500">
              {activeFile?.tailing && (
                <span className="flex items-center gap-1 text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-[pulse-dot_1.5s_ease-in-out_infinite]" />
                  Live
                </span>
              )}
              {autoScroll && (
                <span className="text-indigo-600">Auto-scroll</span>
              )}
            </div>
          </div>
        </>
      ) : (
        <EmptyState onOpenFile={handleOpenFile} />
      )}

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { LogFile, LogLine, SearchState } from '@/types/loglens';
import { parseLogLines, filterLines } from '@/lib/loglens/parser';
import {
  readLogFile,
  tailLogFile,
  stopTailing,
  openFileDialog,
} from '@/lib/loglens/tauri-bridge';

let fileCounter = 0;

function generateFileId(): string {
  return `file-${++fileCounter}-${Date.now()}`;
}

function extractFileName(path: string): string {
  const parts = path.replace(/\\/g, '/').split('/');
  return parts[parts.length - 1] || path;
}

export function useLogFile() {
  const [files, setFiles] = useState<LogFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [search, setSearch] = useState<SearchState>({
    query: '',
    isRegex: false,
    matchCount: 0,
    currentMatch: 0,
  });
  const [autoScroll, setAutoScroll] = useState(true);

  // Track unlisten functions for active tailers keyed by file id
  const tailersRef = useRef<Map<string, () => void>>(new Map());

  // Cleanup all tailers on unmount
  useEffect(() => {
    return () => {
      for (const unlisten of tailersRef.current.values()) {
        unlisten();
      }
      tailersRef.current.clear();
    };
  }, []);

  const activeFile = files.find((f) => f.id === activeFileId) ?? null;

  // -----------------------------------------------------------------------
  // Computed: filtered lines based on search
  // -----------------------------------------------------------------------
  const getFilteredLines = useCallback(
    (file: LogFile | null): LogLine[] => {
      if (!file) return [];
      if (!search.query.trim()) return file.lines;
      const { filtered } = filterLines(file.lines, search.query, search.isRegex);
      return filtered;
    },
    [search.query, search.isRegex]
  );

  // -----------------------------------------------------------------------
  // Open a file via Tauri dialog
  // -----------------------------------------------------------------------
  const openFile = useCallback(async (): Promise<void> => {
    const path = await openFileDialog();
    if (!path) return;

    // Check if already open
    const existing = files.find((f) => f.path === path);
    if (existing) {
      setActiveFileId(existing.id);
      return;
    }

    const rawLines = await readLogFile(path);
    const parsed = parseLogLines(rawLines);
    const id = generateFileId();

    const newFile: LogFile = {
      id,
      name: extractFileName(path),
      path,
      lines: parsed,
      totalLines: parsed.length,
      tailing: false,
    };

    setFiles((prev) => [...prev, newFile]);
    setActiveFileId(id);
  }, [files]);

  // -----------------------------------------------------------------------
  // Close a file tab
  // -----------------------------------------------------------------------
  const closeFile = useCallback(
    (fileId: string) => {
      // Stop tailing if active
      const file = files.find((f) => f.id === fileId);
      if (file?.tailing) {
        stopTailing(file.path).catch(() => {});
      }
      const unlisten = tailersRef.current.get(fileId);
      if (unlisten) {
        unlisten();
        tailersRef.current.delete(fileId);
      }

      setFiles((prev) => {
        const next = prev.filter((f) => f.id !== fileId);
        // If we closed the active tab, select another
        if (activeFileId === fileId) {
          const idx = prev.findIndex((f) => f.id === fileId);
          const newActive =
            next.length === 0
              ? null
              : next[Math.min(idx, next.length - 1)]?.id ?? null;
          setActiveFileId(newActive);
        }
        return next;
      });
    },
    [activeFileId, files]
  );

  // -----------------------------------------------------------------------
  // Toggle tailing on/off for the active file
  // -----------------------------------------------------------------------
  const toggleTailing = useCallback(async () => {
    if (!activeFile) return;

    if (activeFile.tailing) {
      // Stop tailing
      await stopTailing(activeFile.path).catch(() => {});
      const unlisten = tailersRef.current.get(activeFile.id);
      if (unlisten) {
        unlisten();
        tailersRef.current.delete(activeFile.id);
      }
      setFiles((prev) =>
        prev.map((f) => (f.id === activeFile.id ? { ...f, tailing: false } : f))
      );
    } else {
      // Start tailing
      const unlisten = await tailLogFile(activeFile.path, (newRawLines) => {
        setFiles((prev) =>
          prev.map((f) => {
            if (f.id !== activeFile.id) return f;
            const newParsed = parseLogLines(newRawLines, f.lines.length);
            const allLines = [...f.lines, ...newParsed];
            return {
              ...f,
              lines: allLines,
              totalLines: allLines.length,
            };
          })
        );
      });

      tailersRef.current.set(activeFile.id, unlisten);
      setFiles((prev) =>
        prev.map((f) => (f.id === activeFile.id ? { ...f, tailing: true } : f))
      );
    }
  }, [activeFile]);

  // -----------------------------------------------------------------------
  // Toggle bookmark on a line
  // -----------------------------------------------------------------------
  const toggleBookmark = useCallback(
    (lineId: number) => {
      if (!activeFileId) return;
      setFiles((prev) =>
        prev.map((f) => {
          if (f.id !== activeFileId) return f;
          return {
            ...f,
            lines: f.lines.map((line) =>
              line.id === lineId ? { ...line, bookmarked: !line.bookmarked } : line
            ),
          };
        })
      );
    },
    [activeFileId]
  );

  // -----------------------------------------------------------------------
  // Update search state
  // -----------------------------------------------------------------------
  const updateSearch = useCallback(
    (query: string, isRegex: boolean) => {
      if (!activeFile) {
        setSearch({ query, isRegex, matchCount: 0, currentMatch: 0 });
        return;
      }
      const { matchCount } = filterLines(activeFile.lines, query, isRegex);
      setSearch({
        query,
        isRegex,
        matchCount,
        currentMatch: matchCount > 0 ? 1 : 0,
      });
    },
    [activeFile]
  );

  const navigateMatch = useCallback(
    (direction: 'next' | 'prev') => {
      setSearch((prev) => {
        if (prev.matchCount === 0) return prev;
        let next = prev.currentMatch;
        if (direction === 'next') {
          next = next >= prev.matchCount ? 1 : next + 1;
        } else {
          next = next <= 1 ? prev.matchCount : next - 1;
        }
        return { ...prev, currentMatch: next };
      });
    },
    []
  );

  // -----------------------------------------------------------------------
  // Get bookmarked lines for the active file
  // -----------------------------------------------------------------------
  const getBookmarkedLines = useCallback((): LogLine[] => {
    if (!activeFile) return [];
    return activeFile.lines.filter((line) => line.bookmarked);
  }, [activeFile]);

  // -----------------------------------------------------------------------
  // Reload the active file from disk
  // -----------------------------------------------------------------------
  const reloadFile = useCallback(async () => {
    if (!activeFile) return;

    const rawLines = await readLogFile(activeFile.path);
    const parsed = parseLogLines(rawLines);

    // Preserve bookmarks
    const bookmarkedTexts = new Set(
      activeFile.lines.filter((l) => l.bookmarked).map((l) => l.text)
    );
    const withBookmarks = parsed.map((line) => ({
      ...line,
      bookmarked: bookmarkedTexts.has(line.text),
    }));

    setFiles((prev) =>
      prev.map((f) =>
        f.id === activeFile.id
          ? { ...f, lines: withBookmarks, totalLines: withBookmarks.length }
          : f
      )
    );
  }, [activeFile]);

  return {
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
  };
}

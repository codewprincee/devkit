'use client';

import { useState, useCallback } from 'react';
import type { EnvFile } from '@/types';
import { parseEnvContent } from '@/lib/parser';
import {
  isTauri,
  tauriScanEnvFiles,
  tauriReadEnvFile,
  tauriWriteEnvFile,
} from '@/lib/tauri-bridge';

function isEnvFile(name: string): boolean {
  return name === '.env' || name.startsWith('.env.');
}

export function useFileSystem() {
  const [files, setFiles] = useState<EnvFile[]>([]);
  const [projectName, setProjectName] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [isSupported] = useState(() => {
    if (typeof window === 'undefined') return false;
    return isTauri() || 'showDirectoryPicker' in window;
  });

  const scanDirectory = useCallback(
    async (
      dirHandle: FileSystemDirectoryHandle,
      basePath: string = ''
    ): Promise<EnvFile[]> => {
      const found: EnvFile[] = [];

      for await (const entry of (dirHandle as any).values()) {
        const entryPath = basePath ? `${basePath}/${entry.name}` : entry.name;

        if (entry.kind === 'file' && isEnvFile(entry.name)) {
          try {
            const fileHandle = entry as FileSystemFileHandle;
            const file = await fileHandle.getFile();
            const raw = await file.text();
            const variables = parseEnvContent(raw);
            found.push({
              name: entry.name,
              path: entryPath,
              variables,
              raw,
              handle: fileHandle,
            });
          } catch {
            // Skip files we can't read
          }
        }

        if (entry.kind === 'directory') {
          const skip = ['node_modules', '.git', '.next', 'dist', 'build', '.cache'];
          if (skip.includes(entry.name)) continue;

          const subDir = entry as FileSystemDirectoryHandle;
          const subFiles = await scanDirectory(subDir, entryPath);
          found.push(...subFiles);
        }
      }

      return found;
    },
    []
  );

  const openProjectTauri = useCallback(async () => {
    const { open } = await import('@tauri-apps/plugin-dialog');
    const selected = await open({ directory: true, title: 'Select project folder' });
    if (!selected) return;

    const dirPath = selected as string;
    const dirName = dirPath.split('/').pop() || dirPath;
    setProjectName(dirName);
    setLoading(true);

    try {
      const scanned = await tauriScanEnvFiles(dirPath);
      if (!scanned) return;

      const envFiles: EnvFile[] = [];
      for (const info of scanned) {
        const variables = await tauriReadEnvFile(info.path);
        if (!variables) continue;

        const raw = variables
          .map((v) => v.raw_line)
          .join('\n');

        envFiles.push({
          name: info.name,
          path: info.path,
          variables: parseEnvContent(raw),
          raw,
        });
      }

      envFiles.sort((a, b) => {
        if (a.name === '.env') return -1;
        if (b.name === '.env') return 1;
        return a.name.localeCompare(b.name);
      });

      setFiles(envFiles);
    } finally {
      setLoading(false);
    }
  }, []);

  const openProject = useCallback(async () => {
    if (isTauri()) {
      return openProjectTauri();
    }

    if (!('showDirectoryPicker' in window)) return;

    try {
      setLoading(true);
      const dirHandle = await (window as any).showDirectoryPicker({
        mode: 'readwrite',
      });
      setProjectName(dirHandle.name);
      const envFiles = await scanDirectory(dirHandle);

      envFiles.sort((a, b) => {
        if (a.name === '.env') return -1;
        if (b.name === '.env') return 1;
        return a.name.localeCompare(b.name);
      });

      setFiles(envFiles);
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      throw err;
    } finally {
      setLoading(false);
    }
  }, [scanDirectory, openProjectTauri]);

  const loadDroppedFiles = useCallback(async (droppedFiles: File[]) => {
    const envFiles: EnvFile[] = [];

    for (const file of droppedFiles) {
      if (!isEnvFile(file.name)) continue;
      const raw = await file.text();
      const variables = parseEnvContent(raw);
      envFiles.push({
        name: file.name,
        path: file.name,
        variables,
        raw,
      });
    }

    envFiles.sort((a, b) => {
      if (a.name === '.env') return -1;
      if (b.name === '.env') return 1;
      return a.name.localeCompare(b.name);
    });

    setFiles(envFiles);
    setProjectName('Dropped files');
  }, []);

  const updateFile = useCallback(
    (path: string, updater: (file: EnvFile) => EnvFile) => {
      setFiles((prev) =>
        prev.map((f) => (f.path === path ? updater(f) : f))
      );
    },
    []
  );

  const saveFile = useCallback(
    async (path: string) => {
      const file = files.find((f) => f.path === path);
      if (!file) return;

      if (isTauri()) {
        await tauriWriteEnvFile(path, file.variables.map((v) => ({
          key: v.key,
          value: v.value,
          line: v.line,
          is_comment: v.raw.startsWith('#'),
          is_empty: v.key === '' && v.value === '' && !v.raw.startsWith('#'),
          has_quotes: v.raw.includes(`"${v.value}"`),
          raw_line: v.raw,
        })));
        return;
      }

      if (file.handle) {
        const writable = await file.handle.createWritable();
        await writable.write(file.raw);
        await writable.close();
        return;
      }

      // Fallback: trigger browser download
      const blob = new Blob([file.raw], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.click();
      URL.revokeObjectURL(url);
    },
    [files]
  );

  return {
    files,
    projectName,
    loading,
    isSupported,
    openProject,
    loadDroppedFiles,
    updateFile,
    saveFile,
    setFiles,
  };
}

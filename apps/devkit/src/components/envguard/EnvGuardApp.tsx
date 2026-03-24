'use client';

import { useState, useCallback, useRef } from 'react';
import type { TabId } from '@/types/envguard';
import { useFileSystem } from '@/hooks/envguard/useFileSystem';
import { useToast } from '@/hooks/useToast';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { TabBar } from './TabBar';
import { VariableTable } from './VariableTable';
import { DiffView } from './DiffView';
import { Validator } from './Validator';
import { Generator } from './Generator';
import { Encryptor } from './Encryptor';
import { EmptyState } from './EmptyState';
import { ToastContainer } from './Toast';

export default function EnvGuardApp() {
  const {
    files,
    projectName,
    loading,
    isSupported,
    openProject,
    loadDroppedFiles,
    updateFile,
    saveFile,
  } = useFileSystem();

  const { toasts, addToast, removeToast } = useToast();

  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('viewer');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const prevFilesLen = useRef(0);
  if (files.length > 0 && files.length !== prevFilesLen.current) {
    prevFilesLen.current = files.length;
    if (!selectedFile || !files.find((f) => f.path === selectedFile)) {
      setSelectedFile(files[0].path);
    }
  }

  const handleOpenProject = useCallback(async () => {
    try {
      await openProject();
    } catch {
      addToast('Failed to open project', 'error');
    }
  }, [openProject, addToast]);

  const handleDropFiles = useCallback(
    async (droppedFiles: File[]) => {
      try {
        await loadDroppedFiles(droppedFiles);
        addToast('Files loaded', 'success');
      } catch {
        addToast('Failed to load files', 'error');
      }
    },
    [loadDroppedFiles, addToast]
  );

  const handleUpdateFile = useCallback(
    (updater: (file: any) => any) => {
      if (selectedFile) {
        updateFile(selectedFile, updater);
      }
    },
    [selectedFile, updateFile]
  );

  const handleSaveFile = useCallback(async () => {
    if (!selectedFile) return;
    try {
      await saveFile(selectedFile);
      addToast('File saved', 'success');
    } catch {
      addToast('Failed to save file', 'error');
    }
  }, [selectedFile, saveFile, addToast]);

  const currentFile = files.find((f) => f.path === selectedFile);
  const hasFiles = files.length > 0;

  return (
    <div className="flex h-full flex-col bg-white">
      <Header
        projectName={projectName}
        onOpenProject={handleOpenProject}
        loading={loading}
        isSupported={isSupported}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          files={files}
          selectedFile={selectedFile}
          onSelectFile={setSelectedFile}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex flex-1 flex-col overflow-hidden">
          {hasFiles ? (
            <>
              <TabBar activeTab={activeTab} onChangeTab={setActiveTab} />
              <div className="flex-1 overflow-hidden">
                {activeTab === 'viewer' && currentFile && (
                  <VariableTable
                    file={currentFile}
                    onUpdateFile={handleUpdateFile}
                    onToast={addToast}
                    onSave={handleSaveFile}
                  />
                )}
                {activeTab === 'viewer' && !currentFile && (
                  <div className="flex items-center justify-center h-full text-sm text-gray-400">
                    Select a file from the sidebar
                  </div>
                )}
                {activeTab === 'diff' && <DiffView files={files} />}
                {activeTab === 'validate' && (
                  <Validator files={files} selectedFile={selectedFile} />
                )}
                {activeTab === 'generate' && (
                  <Generator files={files} selectedFile={selectedFile} onToast={addToast} />
                )}
                {activeTab === 'encrypt' && (
                  <Encryptor files={files} selectedFile={selectedFile} onToast={addToast} />
                )}
              </div>
            </>
          ) : (
            <EmptyState
              isSupported={isSupported}
              onOpenProject={handleOpenProject}
              onDropFiles={handleDropFiles}
            />
          )}
        </main>
      </div>

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

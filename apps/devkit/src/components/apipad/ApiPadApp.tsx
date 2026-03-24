'use client';

import { useState, useCallback } from 'react';
import type { ApiRequest, ApiCollection, HistoryEntry } from '@/types/apipad';
import { useToast } from '@/hooks/useToast';
import { useCollections } from '@/hooks/apipad/useCollections';
import { useEnvironments } from '@/hooks/apipad/useEnvironments';
import { useRequestHistory } from '@/hooks/apipad/useRequestHistory';
import { useRequestExecutor } from '@/hooks/apipad/useRequestExecutor';
import { createEmptyRequest } from '@/lib/apipad/utils';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { RequestPanel } from './RequestPanel';
import { ResponsePanel } from './ResponsePanel';
import { EmptyState } from './EmptyState';
import { ImportModal } from './ImportModal';
import { ToastContainer } from './Toast';

export default function ApiPadApp() {
  const { toasts, addToast, removeToast } = useToast();
  const {
    collections,
    addCollection,
    deleteCollection,
    addRequestToCollection,
    addFolderToCollection,
    updateRequest,
    importCollection,
  } = useCollections();
  const {
    environments,
    addEnvironment,
    deleteEnvironment,
    setActiveEnvironment,
    updateEnvironmentVariables,
    activeVariables,
  } = useEnvironments();
  const { history, addEntry, clearHistory } = useRequestHistory();

  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  const [activeRequest, setActiveRequest] = useState<ApiRequest | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  const { response, loading, sendRequest } = useRequestExecutor(activeVariables, addEntry);

  const handleSelectRequest = useCallback(
    (collectionId: string, request: ApiRequest) => {
      setActiveCollectionId(collectionId);
      setActiveRequest({ ...request });
    },
    []
  );

  const handleUpdateRequest = useCallback(
    (request: ApiRequest) => {
      setActiveRequest(request);
      if (activeCollectionId) {
        updateRequest(activeCollectionId, request);
      }
    },
    [activeCollectionId, updateRequest]
  );

  const handleSendRequest = useCallback(() => {
    if (!activeRequest) return;
    if (!activeRequest.url.trim()) {
      addToast('Enter a URL', 'error');
      return;
    }
    sendRequest(activeRequest);
  }, [activeRequest, sendRequest, addToast]);

  const handleAddCollection = useCallback(() => {
    const col = addCollection();
    addToast(`Created "${col.name}"`, 'success');
  }, [addCollection, addToast]);

  const handleAddRequest = useCallback(
    (collectionId: string) => {
      const req = addRequestToCollection(collectionId);
      setActiveCollectionId(collectionId);
      setActiveRequest({ ...req });
    },
    [addRequestToCollection]
  );

  const handleReplayHistory = useCallback(
    (entry: HistoryEntry) => {
      setActiveRequest({ ...entry.request, id: entry.request.id });
      setActiveCollectionId(null);
    },
    []
  );

  const handleImport = useCallback(
    (collection: ApiCollection) => {
      importCollection(collection);
    },
    [importCollection]
  );

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const hasContent = activeRequest !== null;

  return (
    <div className="flex h-full flex-col bg-white">
      <Header
        environments={environments}
        onSetActiveEnvironment={setActiveEnvironment}
        onImport={() => setImportOpen(true)}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black/20 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          collections={collections}
          environments={environments}
          history={history}
          activeRequestId={activeRequest?.id || null}
          onSelectRequest={handleSelectRequest}
          onAddRequest={handleAddRequest}
          onAddFolder={addFolderToCollection}
          onAddCollection={handleAddCollection}
          onDeleteCollection={deleteCollection}
          onReplayHistory={handleReplayHistory}
          onClearHistory={clearHistory}
          onAddEnvironment={addEnvironment}
          onDeleteEnvironment={deleteEnvironment}
          onSetActiveEnvironment={setActiveEnvironment}
          onUpdateEnvironmentVariables={updateEnvironmentVariables}
        />

        <main className="flex flex-1 flex-col overflow-hidden">
          {hasContent ? (
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-hidden min-h-0">
                <RequestPanel
                  request={activeRequest}
                  loading={loading}
                  onUpdate={handleUpdateRequest}
                  onSend={handleSendRequest}
                />
              </div>
              <div className="flex-1 overflow-hidden min-h-0 border-t border-gray-200">
                <ResponsePanel response={response} loading={loading} />
              </div>
            </div>
          ) : (
            <EmptyState
              onCreateCollection={handleAddCollection}
              onImport={() => setImportOpen(true)}
            />
          )}
        </main>
      </div>

      <ImportModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onImport={handleImport}
        onToast={addToast}
      />

      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

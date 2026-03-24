'use client';

import { useState } from 'react';
import type { ApiRequest, RequestTab, HttpMethod, KeyValuePair, ApiAuth } from '@/types';
import { UrlBar } from './UrlBar';
import { RequestTabs } from './RequestTabs';
import { ParamsEditor } from './ParamsEditor';
import { HeadersEditor } from './HeadersEditor';
import { BodyEditor } from './BodyEditor';
import { AuthEditor } from './AuthEditor';

interface RequestPanelProps {
  request: ApiRequest;
  loading: boolean;
  onUpdate: (request: ApiRequest) => void;
  onSend: () => void;
}

export function RequestPanel({ request, loading, onUpdate, onSend }: RequestPanelProps) {
  const [activeTab, setActiveTab] = useState<RequestTab>('params');

  const updateField = <K extends keyof ApiRequest>(field: K, value: ApiRequest[K]) => {
    onUpdate({ ...request, [field]: value });
  };

  return (
    <div className="flex flex-col h-full border-b border-gray-200">
      <UrlBar
        method={request.method}
        url={request.url}
        loading={loading}
        onMethodChange={(m: HttpMethod) => updateField('method', m)}
        onUrlChange={(u: string) => updateField('url', u)}
        onSend={onSend}
      />

      <RequestTabs activeTab={activeTab} onChangeTab={setActiveTab} />

      <div className="flex-1 overflow-auto">
        {activeTab === 'params' && (
          <ParamsEditor
            params={request.params}
            onChange={(p: KeyValuePair[]) => updateField('params', p)}
          />
        )}
        {activeTab === 'headers' && (
          <HeadersEditor
            headers={request.headers}
            onChange={(h: KeyValuePair[]) => updateField('headers', h)}
          />
        )}
        {activeTab === 'body' && (
          <BodyEditor
            body={request.body}
            bodyType={request.bodyType}
            onBodyChange={(b: string) => updateField('body', b)}
            onBodyTypeChange={(t: 'json' | 'form' | 'raw' | 'none') => updateField('bodyType', t)}
          />
        )}
        {activeTab === 'auth' && (
          <AuthEditor
            auth={request.auth}
            onChange={(a: ApiAuth) => updateField('auth', a)}
          />
        )}
      </div>
    </div>
  );
}

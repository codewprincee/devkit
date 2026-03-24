'use client';

import { useState } from 'react';
import type { ApiResponse, ResponseTab } from '@/types';
import { ResponseMeta } from './ResponseMeta';
import { ResponseBody } from './ResponseBody';
import { ResponseHeaders } from './ResponseHeaders';

interface ResponsePanelProps {
  response: ApiResponse | null;
  loading: boolean;
}

export function ResponsePanel({ response, loading }: ResponsePanelProps) {
  const [activeTab, setActiveTab] = useState<ResponseTab>('body');

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <svg className="h-5 w-5 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Sending request...
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
          <p className="mt-2 text-xs text-gray-400">Send a request to see the response</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ResponseMeta response={response} />

      <div className="border-b border-gray-200 bg-gray-50/50">
        <nav className="flex gap-0 px-4 -mb-px">
          {(['body', 'headers'] as ResponseTab[]).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  inline-flex items-center border-b-2 px-3 py-2 text-xs font-medium
                  transition-colors whitespace-nowrap capitalize
                  ${isActive
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }
                `}
              >
                {tab}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'body' && <ResponseBody body={response.body} />}
        {activeTab === 'headers' && <ResponseHeaders headers={response.headers} />}
      </div>
    </div>
  );
}

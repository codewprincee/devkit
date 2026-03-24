'use client';

import { useMemo } from 'react';
import { highlightJson } from '@/lib/json-highlight';

interface ResponseBodyProps {
  body: string;
}

export function ResponseBody({ body }: ResponseBodyProps) {
  const { isJson, highlighted } = useMemo(() => {
    try {
      JSON.parse(body);
      return { isJson: true, highlighted: highlightJson(body) };
    } catch {
      return { isJson: false, highlighted: '' };
    }
  }, [body]);

  if (!body) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-gray-400 p-4">
        No response body
      </div>
    );
  }

  if (isJson) {
    return (
      <div className="p-4 overflow-auto h-full bg-gray-900 rounded-b-lg">
        <pre
          className="text-xs font-mono leading-relaxed whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
      </div>
    );
  }

  return (
    <div className="p-4 overflow-auto h-full">
      <pre className="text-xs font-mono text-gray-700 leading-relaxed whitespace-pre-wrap">
        {body}
      </pre>
    </div>
  );
}

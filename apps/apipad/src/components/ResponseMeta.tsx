'use client';

import type { ApiResponse } from '@/types';
import { getStatusColor, formatTime, formatBytes } from '@/lib/utils';

interface ResponseMetaProps {
  response: ApiResponse;
}

export function ResponseMeta({ response }: ResponseMetaProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-200 bg-gray-50/50">
      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-bold ${getStatusColor(response.status)}`}>
        {response.status || 'ERR'} {response.statusText}
      </span>
      <span className="text-xs text-gray-500">{formatTime(response.time)}</span>
      <span className="text-xs text-gray-500">{formatBytes(response.size)}</span>
    </div>
  );
}

import type { ApiRequest, ApiResponse, KeyValuePair } from '@/types/apipad';
import { buildUrl } from './utils';

export interface RequestExecutor {
  execute(request: ApiRequest): Promise<ApiResponse>;
}

export class TauriExecutor implements RequestExecutor {
  async execute(request: ApiRequest): Promise<ApiResponse> {
    const { invoke } = await import('@tauri-apps/api/core');

    const url = buildUrl(request.url, request.params.filter((p) => p.enabled));

    const headers: Record<string, string> = {};
    for (const h of request.headers) {
      if (h.enabled && h.key) {
        headers[h.key] = h.value;
      }
    }

    if (request.auth.type === 'bearer' && request.auth.token) {
      headers['Authorization'] = `Bearer ${request.auth.token}`;
    } else if (request.auth.type === 'basic' && request.auth.username) {
      const encoded = btoa(`${request.auth.username}:${request.auth.password || ''}`);
      headers['Authorization'] = `Basic ${encoded}`;
    } else if (request.auth.type === 'apikey' && request.auth.key && request.auth.value) {
      if (request.auth.addTo !== 'query') {
        headers[request.auth.key] = request.auth.value;
      }
    }

    const body = (request.method !== 'GET' && request.method !== 'HEAD' && request.bodyType !== 'none' && request.body)
      ? request.body
      : undefined;

    try {
      const res = await invoke<{
        status: number;
        status_text: string;
        headers: Record<string, string>;
        body: string;
        time_ms: number;
        size: number;
      }>('send_request', {
        args: { method: request.method, url, headers, body },
      });

      return {
        status: res.status,
        statusText: res.status_text,
        headers: res.headers,
        body: res.body,
        time: res.time_ms,
        size: res.size,
      };
    } catch (err: any) {
      return {
        status: 0,
        statusText: err.toString?.() || 'Request failed',
        headers: {},
        body: `Error: ${err}`,
        time: 0,
        size: 0,
      };
    }
  }
}

export class FetchExecutor implements RequestExecutor {
  async execute(request: ApiRequest): Promise<ApiResponse> {
    const url = buildUrl(request.url, request.params.filter((p) => p.enabled));

    const headers: Record<string, string> = {};
    for (const h of request.headers) {
      if (h.enabled && h.key) {
        headers[h.key] = h.value;
      }
    }

    // Apply auth
    if (request.auth.type === 'bearer' && request.auth.token) {
      headers['Authorization'] = `Bearer ${request.auth.token}`;
    } else if (request.auth.type === 'basic' && request.auth.username) {
      const encoded = btoa(`${request.auth.username}:${request.auth.password || ''}`);
      headers['Authorization'] = `Basic ${encoded}`;
    } else if (request.auth.type === 'apikey' && request.auth.key && request.auth.value) {
      if (request.auth.addTo === 'query') {
        // Will be handled in URL building
      } else {
        headers[request.auth.key] = request.auth.value;
      }
    }

    const init: RequestInit = {
      method: request.method,
      headers,
    };

    if (request.method !== 'GET' && request.method !== 'HEAD' && request.bodyType !== 'none' && request.body) {
      init.body = request.body;
    }

    const start = performance.now();

    try {
      const res = await fetch(url, init);
      const time = performance.now() - start;

      const body = await res.text();
      const size = new TextEncoder().encode(body).length;

      const responseHeaders: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      return {
        status: res.status,
        statusText: res.statusText,
        headers: responseHeaders,
        body,
        time,
        size,
      };
    } catch (err: any) {
      const time = performance.now() - start;
      return {
        status: 0,
        statusText: err.message || 'Network Error',
        headers: {},
        body: `Error: ${err.message || 'Failed to fetch'}.\n\nThis may be caused by CORS restrictions. In the desktop app, requests bypass CORS.`,
        time,
        size: 0,
      };
    }
  }
}

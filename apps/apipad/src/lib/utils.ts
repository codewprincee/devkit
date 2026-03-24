import type { ApiRequest, ApiCollection, ApiFolder, HttpMethod, KeyValuePair } from '@/types';

export function generateId(): string {
  return crypto.randomUUID();
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatTime(ms: number): string {
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

export function getStatusColor(status: number): string {
  if (status >= 200 && status < 300) return 'text-emerald-600 bg-emerald-50';
  if (status >= 300 && status < 400) return 'text-blue-600 bg-blue-50';
  if (status >= 400 && status < 500) return 'text-amber-600 bg-amber-50';
  if (status >= 500) return 'text-red-600 bg-red-50';
  return 'text-gray-600 bg-gray-50';
}

export function getMethodColor(method: HttpMethod): string {
  const colors: Record<HttpMethod, string> = {
    GET: 'text-emerald-600',
    POST: 'text-blue-600',
    PUT: 'text-amber-600',
    PATCH: 'text-orange-600',
    DELETE: 'text-red-600',
    HEAD: 'text-violet-600',
    OPTIONS: 'text-gray-600',
  };
  return colors[method];
}

export function createEmptyRequest(name: string = 'New Request'): ApiRequest {
  return {
    id: generateId(),
    name,
    method: 'GET',
    url: '',
    headers: [{ key: 'Content-Type', value: 'application/json', enabled: true }],
    params: [],
    body: '',
    bodyType: 'none',
    auth: { type: 'none' },
  };
}

export function createEmptyCollection(name: string = 'New Collection'): ApiCollection {
  return {
    id: generateId(),
    name,
    folders: [],
    requests: [],
  };
}

export function createEmptyFolder(name: string = 'New Folder'): ApiFolder {
  return {
    id: generateId(),
    name,
    requests: [],
    expanded: true,
  };
}

export function parseQueryParams(url: string): KeyValuePair[] {
  try {
    const urlObj = new URL(url);
    return Array.from(urlObj.searchParams.entries()).map(([key, value]) => ({
      key,
      value,
      enabled: true,
    }));
  } catch {
    return [];
  }
}

export function buildUrl(baseUrl: string, params: KeyValuePair[]): string {
  try {
    const url = new URL(baseUrl);
    url.search = '';
    const enabled = params.filter((p) => p.enabled && p.key);
    for (const p of enabled) {
      url.searchParams.append(p.key, p.value);
    }
    return url.toString();
  } catch {
    if (params.length === 0) return baseUrl;
    const enabled = params.filter((p) => p.enabled && p.key);
    if (enabled.length === 0) return baseUrl;
    const qs = enabled.map((p) => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value)}`).join('&');
    return `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${qs}`;
  }
}

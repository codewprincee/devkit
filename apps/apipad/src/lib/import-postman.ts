import type { ApiCollection, ApiRequest, ApiFolder, KeyValuePair } from '@/types';
import { generateId } from './utils';

interface PostmanItem {
  name: string;
  item?: PostmanItem[];
  request?: {
    method: string;
    header?: Array<{ key: string; value: string; disabled?: boolean }>;
    url?: {
      raw?: string;
      host?: string[];
      path?: string[];
      query?: Array<{ key: string; value: string; disabled?: boolean }>;
    } | string;
    body?: {
      mode?: string;
      raw?: string;
    };
    auth?: {
      type: string;
      bearer?: Array<{ key: string; value: string }>;
      basic?: Array<{ key: string; value: string }>;
    };
  };
}

interface PostmanCollection {
  info: { name: string };
  item: PostmanItem[];
}

function parseUrl(url: PostmanItem['request'] extends undefined ? never : NonNullable<NonNullable<PostmanItem['request']>['url']>): string {
  if (typeof url === 'string') return url;
  return url?.raw || '';
}

function convertItem(item: PostmanItem): ApiRequest {
  const req = item.request;
  const url = req?.url ? parseUrl(req.url as any) : '';

  const headers: KeyValuePair[] = (req?.header || []).map((h) => ({
    key: h.key,
    value: h.value,
    enabled: !h.disabled,
  }));

  const params: KeyValuePair[] = [];
  if (req?.url && typeof req.url !== 'string' && req.url.query) {
    for (const q of req.url.query) {
      params.push({ key: q.key, value: q.value, enabled: !q.disabled });
    }
  }

  return {
    id: generateId(),
    name: item.name,
    method: (req?.method || 'GET').toUpperCase() as ApiRequest['method'],
    url,
    headers,
    params,
    body: req?.body?.raw || '',
    bodyType: req?.body?.mode === 'raw' ? 'json' : 'none',
    auth: { type: 'none' },
  };
}

function convertFolder(item: PostmanItem): ApiFolder {
  return {
    id: generateId(),
    name: item.name,
    requests: (item.item || []).filter((i) => i.request).map(convertItem),
    expanded: true,
  };
}

export function importPostmanCollection(json: string): ApiCollection {
  const data: PostmanCollection = JSON.parse(json);

  const folders: ApiFolder[] = [];
  const requests: ApiRequest[] = [];

  for (const item of data.item) {
    if (item.item && !item.request) {
      folders.push(convertFolder(item));
    } else if (item.request) {
      requests.push(convertItem(item));
    }
  }

  return {
    id: generateId(),
    name: data.info.name,
    folders,
    requests,
  };
}

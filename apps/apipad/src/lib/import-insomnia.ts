import type { ApiCollection, ApiRequest, ApiFolder, KeyValuePair } from '@/types';
import { generateId } from './utils';

interface InsomniaResource {
  _type: string;
  _id: string;
  parentId: string;
  name: string;
  method?: string;
  url?: string;
  body?: { mimeType?: string; text?: string };
  headers?: Array<{ name: string; value: string; disabled?: boolean }>;
  parameters?: Array<{ name: string; value: string; disabled?: boolean }>;
  authentication?: { type?: string; token?: string; username?: string; password?: string };
}

interface InsomniaExport {
  resources: InsomniaResource[];
}

export function importInsomniaCollection(json: string): ApiCollection {
  const data: InsomniaExport = JSON.parse(json);
  const resources = data.resources;

  const workspace = resources.find((r) => r._type === 'workspace');
  const collectionName = workspace?.name || 'Imported Collection';

  const folders: ApiFolder[] = [];
  const requests: ApiRequest[] = [];

  const folderResources = resources.filter((r) => r._type === 'request_group');
  const requestResources = resources.filter((r) => r._type === 'request');

  for (const fr of folderResources) {
    const folderRequests = requestResources
      .filter((r) => r.parentId === fr._id)
      .map(convertRequest);

    folders.push({
      id: generateId(),
      name: fr.name,
      requests: folderRequests,
      expanded: true,
    });
  }

  // Top-level requests (parented to workspace)
  const topLevelRequests = requestResources
    .filter((r) => r.parentId === workspace?._id)
    .map(convertRequest);

  requests.push(...topLevelRequests);

  return {
    id: generateId(),
    name: collectionName,
    folders,
    requests,
  };
}

function convertRequest(r: InsomniaResource): ApiRequest {
  const headers: KeyValuePair[] = (r.headers || []).map((h) => ({
    key: h.name,
    value: h.value,
    enabled: !h.disabled,
  }));

  const params: KeyValuePair[] = (r.parameters || []).map((p) => ({
    key: p.name,
    value: p.value,
    enabled: !p.disabled,
  }));

  return {
    id: generateId(),
    name: r.name,
    method: (r.method || 'GET').toUpperCase() as ApiRequest['method'],
    url: r.url || '',
    headers,
    params,
    body: r.body?.text || '',
    bodyType: r.body?.mimeType?.includes('json') ? 'json' : r.body?.text ? 'raw' : 'none',
    auth: { type: 'none' },
  };
}

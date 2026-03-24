export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

export interface KeyValuePair {
  key: string;
  value: string;
  enabled: boolean;
}

export interface ApiAuth {
  type: 'none' | 'bearer' | 'basic' | 'apikey';
  token?: string;
  username?: string;
  password?: string;
  key?: string;
  value?: string;
  addTo?: 'header' | 'query';
}

export interface ApiRequest {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  headers: KeyValuePair[];
  params: KeyValuePair[];
  body: string;
  bodyType: 'json' | 'form' | 'raw' | 'none';
  auth: ApiAuth;
}

export interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  time: number;
  size: number;
}

export interface ApiFolder {
  id: string;
  name: string;
  requests: ApiRequest[];
  expanded?: boolean;
}

export interface ApiCollection {
  id: string;
  name: string;
  folders: ApiFolder[];
  requests: ApiRequest[];
}

export interface ApiEnvironment {
  id: string;
  name: string;
  variables: KeyValuePair[];
  isActive: boolean;
}

export interface HistoryEntry {
  id: string;
  request: ApiRequest;
  response: ApiResponse;
  timestamp: number;
}

export type SidebarTab = 'collections' | 'history' | 'environments';
export type RequestTab = 'params' | 'headers' | 'body' | 'auth';
export type ResponseTab = 'body' | 'headers';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
}

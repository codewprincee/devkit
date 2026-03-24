export interface LogLine {
  id: number;
  text: string;
  level: LogLevel;
  timestamp?: string;
  isJson: boolean;
  jsonData?: unknown;
  bookmarked: boolean;
}

export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'unknown';

export interface LogFile {
  id: string;
  name: string;
  path: string;
  lines: LogLine[];
  totalLines: number;
  tailing: boolean;
}

export interface SearchState {
  query: string;
  isRegex: boolean;
  matchCount: number;
  currentMatch: number;
}

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
}

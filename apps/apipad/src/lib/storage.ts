import type { ApiCollection, ApiEnvironment, HistoryEntry } from '@/types';

const PREFIX = 'apipad:';
const HISTORY_LIMIT = 100;

export interface StorageAdapter {
  getCollections(): ApiCollection[];
  saveCollections(collections: ApiCollection[]): void;
  getEnvironments(): ApiEnvironment[];
  saveEnvironments(environments: ApiEnvironment[]): void;
  getHistory(): HistoryEntry[];
  addHistory(entry: HistoryEntry): void;
  clearHistory(): void;
}

export class LocalStorageAdapter implements StorageAdapter {
  private get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(`${PREFIX}${key}`);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  private set(key: string, value: unknown): void {
    localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value));
  }

  getCollections(): ApiCollection[] {
    return this.get<ApiCollection[]>('collections', []);
  }

  saveCollections(collections: ApiCollection[]): void {
    this.set('collections', collections);
  }

  getEnvironments(): ApiEnvironment[] {
    return this.get<ApiEnvironment[]>('environments', []);
  }

  saveEnvironments(environments: ApiEnvironment[]): void {
    this.set('environments', environments);
  }

  getHistory(): HistoryEntry[] {
    return this.get<HistoryEntry[]>('history', []);
  }

  addHistory(entry: HistoryEntry): void {
    const history = this.getHistory();
    history.unshift(entry);
    if (history.length > HISTORY_LIMIT) {
      history.length = HISTORY_LIMIT;
    }
    this.set('history', history);
  }

  clearHistory(): void {
    this.set('history', []);
  }
}

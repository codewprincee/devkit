export interface EnvVariable {
  key: string;
  value: string;
  line: number;
  comment?: string;
  raw: string;
}

export interface EnvFile {
  name: string;
  path: string;
  variables: EnvVariable[];
  raw: string;
  handle?: FileSystemFileHandle;
}

export interface DiffEntry {
  key: string;
  leftValue?: string;
  rightValue?: string;
  status: 'added' | 'removed' | 'changed' | 'same';
  leftLine?: number;
  rightLine?: number;
}

export interface DiffResult {
  entries: DiffEntry[];
  added: number;
  removed: number;
  changed: number;
  same: number;
}

export type ValidationSeverity = 'error' | 'warning';

export interface ValidationIssue {
  key: string;
  value: string;
  message: string;
  severity: ValidationSeverity;
  line: number;
}

export interface ValidationReport {
  issues: ValidationIssue[];
  errors: number;
  warnings: number;
  passed: boolean;
}

export type TabId = 'viewer' | 'diff' | 'validate' | 'generate' | 'encrypt';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
}

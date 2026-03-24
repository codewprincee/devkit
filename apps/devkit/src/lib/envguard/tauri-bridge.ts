export function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

type InvokeFn = <T>(cmd: string, args?: Record<string, unknown>) => Promise<T>;

let invokeFn: InvokeFn | null = null;

async function getInvoke(): Promise<InvokeFn | null> {
  if (!isTauri()) return null;
  if (invokeFn) return invokeFn;

  try {
    const mod = await import('@tauri-apps/api/core');
    invokeFn = mod.invoke;
    return invokeFn;
  } catch {
    return null;
  }
}

export interface TauriEnvFileInfo {
  path: string;
  name: string;
  size: number;
  last_modified: number;
  environment: string;
}

export interface TauriEnvVariable {
  key: string;
  value: string;
  line: number;
  is_comment: boolean;
  is_empty: boolean;
  has_quotes: boolean;
  raw_line: string;
}

export async function tauriScanEnvFiles(path: string): Promise<TauriEnvFileInfo[] | null> {
  const invoke = await getInvoke();
  if (!invoke) return null;
  return invoke<TauriEnvFileInfo[]>('scan_env_files', { path });
}

export async function tauriReadEnvFile(path: string): Promise<TauriEnvVariable[] | null> {
  const invoke = await getInvoke();
  if (!invoke) return null;
  return invoke<TauriEnvVariable[]>('read_env_file', { path });
}

export async function tauriWriteEnvFile(
  path: string,
  variables: TauriEnvVariable[]
): Promise<void | null> {
  const invoke = await getInvoke();
  if (!invoke) return null;
  return invoke<void>('write_env_file', { path, variables });
}

export async function tauriEncryptEnv(
  path: string,
  password: string
): Promise<string | null> {
  const invoke = await getInvoke();
  if (!invoke) return null;
  return invoke<string>('encrypt_env', { path, password });
}

export async function tauriDecryptEnv(
  path: string,
  password: string
): Promise<TauriEnvVariable[] | null> {
  const invoke = await getInvoke();
  if (!invoke) return null;
  return invoke<TauriEnvVariable[]>('decrypt_env', { path, password });
}

export async function tauriCheckGitignore(
  projectPath: string
): Promise<Array<{ file: string; ignored: boolean }> | null> {
  const invoke = await getInvoke();
  if (!invoke) return null;
  return invoke<Array<{ file: string; ignored: boolean }>>('check_gitignore', { projectPath });
}

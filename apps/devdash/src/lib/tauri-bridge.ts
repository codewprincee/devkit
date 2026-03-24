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

import type {
  DockerContainer,
  MongoStatus,
  RedisStatus,
  PostgresStatus,
  NodeProcess,
  SystemInfo,
} from '@/types';

export async function tauriGetDockerContainers(): Promise<DockerContainer[] | null> {
  const invoke = await getInvoke();
  if (!invoke) return null;
  return invoke<DockerContainer[]>('get_docker_containers');
}

export async function tauriDockerAction(
  id: string,
  action: string
): Promise<string | null> {
  const invoke = await getInvoke();
  if (!invoke) return null;
  return invoke<string>('docker_action', { id, action });
}

export async function tauriGetDockerLogs(id: string): Promise<string | null> {
  const invoke = await getInvoke();
  if (!invoke) return null;
  return invoke<string>('get_docker_logs', { id });
}

export async function tauriGetMongoStatus(): Promise<MongoStatus | null> {
  const invoke = await getInvoke();
  if (!invoke) return null;
  return invoke<MongoStatus>('get_mongo_status');
}

export async function tauriGetRedisStatus(): Promise<RedisStatus | null> {
  const invoke = await getInvoke();
  if (!invoke) return null;
  return invoke<RedisStatus>('get_redis_status');
}

export async function tauriGetPostgresStatus(): Promise<PostgresStatus | null> {
  const invoke = await getInvoke();
  if (!invoke) return null;
  return invoke<PostgresStatus>('get_postgres_status');
}

export async function tauriGetNodeProcesses(): Promise<NodeProcess[] | null> {
  const invoke = await getInvoke();
  if (!invoke) return null;
  return invoke<NodeProcess[]>('get_node_processes');
}

export async function tauriGetSystemInfo(): Promise<SystemInfo | null> {
  const invoke = await getInvoke();
  if (!invoke) return null;
  return invoke<SystemInfo>('get_system_info');
}

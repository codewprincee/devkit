export interface DockerContainer {
  id: string;
  name: string;
  image: string;
  status: string;
  state: 'running' | 'stopped' | 'paused';
  ports: string;
  created: string;
  cpuPercent: number;
  memUsage: string;
}

export interface MongoStatus {
  connected: boolean;
  version: string;
  databases: { name: string; sizeOnDisk: number; collections: number }[];
}

export interface RedisStatus {
  connected: boolean;
  version: string;
  memoryUsed: string;
  memoryMax: string;
  keyCount: number;
  uptime: string;
}

export interface PostgresStatus {
  connected: boolean;
  version: string;
  databases: { name: string; size: string; tables: number }[];
}

export interface NodeProcess {
  pid: number;
  name: string;
  command: string;
  port?: number;
  cpuPercent: number;
  memoryMb: number;
  uptime: string;
}

export interface SystemInfo {
  cpuUsage: number;
  cpuCores: number;
  memoryUsed: number;
  memoryTotal: number;
  diskUsed: number;
  diskTotal: number;
  hostname: string;
  os: string;
  uptime: string;
}

export type ServiceTab = 'docker' | 'mongo' | 'redis' | 'postgres' | 'node' | 'system';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
}

export interface ServiceStatus {
  docker: { containers: DockerContainer[]; error?: string };
  mongo: MongoStatus & { error?: string };
  redis: RedisStatus & { error?: string };
  postgres: PostgresStatus & { error?: string };
  node: { processes: NodeProcess[]; error?: string };
  system: SystemInfo & { error?: string };
}

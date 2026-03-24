// Shared types across all DevKit apps

export type SortDirection = "asc" | "desc";

export interface SortConfig<T extends string = string> {
  field: T;
  direction: SortDirection;
}

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
}

// PortMan types
export interface PortProcess {
  pid: number;
  port: number;
  protocol: string;
  process_name: string;
  command: string;
  user: string;
  cpu_usage: number;
  memory_mb: number;
  state: string;
}

export interface SystemStats {
  total_listening: number;
  total_established: number;
  unique_processes: number;
}

export interface ProcessDetail {
  pid: number;
  ppid: number;
  started: string;
  elapsed: string;
  full_command: string;
  open_files: number;
  threads: number;
}

// EnvGuard types
export interface EnvFile {
  path: string;
  name: string;
  environment: string;
  variables: EnvVariable[];
  lastModified: number;
}

export interface EnvVariable {
  key: string;
  value: string;
  line: number;
  hasQuotes: boolean;
  isComment: boolean;
  isEmpty: boolean;
}

export interface EnvDiffResult {
  key: string;
  status: "added" | "removed" | "changed" | "same";
  leftValue?: string;
  rightValue?: string;
}

export interface EnvValidation {
  key: string;
  value: string;
  issues: EnvValidationIssue[];
}

export interface EnvValidationIssue {
  type: "missing" | "empty" | "invalid_url" | "invalid_port" | "invalid_email" | "whitespace" | "no_quotes";
  message: string;
  severity: "error" | "warning" | "info";
}

export interface EnvProject {
  path: string;
  name: string;
  files: EnvFile[];
  gitIgnored: boolean;
}

// API Pad types
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS";

export interface ApiRequest {
  id: string;
  name: string;
  method: HttpMethod;
  url: string;
  headers: Record<string, string>;
  body: string;
  bodyType: "json" | "form" | "raw" | "none";
  auth: ApiAuth;
}

export interface ApiAuth {
  type: "none" | "bearer" | "basic" | "apikey";
  token?: string;
  username?: string;
  password?: string;
  key?: string;
  value?: string;
  addTo?: "header" | "query";
}

export interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  time: number;
  size: number;
}

export interface ApiCollection {
  id: string;
  name: string;
  requests: ApiRequest[];
  variables: Record<string, string>;
}

// LogLens types
export type LogLevel = "error" | "warn" | "info" | "debug" | "trace" | "unknown";

export interface LogEntry {
  id: number;
  line: string;
  level: LogLevel;
  timestamp?: string;
  message: string;
  isJson: boolean;
  jsonData?: Record<string, unknown>;
  file: string;
}

export interface LogFilter {
  levels: LogLevel[];
  search: string;
  regex: boolean;
  files: string[];
}

// DevDash types
export interface DockerContainer {
  id: string;
  name: string;
  image: string;
  status: string;
  state: "running" | "stopped" | "paused" | "restarting";
  ports: string[];
  cpuPercent: number;
  memoryMb: number;
  created: string;
}

export interface ServiceStatus {
  name: string;
  type: "mongodb" | "redis" | "postgresql" | "docker" | "node";
  status: "running" | "stopped" | "error" | "unknown";
  host: string;
  port: number;
  details: Record<string, string | number>;
}

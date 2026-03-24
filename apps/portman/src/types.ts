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

export type StateFilter = "ALL" | "LISTEN" | "ESTABLISHED";

export type SortField =
  | "port"
  | "process_name"
  | "pid"
  | "protocol"
  | "state"
  | "cpu_usage"
  | "memory_mb"
  | "user";

export type SortDirection = "asc" | "desc";

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export interface Toast {
  id: string;
  message: string;
  type: "success" | "error";
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

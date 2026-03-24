/**
 * Bridge to Tauri backend commands.
 * Falls back to mock data when running outside Tauri (e.g. in the browser during dev).
 */

interface TauriInvoke {
  (cmd: string, args?: Record<string, unknown>): Promise<unknown>;
}

interface TauriEvent {
  listen: (
    event: string,
    handler: (event: { payload: unknown }) => void
  ) => Promise<() => void>;
}

let invoke: TauriInvoke | null = null;
let eventModule: TauriEvent | null = null;

async function getInvoke(): Promise<TauriInvoke> {
  if (invoke) return invoke;
  try {
    const mod = await import('@tauri-apps/api/core');
    invoke = mod.invoke;
    return invoke;
  } catch {
    throw new Error('Tauri API not available');
  }
}

async function getEventModule(): Promise<TauriEvent> {
  if (eventModule) return eventModule;
  try {
    const mod = await import('@tauri-apps/api/event');
    eventModule = mod as unknown as TauriEvent;
    return eventModule;
  } catch {
    throw new Error('Tauri event API not available');
  }
}

export function isTauriAvailable(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

/**
 * Read a log file from disk, returning the last N lines.
 */
export async function readLogFile(
  path: string,
  maxLines: number = 10000
): Promise<string[]> {
  if (!isTauriAvailable()) {
    return generateMockLogLines(200);
  }

  const fn = await getInvoke();
  const result = await fn('read_log_file', { path, maxLines });
  return result as string[];
}

/**
 * Start tailing a log file. Returns an unlisten function.
 * New lines are emitted via the "log-lines" event.
 */
export async function tailLogFile(
  path: string,
  onNewLines: (lines: string[]) => void
): Promise<() => void> {
  if (!isTauriAvailable()) {
    // Mock: emit a new line every 2 seconds
    const levels = ['INFO', 'WARN', 'ERROR', 'DEBUG'];
    const interval = setInterval(() => {
      const level = levels[Math.floor(Math.random() * levels.length)];
      const ts = new Date().toISOString();
      onNewLines([`${ts} [${level}] Mock tailing line at ${ts}`]);
    }, 2000);
    return () => clearInterval(interval);
  }

  const fn = await getInvoke();
  await fn('tail_log_file', { path });

  const events = await getEventModule();
  const unlisten = await events.listen('log-lines', (event) => {
    const payload = event.payload as { path: string; lines: string[] };
    if (payload.path === path) {
      onNewLines(payload.lines);
    }
  });

  return unlisten;
}

/**
 * Stop tailing a log file.
 */
export async function stopTailing(path: string): Promise<void> {
  if (!isTauriAvailable()) return;

  const fn = await getInvoke();
  await fn('stop_tailing', { path });
}

/**
 * List *.log files in a directory.
 */
export async function listLogFiles(
  dir: string
): Promise<Array<{ name: string; path: string; size: number }>> {
  if (!isTauriAvailable()) {
    return [
      { name: 'app.log', path: '/mock/app.log', size: 1024 },
      { name: 'error.log', path: '/mock/error.log', size: 512 },
    ];
  }

  const fn = await getInvoke();
  const result = await fn('list_log_files', { dir });
  return result as Array<{ name: string; path: string; size: number }>;
}

/**
 * Open the native file picker dialog for selecting log files.
 */
export async function openFileDialog(): Promise<string | null> {
  if (!isTauriAvailable()) {
    return '/mock/sample.log';
  }

  try {
    const { open } = await import('@tauri-apps/plugin-dialog');
    const result = await open({
      multiple: false,
      filters: [
        { name: 'Log Files', extensions: ['log', 'txt', 'out', 'err'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    });
    if (typeof result === 'string') return result;
    if (result && typeof result === 'object' && 'path' in result) {
      return (result as { path: string }).path;
    }
    return null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Mock helpers for browser development
// ---------------------------------------------------------------------------

function generateMockLogLines(count: number): string[] {
  const levels = ['INFO', 'WARN', 'ERROR', 'DEBUG', 'TRACE'];
  const messages = [
    'Server started on port 3000',
    'Database connection established',
    'Request received: GET /api/users',
    'Cache miss for key: user:123',
    'Processing batch job #42',
    'Connection timeout after 30s',
    'Failed to parse request body',
    'Rate limit exceeded for IP 192.168.1.1',
    'Memory usage: 256MB / 512MB',
    'Garbage collection completed in 15ms',
    '{"event":"page_view","path":"/dashboard","user_id":"u_abc123","duration_ms":142}',
    '{"level":"error","message":"Unhandled exception","stack":"TypeError: Cannot read property \'id\' of undefined\\n    at processUser (app.js:42)"}',
    'Websocket connection closed: code=1000',
    'SSL certificate expires in 30 days',
    'Deployment v2.3.1 rolling out to 3/5 instances',
  ];

  const lines: string[] = [];
  const baseTime = Date.now() - count * 1000;

  for (let i = 0; i < count; i++) {
    const level = levels[Math.floor(Math.random() * levels.length)];
    const message = messages[Math.floor(Math.random() * messages.length)];
    const timestamp = new Date(baseTime + i * 1000).toISOString();
    lines.push(`${timestamp} [${level}] ${message}`);
  }

  return lines;
}

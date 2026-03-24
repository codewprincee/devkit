use notify::{Config, Event, EventKind, RecommendedWatcher, RecursiveMode, Watcher};
use serde::Serialize;
use std::collections::HashMap;
use std::fs::{self, File};
use std::io::{BufRead, BufReader, Seek, SeekFrom};
use std::path::Path;
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, Emitter, Manager};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

#[derive(Serialize, Clone, Debug)]
pub struct LogFileInfo {
    name: String,
    path: String,
    size: u64,
}

#[derive(Serialize, Clone, Debug)]
struct LogLinesPayload {
    path: String,
    lines: Vec<String>,
}

// State for tracking active file watchers
pub struct WatcherState {
    watchers: HashMap<String, WatcherHandle>,
}

struct WatcherHandle {
    _watcher: RecommendedWatcher,
    file_position: Arc<Mutex<u64>>,
}

// ---------------------------------------------------------------------------
// Tauri commands
// ---------------------------------------------------------------------------

/// Read a log file and return the last `max_lines` lines.
/// For files with more lines than `max_lines`, only the tail is returned
/// to keep memory usage bounded.
#[tauri::command]
pub fn read_log_file(path: String, max_lines: Option<usize>) -> Result<Vec<String>, String> {
    let max = max_lines.unwrap_or(10_000);
    let file_path = Path::new(&path);

    if !file_path.exists() {
        return Err(format!("File not found: {}", path));
    }

    if !file_path.is_file() {
        return Err(format!("Path is not a file: {}", path));
    }

    let content =
        fs::read_to_string(file_path).map_err(|e| format!("Failed to read {}: {}", path, e))?;

    let lines: Vec<String> = content.lines().map(|l| l.to_string()).collect();

    // Return only the last `max` lines
    if lines.len() > max {
        Ok(lines[lines.len() - max..].to_vec())
    } else {
        Ok(lines)
    }
}

/// Start watching a file for changes (like `tail -f`).
/// New lines are emitted to the frontend via the "log-lines" event.
#[tauri::command]
pub fn tail_log_file(app: AppHandle, path: String) -> Result<(), String> {
    let state = app.state::<Arc<Mutex<WatcherState>>>();
    let mut state = state.lock().map_err(|e| e.to_string())?;

    // Don't double-watch
    if state.watchers.contains_key(&path) {
        return Ok(());
    }

    let file_path = Path::new(&path);
    if !file_path.exists() {
        return Err(format!("File not found: {}", path));
    }

    // Record the current file size so we only emit new content
    let metadata = fs::metadata(file_path).map_err(|e| e.to_string())?;
    let position = Arc::new(Mutex::new(metadata.len()));

    let path_clone = path.clone();
    let position_clone = position.clone();
    let app_clone = app.clone();

    let mut watcher = RecommendedWatcher::new(
        move |result: Result<Event, notify::Error>| {
            if let Ok(event) = result {
                match event.kind {
                    EventKind::Modify(_) | EventKind::Create(_) => {
                        // Read new content from the last known position
                        if let Ok(new_lines) =
                            read_new_lines(&path_clone, &position_clone)
                        {
                            if !new_lines.is_empty() {
                                let payload = LogLinesPayload {
                                    path: path_clone.clone(),
                                    lines: new_lines,
                                };
                                let _ = app_clone.emit("log-lines", payload);
                            }
                        }
                    }
                    _ => {}
                }
            }
        },
        Config::default(),
    )
    .map_err(|e| format!("Failed to create watcher: {}", e))?;

    watcher
        .watch(file_path, RecursiveMode::NonRecursive)
        .map_err(|e| format!("Failed to watch file: {}", e))?;

    state.watchers.insert(
        path,
        WatcherHandle {
            _watcher: watcher,
            file_position: position,
        },
    );

    Ok(())
}

/// Stop tailing a file.
#[tauri::command]
pub fn stop_tailing(app: AppHandle, path: String) -> Result<(), String> {
    let state = app.state::<Arc<Mutex<WatcherState>>>();
    let mut state = state.lock().map_err(|e| e.to_string())?;
    state.watchers.remove(&path);
    Ok(())
}

/// List *.log files in a directory (non-recursive, one level deep).
#[tauri::command]
pub fn list_log_files(dir: String) -> Result<Vec<LogFileInfo>, String> {
    let dir_path = Path::new(&dir);
    if !dir_path.is_dir() {
        return Err(format!("Path is not a directory: {}", dir));
    }

    let mut results: Vec<LogFileInfo> = Vec::new();

    let entries = fs::read_dir(dir_path).map_err(|e| e.to_string())?;

    for entry in entries.flatten() {
        let path = entry.path();
        if !path.is_file() {
            continue;
        }

        let name = path
            .file_name()
            .unwrap_or_default()
            .to_string_lossy()
            .to_string();

        let ext = path
            .extension()
            .unwrap_or_default()
            .to_string_lossy()
            .to_lowercase();

        if matches!(ext.as_str(), "log" | "txt" | "out" | "err") {
            let size = entry.metadata().map(|m| m.len()).unwrap_or(0);
            results.push(LogFileInfo {
                name,
                path: path.to_string_lossy().to_string(),
                size,
            });
        }
    }

    results.sort_by(|a, b| a.name.cmp(&b.name));
    Ok(results)
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/// Read new lines from a file starting at the recorded position.
/// Updates the position to the new end of file.
pub fn read_new_lines(path: &str, position: &Arc<Mutex<u64>>) -> Result<Vec<String>, String> {
    let mut pos = position.lock().map_err(|e| e.to_string())?;

    let file = File::open(path).map_err(|e| e.to_string())?;
    let metadata = file.metadata().map_err(|e| e.to_string())?;
    let file_len = metadata.len();

    // File was truncated (log rotation) — reset to beginning
    if file_len < *pos {
        *pos = 0;
    }

    if file_len == *pos {
        return Ok(Vec::new());
    }

    let mut reader = BufReader::new(file);
    reader
        .seek(SeekFrom::Start(*pos))
        .map_err(|e| e.to_string())?;

    let mut lines: Vec<String> = Vec::new();
    let mut buf = String::new();

    loop {
        buf.clear();
        match reader.read_line(&mut buf) {
            Ok(0) => break,
            Ok(_) => {
                let line = buf.trim_end_matches('\n').trim_end_matches('\r').to_string();
                if !line.is_empty() {
                    lines.push(line);
                }
            }
            Err(_) => break,
        }
    }

    *pos = file_len;
    Ok(lines)
}

pub fn create_watcher_state() -> Arc<Mutex<WatcherState>> {
    Arc::new(Mutex::new(WatcherState {
        watchers: HashMap::new(),
    }))
}

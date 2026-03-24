use serde::{Deserialize, Serialize};
use std::process::Command;
use sysinfo::{Disks, System};

// ---------------------------------------------------------------------------
// Structs
// ---------------------------------------------------------------------------

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct DockerContainer {
    id: String,
    name: String,
    image: String,
    status: String,
    state: String,
    ports: String,
    created: String,
    #[serde(rename = "cpuPercent")]
    cpu_percent: f64,
    #[serde(rename = "memUsage")]
    mem_usage: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct MongoDatabase {
    name: String,
    #[serde(rename = "sizeOnDisk")]
    size_on_disk: u64,
    collections: u32,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct MongoStatus {
    connected: bool,
    version: String,
    databases: Vec<MongoDatabase>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct RedisStatus {
    connected: bool,
    version: String,
    #[serde(rename = "memoryUsed")]
    memory_used: String,
    #[serde(rename = "memoryMax")]
    memory_max: String,
    #[serde(rename = "keyCount")]
    key_count: u64,
    uptime: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct PostgresDatabase {
    name: String,
    size: String,
    tables: u32,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct PostgresStatus {
    connected: bool,
    version: String,
    databases: Vec<PostgresDatabase>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct NodeProcess {
    pid: u32,
    name: String,
    command: String,
    port: Option<u16>,
    #[serde(rename = "cpuPercent")]
    cpu_percent: f64,
    #[serde(rename = "memoryMb")]
    memory_mb: f64,
    uptime: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct SystemInfo {
    #[serde(rename = "cpuUsage")]
    cpu_usage: f64,
    #[serde(rename = "cpuCores")]
    cpu_cores: u32,
    #[serde(rename = "memoryUsed")]
    memory_used: u64,
    #[serde(rename = "memoryTotal")]
    memory_total: u64,
    #[serde(rename = "diskUsed")]
    disk_used: u64,
    #[serde(rename = "diskTotal")]
    disk_total: u64,
    hostname: String,
    os: String,
    uptime: String,
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

fn run_command(program: &str, args: &[&str]) -> Result<String, String> {
    Command::new(program)
        .args(args)
        .output()
        .map_err(|e| format!("{} not found or failed to execute: {}", program, e))
        .and_then(|output| {
            if output.status.success() {
                String::from_utf8(output.stdout)
                    .map_err(|e| format!("Invalid UTF-8 output: {}", e))
            } else {
                let stderr = String::from_utf8_lossy(&output.stderr);
                Err(format!(
                    "{} exited with code {}: {}",
                    program,
                    output.status.code().unwrap_or(-1),
                    stderr.trim()
                ))
            }
        })
}

fn format_duration(secs: u64) -> String {
    if secs < 60 {
        return format!("{}s", secs);
    }
    if secs < 3600 {
        return format!("{}m {}s", secs / 60, secs % 60);
    }
    if secs < 86400 {
        return format!("{}h {}m", secs / 3600, (secs % 3600) / 60);
    }
    format!("{}d {}h", secs / 86400, (secs % 86400) / 3600)
}

// ---------------------------------------------------------------------------
// Docker commands
// ---------------------------------------------------------------------------

#[tauri::command]
fn get_docker_containers() -> Result<Vec<DockerContainer>, String> {
    let output = run_command(
        "docker",
        &["ps", "-a", "--format", "{{.ID}}\t{{.Names}}\t{{.Image}}\t{{.Status}}\t{{.State}}\t{{.Ports}}\t{{.CreatedAt}}"],
    )?;

    let mut containers: Vec<DockerContainer> = Vec::new();

    for line in output.lines() {
        let parts: Vec<&str> = line.split('\t').collect();
        if parts.len() < 7 {
            continue;
        }

        let state = match parts[4].to_lowercase().as_str() {
            "running" => "running",
            "paused" => "paused",
            _ => "stopped",
        };

        containers.push(DockerContainer {
            id: parts[0].to_string(),
            name: parts[1].to_string(),
            image: parts[2].to_string(),
            status: parts[3].to_string(),
            state: state.to_string(),
            ports: parts[5].to_string(),
            created: parts[6].to_string(),
            cpu_percent: 0.0,
            mem_usage: String::new(),
        });
    }

    // Try to get stats for running containers
    if let Ok(stats_output) = run_command(
        "docker",
        &["stats", "--no-stream", "--format", "{{.ID}}\t{{.CPUPerc}}\t{{.MemUsage}}"],
    ) {
        for line in stats_output.lines() {
            let parts: Vec<&str> = line.split('\t').collect();
            if parts.len() < 3 {
                continue;
            }
            let id = parts[0];
            let cpu_str = parts[1].trim_end_matches('%');
            let mem_str = parts[2];

            if let Some(container) = containers.iter_mut().find(|c| c.id.starts_with(id) || id.starts_with(&c.id)) {
                container.cpu_percent = cpu_str.parse().unwrap_or(0.0);
                container.mem_usage = mem_str.to_string();
            }
        }
    }

    Ok(containers)
}

#[tauri::command]
fn docker_action(id: String, action: String) -> Result<String, String> {
    match action.as_str() {
        "start" | "stop" | "restart" => {
            run_command("docker", &[&action, &id])?;
            Ok(format!("Container {} {}ed successfully", id, action))
        }
        _ => Err(format!("Unknown action: {}", action)),
    }
}

#[tauri::command]
fn get_docker_logs(id: String) -> Result<String, String> {
    run_command("docker", &["logs", "--tail", "100", &id])
}

// ---------------------------------------------------------------------------
// MongoDB commands
// ---------------------------------------------------------------------------

#[tauri::command]
fn get_mongo_status() -> Result<MongoStatus, String> {
    // Try mongosh first, fall back to mongo
    let version_output = run_command("mongosh", &["--quiet", "--eval", "db.version()"])
        .or_else(|_| run_command("mongo", &["--quiet", "--eval", "db.version()"]))?;

    let version = version_output.trim().to_string();

    // Get database list
    let db_output = run_command(
        "mongosh",
        &["--quiet", "--eval", "JSON.stringify(db.adminCommand('listDatabases'))"],
    )
    .or_else(|_| {
        run_command(
            "mongo",
            &["--quiet", "--eval", "JSON.stringify(db.adminCommand('listDatabases'))"],
        )
    })?;

    let mut databases: Vec<MongoDatabase> = Vec::new();

    if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(db_output.trim()) {
        if let Some(dbs) = parsed.get("databases").and_then(|d| d.as_array()) {
            for db in dbs {
                let name = db
                    .get("name")
                    .and_then(|n| n.as_str())
                    .unwrap_or("")
                    .to_string();
                let size = db
                    .get("sizeOnDisk")
                    .and_then(|s| s.as_u64())
                    .unwrap_or(0);

                // Get collection count for each database
                let collections = get_collection_count(&name).unwrap_or(0);

                databases.push(MongoDatabase {
                    name,
                    size_on_disk: size,
                    collections,
                });
            }
        }
    }

    Ok(MongoStatus {
        connected: true,
        version,
        databases,
    })
}

fn get_collection_count(db_name: &str) -> Result<u32, String> {
    let eval_str = format!(
        "JSON.stringify(db.getSiblingDB('{}').getCollectionNames().length)",
        db_name
    );
    let output = run_command("mongosh", &["--quiet", "--eval", &eval_str])
        .or_else(|_| run_command("mongo", &["--quiet", "--eval", &eval_str]))?;

    output.trim().parse::<u32>().map_err(|e| e.to_string())
}

// ---------------------------------------------------------------------------
// Redis commands
// ---------------------------------------------------------------------------

#[tauri::command]
fn get_redis_status() -> Result<RedisStatus, String> {
    let output = run_command("redis-cli", &["info"])?;

    let mut version = String::new();
    let mut memory_used = String::new();
    let mut memory_max = String::new();
    let mut key_count: u64 = 0;
    let mut uptime_seconds: u64 = 0;

    for line in output.lines() {
        let line = line.trim();
        if let Some(val) = line.strip_prefix("redis_version:") {
            version = val.trim().to_string();
        } else if let Some(val) = line.strip_prefix("used_memory_human:") {
            memory_used = val.trim().to_string();
        } else if let Some(val) = line.strip_prefix("maxmemory_human:") {
            memory_max = val.trim().to_string();
        } else if let Some(val) = line.strip_prefix("uptime_in_seconds:") {
            uptime_seconds = val.trim().parse().unwrap_or(0);
        } else if line.starts_with("db") && line.contains("keys=") {
            // Parse db0:keys=123,expires=0,avg_ttl=0
            if let Some(keys_part) = line.split("keys=").nth(1) {
                if let Some(num_str) = keys_part.split(',').next() {
                    key_count += num_str.parse::<u64>().unwrap_or(0);
                }
            }
        }
    }

    // Clean up memory_max if it shows "0B" (meaning unlimited)
    if memory_max == "0B" || memory_max.is_empty() {
        memory_max = "0".to_string();
    }

    Ok(RedisStatus {
        connected: true,
        version,
        memory_used,
        memory_max,
        key_count,
        uptime: format_duration(uptime_seconds),
    })
}

// ---------------------------------------------------------------------------
// PostgreSQL commands
// ---------------------------------------------------------------------------

#[tauri::command]
fn get_postgres_status() -> Result<PostgresStatus, String> {
    // Get version
    let version_output = run_command("psql", &["--version"])?;
    let version = version_output
        .trim()
        .split(' ')
        .last()
        .unwrap_or("unknown")
        .to_string();

    // List databases
    let db_output = run_command(
        "psql",
        &[
            "-t",
            "-A",
            "-c",
            "SELECT datname, pg_database_size(datname), 0 FROM pg_database WHERE datistemplate = false ORDER BY datname",
        ],
    )?;

    let mut databases: Vec<PostgresDatabase> = Vec::new();

    for line in db_output.lines() {
        let line = line.trim();
        if line.is_empty() {
            continue;
        }

        let parts: Vec<&str> = line.split('|').collect();
        if parts.len() < 2 {
            continue;
        }

        let name = parts[0].trim().to_string();
        let size_bytes: u64 = parts[1].trim().parse().unwrap_or(0);
        let size = format_pg_size(size_bytes);

        // Get table count for each database
        let tables = get_pg_table_count(&name).unwrap_or(0);

        databases.push(PostgresDatabase {
            name,
            size,
            tables,
        });
    }

    Ok(PostgresStatus {
        connected: true,
        version,
        databases,
    })
}

fn format_pg_size(bytes: u64) -> String {
    if bytes == 0 {
        return "0 B".to_string();
    }
    let sizes = ["B", "KB", "MB", "GB", "TB"];
    let i = (bytes as f64).log(1024.0).floor() as usize;
    let i = i.min(sizes.len() - 1);
    format!("{:.1} {}", bytes as f64 / 1024_f64.powi(i as i32), sizes[i])
}

fn get_pg_table_count(db_name: &str) -> Result<u32, String> {
    let output = run_command(
        "psql",
        &[
            "-d",
            db_name,
            "-t",
            "-A",
            "-c",
            "SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public'",
        ],
    )?;

    output.trim().parse::<u32>().map_err(|e| e.to_string())
}

// ---------------------------------------------------------------------------
// Node.js process commands
// ---------------------------------------------------------------------------

#[tauri::command]
fn get_node_processes() -> Result<Vec<NodeProcess>, String> {
    let output = run_command("ps", &["aux"])?;

    let mut processes: Vec<NodeProcess> = Vec::new();

    for line in output.lines().skip(1) {
        // Skip header row
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() < 11 {
            continue;
        }

        // Check if this is a node process
        let command_parts: Vec<&str> = parts[10..].to_vec();
        let full_command = command_parts.join(" ");

        let is_node = full_command.contains("node")
            || full_command.contains("next")
            || full_command.contains("ts-node")
            || full_command.contains("tsx")
            || full_command.contains("npx");

        // Skip grep processes and our own ps command
        if !is_node || full_command.contains("grep") {
            continue;
        }

        let pid: u32 = parts[1].parse().unwrap_or(0);
        let cpu_percent: f64 = parts[2].parse().unwrap_or(0.0);
        let mem_percent: f64 = parts[3].parse().unwrap_or(0.0);
        let start_time = parts[8].to_string();

        // Estimate memory in MB from the RSS column (parts[5] is RSS in KB on macOS)
        let rss_kb: f64 = parts[5].parse().unwrap_or(0.0);
        let memory_mb = rss_kb / 1024.0;

        // Try to extract a meaningful name from the command
        let name = extract_process_name(&full_command);

        // Try to detect port from command args
        let port = extract_port(&full_command);

        processes.push(NodeProcess {
            pid,
            name,
            command: truncate_string(&full_command, 120),
            port,
            cpu_percent,
            memory_mb: if memory_mb > 0.0 { memory_mb } else { mem_percent * 100.0 },
            uptime: start_time,
        });
    }

    Ok(processes)
}

fn extract_process_name(command: &str) -> String {
    // Try to get a meaningful name from common patterns
    if command.contains("next dev") || command.contains("next start") {
        return "Next.js".to_string();
    }
    if command.contains("vite") {
        return "Vite".to_string();
    }
    if command.contains("webpack") {
        return "Webpack".to_string();
    }
    if command.contains("ts-node") || command.contains("tsx") {
        return "TypeScript".to_string();
    }
    if command.contains("nodemon") {
        return "Nodemon".to_string();
    }
    if command.contains("pm2") {
        return "PM2".to_string();
    }
    if command.contains("express") {
        return "Express".to_string();
    }
    if command.contains("nest") {
        return "NestJS".to_string();
    }

    // Fall back to the binary name
    command
        .split_whitespace()
        .next()
        .unwrap_or("node")
        .split('/')
        .last()
        .unwrap_or("node")
        .to_string()
}

fn extract_port(command: &str) -> Option<u16> {
    // Look for common port patterns: --port 3000, -p 3000, PORT=3000
    let patterns = ["--port", "-p", "--listen"];
    for pattern in patterns {
        if let Some(pos) = command.find(pattern) {
            let after = &command[pos + pattern.len()..];
            let trimmed = after.trim_start_matches(|c: char| c == '=' || c == ' ');
            if let Some(num_str) = trimmed.split_whitespace().next() {
                if let Ok(port) = num_str.parse::<u16>() {
                    if port > 0 && port <= 65535 {
                        return Some(port);
                    }
                }
            }
        }
    }

    // Look for PORT=
    if let Some(pos) = command.find("PORT=") {
        let after = &command[pos + 5..];
        if let Some(num_str) = after.split_whitespace().next() {
            if let Ok(port) = num_str.parse::<u16>() {
                if port > 0 && port <= 65535 {
                    return Some(port);
                }
            }
        }
    }

    None
}

fn truncate_string(s: &str, max_len: usize) -> String {
    if s.len() <= max_len {
        s.to_string()
    } else {
        format!("{}...", &s[..max_len])
    }
}

// ---------------------------------------------------------------------------
// System info command
// ---------------------------------------------------------------------------

#[tauri::command]
fn get_system_info() -> Result<SystemInfo, String> {
    let mut sys = System::new_all();
    sys.refresh_all();

    // Wait briefly and refresh CPU to get accurate readings
    std::thread::sleep(std::time::Duration::from_millis(200));
    sys.refresh_cpu_all();

    let cpu_usage: f64 = sys.cpus().iter().map(|c| c.cpu_usage() as f64).sum::<f64>()
        / sys.cpus().len().max(1) as f64;

    let cpu_cores = sys.cpus().len() as u32;
    let memory_used = sys.used_memory();
    let memory_total = sys.total_memory();

    // Get disk info
    let disks = Disks::new_with_refreshed_list();
    let mut disk_total: u64 = 0;
    let mut disk_used: u64 = 0;

    for disk in disks.list() {
        let mount = disk.mount_point().to_string_lossy();
        // On macOS, the main disk is mounted at /
        // On Linux, look for / or /home
        if mount == "/" || (mount == "/home" && disk_total == 0) {
            disk_total = disk.total_space();
            disk_used = disk.total_space() - disk.available_space();
        }
    }

    // Fallback: use first disk if root not found
    if disk_total == 0 {
        if let Some(disk) = disks.list().first() {
            disk_total = disk.total_space();
            disk_used = disk.total_space() - disk.available_space();
        }
    }

    let hostname = System::host_name().unwrap_or_else(|| "unknown".to_string());
    let os_name = System::name().unwrap_or_else(|| "unknown".to_string());
    let os_version = System::os_version().unwrap_or_else(|| "".to_string());
    let os = if os_version.is_empty() {
        os_name
    } else {
        format!("{} {}", os_name, os_version)
    };

    let uptime_secs = System::uptime();

    Ok(SystemInfo {
        cpu_usage,
        cpu_cores,
        memory_used,
        memory_total,
        disk_used,
        disk_total,
        hostname,
        os,
        uptime: format_duration(uptime_secs),
    })
}

// ---------------------------------------------------------------------------
// App entry point
// ---------------------------------------------------------------------------

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            get_docker_containers,
            docker_action,
            get_docker_logs,
            get_mongo_status,
            get_redis_status,
            get_postgres_status,
            get_node_processes,
            get_system_info,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

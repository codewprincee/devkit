use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::process::Command;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PortProcess {
    pub pid: u32,
    pub port: u16,
    pub protocol: String,
    pub process_name: String,
    pub command: String,
    pub user: String,
    pub cpu_usage: f64,
    pub memory_mb: f64,
    pub state: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SystemStats {
    pub total_listening: usize,
    pub total_established: usize,
    pub unique_processes: usize,
}

#[tauri::command]
fn get_ports() -> Result<Vec<PortProcess>, String> {
    let output = Command::new("lsof")
        .args(["-iTCP", "-iUDP", "-sTCP:LISTEN,ESTABLISHED", "-nP"])
        .output()
        .map_err(|e| format!("Failed to run lsof: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    let mut processes: Vec<PortProcess> = Vec::new();
    let mut seen: HashMap<(u32, u16), bool> = HashMap::new();

    for line in stdout.lines().skip(1) {
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() < 9 {
            continue;
        }

        let process_name = parts[0].to_string();
        let pid: u32 = match parts[1].parse() {
            Ok(p) => p,
            Err(_) => continue,
        };
        let user = parts[2].to_string();
        let protocol = parts[7].to_string();

        // Parse the name field (e.g., "*:3000" or "127.0.0.1:8080")
        let name_field = parts[8];
        let port: u16 = if let Some(port_str) = name_field.rsplit(':').next() {
            match port_str.parse() {
                Ok(p) => p,
                Err(_) => continue,
            }
        } else {
            continue;
        };

        // Determine state
        let state = if parts.len() > 9 {
            parts[9].trim_start_matches('(').trim_end_matches(')').to_string()
        } else {
            "UNKNOWN".to_string()
        };

        let key = (pid, port);
        if seen.contains_key(&key) {
            continue;
        }
        seen.insert(key, true);

        // Get process details via ps
        let (cpu, mem, cmd) = get_process_details(pid);

        processes.push(PortProcess {
            pid,
            port,
            protocol,
            process_name,
            command: cmd,
            user,
            cpu_usage: cpu,
            memory_mb: mem,
            state,
        });
    }

    processes.sort_by_key(|p| p.port);
    Ok(processes)
}

fn get_process_details(pid: u32) -> (f64, f64, String) {
    let output = Command::new("ps")
        .args(["-p", &pid.to_string(), "-o", "%cpu,%mem,rss,command="])
        .output();

    match output {
        Ok(out) => {
            let stdout = String::from_utf8_lossy(&out.stdout);
            let line = stdout.lines().nth(1).unwrap_or("");
            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.len() >= 4 {
                let cpu: f64 = parts[0].parse().unwrap_or(0.0);
                let rss_kb: f64 = parts[2].parse().unwrap_or(0.0);
                let mem_mb = rss_kb / 1024.0;
                let cmd = parts[3..].join(" ");
                (cpu, mem_mb, cmd)
            } else {
                (0.0, 0.0, String::new())
            }
        }
        Err(_) => (0.0, 0.0, String::new()),
    }
}

#[tauri::command]
fn get_system_stats() -> Result<SystemStats, String> {
    let ports = get_ports()?;
    let listening = ports.iter().filter(|p| p.state == "LISTEN").count();
    let established = ports.iter().filter(|p| p.state == "ESTABLISHED").count();
    let mut unique_pids: Vec<u32> = ports.iter().map(|p| p.pid).collect();
    unique_pids.sort();
    unique_pids.dedup();

    Ok(SystemStats {
        total_listening: listening,
        total_established: established,
        unique_processes: unique_pids.len(),
    })
}

#[tauri::command]
fn kill_process(pid: u32) -> Result<String, String> {
    let output = Command::new("kill")
        .args(["-9", &pid.to_string()])
        .output()
        .map_err(|e| format!("Failed to kill process: {}", e))?;

    if output.status.success() {
        Ok(format!("Process {} killed successfully", pid))
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr);
        Err(format!("Failed to kill process {}: {}", pid, stderr))
    }
}

#[tauri::command]
fn kill_processes(pids: Vec<u32>) -> Result<Vec<String>, String> {
    let mut results = Vec::new();
    for pid in pids {
        match kill_process(pid) {
            Ok(msg) => results.push(msg),
            Err(e) => results.push(e),
        }
    }
    Ok(results)
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ProcessDetail {
    pub pid: u32,
    pub ppid: u32,
    pub started: String,
    pub elapsed: String,
    pub full_command: String,
    pub open_files: usize,
    pub threads: u32,
}

#[tauri::command]
fn get_process_detail(pid: u32) -> Result<ProcessDetail, String> {
    let ps_output = Command::new("ps")
        .args(["-p", &pid.to_string(), "-o", "ppid=,lstart=,etime=,command="])
        .output()
        .map_err(|e| format!("Failed to get process details: {}", e))?;

    let stdout = String::from_utf8_lossy(&ps_output.stdout);
    let line = stdout.lines().next().unwrap_or("").trim();

    let parts: Vec<&str> = line.splitn(2, char::is_whitespace).collect();
    let ppid: u32 = parts.first().unwrap_or(&"0").trim().parse().unwrap_or(0);

    // Get lstart (e.g., "Mon Mar 24 06:30:00 2026")
    let rest = if parts.len() > 1 { parts[1].trim() } else { "" };
    // lstart has 5 tokens: Day Mon DD HH:MM:SS YYYY
    let tokens: Vec<&str> = rest.splitn(6, char::is_whitespace).collect();
    let (started, rest2) = if tokens.len() >= 6 {
        (tokens[..5].join(" "), tokens[5].to_string())
    } else {
        ("unknown".to_string(), rest.to_string())
    };

    let tokens2: Vec<&str> = rest2.trim().splitn(2, char::is_whitespace).collect();
    let elapsed = tokens2.first().unwrap_or(&"").to_string();
    let full_command = if tokens2.len() > 1 { tokens2[1].to_string() } else { String::new() };

    // Count open files
    let lsof_output = Command::new("lsof")
        .args(["-p", &pid.to_string()])
        .output();
    let open_files = match lsof_output {
        Ok(out) => {
            let s = String::from_utf8_lossy(&out.stdout);
            s.lines().count().saturating_sub(1)
        }
        Err(_) => 0,
    };

    // Thread count
    let thread_output = Command::new("ps")
        .args(["-M", "-p", &pid.to_string()])
        .output();
    let threads = match thread_output {
        Ok(out) => {
            let s = String::from_utf8_lossy(&out.stdout);
            s.lines().count().saturating_sub(1) as u32
        }
        Err(_) => 0,
    };

    Ok(ProcessDetail {
        pid,
        ppid,
        started,
        elapsed,
        full_command,
        open_files,
        threads,
    })
}

#[tauri::command]
fn search_port(port: u16) -> Result<Vec<PortProcess>, String> {
    let all = get_ports()?;
    let filtered: Vec<PortProcess> = all.into_iter().filter(|p| p.port == port).collect();
    Ok(filtered)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            get_ports,
            get_system_stats,
            kill_process,
            kill_processes,
            search_port,
            get_process_detail,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

mod apipad;
mod devdash;
mod envguard;
mod loglens;
mod portman;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let watcher_state = loglens::create_watcher_state();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(watcher_state)
        .invoke_handler(tauri::generate_handler![
            // PortMan commands
            portman::get_ports,
            portman::get_system_stats,
            portman::kill_process,
            portman::kill_processes,
            portman::search_port,
            portman::get_process_detail,
            // EnvGuard commands
            envguard::scan_env_files,
            envguard::read_env_file,
            envguard::write_env_file,
            envguard::diff_env_files,
            envguard::validate_env,
            envguard::encrypt_env,
            envguard::decrypt_env,
            envguard::generate_example,
            envguard::check_gitignore,
            // API Pad commands
            apipad::send_request,
            // LogLens commands
            loglens::read_log_file,
            loglens::tail_log_file,
            loglens::stop_tailing,
            loglens::list_log_files,
            // DevDash commands
            devdash::get_docker_containers,
            devdash::docker_action,
            devdash::get_docker_logs,
            devdash::get_mongo_status,
            devdash::get_redis_status,
            devdash::get_postgres_status,
            devdash::get_node_processes,
            devdash::get_system_info,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

use aes_gcm::{
    aead::{Aead, KeyInit, OsRng},
    Aes256Gcm, Nonce,
};
use base64::{engine::general_purpose::STANDARD as BASE64, Engine};
use rand::RngCore;
use serde::{Deserialize, Serialize};
use std::collections::{HashMap, HashSet};
use std::fs;
use std::path::{Path, PathBuf};
use std::time::SystemTime;
use walkdir::WalkDir;

#[derive(Serialize, Deserialize, Debug)]
pub struct EnvFileInfo {
    path: String,
    name: String,
    size: u64,
    last_modified: u64,
    environment: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct EnvVariable {
    key: String,
    value: String,
    line: u32,
    is_comment: bool,
    is_empty: bool,
    has_quotes: bool,
    raw_line: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct DiffResult {
    key: String,
    status: String,
    left_value: Option<String>,
    right_value: Option<String>,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ValidationIssue {
    key: String,
    value: String,
    issue_type: String,
    message: String,
    severity: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct GitIgnoreStatus {
    file: String,
    ignored: bool,
}

fn detect_environment(name: &str) -> String {
    let lower = name.to_lowercase();
    if lower.contains("prod") {
        "production".into()
    } else if lower.contains("stag") {
        "staging".into()
    } else if lower.contains("test") {
        "testing".into()
    } else if lower.contains("dev") || lower == ".env.local" {
        "development".into()
    } else if lower == ".env.example" || lower == ".env.sample" {
        "example".into()
    } else {
        "unknown".into()
    }
}

fn parse_env_content(content: &str) -> Vec<EnvVariable> {
    let mut variables: Vec<EnvVariable> = Vec::new();
    let lines: Vec<&str> = content.lines().collect();
    let mut i: usize = 0;

    while i < lines.len() {
        let raw_line = lines[i].to_string();
        let trimmed = raw_line.trim();
        let line_number = (i + 1) as u32;

        if trimmed.is_empty() {
            variables.push(EnvVariable {
                key: String::new(),
                value: String::new(),
                line: line_number,
                is_comment: false,
                is_empty: true,
                has_quotes: false,
                raw_line,
            });
            i += 1;
            continue;
        }

        if trimmed.starts_with('#') {
            variables.push(EnvVariable {
                key: String::new(),
                value: String::new(),
                line: line_number,
                is_comment: true,
                is_empty: false,
                has_quotes: false,
                raw_line,
            });
            i += 1;
            continue;
        }

        let effective = if trimmed.starts_with("export ") {
            &trimmed[7..]
        } else {
            trimmed
        };

        if let Some(eq_pos) = effective.find('=') {
            let key = effective[..eq_pos].trim().to_string();
            let mut val_part = effective[eq_pos + 1..].to_string();
            let has_quotes;

            if val_part.starts_with('"') {
                has_quotes = true;
                if !val_part[1..].contains('"') {
                    while i + 1 < lines.len() {
                        i += 1;
                        val_part.push('\n');
                        val_part.push_str(lines[i]);
                        if lines[i].contains('"') {
                            break;
                        }
                    }
                }
                val_part = strip_quotes(&val_part, '"');
            } else if val_part.starts_with('\'') {
                has_quotes = true;
                if !val_part[1..].contains('\'') {
                    while i + 1 < lines.len() {
                        i += 1;
                        val_part.push('\n');
                        val_part.push_str(lines[i]);
                        if lines[i].contains('\'') {
                            break;
                        }
                    }
                }
                val_part = strip_quotes(&val_part, '\'');
            } else {
                has_quotes = false;
                if let Some(comment_pos) = val_part.find(" #") {
                    val_part = val_part[..comment_pos].to_string();
                }
                val_part = val_part.trim().to_string();
            }

            variables.push(EnvVariable {
                key,
                value: val_part,
                line: line_number,
                is_comment: false,
                is_empty: false,
                has_quotes,
                raw_line,
            });
        } else {
            variables.push(EnvVariable {
                key: String::new(),
                value: String::new(),
                line: line_number,
                is_comment: false,
                is_empty: true,
                has_quotes: false,
                raw_line,
            });
        }

        i += 1;
    }

    variables
}

fn strip_quotes(s: &str, q: char) -> String {
    let trimmed = s.trim();
    if trimmed.starts_with(q) && trimmed.ends_with(q) && trimmed.len() >= 2 {
        trimmed[1..trimmed.len() - 1].to_string()
    } else {
        trimmed.to_string()
    }
}

fn derive_key(password: &str) -> [u8; 32] {
    use std::collections::hash_map::DefaultHasher;
    use std::hash::{Hash, Hasher};

    let mut key = [0u8; 32];
    let bytes = password.as_bytes();
    for i in 0..32 {
        let mut hasher = DefaultHasher::new();
        i.hash(&mut hasher);
        bytes.hash(&mut hasher);
        key[i] = (hasher.finish() & 0xFF) as u8;
    }
    key
}

#[tauri::command]
pub fn scan_env_files(path: String) -> Result<Vec<EnvFileInfo>, String> {
    let root = Path::new(&path);
    if !root.is_dir() {
        return Err(format!("Path is not a directory: {}", path));
    }

    let mut results: Vec<EnvFileInfo> = Vec::new();

    for entry in WalkDir::new(root)
        .follow_links(false)
        .into_iter()
        .filter_entry(|e| {
            let name = e.file_name().to_string_lossy();
            !matches!(
                name.as_ref(),
                "node_modules" | ".git" | "target" | "dist" | ".next" | "__pycache__"
            )
        })
        .filter_map(|e| e.ok())
    {
        if !entry.file_type().is_file() {
            continue;
        }

        let file_name = entry.file_name().to_string_lossy().to_string();

        if !file_name.starts_with(".env") || file_name.ends_with(".encrypted") {
            continue;
        }

        let metadata = entry.metadata().map_err(|e| e.to_string())?;
        let last_modified = metadata
            .modified()
            .unwrap_or(SystemTime::UNIX_EPOCH)
            .duration_since(SystemTime::UNIX_EPOCH)
            .unwrap_or_default()
            .as_secs();

        results.push(EnvFileInfo {
            path: entry.path().to_string_lossy().to_string(),
            name: file_name.clone(),
            size: metadata.len(),
            last_modified,
            environment: detect_environment(&file_name),
        });
    }

    results.sort_by(|a, b| a.path.cmp(&b.path));
    Ok(results)
}

#[tauri::command]
pub fn read_env_file(path: String) -> Result<Vec<EnvVariable>, String> {
    let content = fs::read_to_string(&path).map_err(|e| format!("Failed to read {}: {}", path, e))?;
    Ok(parse_env_content(&content))
}

#[tauri::command]
pub fn write_env_file(path: String, variables: Vec<EnvVariable>) -> Result<(), String> {
    let mut lines: Vec<String> = Vec::new();

    for var in &variables {
        if var.is_empty && var.key.is_empty() {
            if var.raw_line.is_empty() {
                lines.push(String::new());
            } else {
                lines.push(var.raw_line.clone());
            }
            continue;
        }

        if var.is_comment {
            lines.push(var.raw_line.clone());
            continue;
        }

        if var.has_quotes {
            lines.push(format!("{}=\"{}\"", var.key, var.value));
        } else {
            lines.push(format!("{}={}", var.key, var.value));
        }
    }

    let content = lines.join("\n") + "\n";
    fs::write(&path, content).map_err(|e| format!("Failed to write {}: {}", path, e))
}

#[tauri::command]
pub fn diff_env_files(left: String, right: String) -> Result<Vec<DiffResult>, String> {
    let left_content =
        fs::read_to_string(&left).map_err(|e| format!("Failed to read {}: {}", left, e))?;
    let right_content =
        fs::read_to_string(&right).map_err(|e| format!("Failed to read {}: {}", right, e))?;

    let left_vars = parse_env_content(&left_content);
    let right_vars = parse_env_content(&right_content);

    let right_map: HashMap<String, String> = right_vars
        .iter()
        .filter(|v| !v.is_comment && !v.is_empty && !v.key.is_empty())
        .map(|v| (v.key.clone(), v.value.clone()))
        .collect();

    let mut results: Vec<DiffResult> = Vec::new();
    let mut seen: HashSet<String> = HashSet::new();

    for var in &left_vars {
        if var.is_comment || var.is_empty || var.key.is_empty() || seen.contains(&var.key) {
            continue;
        }
        seen.insert(var.key.clone());

        match right_map.get(&var.key) {
            Some(right_val) => {
                let status = if *right_val == var.value { "same" } else { "changed" };
                results.push(DiffResult {
                    key: var.key.clone(),
                    status: status.into(),
                    left_value: Some(var.value.clone()),
                    right_value: Some(right_val.clone()),
                });
            }
            None => {
                results.push(DiffResult {
                    key: var.key.clone(),
                    status: "removed".into(),
                    left_value: Some(var.value.clone()),
                    right_value: None,
                });
            }
        }
    }

    for var in &right_vars {
        if var.is_comment || var.is_empty || var.key.is_empty() || seen.contains(&var.key) {
            continue;
        }
        seen.insert(var.key.clone());

        results.push(DiffResult {
            key: var.key.clone(),
            status: "added".into(),
            left_value: None,
            right_value: Some(var.value.clone()),
        });
    }

    Ok(results)
}

#[tauri::command]
pub fn validate_env(variables: Vec<EnvVariable>) -> Vec<ValidationIssue> {
    let mut issues: Vec<ValidationIssue> = Vec::new();
    let mut key_counts: HashMap<String, u32> = HashMap::new();

    for var in &variables {
        if !var.is_comment && !var.is_empty && !var.key.is_empty() {
            *key_counts.entry(var.key.clone()).or_insert(0) += 1;
        }
    }

    for var in &variables {
        if var.is_comment || var.is_empty || var.key.is_empty() {
            continue;
        }

        if let Some(&count) = key_counts.get(&var.key) {
            if count > 1 {
                issues.push(ValidationIssue {
                    key: var.key.clone(),
                    value: var.value.clone(),
                    issue_type: "duplicate_key".into(),
                    message: format!("Key '{}' is defined {} times", var.key, count),
                    severity: "error".into(),
                });
            }
        }

        if var.value.is_empty() {
            issues.push(ValidationIssue {
                key: var.key.clone(),
                value: var.value.clone(),
                issue_type: "empty_value".into(),
                message: format!("Key '{}' has an empty value", var.key),
                severity: "warning".into(),
            });
            continue;
        }

        if var.value != var.value.trim() {
            issues.push(ValidationIssue {
                key: var.key.clone(),
                value: var.value.clone(),
                issue_type: "whitespace".into(),
                message: format!("Key '{}' has leading or trailing whitespace in its value", var.key),
                severity: "warning".into(),
            });
        }

        let key_lower = var.key.to_lowercase();
        if key_lower.contains("url") || key_lower.contains("uri") || key_lower.contains("endpoint")
            || key_lower.contains("host") || key_lower.contains("origin")
        {
            if !var.value.starts_with("http://") && !var.value.starts_with("https://")
                && !var.value.starts_with("ws://") && !var.value.starts_with("wss://")
                && !var.value.starts_with("mongodb://") && !var.value.starts_with("mongodb+srv://")
                && !var.value.starts_with("redis://") && !var.value.starts_with("postgres://")
                && !var.value.starts_with("mysql://") && !var.value.starts_with("amqp://")
                && !var.value.contains("localhost") && !var.value.contains("127.0.0.1")
            {
                issues.push(ValidationIssue {
                    key: var.key.clone(),
                    value: var.value.clone(),
                    issue_type: "invalid_url".into(),
                    message: format!("Key '{}' appears to be a URL but has no valid scheme", var.key),
                    severity: "warning".into(),
                });
            }
        }

        if key_lower.contains("port") {
            if let Ok(port) = var.value.parse::<u32>() {
                if port == 0 || port > 65535 {
                    issues.push(ValidationIssue {
                        key: var.key.clone(),
                        value: var.value.clone(),
                        issue_type: "invalid_port".into(),
                        message: format!("Key '{}' has port value {} outside valid range 1-65535", var.key, port),
                        severity: "error".into(),
                    });
                }
            } else {
                issues.push(ValidationIssue {
                    key: var.key.clone(),
                    value: var.value.clone(),
                    issue_type: "invalid_port".into(),
                    message: format!("Key '{}' appears to be a port but is not a number", var.key),
                    severity: "error".into(),
                });
            }
        }
    }

    let mut seen_dupes: HashSet<String> = HashSet::new();
    issues.retain(|issue| {
        if issue.issue_type == "duplicate_key" {
            if seen_dupes.contains(&issue.key) {
                return false;
            }
            seen_dupes.insert(issue.key.clone());
        }
        true
    });

    issues
}

#[tauri::command]
pub fn encrypt_env(path: String, password: String) -> Result<String, String> {
    let content = fs::read_to_string(&path).map_err(|e| format!("Failed to read {}: {}", path, e))?;

    let key_bytes = derive_key(&password);
    let cipher = Aes256Gcm::new_from_slice(&key_bytes).map_err(|e| e.to_string())?;

    let mut nonce_bytes = [0u8; 12];
    OsRng.fill_bytes(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);

    let ciphertext = cipher
        .encrypt(nonce, content.as_bytes())
        .map_err(|e| format!("Encryption failed: {}", e))?;

    let mut combined = Vec::with_capacity(12 + ciphertext.len());
    combined.extend_from_slice(&nonce_bytes);
    combined.extend_from_slice(&ciphertext);

    let encoded = BASE64.encode(&combined);

    let out_path = format!("{}.encrypted", path);
    fs::write(&out_path, &encoded)
        .map_err(|e| format!("Failed to write encrypted file: {}", e))?;

    Ok(out_path)
}

#[tauri::command]
pub fn decrypt_env(path: String, password: String) -> Result<Vec<EnvVariable>, String> {
    let encoded = fs::read_to_string(&path).map_err(|e| format!("Failed to read {}: {}", path, e))?;

    let combined = BASE64
        .decode(encoded.trim())
        .map_err(|e| format!("Invalid base64: {}", e))?;

    if combined.len() < 13 {
        return Err("Encrypted data is too short".into());
    }

    let (nonce_bytes, ciphertext) = combined.split_at(12);
    let key_bytes = derive_key(&password);
    let cipher = Aes256Gcm::new_from_slice(&key_bytes).map_err(|e| e.to_string())?;
    let nonce = Nonce::from_slice(nonce_bytes);

    let plaintext = cipher
        .decrypt(nonce, ciphertext)
        .map_err(|_| "Decryption failed — wrong password or corrupted data".to_string())?;

    let content = String::from_utf8(plaintext).map_err(|e| format!("Invalid UTF-8 after decryption: {}", e))?;

    Ok(parse_env_content(&content))
}

#[tauri::command]
pub fn generate_example(variables: Vec<EnvVariable>) -> String {
    let mut lines: Vec<String> = Vec::new();

    for var in &variables {
        if var.is_empty {
            lines.push(String::new());
            continue;
        }

        if var.is_comment {
            lines.push(var.raw_line.clone());
            continue;
        }

        lines.push(format!("{}=", var.key));
    }

    lines.join("\n") + "\n"
}

#[tauri::command]
pub fn check_gitignore(project_path: String) -> Result<Vec<GitIgnoreStatus>, String> {
    let root = Path::new(&project_path);

    let env_files: Vec<PathBuf> = WalkDir::new(root)
        .follow_links(false)
        .into_iter()
        .filter_entry(|e| {
            let name = e.file_name().to_string_lossy();
            !matches!(
                name.as_ref(),
                "node_modules" | ".git" | "target" | "dist" | ".next" | "__pycache__"
            )
        })
        .filter_map(|e| e.ok())
        .filter(|e| {
            e.file_type().is_file() && e.file_name().to_string_lossy().starts_with(".env")
        })
        .map(|e| e.path().to_path_buf())
        .collect();

    let gitignore_path = root.join(".gitignore");
    let gitignore_patterns: Vec<String> = if gitignore_path.exists() {
        fs::read_to_string(&gitignore_path)
            .unwrap_or_default()
            .lines()
            .map(|l| l.trim().to_string())
            .filter(|l| !l.is_empty() && !l.starts_with('#'))
            .collect()
    } else {
        Vec::new()
    };

    let results: Vec<GitIgnoreStatus> = env_files
        .iter()
        .map(|file_path| {
            let relative = file_path
                .strip_prefix(root)
                .unwrap_or(file_path)
                .to_string_lossy()
                .to_string();

            let file_name = file_path
                .file_name()
                .unwrap_or_default()
                .to_string_lossy()
                .to_string();

            let ignored = gitignore_patterns.iter().any(|pattern| {
                if pattern == &relative || pattern == &file_name {
                    return true;
                }
                if let Some(prefix) = pattern.strip_suffix('*') {
                    if file_name.starts_with(prefix) || relative.starts_with(prefix) {
                        return true;
                    }
                }
                if relative.starts_with(pattern) {
                    return true;
                }
                false
            });

            GitIgnoreStatus { file: relative, ignored }
        })
        .collect();

    Ok(results)
}

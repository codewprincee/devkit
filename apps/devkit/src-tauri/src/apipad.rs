use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Deserialize)]
pub struct SendRequestArgs {
    method: String,
    url: String,
    headers: HashMap<String, String>,
    body: Option<String>,
}

#[derive(Serialize)]
pub struct SendRequestResponse {
    status: u16,
    status_text: String,
    headers: HashMap<String, String>,
    body: String,
    time_ms: f64,
    size: usize,
}

#[tauri::command]
pub async fn send_request(args: SendRequestArgs) -> Result<SendRequestResponse, String> {
    let client = reqwest::Client::new();
    let start = std::time::Instant::now();

    let method = args
        .method
        .parse::<reqwest::Method>()
        .map_err(|e| format!("Invalid method: {}", e))?;

    let mut builder = client.request(method, &args.url);

    for (key, value) in &args.headers {
        builder = builder.header(key.as_str(), value.as_str());
    }

    if let Some(body) = args.body {
        builder = builder.body(body);
    }

    let response = builder.send().await.map_err(|e| format!("Request failed: {}", e))?;
    let elapsed = start.elapsed().as_secs_f64() * 1000.0;

    let status = response.status().as_u16();
    let status_text = response
        .status()
        .canonical_reason()
        .unwrap_or("Unknown")
        .to_string();

    let mut headers = HashMap::new();
    for (key, value) in response.headers() {
        if let Ok(v) = value.to_str() {
            headers.insert(key.to_string(), v.to_string());
        }
    }

    let body = response.text().await.map_err(|e| format!("Failed to read body: {}", e))?;
    let size = body.len();

    Ok(SendRequestResponse {
        status,
        status_text,
        headers,
        body,
        time_ms: elapsed,
        size,
    })
}

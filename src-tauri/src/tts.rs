use std::path::PathBuf;
use tokio::process::Command;
use tokio::time::{sleep, Duration};

const DROPS_DIR: &str = "/var/lib/fort/drops";
const POLL_INTERVAL: Duration = Duration::from_millis(200);
const POLL_TIMEOUT: Duration = Duration::from_secs(15);
const MAX_TEXT_LEN: usize = 500;

/// Synthesize text to speech via Kokoro on lordhenry.
/// Returns base64-encoded mp3 audio data.
pub async fn synthesize(text: &str) -> Result<String, String> {
    let text = if text.len() > MAX_TEXT_LEN {
        &text[..MAX_TEXT_LEN]
    } else {
        text
    };

    let filename = format!("nerve-tts-{}.mp3", std::process::id() as u64 ^ timestamp_nanos());

    let payload = serde_json::json!({
        "text": text,
        "output": {
            "host": "ratched",
            "name": &filename,
        }
    });

    let output = Command::new("fort")
        .args(["lordhenry", "tts", &payload.to_string()])
        .output()
        .await
        .map_err(|e| format!("Failed to run fort: {e}"))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(format!("fort tts failed: {stderr}"));
    }

    // Poll for the output file
    let path = PathBuf::from(DROPS_DIR);
    let mut elapsed = Duration::ZERO;
    let output_path = loop {
        // fort prepends a timestamp, so we search for files ending with our filename
        let matching = find_output_file(&path, &filename).await;
        if let Some(p) = matching {
            break p;
        }
        if elapsed >= POLL_TIMEOUT {
            return Err(format!("TTS timed out waiting for {filename}"));
        }
        sleep(POLL_INTERVAL).await;
        elapsed += POLL_INTERVAL;
    };

    let bytes = tokio::fs::read(&output_path)
        .await
        .map_err(|e| format!("Failed to read TTS output: {e}"))?;

    // Clean up temp file
    let _ = tokio::fs::remove_file(&output_path).await;

    use base64::Engine;
    Ok(base64::engine::general_purpose::STANDARD.encode(&bytes))
}

/// Find a file in the drops directory whose name ends with the given filename.
/// Fort prepends a timestamp like `2026-02-18T04-16-02_`.
async fn find_output_file(dir: &PathBuf, filename: &str) -> Option<PathBuf> {
    let mut entries = tokio::fs::read_dir(dir).await.ok()?;
    while let Ok(Some(entry)) = entries.next_entry().await {
        let name = entry.file_name();
        let name = name.to_string_lossy();
        if name.ends_with(filename) {
            return Some(entry.path());
        }
    }
    None
}

fn timestamp_nanos() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_nanos() as u64
}

use std::path::PathBuf;
use tokio::process::Command;
use tokio::time::{sleep, Duration};

const POLL_INTERVAL: Duration = Duration::from_millis(200);
const POLL_TIMEOUT: Duration = Duration::from_secs(15);
const MAX_TEXT_LEN: usize = 500;

fn drops_dir() -> String {
    std::env::var("NERVE_TTS_DROPS_DIR").unwrap_or_else(|_| "/var/lib/fort/drops".into())
}

fn tts_host() -> String {
    std::env::var("NERVE_TTS_HOST").unwrap_or_else(|_| "localhost".into())
}

fn tts_output_host() -> String {
    std::env::var("NERVE_TTS_OUTPUT_HOST").unwrap_or_else(|_| "localhost".into())
}

/// Synthesize text to speech via fort TTS capability.
/// Returns base64-encoded mp3 audio data.
pub async fn synthesize(text: &str) -> Result<String, String> {
    let text = truncate_text(text);

    let filename = format!("nerve-tts-{}.mp3", std::process::id() as u64 ^ timestamp_nanos());

    let payload = serde_json::json!({
        "text": text,
        "output": {
            "host": tts_output_host(),
            "name": &filename,
        }
    });

    let host = tts_host();
    eprintln!("TTS: calling fort {} tts with {} chars", host, text.len());
    let output = Command::new("fort")
        .args([&host, "tts", &payload.to_string()])
        .output()
        .await
        .map_err(|e| {
            eprintln!("TTS: fort command failed: {}", e);
            format!("Failed to run fort: {e}")
        })?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        let stdout = String::from_utf8_lossy(&output.stdout);
        eprintln!("TTS: fort tts failed with status {:?}", output.status.code());
        eprintln!("TTS: stdout: {}", stdout);
        eprintln!("TTS: stderr: {}", stderr);
        return Err(format!("fort tts failed: {stderr}"));
    }

    // Poll for the output file
    let path = PathBuf::from(drops_dir());
    eprintln!("TTS: polling for output file in {:?} ending with {}", path, filename);
    let mut elapsed = Duration::ZERO;
    let output_path = loop {
        // fort prepends a timestamp, so we search for files ending with our filename
        let matching = find_output_file(&path, &filename).await;
        if let Some(p) = matching {
            eprintln!("TTS: found output file at {:?}", p);
            break p;
        }
        if elapsed >= POLL_TIMEOUT {
            eprintln!("TTS: timeout after {:?} waiting for {}", elapsed, filename);
            return Err(format!("TTS timed out waiting for {filename}"));
        }
        sleep(POLL_INTERVAL).await;
        elapsed += POLL_INTERVAL;
    };

    let bytes = tokio::fs::read(&output_path)
        .await
        .map_err(|e| {
            eprintln!("TTS: failed to read output file: {}", e);
            format!("Failed to read TTS output: {e}")
        })?;

    eprintln!("TTS: read {} bytes from output file", bytes.len());

    // Clean up temp file
    let _ = tokio::fs::remove_file(&output_path).await;

    use base64::Engine;
    let encoded = base64::engine::general_purpose::STANDARD.encode(&bytes);
    eprintln!("TTS: returning {} bytes of base64-encoded audio", encoded.len());
    Ok(encoded)
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

/// Truncate text to the maximum TTS synthesis length.
/// Exposed for testing.
pub fn truncate_text(text: &str) -> &str {
    if text.len() > MAX_TEXT_LEN {
        &text[..MAX_TEXT_LEN]
    } else {
        text
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn truncate_text_returns_unchanged_when_under_limit() {
        let text = "Hello, world!";
        assert_eq!(truncate_text(text), "Hello, world!");
    }

    #[test]
    fn truncate_text_returns_unchanged_when_at_limit() {
        let text = "a".repeat(MAX_TEXT_LEN);
        assert_eq!(truncate_text(&text), text);
    }

    #[test]
    fn truncate_text_truncates_when_over_limit() {
        let text = "a".repeat(MAX_TEXT_LEN + 100);
        let result = truncate_text(&text);
        assert_eq!(result.len(), MAX_TEXT_LEN);
        assert_eq!(result, "a".repeat(MAX_TEXT_LEN));
    }

    #[test]
    fn truncate_text_handles_empty_string() {
        assert_eq!(truncate_text(""), "");
    }

    #[test]
    fn truncate_text_at_boundary() {
        let text = "a".repeat(MAX_TEXT_LEN - 1);
        assert_eq!(truncate_text(&text), text);
    }

    #[tokio::test]
    async fn find_output_file_returns_none_for_nonexistent_dir() {
        let dir = PathBuf::from("/nonexistent/path");
        let result = find_output_file(&dir, "test.mp3").await;
        assert!(result.is_none());
    }

    #[tokio::test]
    async fn find_output_file_matches_suffix() {
        // Create a temporary directory with a test file
        let temp_dir = std::env::temp_dir().join(format!("nerve-tts-test-{}", timestamp_nanos()));
        tokio::fs::create_dir_all(&temp_dir).await.unwrap();

        let filename = "test-output.mp3";
        let timestamped = format!("2026-02-21T10-30-45_{}", filename);
        let file_path = temp_dir.join(&timestamped);
        tokio::fs::write(&file_path, b"test audio data").await.unwrap();

        let result = find_output_file(&temp_dir, filename).await;
        assert!(result.is_some());
        let found_path = result.unwrap();
        assert_eq!(found_path, file_path);

        // Cleanup
        tokio::fs::remove_dir_all(&temp_dir).await.ok();
    }

    #[tokio::test]
    async fn find_output_file_ignores_non_matching_files() {
        // Create a temporary directory with files that don't match
        let temp_dir = std::env::temp_dir().join(format!("nerve-tts-test-{}", timestamp_nanos()));
        tokio::fs::create_dir_all(&temp_dir).await.unwrap();

        let file1 = temp_dir.join("other-file.mp3");
        let file2 = temp_dir.join("2026-02-21T10-30-45_different.mp3");
        tokio::fs::write(&file1, b"audio1").await.unwrap();
        tokio::fs::write(&file2, b"audio2").await.unwrap();

        let result = find_output_file(&temp_dir, "target.mp3").await;
        assert!(result.is_none());

        // Cleanup
        tokio::fs::remove_dir_all(&temp_dir).await.ok();
    }
}

/**
 * Voice recording utilities for compose bar.
 *
 * Pure decision functions for voice message recording workflow.
 */

/**
 * Select the best MIME type for voice recording based on browser support.
 *
 * Prefers audio/webm with opus codec, falls back to plain audio/webm.
 *
 * @returns The MIME type string to use with MediaRecorder
 */
export function selectVoiceMimeType(): string {
  if (typeof MediaRecorder === "undefined") return "audio/webm";

  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/mp4",
  ];
  for (const mime of candidates) {
    if (MediaRecorder.isTypeSupported(mime)) return mime;
  }
  return "audio/webm";
}

/**
 * Determine the file extension for a voice recording based on MIME type.
 *
 * @param mimeType - The MIME type of the recording
 * @returns File extension without the dot (e.g., "webm", "ogg")
 */
export function getVoiceFileExtension(mimeType: string): string {
  if (mimeType.includes("webm")) return "webm";
  if (mimeType.includes("mp4")) return "m4a";
  return "ogg";
}

/**
 * Extract the base MIME type without codec parameters.
 *
 * @param mimeType - Full MIME type string (e.g., "audio/webm;codecs=opus")
 * @returns Base MIME type (e.g., "audio/webm")
 */
export function getBaseMimeType(mimeType: string): string {
  return mimeType.split(";")[0];
}

/**
 * Convert a Blob to a base64-encoded string.
 *
 * @param blob - The Blob to convert
 * @returns Promise resolving to base64 string (without data URI prefix)
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * MIME type inference for image files based on file extension.
 *
 * @param filename - The name of the file
 * @returns MIME type string, or empty string if unknown
 */
export function guessMime(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
  };
  return ext ? (map[ext] ?? "") : "";
}

/**
 * Read a file as base64-encoded data URI and extract the base64 portion.
 *
 * @param file - The file to read
 * @returns Promise resolving to base64 string (without data URI prefix)
 */
export function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip "data:...;base64," prefix
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Short, privacy-friendly fingerprint of a user-agent string: the first 8 bytes
// of its SHA-256, hex-encoded. No cookie, no full UA stored. Used for rough
// de-duplication of scan visits and events. Works on both Edge and Node runtimes.
export async function sha8(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .slice(0, 8)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

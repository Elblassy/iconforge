import pako from "pako";
import type { IconConfig } from "@/types/icon-config";

export function encodeConfig(config: IconConfig): string {
  const stripped = { ...config };
  if (stripped.source.type === "image") {
    stripped.source = { ...stripped.source, imageDataUrl: "" };
  }
  const json = JSON.stringify(stripped);
  const compressed = pako.deflate(json);
  const base64 = btoa(String.fromCharCode(...compressed));
  return encodeURIComponent(base64);
}

export function decodeConfig(encoded: string): IconConfig | null {
  try {
    const base64 = decodeURIComponent(encoded);
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const json = pako.inflate(bytes, { to: "string" });
    return JSON.parse(json) as IconConfig;
  } catch {
    return null;
  }
}

export function buildShareUrl(config: IconConfig): string | null {
  const encoded = encodeConfig(config);
  const url = `${window.location.origin}?config=${encoded}`;
  return url.length > 4000 ? null : url;
}

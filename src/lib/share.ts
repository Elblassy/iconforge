import pako from "pako";
import type { IconConfig } from "@/types/icon-config";

export function encodeConfig(config: IconConfig): string {
  const stripped = { ...config };
  if (stripped.source.type === "image") {
    stripped.source = { ...stripped.source, imageDataUrl: "" };
  }
  if (stripped.logoOverlay?.imageDataUrl) {
    stripped.logoOverlay = { ...stripped.logoOverlay, imageDataUrl: "" };
  }
  const json = JSON.stringify(stripped);
  const compressed = pako.deflate(json);
  const base64 = btoa(String.fromCharCode(...compressed));
  return encodeURIComponent(base64);
}

function isValidConfig(obj: unknown): obj is IconConfig {
  if (!obj || typeof obj !== "object") return false;
  const o = obj as Record<string, unknown>;
  return (
    typeof o.odooVersion === "string" &&
    typeof o.backgroundColor === "string" &&
    typeof o.iconColor === "string" &&
    typeof o.iconWidth === "number" &&
    typeof o.fontSize === "number" &&
    typeof o.fontWeight === "number" &&
    o.source !== undefined &&
    typeof (o.source as Record<string, unknown>).type === "string"
  );
}

export function decodeConfig(encoded: string): IconConfig | null {
  try {
    const base64 = decodeURIComponent(encoded);
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const json = pako.inflate(bytes, { to: "string" });
    const parsed: unknown = JSON.parse(json);
    if (!isValidConfig(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function buildShareUrl(config: IconConfig): string | null {
  const encoded = encodeConfig(config);
  const url = `${window.location.origin}?config=${encoded}`;
  return url.length > 4000 ? null : url;
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { buildShareUrl } from "@/lib/share";
import type { IconConfig } from "@/types/icon-config";

interface ExportPanelProps {
  config: IconConfig;
}

type CopyStatus = "idle" | "copied" | "too-long";

export function ExportPanel({ config }: ExportPanelProps) {
  const [status, setStatus] = useState<CopyStatus>("idle");

  async function handleShareLink() {
    const url = buildShareUrl(config);
    if (!url) {
      setStatus("too-long");
      setTimeout(() => setStatus("idle"), 3000);
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setStatus("copied");
    } catch {
      // Fallback: open the URL so the user can copy from address bar
      window.open(url, "_self");
      setStatus("copied");
    }
    setTimeout(() => setStatus("idle"), 3000);
  }

  return (
    <div className="space-y-1">
      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={handleShareLink}
      >
        Share Link
      </Button>
      {status === "copied" && (
        <p className="text-center text-xs text-green-600 dark:text-green-400">
          Link copied!
        </p>
      )}
      {status === "too-long" && (
        <p className="text-center text-xs text-destructive">
          URL too long — try removing uploaded image
        </p>
      )}
    </div>
  );
}

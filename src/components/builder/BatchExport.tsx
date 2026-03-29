"use client";
import { useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import type { IconConfig, OdooVersion } from "@/types/icon-config";
import { IconRenderer } from "@/lib/icon-renderer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const ALL_VERSIONS: OdooVersion[] = ["16.0", "17.0", "18.0", "19.0"];
const ALL_SIZES: number[] = [128, 256, 512];

interface BatchExportProps {
  config: IconConfig;
}

export function BatchExport({ config }: BatchExportProps) {
  const [selectedVersions, setSelectedVersions] = useState<OdooVersion[]>([
    config.odooVersion,
  ]);
  const [selectedSizes, setSelectedSizes] = useState<number[]>([512]);
  const [exporting, setExporting] = useState(false);

  function toggleVersion(v: OdooVersion) {
    setSelectedVersions((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    );
  }

  function toggleSize(s: number) {
    setSelectedSizes((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  const totalCount = selectedVersions.length * selectedSizes.length;
  const isDisabled =
    exporting || selectedVersions.length === 0 || selectedSizes.length === 0;

  async function handleDownloadZip() {
    setExporting(true);
    try {
      const zip = new JSZip();
      const renderer = new IconRenderer();

      for (const version of selectedVersions) {
        for (const size of selectedSizes) {
          const renderConfig: IconConfig = {
            ...config,
            odooVersion: version,
            iconWidth: size,
          };

          let canvas: HTMLCanvasElement;

          if (
            renderConfig.source.type === "image" &&
            renderConfig.source.imageDataUrl
          ) {
            canvas = await new Promise<HTMLCanvasElement>((resolve) => {
              const img = new Image();
              img.onload = () => {
                resolve(renderer.renderWithImage(renderConfig, img));
              };
              img.onerror = () => {
                resolve(renderer.render(renderConfig));
              };
              img.src =
                renderConfig.source.type === "image"
                  ? renderConfig.source.imageDataUrl
                  : "";
            });
          } else {
            canvas = renderer.render(renderConfig);
          }

          const blob = await new Promise<Blob | null>((resolve) =>
            canvas.toBlob((b) => resolve(b), "image/png")
          );
          if (!blob) continue;

          zip.file(`odoo-${version}-${size}px.png`, blob);
        }
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, "odoo-icons.zip");
    } finally {
      setExporting(false);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Batch Export
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Batch Export</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-5 pt-2">
          {/* Versions section */}
          <div>
            <p className="text-sm font-medium mb-2">Versions</p>
            <div className="flex flex-wrap gap-2">
              {ALL_VERSIONS.map((v) => (
                <Button
                  key={v}
                  variant={selectedVersions.includes(v) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleVersion(v)}
                >
                  {v}
                </Button>
              ))}
            </div>
          </div>

          {/* Sizes section */}
          <div>
            <p className="text-sm font-medium mb-2">Sizes</p>
            <div className="flex flex-wrap gap-2">
              {ALL_SIZES.map((s) => (
                <Button
                  key={s}
                  variant={selectedSizes.includes(s) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleSize(s)}
                >
                  {s}px
                </Button>
              ))}
            </div>
          </div>

          {/* Count */}
          <p className="text-sm text-muted-foreground">
            {totalCount} icon{totalCount !== 1 ? "s" : ""} will be exported
          </p>

          {/* Download button */}
          <Button onClick={handleDownloadZip} disabled={isDisabled}>
            {exporting ? "Exporting…" : "Download ZIP"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

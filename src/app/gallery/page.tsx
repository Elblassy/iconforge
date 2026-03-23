"use client";
import { IconGrid } from "@/components/gallery/IconGrid";

export default function GalleryPage() {
  return (
    <div className="container mx-auto max-w-5xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Saved Icons</h1>
      <IconGrid />
    </div>
  );
}

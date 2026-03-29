"use client";

/* eslint-disable @next/next/no-img-element */

export function Footer() {
  return (
    <footer className="border-t border-border bg-background/95 backdrop-blur">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span>Powered by</span>
          <a
            href="https://elblasy.app"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 font-semibold text-foreground hover:text-primary transition-colors"
          >
            <img
              src="/elblasy-logo.png"
              alt="elblasy.app"
              width={20}
              height={20}
              className="rounded"
            />
            elblasy.app
          </a>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://elblasy.app"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Website
          </a>
          <span className="text-border">|</span>
          <span>IconForge &copy; {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}

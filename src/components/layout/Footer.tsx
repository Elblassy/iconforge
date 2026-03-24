"use client";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background/95 backdrop-blur">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <span>Built with</span>
          <span className="text-red-500">&#9829;</span>
          <span>by</span>
          <a
            href="https://elblasy.app"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary hover:underline"
          >
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
          <span>Odoo Icon Builder &copy; {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}

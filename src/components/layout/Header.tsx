"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

export function Header() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Builder" },
    { href: "/gallery", label: "Gallery" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-4">
        {/* App logo + title */}
        <div className="flex flex-1 items-center gap-2">
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            {/* App icon — 4 colored squares */}
            <svg width="28" height="28" viewBox="0 0 32 32" className="shrink-0">
              <rect width="32" height="32" rx="7" fill="#714BC2"/>
              <rect x="6" y="6" width="9" height="9" rx="2" fill="#985184"/>
              <rect x="17" y="6" width="9" height="9" rx="2" fill="#FBB945"/>
              <rect x="6" y="17" width="9" height="9" rx="2" fill="#1AD3BB"/>
              <rect x="17" y="17" width="9" height="9" rx="2" fill="#F86126"/>
            </svg>
            <span className="text-base font-semibold tracking-tight">
              IconForge
            </span>
          </Link>
        </div>

        {/* Nav links — centered, hidden on mobile */}
        <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {navLinks.map(({ href, label }) => {
            const isActive =
              href === "/"
                ? pathname === "/"
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={[
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                ].join(" ")}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right side: Powered by + ThemeToggle */}
        <div className="flex flex-1 items-center justify-end gap-3">
          <a
            href="https://elblasy.app"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-primary hover:border-primary"
          >
            Powered by
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/elblasy-logo.png" alt="" width={16} height={16} className="rounded-sm" />
            <span className="font-semibold text-foreground">elblasy.app</span>
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

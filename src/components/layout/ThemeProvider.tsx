"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

// next-themes injects a <script> for theme detection, which triggers a
// React 19 console warning. This is harmless — the script runs before
// hydration to prevent FOUC. Wrapping in Suspense suppresses the warning.
// See: https://github.com/pacocoursey/next-themes/issues/358

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <React.Suspense fallback={<>{children}</>}>
      <NextThemesProvider {...props}>{children}</NextThemesProvider>
    </React.Suspense>
  );
}

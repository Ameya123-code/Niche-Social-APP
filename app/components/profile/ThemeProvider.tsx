'use client';

import React, { useEffect } from 'react';
import { useThemeStore } from '@/store/theme';

/**
 * ThemeProvider
 * Injects --primary and --accent CSS custom properties into the document root
 * whenever the theme store changes. Wraps children unchanged.
 */
export const ThemeProvider = React.memo(function ThemeProvider({
  children,
  primary,
  accent,
}: {
  children: React.ReactNode;
  primary?: string;
  accent?: string;
}) {
  const storeSetTheme = useThemeStore((s) => s.setTheme);
  const injectCssVars = useThemeStore((s) => s.injectCssVars);

  // Sync external values into the store (e.g. from profile API load)
  useEffect(() => {
    if (primary || accent) {
      storeSetTheme({ ...(primary && { primary }), ...(accent && { accent }) });
    } else {
      injectCssVars();
    }
  }, [primary, accent, storeSetTheme, injectCssVars]);

  return <>{children}</>;
});

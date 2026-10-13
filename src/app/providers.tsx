'use client';

import { CssBaseline, ThemeProvider } from '@mui/material';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import type { ReactNode } from 'react';
import rtlPlugin from 'stylis-plugin-rtl';

import { theme } from '@/shared/theme/theme';

const cacheOptions = { key: 'muirtl', stylisPlugins: [rtlPlugin] };

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AppRouterCacheProvider options={cacheOptions}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}

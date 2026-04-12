'use client';

import React, { useMemo } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { store, RootState } from '@/store';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { useSelector } from 'react-redux';
import { createFinalEntryTheme } from '@/lib/theme';
import { Auth0Provider } from '@auth0/nextjs-auth0/client';

// Inner component to access Redux state for theme
function MuiThemeWrapper({ children }: { children: React.ReactNode }) {
  const { mode, accentColor } = useSelector((state: RootState) => state.theme);
  const theme = useMemo(
    () => createFinalEntryTheme(mode, accentColor),
    [mode, accentColor]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Auth0Provider>
      <ReduxProvider store={store}>
        <MuiThemeWrapper>{children}</MuiThemeWrapper>
      </ReduxProvider>
    </Auth0Provider>
  );
}

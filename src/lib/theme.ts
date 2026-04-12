import { createTheme, ThemeOptions } from '@mui/material/styles';

// ─── Design Tokens ───────────────────────────────────────────────────────────
export const tokens = {
  obsidian: '#0B0B0F',
  citrus: '#C6F135',
  chalk: '#F6F3EC',
  navy: '#1A1A2E',
  danger: '#E63946',
  border: '#2D2D3A',
  surfaceDark: '#141418',
  surfaceMid: '#1E1E26',
  white: '#FFFFFF',
};

// ─── Shared Typography ───────────────────────────────────────────────────────
const typography: ThemeOptions['typography'] = {
  fontFamily: '"Space Grotesk", "Helvetica Neue", sans-serif',
  h1: {
    fontFamily: '"Cormorant Garamond", Georgia, serif',
    fontWeight: 700,
    letterSpacing: '-0.02em',
  },
  h2: {
    fontFamily: '"Cormorant Garamond", Georgia, serif',
    fontWeight: 700,
    letterSpacing: '-0.02em',
  },
  h3: {
    fontFamily: '"Cormorant Garamond", Georgia, serif',
    fontWeight: 600,
  },
  h4: {
    fontFamily: '"Space Grotesk", sans-serif',
    fontWeight: 700,
    letterSpacing: '-0.01em',
  },
  h5: { fontWeight: 600 },
  h6: { fontWeight: 600 },
  button: {
    fontFamily: '"Space Grotesk", sans-serif',
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },
};

// ─── Dark Theme (Luxury Guardian — Default) ───────────────────────────────────
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: tokens.citrus,
      contrastText: tokens.obsidian,
    },
    secondary: {
      main: tokens.chalk,
      contrastText: tokens.obsidian,
    },
    error: { main: tokens.danger },
    background: {
      default: tokens.obsidian,
      paper: tokens.surfaceMid,
    },
    text: {
      primary: tokens.chalk,
      secondary: 'rgba(246,243,236,0.6)',
    },
    divider: tokens.border,
  },
  typography,
  shape: { borderRadius: 2 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          padding: '12px 28px',
          fontSize: '0.8rem',
          transition: 'all 0.2s ease',
          '&.MuiButton-containedPrimary': {
            background: tokens.citrus,
            color: tokens.obsidian,
            '&:hover': {
              background: '#b8e020',
              transform: 'translateY(-1px)',
              boxShadow: `0 8px 24px rgba(198,241,53,0.3)`,
            },
          },
          '&.MuiButton-outlinedPrimary': {
            borderColor: tokens.citrus,
            color: tokens.citrus,
            '&:hover': {
              borderColor: tokens.citrus,
              background: 'rgba(198,241,53,0.08)',
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          background: tokens.surfaceMid,
          border: `1px solid ${tokens.border}`,
          borderRadius: 4,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 2 },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: `rgba(11,11,15,0.85)`,
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${tokens.border}`,
          boxShadow: 'none',
        },
      },
    },
  },
});

// ─── Light Theme (Day Mode) ───────────────────────────────────────────────────
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0B6E4F', // deep forest green — warm light mode
      contrastText: tokens.white,
    },
    secondary: {
      main: tokens.citrus,
      contrastText: tokens.obsidian,
    },
    error: { main: tokens.danger },
    background: {
      default: tokens.chalk,
      paper: tokens.white,
    },
    text: {
      primary: tokens.navy,
      secondary: 'rgba(26,26,46,0.65)',
    },
    divider: '#E0DDD5',
  },
  typography,
  shape: { borderRadius: 2 },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: `rgba(246,243,236,0.92)`,
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid #E0DDD5`,
          boxShadow: 'none',
          color: tokens.navy,
        },
      },
    },
  },
});

// ─── Theme Factory (for runtime custom themes from DB) ───────────────────────
export type ThemeMode = 'dark' | 'light';

export function createFinalEntryTheme(
  mode: ThemeMode = 'dark',
  accentColor?: string
) {
  const base = mode === 'dark' ? darkTheme : lightTheme;

  if (!accentColor) return base;

  return createTheme(base, {
    palette: {
      primary: {
        main: accentColor,
        contrastText: tokens.obsidian,
      },
    },
  });
}

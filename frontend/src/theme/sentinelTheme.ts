/**
 * SENTINEL ENTERPRISE Theme Configuration
 * Professional B2B Design System
 */

import { createTheme, ThemeOptions } from '@mui/material/styles';

// Brand Colors - Professional Enterprise Palette
const brandColors = {
  primary: {
    main: '#1a237e',      // Deep Navy Blue - Authority & Trust
    light: '#534bae',     // Lighter Navy
    dark: '#000051',      // Darker Navy
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#00838f',      // Teal - Technology & Innovation
    light: '#4fb3bf',     // Light Teal
    dark: '#005662',      // Dark Teal
    contrastText: '#ffffff',
  },
  accent: {
    gold: '#ffa726',      // Premium Gold
    silver: '#90a4ae',    // Professional Silver
    bronze: '#a1887f',    // Elegant Bronze
  },
  status: {
    critical: '#d32f2f',  // Critical Red
    high: '#f57c00',      // High Orange
    medium: '#fbc02d',    // Medium Yellow
    low: '#388e3c',       // Low Green
    info: '#0288d1',      // Info Blue
  },
  background: {
    default: '#fafafa',   // Light Gray Background
    paper: '#ffffff',     // White Cards
    dark: '#121212',      // Dark Mode Background
    darkPaper: '#1e1e1e', // Dark Mode Cards
  },
  text: {
    primary: '#212121',   // Almost Black
    secondary: '#757575', // Medium Gray
    disabled: '#bdbdbd',  // Light Gray
    hint: '#9e9e9e',      // Hint Gray
  },
};

// Typography - Professional & Readable
const typography = {
  fontFamily: [
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
  ].join(','),
  h1: {
    fontSize: '2.5rem',
    fontWeight: 700,
    letterSpacing: '-0.02em',
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 600,
    letterSpacing: '-0.01em',
  },
  h3: {
    fontSize: '1.75rem',
    fontWeight: 600,
    letterSpacing: '-0.01em',
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 600,
  },
  h5: {
    fontSize: '1.25rem',
    fontWeight: 600,
  },
  h6: {
    fontSize: '1rem',
    fontWeight: 600,
  },
  subtitle1: {
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.75,
  },
  subtitle2: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.57,
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.75,
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.57,
  },
  button: {
    fontSize: '0.875rem',
    fontWeight: 600,
    textTransform: 'none' as const,
  },
  caption: {
    fontSize: '0.75rem',
    lineHeight: 1.66,
  },
  overline: {
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
  },
};

// Spacing & Layout
const spacing = 8; // 8px base unit

// Border Radius
const shape = {
  borderRadius: 8,
};

// Shadows - Subtle & Professional
const shadows = [
  'none',
  '0px 1px 3px rgba(0, 0, 0, 0.12)',
  '0px 2px 4px rgba(0, 0, 0, 0.12)',
  '0px 3px 6px rgba(0, 0, 0, 0.12)',
  '0px 4px 8px rgba(0, 0, 0, 0.12)',
  '0px 6px 12px rgba(0, 0, 0, 0.12)',
  '0px 8px 16px rgba(0, 0, 0, 0.12)',
  '0px 10px 20px rgba(0, 0, 0, 0.12)',
  '0px 12px 24px rgba(0, 0, 0, 0.12)',
  '0px 14px 28px rgba(0, 0, 0, 0.12)',
  '0px 16px 32px rgba(0, 0, 0, 0.12)',
  '0px 18px 36px rgba(0, 0, 0, 0.12)',
  '0px 20px 40px rgba(0, 0, 0, 0.12)',
  '0px 22px 44px rgba(0, 0, 0, 0.12)',
  '0px 24px 48px rgba(0, 0, 0, 0.12)',
  '0px 26px 52px rgba(0, 0, 0, 0.12)',
  '0px 28px 56px rgba(0, 0, 0, 0.12)',
  '0px 30px 60px rgba(0, 0, 0, 0.12)',
  '0px 32px 64px rgba(0, 0, 0, 0.12)',
  '0px 34px 68px rgba(0, 0, 0, 0.12)',
  '0px 36px 72px rgba(0, 0, 0, 0.12)',
  '0px 38px 76px rgba(0, 0, 0, 0.12)',
  '0px 40px 80px rgba(0, 0, 0, 0.12)',
  '0px 42px 84px rgba(0, 0, 0, 0.12)',
  '0px 44px 88px rgba(0, 0, 0, 0.12)',
];

// Component Overrides
const components = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 6,
        padding: '10px 24px',
        fontSize: '0.875rem',
        fontWeight: 600,
        textTransform: 'none' as const,
        boxShadow: 'none',
        '&:hover': {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
        },
      },
      contained: {
        '&:hover': {
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.2)',
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
        '&:hover': {
          boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.12)',
        },
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 6,
        },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 6,
        fontWeight: 500,
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.08)',
      },
    },
  },
};

// Light Theme Configuration
const lightThemeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: brandColors.primary,
    secondary: brandColors.secondary,
    background: {
      default: brandColors.background.default,
      paper: brandColors.background.paper,
    },
    text: brandColors.text,
    error: {
      main: brandColors.status.critical,
    },
    warning: {
      main: brandColors.status.medium,
    },
    info: {
      main: brandColors.status.info,
    },
    success: {
      main: brandColors.status.low,
    },
  },
  typography,
  spacing,
  shape,
  shadows: shadows as any,
  components,
};

// Dark Theme Configuration
const darkThemeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      ...brandColors.primary,
      main: '#5c6bc0', // Lighter for dark mode
    },
    secondary: {
      ...brandColors.secondary,
      main: '#26c6da', // Lighter for dark mode
    },
    background: {
      default: brandColors.background.dark,
      paper: brandColors.background.darkPaper,
    },
    text: {
      primary: '#ffffff',
      secondary: '#b0bec5',
      disabled: '#78909c',
    },
    error: {
      main: '#ef5350',
    },
    warning: {
      main: '#ffb74d',
    },
    info: {
      main: '#4fc3f7',
    },
    success: {
      main: '#66bb6a',
    },
  },
  typography,
  spacing,
  shape,
  shadows: shadows as any,
  components,
};

// Create Themes
export const lightTheme = createTheme(lightThemeOptions);
export const darkTheme = createTheme(darkThemeOptions);

// Export brand colors for direct usage
export { brandColors };

// Default export
export default lightTheme;

import { createTheme } from '@mantine/core';

export const theme = createTheme({
  /** Theme configuration */
  primaryColor: 'blue',
  fontFamily: 'Inter, sans-serif',
  defaultRadius: 'md',

  colors: {
    // Professional blue palette - modern and executive-focused
    blue: [
      '#E8F4FD',
      '#D1E9FB',
      '#A3D3F7',
      '#75BDF3',
      '#47A7EF',
      '#2563EB', // Primary - professional blue
      '#1E4FD8',
      '#173BC5',
      '#1027B2',
      '#0A139F',
    ],
    // Sophisticated purple accent for highlights
    violet: [
      '#F5F3FF',
      '#EDE9FE',
      '#DDD6FE',
      '#C4B5FD',
      '#A78BFA',
      '#8B5CF6', // Accent purple
      '#7C3AED',
      '#6D28D9',
      '#5B21B6',
      '#4C1D95',
    ],
    // Keep cyan for specific highlights if needed
    cyan: [
      '#E6FCFF',
      '#B8F5FF',
      '#8AEDFF',
      '#5CE4FF',
      '#2EDBFF',
      '#2563EB',
      '#00B8E6',
      '#009FCC',
      '#0085B3',
      '#006B99',
    ],
  },

  // True black for dark mode
  black: '#000000',
  white: '#FFFFFF',

  other: {
    // High contrast values
    highContrastText: '#FFFFFF',
    trueBlack: '#000000',
    // New professional accent colors
    primaryBlue: '#2563EB',
    accentPurple: '#8B5CF6',
  },
});

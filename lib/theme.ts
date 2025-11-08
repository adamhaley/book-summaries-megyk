import { createTheme } from '@mantine/core';

export const theme = createTheme({
  /** Theme configuration */
  primaryColor: 'cyan',
  fontFamily: 'Inter, sans-serif',
  defaultRadius: 'md',

  colors: {
    // High-contrast cyan for primary actions
    cyan: [
      '#E6FCFF',
      '#B8F5FF',
      '#8AEDFF',
      '#5CE4FF',
      '#2EDBFF',
      '#00D2FF', // Primary - vibrant cyan
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
  },
});

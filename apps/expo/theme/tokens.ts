/**
 * Megyk Books Design Tokens
 *
 * Centralized design system with colors, typography, spacing, and other tokens
 * Based on the Megyk brand identity from NATIVEWIND-PIVOT-PRD.md
 */

export const colors = {
  // Brand colors
  primary: {
    DEFAULT: '#264653',
    50: '#e8f0f2',
    100: '#c1d8de',
    200: '#9ac0ca',
    300: '#73a8b6',
    400: '#4c90a2',
    500: '#264653', // Primary
    600: '#1f3a44',
    700: '#182d35',
    800: '#112126',
    900: '#0a1417',
  },
  secondary: {
    DEFAULT: '#2A9D8F',
    50: '#e8f7f5',
    100: '#c5e9e4',
    200: '#a2dbd3',
    300: '#7fcdc2',
    400: '#5cbfb1',
    500: '#2A9D8F', // Secondary
    600: '#227e72',
    700: '#1a5e55',
    800: '#123f38',
    900: '#0a1f1c',
  },
  accent: {
    DEFAULT: '#E76F51',
    light: '#F4A261',
    50: '#fef3f0',
    100: '#fce0d6',
    200: '#facdbc',
    300: '#f8baa2',
    400: '#f6a788',
    500: '#E76F51', // Accent
    600: '#e34a28',
    700: '#c33d1f',
    800: '#9a3018',
    900: '#712211',
  },
  neutral: {
    light: '#E9C46A',
    50: '#fdfaf3',
    100: '#f9f1db',
    200: '#f5e8c3',
    300: '#f1dfab',
    400: '#EDD693',
    500: '#E9C46A', // Neutral Light
    600: '#ddb042',
    700: '#b68d2a',
    800: '#8f6b1f',
    900: '#684a14',
  },
  // UI colors
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
  // Semantic colors
  success: {
    light: '#D1FAE5',
    DEFAULT: '#10B981',
    dark: '#065F46',
  },
  warning: {
    light: '#FEF3C7',
    DEFAULT: '#F59E0B',
    dark: '#92400E',
  },
  error: {
    light: '#FEE2E2',
    DEFAULT: '#EF4444',
    dark: '#991B1B',
  },
  info: {
    light: '#DBEAFE',
    DEFAULT: '#3B82F6',
    dark: '#1E40AF',
  },
} as const;

export const typography = {
  fonts: {
    heading: 'System', // Will be replaced with custom fonts
    body: 'System',
    mono: 'Courier',
  },
  fontSizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
    '7xl': 72,
    '8xl': 96,
    '9xl': 128,
  },
  fontWeights: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  lineHeights: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },
  letterSpacing: {
    tighter: -0.05,
    tight: -0.025,
    normal: 0,
    wide: 0.025,
    wider: 0.05,
    widest: 0.1,
  },
} as const;

export const spacing = {
  0: 0,
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  5: 20,
  6: 24,
  7: 28,
  8: 32,
  9: 36,
  10: 40,
  12: 48,
  16: 64,
  20: 80,
  24: 96,
  32: 128,
  40: 160,
  48: 192,
  56: 224,
  64: 256,
} as const;

export const borderRadius = {
  none: 0,
  sm: 2,
  DEFAULT: 4,
  md: 6,
  lg: 8,
  xl: 12,
  '2xl': 16,
  '3xl': 24,
  full: 9999,
} as const;

export const shadows = {
  none: 'none',
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  DEFAULT: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 25,
    elevation: 12,
  },
  '2xl': {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.15,
    shadowRadius: 50,
    elevation: 16,
  },
} as const;

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export const opacity = {
  0: 0,
  5: 0.05,
  10: 0.1,
  20: 0.2,
  25: 0.25,
  30: 0.3,
  40: 0.4,
  50: 0.5,
  60: 0.6,
  70: 0.7,
  75: 0.75,
  80: 0.8,
  90: 0.9,
  95: 0.95,
  100: 1,
} as const;

export const zIndex = {
  0: 0,
  10: 10,
  20: 20,
  30: 30,
  40: 40,
  50: 50,
  auto: 'auto',
} as const;

// Component-specific tokens
export const components = {
  button: {
    height: {
      sm: 32,
      md: 40,
      lg: 48,
      xl: 56,
    },
    paddingX: {
      sm: spacing[3],
      md: spacing[4],
      lg: spacing[6],
      xl: spacing[8],
    },
    borderRadius: borderRadius.md,
  },
  input: {
    height: {
      sm: 32,
      md: 40,
      lg: 48,
    },
    paddingX: {
      sm: spacing[2],
      md: spacing[3],
      lg: spacing[4],
    },
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  card: {
    padding: spacing[4],
    borderRadius: borderRadius.lg,
    shadow: shadows.md,
  },
  modal: {
    borderRadius: borderRadius.xl,
    padding: spacing[6],
  },
  badge: {
    paddingX: spacing[2],
    paddingY: spacing[1],
    borderRadius: borderRadius.full,
    fontSize: typography.fontSizes.xs,
  },
} as const;

// Export the complete theme
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  breakpoints,
  opacity,
  zIndex,
  components,
} as const;

export default theme;

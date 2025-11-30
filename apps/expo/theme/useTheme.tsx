import React, { createContext, useContext, ReactNode } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import { theme as defaultTheme } from './tokens';

type ColorScheme = 'light' | 'dark';
type Theme = typeof defaultTheme;

interface ThemeContextValue {
  theme: Theme;
  colorScheme: ColorScheme;
  isDark: boolean;
  toggleColorScheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useRNColorScheme();
  const [colorScheme, setColorScheme] = React.useState<ColorScheme>(
    systemColorScheme === 'dark' ? 'dark' : 'light'
  );

  const toggleColorScheme = () => {
    setColorScheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const value: ThemeContextValue = {
    theme: defaultTheme,
    colorScheme,
    isDark: colorScheme === 'dark',
    toggleColorScheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

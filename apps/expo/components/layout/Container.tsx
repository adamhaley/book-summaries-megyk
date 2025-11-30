import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

export interface ContainerProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  center?: boolean;
  style?: ViewStyle;
}

/**
 * Container component with max-width constraints
 * Centers content and applies responsive padding
 */
export function Container({
  children,
  size = 'lg',
  padding = 'md',
  center = true,
  style,
}: ContainerProps) {
  const { theme } = useTheme();

  const maxWidths: number | string = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    full: '100%',
  }[size];

  const paddingValues = {
    none: 0,
    sm: theme.spacing[2],
    md: theme.spacing[4],
    lg: theme.spacing[6],
    xl: theme.spacing[8],
  }[padding];

  return (
    <View
      style={[
        {
          width: '100%',
          ...(typeof maxWidths === 'number' ? { maxWidth: maxWidths } : {}),
          paddingHorizontal: paddingValues,
          paddingVertical: paddingValues,
          alignSelf: center ? 'center' : 'auto',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

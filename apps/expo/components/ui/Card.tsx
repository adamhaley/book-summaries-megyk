import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  style?: ViewStyle;
}

export function Card({ 
  children, 
  variant = 'elevated',
  padding = 'md',
  style 
}: CardProps) {
  const { theme } = useTheme();

  const paddingStyles = {
    none: 0,
    sm: theme.spacing[2],
    md: theme.spacing[4],
    lg: theme.spacing[6],
  }[padding];

  const variantStyles = () => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: '#FFFFFF',
          borderWidth: 0,
          ...theme.shadows.md,
        };
      case 'outlined':
        return {
          backgroundColor: '#FFFFFF',
          borderWidth: 1,
          borderColor: theme.colors.gray[200],
        };
      case 'filled':
        return {
          backgroundColor: theme.colors.gray[50],
          borderWidth: 0,
        };
    }
  };

  return (
    <View
      style={[
        {
          borderRadius: theme.borderRadius.lg,
          padding: paddingStyles,
          ...variantStyles(),
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../theme';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
}

export function Badge({ 
  children, 
  variant = 'primary',
  size = 'md' 
}: BadgeProps) {
  const { theme } = useTheme();

  const sizeStyles = {
    sm: {
      paddingVertical: 2,
      paddingHorizontal: 6,
      fontSize: 10,
    },
    md: {
      paddingVertical: 4,
      paddingHorizontal: 8,
      fontSize: 12,
    },
    lg: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      fontSize: 14,
    },
  }[size];

  const variantStyles = {
    primary: {
      backgroundColor: theme.colors.primary[100],
      textColor: theme.colors.primary[700],
    },
    secondary: {
      backgroundColor: theme.colors.secondary[100],
      textColor: theme.colors.secondary[700],
    },
    accent: {
      backgroundColor: theme.colors.accent[100],
      textColor: theme.colors.accent[700],
    },
    success: {
      backgroundColor: theme.colors.success.light,
      textColor: theme.colors.success.dark,
    },
    warning: {
      backgroundColor: theme.colors.warning.light,
      textColor: theme.colors.warning.dark,
    },
    error: {
      backgroundColor: theme.colors.error.light,
      textColor: theme.colors.error.dark,
    },
    neutral: {
      backgroundColor: theme.colors.gray[100],
      textColor: theme.colors.gray[700],
    },
  }[variant];

  return (
    <View
      style={{
        backgroundColor: variantStyles.backgroundColor,
        paddingVertical: sizeStyles.paddingVertical,
        paddingHorizontal: sizeStyles.paddingHorizontal,
        borderRadius: theme.borderRadius.full,
        alignSelf: 'flex-start',
      }}
    >
      <Text
        style={{
          color: variantStyles.textColor,
          fontSize: sizeStyles.fontSize,
          fontWeight: '600',
        }}
      >
        {children}
      </Text>
    </View>
  );
}

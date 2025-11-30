import React from 'react';
import { Pressable, Text, ActivityIndicator, View } from 'react-native';
import { useTheme } from '../../theme';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
}: ButtonProps) {
  const { theme } = useTheme();
  
  const isDisabled = disabled || loading;

  // Size styles
  const sizeStyles = {
    sm: {
      height: theme.components.button.height.sm,
      paddingHorizontal: 12,
      fontSize: 14,
    },
    md: {
      height: theme.components.button.height.md,
      paddingHorizontal: 16,
      fontSize: 16,
    },
    lg: {
      height: theme.components.button.height.lg,
      paddingHorizontal: 20,
      fontSize: 18,
    },
    xl: {
      height: theme.components.button.height.xl,
      paddingHorizontal: 24,
      fontSize: 20,
    },
  }[size];

  // Variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: theme.colors.primary.DEFAULT,
          borderColor: theme.colors.primary.DEFAULT,
          textColor: '#FFFFFF',
        };
      case 'secondary':
        return {
          backgroundColor: theme.colors.secondary.DEFAULT,
          borderColor: theme.colors.secondary.DEFAULT,
          textColor: '#FFFFFF',
        };
      case 'accent':
        return {
          backgroundColor: theme.colors.accent.DEFAULT,
          borderColor: theme.colors.accent.DEFAULT,
          textColor: '#FFFFFF',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: theme.colors.primary.DEFAULT,
          textColor: theme.colors.primary.DEFAULT,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          textColor: theme.colors.primary.DEFAULT,
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      style={({ pressed }) => ({
        height: sizeStyles.height,
        paddingHorizontal: sizeStyles.paddingHorizontal,
        backgroundColor: isDisabled 
          ? theme.colors.gray[300] 
          : pressed 
            ? theme.colors.primary[700] 
            : variantStyles.backgroundColor,
        borderWidth: variant === 'outline' ? 2 : 0,
        borderColor: variantStyles.borderColor,
        borderRadius: theme.borderRadius.DEFAULT,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isDisabled ? 0.6 : 1,
        width: fullWidth ? '100%' : undefined,
        ...theme.shadows.DEFAULT,
      })}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color={variantStyles.textColor} />
      ) : (
        <>
          {leftIcon && <View style={{ marginRight: 8 }}>{leftIcon}</View>}
          <Text
            style={{
              color: isDisabled ? theme.colors.gray[500] : variantStyles.textColor,
              fontSize: sizeStyles.fontSize,
              fontWeight: '600',
            }}
          >
            {title}
          </Text>
          {rightIcon && <View style={{ marginLeft: 8 }}>{rightIcon}</View>}
        </>
      )}
    </Pressable>
  );
}

import React from 'react';
import { TextInput, View, Text, TextInputProps } from 'react-native';
import { useTheme } from '../../theme';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Input({
  label,
  error,
  helperText,
  size = 'md',
  leftIcon,
  rightIcon,
  style,
  ...textInputProps
}: InputProps) {
  const { theme } = useTheme();

  const sizeStyles = {
    sm: {
      height: theme.components.input.height.sm,
      fontSize: 14,
      paddingHorizontal: theme.components.input.paddingX.sm,
    },
    md: {
      height: theme.components.input.height.md,
      fontSize: 16,
      paddingHorizontal: theme.components.input.paddingX.md,
    },
    lg: {
      height: theme.components.input.height.lg,
      fontSize: 18,
      paddingHorizontal: theme.components.input.paddingX.lg,
    },
  }[size];

  return (
    <View style={{ marginBottom: theme.spacing[2] }}>
      {label && (
        <Text
          style={{
            fontSize: 14,
            fontWeight: '600',
            color: theme.colors.gray[700],
            marginBottom: theme.spacing[1],
          }}
        >
          {label}
        </Text>
      )}
      
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: error ? theme.colors.error.DEFAULT : theme.colors.gray[300],
          borderRadius: theme.borderRadius.DEFAULT,
          backgroundColor: '#FFFFFF',
        }}
      >
        {leftIcon && (
          <View style={{ paddingLeft: 12 }}>{leftIcon}</View>
        )}
        
        <TextInput
          {...textInputProps}
          style={[
            {
              flex: 1,
              height: sizeStyles.height,
              fontSize: sizeStyles.fontSize,
              paddingHorizontal: leftIcon || rightIcon ? 8 : sizeStyles.paddingHorizontal,
              color: theme.colors.gray[900],
            },
            style,
          ]}
          placeholderTextColor={theme.colors.gray[400]}
        />
        
        {rightIcon && (
          <View style={{ paddingRight: 12 }}>{rightIcon}</View>
        )}
      </View>

      {(error || helperText) && (
        <Text
          style={{
            fontSize: 12,
            color: error ? theme.colors.error.DEFAULT : theme.colors.gray[600],
            marginTop: theme.spacing[1],
          }}
        >
          {error || helperText}
        </Text>
      )}
    </View>
  );
}

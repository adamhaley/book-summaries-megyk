import React from 'react';
import { Pressable, Text, ActivityIndicator, View } from 'react-native';

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
  testID?: string;
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
  testID,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  // Base classes - always applied
  const baseClasses = 'rounded-lg flex-row items-center justify-center shadow-md';

  // Size classes
  const sizeClasses = {
    sm: 'h-9 px-3',
    md: 'h-11 px-4',
    lg: 'h-12 px-5',
    xl: 'h-14 px-6',
  }[size];

  // Variant classes
  const variantClasses = {
    primary: 'bg-primary border-primary active:bg-primary-700',
    secondary: 'bg-secondary border-secondary active:bg-secondary-700',
    accent: 'bg-accent border-accent active:bg-accent-700',
    outline: 'bg-transparent border-2 border-primary active:bg-primary-50',
    ghost: 'bg-transparent border-transparent active:bg-gray-100',
  }[variant];

  // Text color classes
  const textColorClasses = {
    primary: 'text-white',
    secondary: 'text-white',
    accent: 'text-white',
    outline: 'text-primary',
    ghost: 'text-primary',
  }[variant];

  // Text size classes
  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  }[size];

  // Disabled state classes
  const disabledClasses = isDisabled ? 'bg-gray-300 opacity-60' : '';

  // Width class
  const widthClass = fullWidth ? 'w-full' : '';

  // Combine all classes
  const buttonClasses = `${baseClasses} ${sizeClasses} ${variantClasses} ${disabledClasses} ${widthClass}`.trim();
  const textClasses = `${textColorClasses} ${textSizeClasses} font-semibold`.trim();

  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      className={buttonClasses}
      disabled={isDisabled}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' || variant === 'ghost' ? '#264653' : '#FFFFFF'} />
      ) : (
        <>
          {leftIcon && <View className="mr-2">{leftIcon}</View>}
          <Text className={textClasses}>
            {title}
          </Text>
          {rightIcon && <View className="ml-2">{rightIcon}</View>}
        </>
      )}
    </Pressable>
  );
}

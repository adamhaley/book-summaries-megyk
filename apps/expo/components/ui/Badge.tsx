import React from 'react';
import { View, Text } from 'react-native';

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
  // Base classes
  const baseClasses = 'rounded-full self-start';

  // Size classes
  const sizeClasses = {
    sm: 'py-0.5 px-1.5',
    md: 'py-1 px-2',
    lg: 'py-1.5 px-3',
  }[size];

  // Text size classes
  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-xs',
    lg: 'text-sm',
  }[size];

  // Variant classes (background + text color)
  const variantClasses = {
    primary: 'bg-primary-100',
    secondary: 'bg-secondary-100',
    accent: 'bg-accent-100',
    success: 'bg-green-100',
    warning: 'bg-yellow-100',
    error: 'bg-red-100',
    neutral: 'bg-gray-100',
  }[variant];

  const textVariantClasses = {
    primary: 'text-primary-700',
    secondary: 'text-secondary-700',
    accent: 'text-accent-700',
    success: 'text-green-700',
    warning: 'text-yellow-700',
    error: 'text-red-700',
    neutral: 'text-gray-700',
  }[variant];

  // Combine classes
  const containerClasses = `${baseClasses} ${sizeClasses} ${variantClasses}`.trim();
  const textClasses = `${textSizeClasses} ${textVariantClasses} font-semibold`.trim();

  return (
    <View className={containerClasses}>
      <Text className={textClasses}>
        {children}
      </Text>
    </View>
  );
}

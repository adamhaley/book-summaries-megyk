import React from 'react';
import { View, ViewStyle } from 'react-native';

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
  // Base classes
  const baseClasses = 'rounded-lg';

  // Padding classes
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
  }[padding];

  // Variant classes
  const variantClasses = {
    elevated: 'bg-white shadow-md',
    outlined: 'bg-white border border-gray-200',
    filled: 'bg-gray-50',
  }[variant];

  // Combine classes
  const cardClasses = `${baseClasses} ${paddingClasses} ${variantClasses}`.trim();

  return (
    <View className={cardClasses} style={style}>
      {children}
    </View>
  );
}

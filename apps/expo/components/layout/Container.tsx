import React from 'react';
import { View, ViewStyle } from 'react-native';

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
  // Base class
  const baseClass = 'w-full';

  // Size classes (max-width)
  const sizeClasses = {
    sm: 'max-w-[640px]',
    md: 'max-w-[768px]',
    lg: 'max-w-[1024px]',
    xl: 'max-w-[1280px]',
    full: '',
  }[size];

  // Padding classes
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  }[padding];

  // Center class
  const centerClass = center ? 'self-center' : '';

  const containerClasses = `${baseClass} ${sizeClasses} ${paddingClasses} ${centerClass}`.trim();

  return (
    <View className={containerClasses} style={style}>
      {children}
    </View>
  );
}

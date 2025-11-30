import React from 'react';
import { View, ViewStyle } from 'react-native';

export interface VStackProps {
  children: React.ReactNode;
  spacing?: number;
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  style?: ViewStyle;
}

/**
 * Vertical stack layout component
 * Arranges children in a column with configurable spacing
 */
export function VStack({
  children,
  spacing = 0,
  align = 'flex-start',
  justify = 'flex-start',
  style,
}: VStackProps) {
  const childrenArray = React.Children.toArray(children);

  // Alignment classes
  const alignClasses = {
    'flex-start': 'items-start',
    'center': 'items-center',
    'flex-end': 'items-end',
    'stretch': 'items-stretch',
  }[align];

  // Justify classes
  const justifyClasses = {
    'flex-start': 'justify-start',
    'center': 'justify-center',
    'flex-end': 'justify-end',
    'space-between': 'justify-between',
    'space-around': 'justify-around',
    'space-evenly': 'justify-evenly',
  }[justify];

  const containerClasses = `flex-col ${alignClasses} ${justifyClasses}`.trim();

  return (
    <View className={containerClasses} style={style}>
      {childrenArray.map((child, index) => (
        <View
          key={index}
          style={{
            marginBottom: index < childrenArray.length - 1 ? spacing : 0,
          }}
        >
          {child}
        </View>
      ))}
    </View>
  );
}

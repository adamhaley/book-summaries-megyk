import React from 'react';
import { View, ViewStyle } from 'react-native';

export interface HStackProps {
  children: React.ReactNode;
  spacing?: number;
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  wrap?: boolean;
  style?: ViewStyle;
}

/**
 * Horizontal stack layout component
 * Arranges children in a row with configurable spacing
 */
export function HStack({
  children,
  spacing = 0,
  align = 'flex-start',
  justify = 'flex-start',
  wrap = false,
  style,
}: HStackProps) {
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

  // Wrap classes
  const wrapClass = wrap ? 'flex-wrap' : 'flex-nowrap';

  const containerClasses = `flex-row ${alignClasses} ${justifyClasses} ${wrapClass}`.trim();

  return (
    <View className={containerClasses} style={style}>
      {childrenArray.map((child, index) => (
        <View
          key={index}
          style={{
            marginRight: index < childrenArray.length - 1 ? spacing : 0,
          }}
        >
          {child}
        </View>
      ))}
    </View>
  );
}

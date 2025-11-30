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

  return (
    <View
      style={[
        {
          flexDirection: 'column',
          alignItems: align,
          justifyContent: justify,
        },
        style,
      ]}
    >
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

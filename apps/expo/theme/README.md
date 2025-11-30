# Megyk Books Design System

This directory contains the complete design system for the Megyk Books cross-platform application, including design tokens, theme configuration, and utilities.

## Overview

The design system is built on top of **NativeWind v4** (Tailwind CSS for React Native) and provides a consistent, branded experience across web, iOS, and Android.

## Brand Colors

### Primary - Deep Teal (#264653)
- Main brand color
- Used for headers, primary buttons, key UI elements
- Shades: 50 (lightest) to 900 (darkest)

### Secondary - Turquoise (#2A9D8F)
- Accent and interactive elements
- Links, hover states, secondary buttons
- Complements the primary color

### Accent - Coral (#E76F51)
- Call-to-action buttons
- Important highlights and notifications
- Eye-catching elements

### Accent Light - Sandy Orange (#F4A261)
- Subtle accents and highlights
- Background variations
- Soft emphasis

### Neutral Light - Golden Yellow (#E9C46A)
- Warm neutral tones
- Backgrounds and surfaces
- Text on dark backgrounds

## Usage

### With NativeWind (Recommended)

```tsx
import { View, Text } from 'react-native';

export function Example() {
  return (
    <View className="bg-primary p-4 rounded-lg">
      <Text className="text-white font-bold text-xl">
        Megyk Books
      </Text>
      <Text className="text-neutral-light">
        Your personalized book summaries
      </Text>
    </View>
  );
}
```

### With Theme Hook

```tsx
import { useTheme } from '@/theme';
import { View, Text, StyleSheet } from 'react-native';

export function Example() {
  const { theme, colorScheme, toggleColorScheme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primary.DEFAULT }]}>
      <Text style={[styles.text, { color: theme.colors.white }]}>
        Current mode: {colorScheme}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
  },
  text: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
```

## Typography

### Font Families
- **Heading**: System (will be replaced with branded font)
- **Body**: System
- **Mono**: Courier

### Font Sizes
| Token | Value | Use Case |
|-------|-------|----------|
| xs    | 12px  | Small labels, captions |
| sm    | 14px  | Secondary text |
| base  | 16px  | Body text |
| lg    | 18px  | Emphasized text |
| xl    | 20px  | Small headings |
| 2xl   | 24px  | Section headings |
| 3xl   | 30px  | Page headings |
| 4xl   | 36px  | Hero headings |

### Font Weights
- thin (100), extralight (200), light (300)
- normal (400), medium (500), semibold (600)
- bold (700), extrabold (800), black (900)

## Spacing Scale

Based on 4px grid system:
- 1 = 4px
- 2 = 8px
- 3 = 12px
- 4 = 16px
- 6 = 24px
- 8 = 32px
- 12 = 48px
- 16 = 64px

Usage: `p-4` (16px padding), `m-6` (24px margin), `gap-2` (8px gap)

## Border Radius

- **sm**: 2px - Small elements
- **DEFAULT**: 4px - Standard elements
- **md**: 6px - Cards, buttons
- **lg**: 8px - Larger cards
- **xl**: 12px - Modals
- **2xl**: 16px - Hero sections
- **full**: 9999px - Pills, badges, avatars

## Shadows

Shadow tokens include both iOS (shadow*) and Android (elevation) support:

- **sm**: Subtle depth
- **DEFAULT**: Standard elevation
- **md**: Cards, buttons
- **lg**: Modals, dialogs
- **xl**: Floating elements
- **2xl**: Maximum depth

## Breakpoints

Responsive breakpoints for web:
- **sm**: 640px - Mobile landscape
- **md**: 768px - Tablets
- **lg**: 1024px - Desktop
- **xl**: 1280px - Large desktop
- **2xl**: 1536px - Extra large

## Component Tokens

Pre-configured tokens for common components:

### Button
```tsx
// Sizes: sm (32px), md (40px), lg (48px), xl (56px)
<Button size="md" /> // 40px height, 16px horizontal padding
```

### Input
```tsx
// Sizes: sm (32px), md (40px), lg (48px)
<Input size="md" /> // 40px height, 12px padding, 1px border
```

### Card
```tsx
// Pre-configured: 16px padding, 8px radius, md shadow
<Card />
```

### Badge
```tsx
// Pre-configured: full radius, 8px horizontal, 4px vertical padding
<Badge />
```

## Dark Mode Support

The theme system includes built-in dark mode support via the `useTheme` hook:

```tsx
const { colorScheme, isDark, toggleColorScheme } = useTheme();
```

Use NativeWind's dark mode classes:
```tsx
<View className="bg-white dark:bg-gray-900">
  <Text className="text-gray-900 dark:text-white">
    Auto-adapts to color scheme
  </Text>
</View>
```

## Files

- **tokens.ts**: Complete design token definitions
- **useTheme.tsx**: Theme context and hook
- **index.ts**: Public exports
- **README.md**: This documentation

## Best Practices

1. **Always use tokens**: Never hardcode colors, spacing, or typography
2. **Prefer NativeWind classes**: Use Tailwind classes for better DX
3. **Use semantic colors**: Use success/warning/error for status indicators
4. **Maintain consistency**: Stick to the defined scales
5. **Test in dark mode**: Ensure all UI works in both light and dark modes

## Future Enhancements

- [ ] Add custom font family (Inter, SF Pro, etc.)
- [ ] Create animation tokens (duration, easing)
- [ ] Add icon library integration
- [ ] Create component variant system
- [ ] Add accessibility tokens (focus rings, tap targets)

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Link, usePathname } from 'expo-router';
import { useTheme } from '../../theme';

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
}

export interface MainNavigationProps {
  items?: NavItem[];
}

const defaultNavItems: NavItem[] = [
  { label: 'Home', href: '/', icon: '🏠' },
  { label: 'Library', href: '/library', icon: '📚' },
  { label: 'My Summaries', href: '/summaries', icon: '📝' },
  { label: 'Preferences', href: '/preferences', icon: '⚙️' },
  { label: 'Profile', href: '/profile', icon: '👤' },
];

/**
 * Main navigation menu for dashboard
 * Replaces Mantine NavLink components
 */
export function MainNavigation({ items = defaultNavItems }: MainNavigationProps) {
  const { theme } = useTheme();
  const pathname = usePathname();

  return (
    <View style={{ paddingVertical: theme.spacing[2] }}>
      {items.map((item) => {
        const isActive = pathname === item.href;
        
        return (
          <Link key={item.href} href={item.href} asChild>
            <Pressable
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                padding: theme.spacing[3],
                marginHorizontal: theme.spacing[2],
                marginVertical: theme.spacing[1],
                backgroundColor: isActive
                  ? theme.colors.primary[600]
                  : pressed
                    ? theme.colors.primary[700]
                    : 'transparent',
                borderRadius: theme.borderRadius.DEFAULT,
              })}
            >
              {item.icon && (
                <Text style={{ fontSize: 20, marginRight: theme.spacing[3] }}>
                  {item.icon}
                </Text>
              )}
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 16,
                  fontWeight: isActive ? '600' : '400',
                }}
              >
                {item.label}
              </Text>
            </Pressable>
          </Link>
        );
      })}
    </View>
  );
}

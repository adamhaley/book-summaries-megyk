import React, { useState } from 'react';
import { View, ScrollView, Pressable, Text, useWindowDimensions } from 'react-native';
import { useTheme } from '../../theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export interface DashboardLayoutProps {
  children: React.ReactNode;
  navigation?: React.ReactNode;
  header?: React.ReactNode;
}

/**
 * Dashboard layout with responsive sidebar navigation
 * Replaces Mantine's AppShell
 */
export function DashboardLayout({ 
  children, 
  navigation,
  header 
}: DashboardLayoutProps) {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const isDesktop = width >= 1024;
  const showSidebar = isDesktop || sidebarOpen;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.gray[50] }}>
      <View style={{ flex: 1, flexDirection: 'row' }}>
        {/* Sidebar */}
        {showSidebar && (
          <View
            style={{
              width: isDesktop ? 280 : '80%',
              backgroundColor: theme.colors.primary.DEFAULT,
              position: isDesktop ? 'relative' : 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              zIndex: 1000,
              ...(!isDesktop && theme.shadows.xl),
            }}
          >
            {/* Sidebar Header */}
            <View
              style={{
                padding: theme.spacing[4],
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.primary[700],
              }}
            >
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: '700',
                  color: '#FFFFFF',
                }}
              >
                Megyk Books
              </Text>
            </View>

            {/* Navigation */}
            <ScrollView style={{ flex: 1 }}>
              {navigation}
            </ScrollView>

            {/* Close button for mobile */}
            {!isDesktop && (
              <Pressable
                onPress={() => setSidebarOpen(false)}
                style={{
                  padding: theme.spacing[4],
                  borderTopWidth: 1,
                  borderTopColor: theme.colors.primary[700],
                }}
              >
                <Text style={{ color: '#FFFFFF', textAlign: 'center', fontSize: 16 }}>
                  Close
                </Text>
              </Pressable>
            )}
          </View>
        )}

        {/* Main Content */}
        <View style={{ flex: 1 }}>
          {/* Header */}
          {header && (
            <View
              style={{
                backgroundColor: '#FFFFFF',
                padding: theme.spacing[4],
                borderBottomWidth: 1,
                borderBottomColor: theme.colors.gray[200],
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                ...theme.shadows.sm,
              }}
            >
              {/* Mobile menu button */}
              {!isDesktop && (
                <Pressable
                  onPress={() => setSidebarOpen(!sidebarOpen)}
                  style={{
                    padding: theme.spacing[2],
                    marginRight: theme.spacing[2],
                  }}
                >
                  <Text style={{ fontSize: 24, color: theme.colors.primary.DEFAULT }}>
                    ☰
                  </Text>
                </Pressable>
              )}
              {header}
            </View>
          )}

          {/* Page Content */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: theme.spacing[4] }}
          >
            {children}
          </ScrollView>
        </View>

        {/* Overlay for mobile sidebar */}
        {!isDesktop && sidebarOpen && (
          <Pressable
            onPress={() => setSidebarOpen(false)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 999,
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

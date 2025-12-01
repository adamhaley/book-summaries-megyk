import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui';
import { Container, VStack } from '../../components/layout';
import { DashboardLayout, MainNavigation } from '../../components/dashboard';
import { useTheme } from '../../theme';

export default function LibraryScreen() {
  const { theme } = useTheme();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  return (
    <DashboardLayout
      navigation={<MainNavigation />}
      header={
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: theme.colors.gray[900] }}>
            Discover Books
          </Text>
          <Button
            title="Sign Out"
            onPress={handleSignOut}
            variant="ghost"
            size="sm"
          />
        </View>
      }
    >
      <Container size="lg" padding="lg">
        <VStack spacing={theme.spacing[6]}>
          <View>
            <Text style={{ fontSize: 32, fontWeight: '700', color: theme.colors.gray[900] }}>
              Library
            </Text>
            <Text style={{ fontSize: 16, color: theme.colors.gray[600], marginTop: theme.spacing[2] }}>
              Welcome, {user?.email}!
            </Text>
          </View>

          {/* Placeholder Content */}
          <View
            style={{
              padding: theme.spacing[8],
              backgroundColor: '#FFFFFF',
              borderRadius: theme.borderRadius.lg,
              borderWidth: 2,
              borderColor: theme.colors.primary.DEFAULT,
              borderStyle: 'dashed',
            }}
          >
            <VStack spacing={theme.spacing[4]}>
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: '600',
                  color: theme.colors.gray[900],
                  textAlign: 'center',
                }}
              >
                Library Coming Soon
              </Text>
              <Text
                style={{
                  fontSize: 16,
                  color: theme.colors.gray[600],
                  textAlign: 'center',
                  lineHeight: 24,
                }}
              >
                The book library is under construction. Soon you'll be able to browse our collection and generate personalized summaries.
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: theme.colors.gray[500],
                  textAlign: 'center',
                  fontStyle: 'italic',
                }}
              >
                Phase 1: Authentication ✅ Complete{'\n'}
                Phase 2: Library & Summaries - In Progress
              </Text>
            </VStack>
          </View>
        </VStack>
      </Container>
    </DashboardLayout>
  );
}

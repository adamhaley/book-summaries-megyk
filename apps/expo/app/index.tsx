import React, { useEffect } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { Button, Badge } from '../components/ui';
import { VStack, HStack, Container } from '../components/layout';
import { useTheme } from '../theme';

export default function HomeScreen() {
  const { theme } = useTheme();
  const { user, loading } = useAuth();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.replace('/dashboard/library');
    }
  }, [user, loading]);

  // Show loading while checking auth
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <Text style={{ fontSize: 18, color: theme.colors.gray[600] }}>Loading...</Text>
      </View>
    );
  }

  // Show landing page for unauthenticated users
  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <Container size="md" padding="lg">
        <VStack spacing={theme.spacing[8]} style={{ marginTop: theme.spacing[16] }}>
          {/* Hero Section */}
          <VStack spacing={theme.spacing[6]}>
            <Text
              style={{
                fontSize: 48,
                fontWeight: '700',
                color: theme.colors.gray[900],
                textAlign: 'center',
                lineHeight: 56,
              }}
            >
              Book Summaries
            </Text>
            <Text
              style={{
                fontSize: 20,
                color: theme.colors.gray[600],
                textAlign: 'center',
                lineHeight: 28,
              }}
            >
              AI-powered, personalized book summaries tailored to your reading preferences
            </Text>

            <HStack spacing={theme.spacing[4]} style={{ justifyContent: 'center' }} wrap>
              <Badge variant="primary">Cross-Platform</Badge>
              <Badge variant="secondary">AI-Powered</Badge>
              <Badge variant="accent">Personalized</Badge>
            </HStack>
          </VStack>

          {/* CTA Buttons */}
          <VStack spacing={theme.spacing[3]}>
            <Button
              title="Get Started"
              onPress={() => router.push('/auth/signin')}
              variant="primary"
              size="xl"
              fullWidth
            />
            <Button
              title="Sign In"
              onPress={() => router.push('/auth/signin')}
              variant="outline"
              size="lg"
              fullWidth
            />
          </VStack>

          {/* Features */}
          <VStack spacing={theme.spacing[6]} style={{ marginTop: theme.spacing[8] }}>
            <Text
              style={{
                fontSize: 28,
                fontWeight: '700',
                color: theme.colors.gray[900],
                textAlign: 'center',
              }}
            >
              Features
            </Text>

            <VStack spacing={theme.spacing[4]}>
              {/* Feature 1 */}
              <View
                style={{
                  padding: theme.spacing[5],
                  backgroundColor: '#FFFFFF',
                  borderRadius: theme.borderRadius.lg,
                  borderWidth: 1,
                  borderColor: theme.colors.gray[200],
                }}
              >
                <VStack spacing={theme.spacing[2]}>
                  <Text style={{ fontSize: 20, fontWeight: '600', color: theme.colors.gray[900] }}>
                    Personalized Summaries
                  </Text>
                  <Text style={{ fontSize: 16, color: theme.colors.gray[600], lineHeight: 24 }}>
                    Choose your preferred style (Narrative, Bullet Points, or Workbook) and length to get summaries that match your reading style.
                  </Text>
                </VStack>
              </View>

              {/* Feature 2 */}
              <View
                style={{
                  padding: theme.spacing[5],
                  backgroundColor: '#FFFFFF',
                  borderRadius: theme.borderRadius.lg,
                  borderWidth: 1,
                  borderColor: theme.colors.gray[200],
                }}
              >
                <VStack spacing={theme.spacing[2]}>
                  <Text style={{ fontSize: 20, fontWeight: '600', color: theme.colors.gray[900] }}>
                    Extensive Library
                  </Text>
                  <Text style={{ fontSize: 16, color: theme.colors.gray[600], lineHeight: 24 }}>
                    Browse and discover books from our curated collection, with new titles added regularly.
                  </Text>
                </VStack>
              </View>

              {/* Feature 3 */}
              <View
                style={{
                  padding: theme.spacing[5],
                  backgroundColor: '#FFFFFF',
                  borderRadius: theme.borderRadius.lg,
                  borderWidth: 1,
                  borderColor: theme.colors.gray[200],
                }}
              >
                <VStack spacing={theme.spacing[2]}>
                  <Text style={{ fontSize: 20, fontWeight: '600', color: theme.colors.gray[900] }}>
                    Download & Save
                  </Text>
                  <Text style={{ fontSize: 16, color: theme.colors.gray[600], lineHeight: 24 }}>
                    Access your summaries anytime, download as PDF, and build your personal collection.
                  </Text>
                </VStack>
              </View>
            </VStack>
          </VStack>

          {/* Footer CTA */}
          <VStack spacing={theme.spacing[4]} style={{ marginTop: theme.spacing[8], marginBottom: theme.spacing[12] }}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: '600',
                color: theme.colors.gray[900],
                textAlign: 'center',
              }}
            >
              Ready to get started?
            </Text>
            <Button
              title="Get Started"
              onPress={() => router.push('/auth/signin')}
              variant="primary"
              size="xl"
              fullWidth
            />
          </VStack>
        </VStack>
      </Container>
    </ScrollView>
  );
}

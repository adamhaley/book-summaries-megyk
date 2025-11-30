import React, { useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { DashboardLayout, MainNavigation } from '../components/dashboard';
import { Button, Card, Badge, Input } from '../components/ui';
import { VStack, HStack, Container } from '../components/layout';
import { GenerateSummaryModal } from '../components/summary';
import { useTheme } from '../theme';

export default function HomeScreen() {
  const { theme } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);

  const handleGenerate = async (request: any) => {
    console.log('Generate summary:', request);
    // Will connect to API later
  };

  return (
    <DashboardLayout
      navigation={<MainNavigation />}
      header={
        <Text style={{ fontSize: 18, fontWeight: '600', color: theme.colors.gray[900] }}>
          Welcome to Megyk Books
        </Text>
      }
    >
      <Container size="lg" padding="none">
        <VStack spacing={theme.spacing[6]}>
          {/* Hero Section */}
          <Card variant="elevated" padding="lg">
            <VStack spacing={theme.spacing[4]}>
              <Text style={{ fontSize: 24, fontWeight: '700', color: theme.colors.primary.DEFAULT }}>
                Your Personalized Book Summaries
              </Text>
              <Text style={{ fontSize: 16, color: theme.colors.gray[700] }}>
                AI-powered summaries tailored to your reading preferences
              </Text>
              <HStack spacing={theme.spacing[3]}>
                <Badge variant="primary">Cross-Platform</Badge>
                <Badge variant="secondary">AI-Powered</Badge>
                <Badge variant="accent">Personalized</Badge>
              </HStack>
            </VStack>
          </Card>

          {/* Demo Components */}
          <Card variant="outlined" padding="lg">
            <VStack spacing={theme.spacing[4]}>
              <Text style={{ fontSize: 20, fontWeight: '600', color: theme.colors.gray[900] }}>
                Component Showcase
              </Text>

              {/* Buttons */}
              <VStack spacing={theme.spacing[2]}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: theme.colors.gray[700] }}>
                  Buttons
                </Text>
                <HStack spacing={theme.spacing[2]} wrap>
                  <Button title="Primary" onPress={() => {}} variant="primary" size="md" />
                  <Button title="Secondary" onPress={() => {}} variant="secondary" size="md" />
                  <Button title="Accent" onPress={() => {}} variant="accent" size="md" />
                  <Button title="Outline" onPress={() => {}} variant="outline" size="md" />
                </HStack>
              </VStack>

              {/* Input */}
              <Input
                label="Email"
                placeholder="Enter your email"
                helperText="We'll never share your email"
              />

              {/* Test Modal */}
              <Button
                title="Generate Summary (Demo)"
                onPress={() => setModalVisible(true)}
                variant="primary"
                fullWidth
              />
            </VStack>
          </Card>

          {/* Stats Cards */}
          <HStack spacing={theme.spacing[4]} wrap>
            <Card variant="filled" padding="md" style={{ flex: 1, minWidth: 200 }}>
              <VStack spacing={theme.spacing[2]}>
                <Text style={{ fontSize: 32, fontWeight: '700', color: theme.colors.primary.DEFAULT }}>
                  0
                </Text>
                <Text style={{ fontSize: 14, color: theme.colors.gray[600] }}>
                  Summaries Generated
                </Text>
              </VStack>
            </Card>
            <Card variant="filled" padding="md" style={{ flex: 1, minWidth: 200 }}>
              <VStack spacing={theme.spacing[2]}>
                <Text style={{ fontSize: 32, fontWeight: '700', color: theme.colors.secondary.DEFAULT }}>
                  0
                </Text>
                <Text style={{ fontSize: 14, color: theme.colors.gray[600] }}>
                  Books in Library
                </Text>
              </VStack>
            </Card>
          </HStack>
        </VStack>
      </Container>

      {/* Demo Modal */}
      <GenerateSummaryModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onGenerate={handleGenerate}
        bookId="demo-book-1"
        bookTitle="The Great Gatsby"
      />
    </DashboardLayout>
  );
}

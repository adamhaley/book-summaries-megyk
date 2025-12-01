import React, { useState, useEffect } from 'react';
import { ScrollView, Text, View, ActivityIndicator, Alert, Linking } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Badge, Card } from '../../components/ui';
import { Container, VStack, HStack } from '../../components/layout';
import { DashboardLayout, MainNavigation } from '../../components/dashboard';
import { useTheme } from '../../theme';
import { fetchSummaries, downloadSummary, deleteSummary, Summary } from '../../services/summaries';

export default function SummariesScreen() {
  const { theme } = useTheme();
  const { user, signOut } = useAuth();

  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadSummaries();
    }
  }, [user]);

  const loadSummaries = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetchSummaries(user.id);
      setSummaries(response.summaries);
    } catch (err: any) {
      setError(err.message || 'Failed to load summaries');
      console.error('Error loading summaries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (summary: Summary) => {
    try {
      const url = await downloadSummary(summary.id);
      // Open PDF in browser
      await Linking.openURL(url);
    } catch (err: any) {
      Alert.alert('Download Failed', err.message || 'Failed to download summary');
    }
  };

  const handleDelete = async (summary: Summary) => {
    if (!user) return;

    Alert.alert(
      'Delete Summary',
      `Are you sure you want to delete the summary for "${summary.book_title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(summary.id);
            try {
              await deleteSummary(summary.id, user.id);
              setSummaries(summaries.filter((s) => s.id !== summary.id));
              Alert.alert('Success', 'Summary deleted successfully');
            } catch (err: any) {
              Alert.alert('Delete Failed', err.message || 'Failed to delete summary');
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatGenerationTime = (seconds?: number) => {
    if (!seconds) return null;
    if (seconds < 60) return `${Math.round(seconds)}s`;
    return `${Math.round(seconds / 60)}m`;
  };

  const getStyleLabel = (style: string) => {
    const labels: Record<string, string> = {
      narrative: 'Narrative',
      bullet_points: 'Bullet Points',
      workbook: 'Workbook',
    };
    return labels[style] || style;
  };

  const getLengthLabel = (length: string) => {
    const labels: Record<string, string> = {
      short: 'Short (1 sentence/chapter)',
      medium: 'Medium (1 paragraph/chapter)',
      long: 'Long (1 page/chapter)',
    };
    return labels[length] || length;
  };

  return (
    <DashboardLayout
      navigation={<MainNavigation />}
      header={
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: theme.colors.gray[900] }}>
            My Summaries
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
          {/* Page Title */}
          <View>
            <Text style={{ fontSize: 32, fontWeight: '700', color: theme.colors.gray[900] }}>
              My Summaries
            </Text>
            <Text style={{ fontSize: 16, color: theme.colors.gray[600], marginTop: theme.spacing[2] }}>
              Your personalized book summaries
            </Text>
          </View>

          {/* Loading State */}
          {loading && (
            <View style={{ padding: theme.spacing[8], alignItems: 'center' }}>
              <ActivityIndicator size="large" color={theme.colors.primary.DEFAULT} />
              <Text style={{ marginTop: theme.spacing[4], fontSize: 16, color: theme.colors.gray[600] }}>
                Loading summaries...
              </Text>
            </View>
          )}

          {/* Error State */}
          {error && !loading && (
            <View
              style={{
                padding: theme.spacing[4],
                backgroundColor: theme.colors.error.light || '#FEE2E2',
                borderRadius: theme.borderRadius.DEFAULT,
                borderWidth: 1,
                borderColor: theme.colors.error.DEFAULT,
              }}
            >
              <Text style={{ color: theme.colors.error.DEFAULT, fontSize: 14 }}>
                {error}
              </Text>
              <Button
                title="Retry"
                onPress={loadSummaries}
                variant="outline"
                size="sm"
                style={{ marginTop: theme.spacing[2] }}
              />
            </View>
          )}

          {/* Empty State */}
          {!loading && !error && summaries.length === 0 && (
            <View
              style={{
                padding: theme.spacing[8],
                backgroundColor: '#FFFFFF',
                borderRadius: theme.borderRadius.lg,
                borderWidth: 2,
                borderColor: theme.colors.gray[200],
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: '600', color: theme.colors.gray[900] }}>
                No summaries yet
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: theme.colors.gray[600],
                  marginTop: theme.spacing[2],
                  textAlign: 'center',
                }}
              >
                Visit the library to generate your first summary
              </Text>
              <Button
                title="Browse Library"
                onPress={() => router.push('/dashboard/library')}
                variant="primary"
                size="md"
                style={{ marginTop: theme.spacing[4] }}
              />
            </View>
          )}

          {/* Summaries Grid */}
          {!loading && !error && summaries.length > 0 && (
            <VStack spacing={theme.spacing[4]}>
              {summaries.map((summary) => (
                <Card key={summary.id} variant="outlined" padding="lg">
                  <VStack spacing={theme.spacing[3]}>
                    {/* Book Info */}
                    <View>
                      <Text style={{ fontSize: 20, fontWeight: '600', color: theme.colors.gray[900] }}>
                        {summary.book_title}
                      </Text>
                      <Text style={{ fontSize: 14, color: theme.colors.gray[600], marginTop: theme.spacing[1] }}>
                        by {summary.book_author}
                      </Text>
                    </View>

                    {/* Metadata Badges */}
                    <HStack spacing={theme.spacing[2]} wrap>
                      <Badge variant="primary">
                        {getStyleLabel(summary.style)}
                      </Badge>
                      <Badge variant="secondary">
                        {getLengthLabel(summary.length).split(' ')[0]}
                      </Badge>
                      <Badge variant="accent">
                        {formatDate(summary.created_at)}
                      </Badge>
                      {summary.generation_time && (
                        <Badge variant="outline">
                          Generated in {formatGenerationTime(summary.generation_time)}
                        </Badge>
                      )}
                    </HStack>

                    {/* Actions */}
                    <HStack spacing={theme.spacing[2]}>
                      <Button
                        title="Download"
                        onPress={() => handleDownload(summary)}
                        variant="primary"
                        size="md"
                      />
                      <Button
                        title={deletingId === summary.id ? 'Deleting...' : 'Delete'}
                        onPress={() => handleDelete(summary)}
                        variant="outline"
                        size="md"
                        loading={deletingId === summary.id}
                        disabled={deletingId === summary.id}
                      />
                    </HStack>
                  </VStack>
                </Card>
              ))}

              {/* Summary Count */}
              <Text style={{ fontSize: 14, color: theme.colors.gray[600], textAlign: 'center', marginTop: theme.spacing[2] }}>
                {summaries.length} {summaries.length === 1 ? 'summary' : 'summaries'} total
              </Text>
            </VStack>
          )}
        </VStack>
      </Container>
    </DashboardLayout>
  );
}

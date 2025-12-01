import React, { useState, useEffect } from 'react';
import { ScrollView, Text, View, Pressable, Image, ActivityIndicator, useWindowDimensions, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Badge, Card } from '../../components/ui';
import { Container, VStack, HStack } from '../../components/layout';
import { DashboardLayout, MainNavigation } from '../../components/dashboard';
import { GenerateSummaryModal } from '../../components/summary';
import { useTheme } from '../../theme';
import { fetchBooks, Book } from '../../services/books';
import { generateSummary } from '../../services/summaries';
import { supabase } from '../../lib/supabase';

type SortField = 'title' | 'author' | 'genre' | 'publication_year';
type SortOrder = 'asc' | 'desc';

export default function LibraryScreen() {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const { user, signOut } = useAuth();

  const [books, setBooks] = useState<Book[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Sorting
  const [sortBy, setSortBy] = useState<SortField>('title');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Responsive layout
  const isMobile = width < 768;

  useEffect(() => {
    loadBooks();
  }, [page, sortBy, sortOrder]);

  const loadBooks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchBooks({ page, pageSize, sortBy, sortOrder });
      setBooks(response.books);
      setTotal(response.total);
    } catch (err: any) {
      setError(err.message || 'Failed to load books');
      console.error('Error loading books:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      // Toggle order
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1); // Reset to first page
  };

  const handleGetSummary = (book: Book) => {
    setSelectedBook(book);
    setModalVisible(true);
  };

  const handleGenerate = async (request: any) => {
    if (!user) return;

    try {
      // Get access token
      const session = await supabase.auth.getSession();
      if (!session.data.session?.access_token) {
        Alert.alert('Error', 'Please sign in to generate summaries');
        return;
      }

      // Convert modal format to API format
      const apiRequest = {
        book_id: request.bookId,
        style: request.style,
        length: request.length === '1pg' ? 'short' : request.length === '5pg' ? 'medium' : 'long',
      };

      // Call generation API
      const blob = await generateSummary(apiRequest, session.data.session.access_token);

      // Create blob URL and trigger download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedBook?.title || 'summary'}.pdf`;
      link.click();
      URL.revokeObjectURL(url);

      Alert.alert('Success', 'Summary generated and downloaded!');
      setModalVisible(false);
    } catch (error: any) {
      console.error('Generation error:', error);
      Alert.alert('Generation Failed', error.message || 'Failed to generate summary');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, total);

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
          {/* Page Title */}
          <View>
            <Text style={{ fontSize: 32, fontWeight: '700', color: theme.colors.gray[900] }}>
              Discover Books
            </Text>
            <Text style={{ fontSize: 16, color: theme.colors.gray[600], marginTop: theme.spacing[2] }}>
              Browse our collection and generate personalized summaries
            </Text>
          </View>

          {/* Loading State */}
          {loading && (
            <View style={{ padding: theme.spacing[8], alignItems: 'center' }}>
              <ActivityIndicator size="large" color={theme.colors.primary.DEFAULT} />
              <Text style={{ marginTop: theme.spacing[4], fontSize: 16, color: theme.colors.gray[600] }}>
                Loading books...
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
                onPress={loadBooks}
                variant="outline"
                size="sm"
                style={{ marginTop: theme.spacing[2] }}
              />
            </View>
          )}

          {/* Empty State */}
          {!loading && !error && books.length === 0 && (
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
                No books available yet
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: theme.colors.gray[600],
                  marginTop: theme.spacing[2],
                  textAlign: 'center',
                }}
              >
                Check back soon for new additions to our library
              </Text>
            </View>
          )}

          {/* Books List */}
          {!loading && !error && books.length > 0 && (
            <VStack spacing={theme.spacing[4]}>
              {/* Sort Controls - Desktop */}
              {!isMobile && (
                <HStack spacing={theme.spacing[2]} wrap>
                  <Text style={{ fontSize: 14, color: theme.colors.gray[700], marginRight: theme.spacing[2] }}>
                    Sort by:
                  </Text>
                  <Pressable onPress={() => handleSort('title')}>
                    <Text
                      style={{
                        fontSize: 14,
                                  fontWeight: sortBy === 'title' ? '600' : '400',
                        color: sortBy === 'title' ? theme.colors.primary.DEFAULT : theme.colors.gray[600],
                        textDecorationLine: sortBy === 'title' ? 'underline' : 'none',
                      }}
                    >
                      Title {sortBy === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </Text>
                  </Pressable>
                  <Text style={{ color: theme.colors.gray[400] }}>|</Text>
                  <Pressable onPress={() => handleSort('author')}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: sortBy === 'author' ? '600' : '400',
                        color: sortBy === 'author' ? theme.colors.primary.DEFAULT : theme.colors.gray[600],
                        textDecorationLine: sortBy === 'author' ? 'underline' : 'none',
                      }}
                    >
                      Author {sortBy === 'author' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </Text>
                  </Pressable>
                  <Text style={{ color: theme.colors.gray[400] }}>|</Text>
                  <Pressable onPress={() => handleSort('genre')}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: sortBy === 'genre' ? '600' : '400',
                        color: sortBy === 'genre' ? theme.colors.primary.DEFAULT : theme.colors.gray[600],
                        textDecorationLine: sortBy === 'genre' ? 'underline' : 'none',
                      }}
                    >
                      Genre {sortBy === 'genre' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </Text>
                  </Pressable>
                  <Text style={{ color: theme.colors.gray[400] }}>|</Text>
                  <Pressable onPress={() => handleSort('publication_year')}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: sortBy === 'publication_year' ? '600' : '400',
                        color: sortBy === 'publication_year' ? theme.colors.primary.DEFAULT : theme.colors.gray[600],
                        textDecorationLine: sortBy === 'publication_year' ? 'underline' : 'none',
                      }}
                    >
                      Year {sortBy === 'publication_year' && (sortOrder === 'asc' ? '↑' : '↓')}
                    </Text>
                  </Pressable>
                </HStack>
              )}

              {/* Books Grid/Table */}
              <VStack spacing={theme.spacing[3]}>
                {books.map((book) => (
                  <Card key={book.id} variant="outlined" padding="md">
                    <HStack spacing={theme.spacing[4]} style={{ alignItems: 'flex-start' }}>
                      {/* Book Cover */}
                      <Pressable onPress={() => handleGetSummary(book)}>
                        {book.cover_image_url ? (
                          <Image
                            source={{ uri: book.cover_image_url }}
                            style={{
                              width: isMobile ? 60 : 80,
                              height: isMobile ? 90 : 120,
                              borderRadius: theme.borderRadius.sm,
                              backgroundColor: theme.colors.gray[200],
                            }}
                            resizeMode="cover"
                          />
                        ) : (
                          <View
                            style={{
                              width: isMobile ? 60 : 80,
                              height: isMobile ? 90 : 120,
                              borderRadius: theme.borderRadius.sm,
                              backgroundColor: theme.colors.gray[200],
                              justifyContent: 'center',
                              alignItems: 'center',
                            }}
                          >
                            <Text style={{ fontSize: 10, color: theme.colors.gray[500] }}>No cover</Text>
                          </View>
                        )}
                      </Pressable>

                      {/* Book Details */}
                      <View style={{ flex: 1 }}>
                        <VStack spacing={theme.spacing[2]}>
                          <Text style={{ fontSize: 18, fontWeight: '600', color: theme.colors.gray[900] }}>
                            {book.title}
                          </Text>
                          <Text style={{ fontSize: 14, color: theme.colors.gray[600] }}>
                            by {book.author}
                          </Text>
                          {book.genre && (
                            <Badge variant="secondary" style={{ alignSelf: 'flex-start' }}>
                              {book.genre}
                            </Badge>
                          )}
                          {book.description && (
                            <Text
                              style={{ fontSize: 14, color: theme.colors.gray[700], lineHeight: 20 }}
                              numberOfLines={2}
                            >
                              {book.description}
                            </Text>
                          )}
                        </VStack>
                      </View>

                      {/* Action Button */}
                      <Button
                        title={book.has_default_summary ? 'Get Summary' : 'Generate'}
                        onPress={() => handleGetSummary(book)}
                        variant="primary"
                        size={isMobile ? 'sm' : 'md'}
                      />
                    </HStack>
                  </Card>
                ))}
              </VStack>

              {/* Pagination */}
              <View style={{ marginTop: theme.spacing[4] }}>
                <Text style={{ fontSize: 14, color: theme.colors.gray[600], textAlign: 'center', marginBottom: theme.spacing[3] }}>
                  Showing {startIndex} to {endIndex} of {total} books
                  {totalPages > 1 && ` (page ${page} of ${totalPages})`}
                </Text>

                {totalPages > 1 && (
                  <HStack spacing={theme.spacing[2]} style={{ justifyContent: 'center' }} wrap>
                    <Button
                      title="Previous"
                      onPress={() => setPage(page - 1)}
                      disabled={page === 1}
                      variant="outline"
                      size="sm"
                    />
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <Button
                          key={pageNum}
                          title={String(pageNum)}
                          onPress={() => setPage(pageNum)}
                          variant={page === pageNum ? 'primary' : 'outline'}
                          size="sm"
                        />
                      );
                    })}
                    <Button
                      title="Next"
                      onPress={() => setPage(page + 1)}
                      disabled={page === totalPages}
                      variant="outline"
                      size="sm"
                    />
                  </HStack>
                )}
              </View>
            </VStack>
          )}
        </VStack>
      </Container>

      {/* Generate Summary Modal */}
      {selectedBook && (
        <GenerateSummaryModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          onGenerate={handleGenerate}
          bookId={selectedBook.id}
          bookTitle={selectedBook.title}
        />
      )}
    </DashboardLayout>
  );
}

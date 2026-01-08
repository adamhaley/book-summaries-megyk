'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  Text,
  Group,
  Stack,
  Badge,
  SimpleGrid,
  Title,
  Loader,
  Center,
  Alert,
  Button,
  Box,
  Image,
  Container,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconSparkles,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { SUMMARY_STYLE_OPTIONS, SUMMARY_LENGTH_OPTIONS } from '@/lib/types/preferences';
import { BookCarousel } from '@/components/carousel/BookCarousel';
import { ChatWithBook } from '@/components/chat/ChatWithBook';
import { Book } from '@/lib/types/books';

interface RecentSummary {
  id: string;
  created_at: string;
  style: string;
  length: string;
  book?: {
    title: string;
    author: string;
    genre?: string;
  };
}

// Hero section - consumer-friendly book showcase
function HeroSection({
  router,
  book,
  onOpenChat,
}: {
  router: any;
  book?: Book;
  onOpenChat: (book: Book) => void;
}) {
  // Default placeholder if no book provided
  const currentBook = book ? {
    title: book.title,
    author: book.author,
    cover: book.cover_image_url || "https://placehold.co/300x450/7C3AED/FBBF24?text=" + encodeURIComponent(book.title),
    genre: book.genre || "General"
  } : {
    title: "$100M Offers",
    author: "Alex Hormozi",
    cover: "https://placehold.co/300x450/7C3AED/FBBF24?text=$100M+OFFERS&font=roboto",
    genre: "Business"
  };

  return (
    <Box 
      style={{
        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
        borderRadius: '16px',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(37, 99, 235, 0.2)',
      }}
      p={{ base: 'lg', sm: 'xl', md: '3rem 2rem' }}
    >
      {/* Mobile: Stack, Desktop: Horizontal */}
      <Stack 
        gap="lg"
        style={{ position: 'relative', zIndex: 2 }}
        hiddenFrom="md"
      >
        {/* Mobile Layout - Centered */}
        <Stack align="center" gap="md">
          <Box
            style={{
              perspective: '1200px',
              position: 'relative',
            }}
          >
            <Image
              src={currentBook.cover}
              alt={currentBook.title}
              h={260}
              w={173}
              radius="md"
              style={{
                transform: 'rotateX(-22deg) rotateY(12deg)',
                transformStyle: 'preserve-3d',
                boxShadow: 
                  '8px -6px 24px rgba(0, 0, 0, 0.15), ' +
                  '12px -10px 40px rgba(0, 0, 0, 0.1), ' +
                  '4px -3px 12px rgba(37, 99, 235, 0.2)',
              }}
            />
          </Box>
          
          <Badge 
            size="md" 
            variant="filled"
            style={{ 
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              border: '1px solid #2563EB',
            }}
          >
            FEATURED
          </Badge>
        </Stack>

        <Stack gap="sm" align="center">
          <Title order={1} size="1.75rem" c="#000000" style={{ lineHeight: 1.2, textAlign: 'left' }}>
            {currentBook.title}
          </Title>
          
          <Text size="lg" c="#374151" style={{ textAlign: 'left' }}>
            by {currentBook.author}
          </Text>

          <Group gap="xs" justify="center">
            <Badge variant="light" color="violet">
              {currentBook.genre}
            </Badge>
          </Group>
        </Stack>

        <Stack gap="sm" mt="xs">
          <Button
            size="md"
            variant="filled"
            leftSection={<IconSparkles size={18} />}
            onClick={() => router.push('/dashboard/library')}
            style={{ 
              fontWeight: 600,
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
            }}
            fullWidth
          >
            Discover More
          </Button>

          {book && (
            <a
              href="#chat-with-book"
              onClick={(e) => {
                e.preventDefault();
                onOpenChat(book);
              }}
              className="chat-with-book-cta"
              aria-label={`Chat with ${book.title}`}
              style={{
                display: 'block',
                width: '100%',
                cursor: 'pointer',
                borderRadius: 12,
                overflow: 'hidden',
                border: 'none',
                textDecoration: 'none',
              }}
            >
              <img
                src="/chat-with-book/chat-with-book.png"
                alt={`Chat with ${book.title}`}
                style={{ display: 'block', width: '100%', height: 'auto' }}
              />
            </a>
          )}
        </Stack>
      </Stack>

      {/* Desktop Layout - Horizontal */}
      <Group 
        align="center" 
        gap="xl" 
        wrap="nowrap" 
        style={{ position: 'relative', zIndex: 2 }}
        visibleFrom="md"
      >
        {/* Book Cover */}
        <Box
          style={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            perspective: '1500px',
          }}
        >
          <Image
            src={currentBook.cover}
            alt={currentBook.title}
            height={280}
            width={187}
            radius="md"
            style={{
              transform: 'rotateX(-25deg) rotateY(15deg)',
              transformStyle: 'preserve-3d',
              boxShadow: 
                '12px -10px 35px rgba(0, 0, 0, 0.12), ' +
                '18px -15px 60px rgba(0, 0, 0, 0.08), ' +
                '6px -5px 18px rgba(37, 99, 235, 0.15)',
            }}
          />
        </Box>

        {/* Book Info */}
        <Stack gap="md" style={{ flex: 1, minWidth: 0 }}>
          <Badge 
            size="lg" 
            variant="filled"
            style={{ 
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              border: '1px solid #2563EB',
              width: 'fit-content'
            }}
          >
            FEATURED
          </Badge>
          
          <Title order={1} size="2.5rem" c="#000000" style={{ lineHeight: 1.2, textAlign: 'left' }}>
            {currentBook.title}
          </Title>
          
          <Text size="xl" c="#374151" style={{ textAlign: 'left' }}>
            by {currentBook.author}
          </Text>

          <Group gap="xs">
            <Badge variant="light" color="violet">
              {currentBook.genre}
            </Badge>
          </Group>

          <Group gap="md" mt="md">
            <Button
              size="lg"
              variant="filled"
              leftSection={<IconSparkles size={20} />}
              onClick={() => router.push('/dashboard/library')}
              style={{ 
                fontWeight: 600,
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
              }}
            >
              Discover More
            </Button>

            {book && (
              <a
                href="#chat-with-book"
                onClick={(e) => {
                  e.preventDefault();
                  onOpenChat(book);
                }}
                className="chat-with-book-cta"
                aria-label={`Chat with ${book.title}`}
                style={{
                  display: 'block',
                  cursor: 'pointer',
                  borderRadius: 12,
                  overflow: 'hidden',
                  border: 'none',
                  textDecoration: 'none',
                }}
              >
                <img
                  src="/chat-with-book/chat-with-book.png"
                  alt={`Chat with ${book.title}`}
                  style={{ display: 'block', height: 56, width: 'auto' }}
                />
              </a>
            )}
          </Group>
        </Stack>
      </Group>

      {/* Subtle background decoration */}
      <Box
        style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.1) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />
    </Box>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [recentSummaries, setRecentSummaries] = useState<RecentSummary[]>([]);
  const [recommendedBooks, setRecommendedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatOpened, setChatOpened] = useState(false);
  const [chatBook, setChatBook] = useState<Book | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('[DashboardPage] Fetching dashboard data...');
      
      // Add timeout to prevent infinite loading - longer for local dev
      const isLocalDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), isLocalDev ? 60000 : 15000); // 60s local, 15s prod
      
      const [summariesResponse, booksResponse] = await Promise.all([
        fetch('/api/v1/summaries?limit=3', { signal: controller.signal }),
        fetch('/api/v1/books?limit=12', { signal: controller.signal }),
      ]);

      if (!summariesResponse.ok) {
        throw new Error('Failed to fetch recent summaries');
      }
      if (!booksResponse.ok) {
        throw new Error('Failed to fetch books');
      }

      const [summariesData, booksData] = await Promise.all([
        summariesResponse.json(),
        booksResponse.json(),
      ]);

      setRecentSummaries(summariesData.summaries || []);
      setRecommendedBooks(booksData.books || []);
      console.log('[DashboardPage] Summaries and books loaded');
      
      clearTimeout(timeoutId);
    } catch (err: any) {
      console.error('[DashboardPage] Error fetching dashboard data:', err);
      if (err.name === 'AbortError') {
        setError('Request timed out. Please check your connection and try again.');
      } else {
        setError('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
      console.log('[DashboardPage] Loading complete');
    }
  };

  if (loading) {
    return (
      <Center style={{ minHeight: '400px' }}>
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text c="dimmed">Loading dashboard...</Text>
        </Stack>
      </Center>
    );
  }

  if (error) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
        {error}
      </Alert>
    );
  }

  const featuredBook =
    recommendedBooks.find((candidate) => {
      const title = (candidate.title || '').trim().toLowerCase();
      return title === '$100m offers' || title === '100m offers' || title.includes('100m offers');
    }) || recommendedBooks[0];

  const handleOpenChat = (book: Book) => {
    setChatBook(book);
    setChatOpened(true);
  };

  return (
    <Container size="xl" pt="0" pb="xl">
      <Stack gap="xl">
        <Title order={1} c="#000000">For You</Title>

        {/* Hero Section - Continue Reading */}
        <HeroSection router={router} book={featuredBook} onOpenChat={handleOpenChat} />

      {/* Recommended Books Carousel */}
      {recommendedBooks.length > 0 && (
        <Box>
          <Stack gap="md" mb="md">
            <Title order={2} c="#000000">Recommended For You</Title>
            <Text size="lg" c="#374151">
              Handpicked books based on your interests
            </Text>
          </Stack>
          <BookCarousel 
            books={recommendedBooks}
            showTitle={false}
          />
        </Box>
      )}

      {/* Recent Summaries - More compact, less prominent */}
      {recentSummaries.length > 0 && (
        <Box>
          <Stack gap="md" mb="md">
            <Title order={2} c="#000000">Your Collection</Title>
          </Stack>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
            {recentSummaries.slice(0, 3).map((summary) => (
              <Card 
                key={summary.id} 
                padding="lg" 
                radius="md" 
                withBorder
                style={{
                  backgroundColor: '#ffffff',
                  borderColor: '#e5e7eb',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(37, 99, 235, 0.5)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                onClick={() => router.push('/dashboard/summaries')}
              >
                <Stack gap="sm">
                  <Group justify="space-between" wrap="nowrap" align="flex-start">
                    <Stack gap={4} style={{ flex: 1 }}>
                      <Text size="lg" fw={600} lineClamp={2} c="#000000">
                        {summary.book?.title || 'Unknown Book'}
                      </Text>
                      <Text size="sm" c="#374151">
                        by {summary.book?.author || 'Unknown Author'}
                      </Text>
                    </Stack>
                  </Group>
                  <Group gap="xs">
                    <Badge size="sm" variant="light" color="green">
                      {SUMMARY_STYLE_OPTIONS.find(opt => opt.value === summary.style)?.label || summary.style}
                    </Badge>
                    <Badge size="sm" variant="light" color="blue">
                      {SUMMARY_LENGTH_OPTIONS.find(opt => opt.value === summary.length)?.label || summary.length}
                    </Badge>
                  </Group>
                </Stack>
              </Card>
            ))}
          </SimpleGrid>
        </Box>
      )}
      </Stack>

      <ChatWithBook
        opened={chatOpened}
        onClose={() => setChatOpened(false)}
        book={chatBook}
      />
    </Container>
  );
}

'use client';

import { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  Text,
  Group,
  Stack,
  Badge,
  Progress,
  SimpleGrid,
  Title,
  ThemeIcon,
  Loader,
  Center,
  Alert,
  Button,
  Box,
  Image,
} from '@mantine/core';
import {
  IconBook,
  IconBookmark,
  IconClock,
  IconTrendingUp,
  IconAlertCircle,
  IconPlayerPlay,
  IconSparkles,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { SUMMARY_STYLE_OPTIONS, SUMMARY_LENGTH_OPTIONS } from '@/lib/types/preferences';
import { BookCarousel } from '@/components/carousel/BookCarousel';
import { Book } from '@/lib/types/books';

interface DashboardStats {
  totalBooks: number;
  monthBooks: number;
  summariesRead: number;
  readingTime: string;
  streak: number;
  weekSummaries: number;
  monthSummaries: number;
}

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

// Stats card component
function StatsCard({
  title,
  value,
  icon: Icon,
  color,
  description,
  onClick,
}: {
  title: string;
  value: string | number;
  icon: any;
  color: string;
  description?: string;
  onClick?: () => void;
}) {
  return (
    <Card
      shadow="sm"
      padding="lg"
      radius="md"
      withBorder
      style={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = 'var(--mantine-shadow-md)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'var(--mantine-shadow-sm)';
        }
      }}
      onClick={onClick}
    >
      <Group justify="space-between">
        <Stack gap="xs">
          <Text size="sm" c="dimmed" fw={500}>
            {title}
          </Text>
          <Text size="xl" fw={700}>
            {value}
          </Text>
          {description && (
            <Text size="xs" c="dimmed">
              {description}
            </Text>
          )}
        </Stack>
        <ThemeIcon color={color} size="xl" radius="md" variant="light">
          <Icon size={24} />
        </ThemeIcon>
      </Group>
    </Card>
  );
}

// Hero section - consumer-friendly book showcase
function HeroSection({ router }: { router: any }) {
  // Placeholder data - in production this would come from user's current reading
  const currentBook = {
    title: "Atomic Habits",
    author: "James Clear",
    cover: "https://placehold.co/300x450/8B5CF6/ffffff?text=Atomic+Habits",
    progress: 68,
    genre: "Self-Help"
  };

  return (
    <Box 
      style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2a1545 100%)',
        borderRadius: '16px',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(139, 92, 246, 0.2)',
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
          <Image
            src={currentBook.cover}
            alt={currentBook.title}
            h={200}
            w={133}
            radius="md"
            style={{
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6), 0 4px 16px rgba(139, 92, 246, 0.3)',
            }}
          />
          
          <Badge 
            size="md" 
            variant="filled"
            style={{ 
              backgroundColor: 'rgba(139, 92, 246, 0.2)',
              color: '#FFFFFF',
              border: '1px solid rgba(139, 92, 246, 0.4)',
            }}
          >
            CONTINUE READING
          </Badge>
        </Stack>

        <Stack gap="sm" align="center" ta="center">
          <Title order={1} size="1.75rem" c="#FFFFFF" style={{ lineHeight: 1.2 }}>
            {currentBook.title}
          </Title>
          
          <Text size="lg" c="#AAAAAA">
            by {currentBook.author}
          </Text>

          <Group gap="xs" justify="center">
            <Badge variant="light" color="violet">
              {currentBook.genre}
            </Badge>
            <Text size="sm" c="dimmed">
              {currentBook.progress}% complete
            </Text>
          </Group>
        </Stack>

        <Stack gap="sm" mt="xs">
          <Button
            size="md"
            variant="filled"
            color="cyan"
            leftSection={<IconPlayerPlay size={18} />}
            onClick={() => router.push('/dashboard/library')}
            style={{ fontWeight: 600 }}
            fullWidth
          >
            Continue Reading
          </Button>
          <Button
            size="md"
            variant="outline"
            c="#FFFFFF"
            leftSection={<IconSparkles size={18} />}
            style={{ 
              borderColor: '#FFFFFF',
              fontWeight: 600
            }}
            onClick={() => router.push('/dashboard/library')}
            fullWidth
          >
            Discover More
          </Button>
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
          }}
        >
          <Image
            src={currentBook.cover}
            alt={currentBook.title}
            height={280}
            width={187}
            radius="md"
            style={{
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6), 0 8px 24px rgba(139, 92, 246, 0.3)',
            }}
          />
        </Box>

        {/* Book Info */}
        <Stack gap="md" style={{ flex: 1, minWidth: 0 }}>
          <Badge 
            size="lg" 
            variant="filled"
            style={{ 
              backgroundColor: 'rgba(139, 92, 246, 0.2)',
              color: '#FFFFFF',
              border: '1px solid rgba(139, 92, 246, 0.4)',
              width: 'fit-content'
            }}
          >
            CONTINUE READING
          </Badge>
          
          <Title order={1} size="2.5rem" c="#FFFFFF" style={{ lineHeight: 1.2 }}>
            {currentBook.title}
          </Title>
          
          <Text size="xl" c="#AAAAAA">
            by {currentBook.author}
          </Text>

          <Group gap="xs">
            <Badge variant="light" color="violet">
              {currentBook.genre}
            </Badge>
            <Text size="sm" c="dimmed">
              {currentBook.progress}% complete
            </Text>
          </Group>

          <Group gap="md" mt="md">
            <Button
              size="lg"
              variant="filled"
              color="cyan"
              leftSection={<IconPlayerPlay size={20} />}
              onClick={() => router.push('/dashboard/library')}
              style={{ fontWeight: 600 }}
            >
              Continue Reading
            </Button>
            <Button
              size="lg"
              variant="outline"
              c="#FFFFFF"
              leftSection={<IconSparkles size={20} />}
              style={{ 
                borderColor: '#FFFFFF',
                fontWeight: 600
              }}
              onClick={() => router.push('/dashboard/library')}
            >
              Discover More
            </Button>
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
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />
    </Box>
  );
}

// Recent summaries card
function RecentSummariesCard({ summaries }: { summaries: RecentSummary[] }) {
  const router = useRouter();

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} ${Math.floor(diffInDays / 7) === 1 ? 'week' : 'weeks'} ago`;
    return `${Math.floor(diffInDays / 30)} ${Math.floor(diffInDays / 30) === 1 ? 'month' : 'months'} ago`;
  };

  const getStyleLabel = (style: string) => {
    return SUMMARY_STYLE_OPTIONS.find(opt => opt.value === style)?.label || style;
  };

  const getLengthLabel = (length: string) => {
    return SUMMARY_LENGTH_OPTIONS.find(opt => opt.value === length)?.label || length;
  };

  if (summaries.length === 0) {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack gap="md">
          <Text fw={500} size="lg">
            Recent Summaries
          </Text>
          <Center py="xl">
            <Stack align="center" gap="sm">
              <Text size="sm" c="dimmed">
                No summaries yet
              </Text>
              <Button
                size="xs"
                variant="light"
                onClick={() => router.push('/dashboard/library')}
              >
                Browse Library
              </Button>
            </Stack>
          </Center>
        </Stack>
      </Card>
    );
  }

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Text fw={500} size="lg">
            Recent Summaries
          </Text>
          <Button
            size="xs"
            variant="subtle"
            onClick={() => router.push('/dashboard/summaries')}
          >
            View All
          </Button>
        </Group>
        {summaries.slice(0, 3).map((summary) => (
          <Card key={summary.id} padding="sm" radius="md" withBorder>
            <Stack gap="xs">
              <Group justify="space-between" wrap="nowrap" align="flex-start">
                <Stack gap={4} style={{ flex: 1 }}>
                  <Text size="sm" fw={500} lineClamp={1}>
                    {summary.book?.title || 'Unknown Book'}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {summary.book?.author || 'Unknown Author'}
                  </Text>
                </Stack>
                <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
                  {getRelativeTime(summary.created_at)}
                </Text>
              </Group>
              <Group gap="xs">
                <Badge size="sm" variant="light" color="green">
                  {getStyleLabel(summary.style)}
                </Badge>
                <Badge size="sm" variant="light" color="blue">
                  {getLengthLabel(summary.length)}
                </Badge>
                {summary.book?.genre && (
                  <Badge size="sm" variant="light" color="gray">
                    {summary.book.genre}
                  </Badge>
                )}
              </Group>
            </Stack>
          </Card>
        ))}
      </Stack>
    </Card>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentSummaries, setRecentSummaries] = useState<RecentSummary[]>([]);
  const [recommendedBooks, setRecommendedBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch stats (keeping for now, but not displaying prominently)
      const statsResponse = await fetch('/api/v1/dashboard/stats');
      if (!statsResponse.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }
      const statsData = await statsResponse.json();
      setStats(statsData.stats);

      // Fetch recent summaries
      const summariesResponse = await fetch('/api/v1/summaries');
      if (!summariesResponse.ok) {
        throw new Error('Failed to fetch recent summaries');
      }
      const summariesData = await summariesResponse.json();
      setRecentSummaries(summariesData.summaries || []);

      // Fetch recommended books for carousel
      const booksResponse = await fetch('/api/v1/books?limit=12');
      if (booksResponse.ok) {
        const booksData = await booksResponse.json();
        setRecommendedBooks(booksData.books || []);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
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

  return (
    <Stack gap="xl">
      <Title order={1} c="#FFFFFF">For You</Title>

      {/* Hero Section - Continue Reading */}
      <HeroSection router={router} />

      {/* Recommended Books Carousel */}
      {recommendedBooks.length > 0 && (
        <Box>
          <Stack gap="md" mb="md">
            <Title order={2} c="#FFFFFF">Recommended For You</Title>
            <Text size="lg" c="#AAAAAA">
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
            <Group justify="space-between" align="center">
              <Title order={2} c="#FFFFFF">Your Collection</Title>
              <Button
                variant="subtle"
                color="cyan"
                onClick={() => router.push('/dashboard/summaries')}
              >
                View All
              </Button>
            </Group>
          </Stack>
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
            {recentSummaries.slice(0, 3).map((summary) => (
              <Card 
                key={summary.id} 
                padding="lg" 
                radius="md" 
                withBorder
                style={{
                  backgroundColor: '#000000',
                  borderColor: '#2a2a2a',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(0, 210, 255, 0.3)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#2a2a2a';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                onClick={() => router.push('/dashboard/summaries')}
              >
                <Stack gap="sm">
                  <Group justify="space-between" wrap="nowrap" align="flex-start">
                    <Stack gap={4} style={{ flex: 1 }}>
                      <Text size="lg" fw={600} lineClamp={2} c="#FFFFFF">
                        {summary.book?.title || 'Unknown Book'}
                      </Text>
                      <Text size="sm" c="#AAAAAA">
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
  );
}

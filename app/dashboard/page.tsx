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
} from '@mantine/core';
import {
  IconBook,
  IconBookmark,
  IconClock,
  IconTrendingUp,
  IconAlertCircle,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { SUMMARY_STYLE_OPTIONS, SUMMARY_LENGTH_OPTIONS } from '@/lib/types/preferences';

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

// Current reading card (placeholder)
function CurrentReadingCard() {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Text fw={500} size="lg">
            Current Reading
          </Text>
          <Badge size="sm" color="blue" variant="light">
            IN PROGRESS
          </Badge>
        </Group>

        <Stack gap="sm">
          <Text fw={600} size="md">
            Atomic Habits by James Clear
          </Text>

          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Progress
            </Text>
            <Text size="sm" fw={500}>
              68%
            </Text>
          </Group>

          <Progress value={68} color="blue" size="md" radius="md" />
        </Stack>
      </Stack>
    </Card>
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch stats
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
    <Stack gap="lg">
      <Title order={1}>Dashboard</Title>

      {/* Stats Grid */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        <StatsCard
          title="Total Books"
          value={stats?.totalBooks || 0}
          icon={IconBook}
          color="blue"
          description={
            stats?.monthBooks
              ? `+${stats.monthBooks} this month`
              : 'Available in library'
          }
          onClick={() => router.push('/dashboard/library')}
        />
        <StatsCard
          title="Summaries Generated"
          value={stats?.summariesRead || 0}
          icon={IconBookmark}
          color="green"
          description={
            stats?.weekSummaries
              ? `+${stats.weekSummaries} this week`
              : 'Start generating!'
          }
          onClick={() => router.push('/dashboard/summaries')}
        />
        <StatsCard
          title="Reading Time"
          value={stats?.readingTime || '0m'}
          icon={IconClock}
          color="orange"
          description="This month"
        />
        <StatsCard
          title="Streak"
          value={stats?.streak ? `${stats.streak} ${stats.streak === 1 ? 'day' : 'days'}` : '0 days'}
          icon={IconTrendingUp}
          color="violet"
          description={stats?.streak ? 'Keep it up!' : 'Start your streak!'}
        />
      </SimpleGrid>

      {/* Main Content Grid */}
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <CurrentReadingCard />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <RecentSummariesCard summaries={recentSummaries} />
        </Grid.Col>
      </Grid>
    </Stack>
  );
}

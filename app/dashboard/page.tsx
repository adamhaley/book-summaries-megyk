'use client';

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
} from '@mantine/core';
import {
  IconBook,
  IconBookmark,
  IconClock,
  IconTrendingUp,
} from '@tabler/icons-react';

// Stats card component
function StatsCard({
  title,
  value,
  icon: Icon,
  color,
  description,
}: {
  title: string;
  value: string | number;
  icon: any;
  color: string;
  description?: string;
}) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
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

// Reading progress card
function ReadingProgressCard() {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between">
          <Text fw={500}>Current Reading</Text>
          <Badge color="blue" variant="light">
            In Progress
          </Badge>
        </Group>
        <Text size="lg" fw={600}>
          Atomic Habits by James Clear
        </Text>
        <Stack gap="xs">
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Progress
            </Text>
            <Text size="sm" fw={500}>
              68%
            </Text>
          </Group>
          <Progress value={68} color="blue" size="lg" radius="xl" />
        </Stack>
      </Stack>
    </Card>
  );
}

// Recent summaries card
function RecentSummariesCard() {
  const summaries = [
    {
      title: 'Deep Work',
      author: 'Cal Newport',
      date: '2 days ago',
      category: 'Productivity',
    },
    {
      title: 'Thinking, Fast and Slow',
      author: 'Daniel Kahneman',
      date: '5 days ago',
      category: 'Psychology',
    },
    {
      title: 'The Lean Startup',
      author: 'Eric Ries',
      date: '1 week ago',
      category: 'Business',
    },
  ];

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Text fw={500} size="lg">
          Recent Summaries
        </Text>
        {summaries.map((summary, index) => (
          <Card key={index} padding="sm" radius="md" withBorder>
            <Group justify="space-between" wrap="nowrap">
              <Stack gap={4}>
                <Text size="sm" fw={500}>
                  {summary.title}
                </Text>
                <Text size="xs" c="dimmed">
                  {summary.author}
                </Text>
              </Stack>
              <Stack gap={4} align="flex-end">
                <Badge size="sm" variant="light">
                  {summary.category}
                </Badge>
                <Text size="xs" c="dimmed">
                  {summary.date}
                </Text>
              </Stack>
            </Group>
          </Card>
        ))}
      </Stack>
    </Card>
  );
}

export default function DashboardPage() {
  return (
    <Stack gap="lg">
      <Title order={1}>Dashboard</Title>

      {/* Stats Grid */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        <StatsCard
          title="Total Books"
          value={127}
          icon={IconBook}
          color="blue"
          description="+12 this month"
        />
        <StatsCard
          title="Summaries Read"
          value={45}
          icon={IconBookmark}
          color="green"
          description="+8 this week"
        />
        <StatsCard
          title="Reading Time"
          value="24h"
          icon={IconClock}
          color="orange"
          description="This month"
        />
        <StatsCard
          title="Streak"
          value="15 days"
          icon={IconTrendingUp}
          color="violet"
          description="Keep it up!"
        />
      </SimpleGrid>

      {/* Main Content Grid */}
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <ReadingProgressCard />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <RecentSummariesCard />
        </Grid.Col>
      </Grid>
    </Stack>
  );
}

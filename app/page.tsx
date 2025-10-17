'use client';

import {
  Container,
  Title,
  Text,
  Button,
  Card,
  SimpleGrid,
  Stack,
  ThemeIcon,
  Group,
  Center,
  Box,
} from '@mantine/core';
import {
  IconBook,
  IconSettings,
  IconSparkles,
  IconArrowRight,
} from '@tabler/icons-react';
import Link from 'next/link';

export default function Home() {
  return (
    <Container size="lg" py="xl">
      {/* Hero Section */}
      <Box
        p="xl"
        mb="xl"
        style={{ 
          background: 'var(--mantine-color-body)',
          borderRadius: 'var(--mantine-radius-md)' 
        }}
      >
          <Center>
            <Stack align="center" gap="lg">
              <Title order={1} size="3.5rem" fw={700} ta="center" maw={800}>
                Personalized Book Summaries
              </Title>
              <Text size="xl" c="dimmed" ta="center" maw={600}>
                Get AI-generated summaries tailored to your reading preferences and background
              </Text>
              <Button
                component={Link}
                href="/onboarding"
                size="lg"
                rightSection={<IconArrowRight size={20} />}
                gradient={{ from: 'blue', to: 'cyan' }}
                variant="gradient"
              >
                Get Started
              </Button>
            </Stack>
          </Center>
      </Box>

      {/* Features Section */}
      <Stack gap="xl">
        <Title order={2} ta="center" size="2.5rem" fw={600}>
          How It Works
        </Title>
        
        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack align="center" gap="md">
              <ThemeIcon size="xl" radius="md" variant="light" color="blue">
                <IconBook size={32} />
              </ThemeIcon>
              <Title order={3} size="xl" fw={600} ta="center">
                Choose a Book
              </Title>
              <Text c="dimmed" ta="center">
                Browse our library of books and select the one you want to learn about
              </Text>
            </Stack>
          </Card>
          
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack align="center" gap="md">
              <ThemeIcon size="xl" radius="md" variant="light" color="orange">
                <IconSettings size={32} />
              </ThemeIcon>
              <Title order={3} size="xl" fw={600} ta="center">
                Personalize
              </Title>
              <Text c="dimmed" ta="center">
                Tell us about your background and what you want to focus on
              </Text>
            </Stack>
          </Card>
          
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack align="center" gap="md">
              <ThemeIcon size="xl" radius="md" variant="light" color="violet">
                <IconSparkles size={32} />
              </ThemeIcon>
              <Title order={3} size="xl" fw={600} ta="center">
                Get Your Summary
              </Title>
              <Text c="dimmed" ta="center">
                Receive a summary tailored specifically to your needs and interests
              </Text>
            </Stack>
          </Card>
        </SimpleGrid>
      </Stack>

      {/* Coming Soon Banner */}
      <Card shadow="sm" padding="xl" radius="md" withBorder mt="xl">
        <Center>
          <Stack align="center" gap="md">
            <Title order={2} size="2rem" fw={600} c="dimmed">
              Platform Coming Soon
            </Title>
            <Text c="dimmed" ta="center" maw={500}>
              We're working hard to bring you the best personalized book summary experience
            </Text>
            <Text size="sm" c="dimmed" ta="center">
              Built with Next.js, Supabase, and AI-powered personalization
            </Text>
          </Stack>
        </Center>
      </Card>
    </Container>
  );
}

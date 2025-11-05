'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  Container, 
  Center, 
  Loader, 
  Text, 
  Stack, 
  Title, 
  Button, 
  Group,
  Box,
  Overlay
} from '@mantine/core';
import { IconArrowRight, IconSparkles } from '@tabler/icons-react';
import { Book } from '@/lib/types/books';
import { BookCarousel } from '@/components/carousel/BookCarousel';

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndLoadBooks = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setIsAuthenticated(true);
        // Load books for carousel
        try {
          const response = await fetch('/api/v1/books?featured=true&limit=12');
          if (response.ok) {
            const data = await response.json();
            setBooks(data.books || []);
          }
        } catch (error) {
          console.error('Error loading books:', error);
        }
      } else {
        setIsAuthenticated(false);
      }
      
      setLoading(false);
    };

    checkAuthAndLoadBooks();
  }, []);

  // Loading state
  if (loading) {
    return (
      <Container size="xs" py="xl" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <Center style={{ width: '100%' }}>
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text c="dimmed">Loading...</Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  // Not authenticated - show sign in prompt
  if (!isAuthenticated) {
    return (
      <Box style={{ minHeight: '100vh', position: 'relative' }}>
        <Overlay 
          gradient="linear-gradient(145deg, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.3) 100%)"
          opacity={0.6}
        />
        <Container 
          size="md" 
          style={{ 
            minHeight: '100vh', 
            display: 'flex', 
            alignItems: 'center',
            position: 'relative',
            zIndex: 2
          }}
        >
          <Center style={{ width: '100%' }}>
            <Stack align="center" gap="xl" ta="center">
              <Stack gap="md" align="center">
                <IconSparkles size={64} stroke={1} />
                <Title order={1} size="3rem" fw={800}>
                  Book Summaries
                </Title>
                <Text size="xl" c="dimmed" maw={600}>
                  Discover personalized AI-generated book summaries tailored just for you. 
                  Dive into thousands of books in minutes, not hours.
                </Text>
              </Stack>
              
              <Group gap="lg">
                <Button
                  size="lg"
                  variant="filled"
                  rightSection={<IconArrowRight size={20} />}
                  onClick={() => router.push('/auth/signin')}
                >
                  Get Started
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => router.push('/auth/signin')}
                >
                  Sign In
                </Button>
              </Group>
            </Stack>
          </Center>
        </Container>
      </Box>
    );
  }

  // Authenticated - show splash page with carousel
  return (
    <Box style={{ 
      minHeight: '100vh', 
      background: 'var(--mantine-color-body)',
      overflowX: 'hidden' // Prevent horizontal page scrolling
    }}>
      {/* Hero Section */}
      <Box 
        style={{
          background: 'linear-gradient(135deg, var(--mantine-color-blue-6) 0%, var(--mantine-color-violet-6) 100%)',
          color: 'white',
          paddingTop: '4rem',
          paddingBottom: '2rem',
        }}
      >
        <Container size="xl">
          <Stack align="center" gap="lg" ta="center">
            <Title order={1} size="3rem" fw={800}>
              Welcome Back
            </Title>
            <Text size="xl" opacity={0.9} maw={600}>
              Discover your next great read from our curated collection
            </Text>
            <Group gap="lg">
              <Button
                size="lg"
                variant="filled"
                color="dark"
                rightSection={<IconArrowRight size={20} />}
                onClick={() => router.push('/dashboard')}
              >
                Go to Dashboard
              </Button>
              <Button
                size="lg"
                variant="outline"
                c="white"
                onClick={() => router.push('/dashboard/library')}
              >
                Browse Library
              </Button>
            </Group>
          </Stack>
        </Container>
      </Box>

      {/* Featured Books Carousel */}
      <Box py="xl">
        <BookCarousel 
          books={books}
          title="Featured Books"
          showTitle={true}
        />
      </Box>

      {/* Call to Action */}
      <Box 
        py="xl" 
        style={{ 
          backgroundColor: 'light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-7))',
          borderTop: '1px solid light-dark(var(--mantine-color-gray-2), var(--mantine-color-dark-6))'
        }}
      >
        <Container size="md">
          <Stack align="center" gap="lg" ta="center">
            <Title order={2}>Ready to dive deeper?</Title>
            <Text size="lg" c="dimmed">
              Explore your personalized dashboard or browse our complete library
            </Text>
            <Group gap="md">
              <Button
                variant="filled"
                leftSection={<IconSparkles size={16} />}
                onClick={() => router.push('/dashboard')}
              >
                View Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard/library')}
              >
                Browse All Books
              </Button>
            </Group>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}

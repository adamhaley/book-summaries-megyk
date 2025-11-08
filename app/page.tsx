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
          const response = await fetch('/api/v1/books?featured=true&limit=20');
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
            <Loader size="lg" color="cyan" />
            <Text c="dimmed">Loading...</Text>
          </Stack>
        </Center>
      </Container>
    );
  }

  // Not authenticated - show sign in prompt
  if (!isAuthenticated) {
    return (
      <Box style={{ 
        height: 'calc(100vh - 60px)', 
        position: 'relative', 
        overflow: 'hidden',
        backgroundColor: '#000000'
      }}>
        <Container 
          size="md" 
          style={{ 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center',
            position: 'relative',
            zIndex: 10
          }}
        >
          <Center style={{ width: '100%' }}>
            <Stack align="center" gap="xl" ta="center">
              <Stack gap="md" align="center">
                <IconSparkles size={64} stroke={1.5} color="#00D2FF" />
                <Title order={1} size="3rem" fw={800} c="#FFFFFF">
                  Book Summaries
                </Title>
                <Text size="xl" c="#AAAAAA" maw={600}>
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
                  style={{ 
                    fontWeight: 600,
                    backgroundColor: 'rgba(0, 210, 255, 0.8)',
                    color: '#000000',
                  }}
                >
                  Get Started
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  c="#FFFFFF"
                  style={{ 
                    borderColor: '#FFFFFF',
                    fontWeight: 600
                  }}
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
      {/* Hero Section - High Contrast */}
      <Box 
        style={{
          background: '#000000',
          color: '#FFFFFF',
          paddingTop: '4rem',
          paddingBottom: '2rem',
          borderBottom: '1px solid #2a2a2a',
        }}
      >
        <Container size="xl">
          <Stack align="center" gap="lg" ta="center">
            <Title order={1} size="3rem" fw={800} c="#FFFFFF">
              Welcome Back
            </Title>
            <Text size="xl" c="#AAAAAA" maw={600}>
              Discover your next great read from our curated collection
            </Text>
            <Group gap="lg" justify="center">
              <Button
                size="lg"
                variant="filled"
                rightSection={<IconArrowRight size={20} />}
                onClick={() => router.push('/dashboard')}
                style={{ 
                  fontWeight: 600,
                  backgroundColor: 'rgba(0, 210, 255, 0.8)',
                  color: '#000000',
                }}
              >
                Go to Dashboard
              </Button>
              <Button
                size="lg"
                variant="outline"
                c="#FFFFFF"
                style={{ 
                  borderColor: '#FFFFFF',
                  fontWeight: 600
                }}
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
          backgroundColor: '#000000',
          borderTop: '1px solid #2a2a2a'
        }}
      >
        <Container size="md">
          <Stack align="center" gap="lg" ta="center">
            <Title order={2} c="#FFFFFF">Ready to dive deeper?</Title>
            <Text size="lg" c="#AAAAAA">
              Explore your personalized dashboard or browse our complete library
            </Text>
            <Group gap="md">
              <Button
                variant="filled"
                leftSection={<IconSparkles size={16} />}
                onClick={() => router.push('/dashboard')}
                style={{ 
                  backgroundColor: 'rgba(0, 210, 255, 0.8)',
                  color: '#000000',
                }}
              >
                View Dashboard
              </Button>
              <Button
                variant="outline"
                c="#FFFFFF"
                style={{ borderColor: '#FFFFFF' }}
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

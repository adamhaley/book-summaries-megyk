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
} from '@mantine/core';
import { IconArrowRight, IconSparkles } from '@tabler/icons-react';

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // Redirect authenticated users to dashboard
        router.push('/dashboard');
      } else {
        setIsAuthenticated(false);
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

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

  // Authenticated users are redirected to dashboard
  return null;
}

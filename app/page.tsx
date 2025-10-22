'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Container, Center, Loader, Text, Stack } from '@mantine/core';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // User is authenticated, redirect to dashboard
        router.push('/dashboard');
      } else {
        // User is not authenticated, redirect to signin
        router.push('/auth/signin');
      }
    };

    checkAuth();
  }, [router]);

  return (
    <Container size="xs" py="xl" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Center style={{ width: '100%' }}>
        <Stack align="center" gap="md">
          <Loader size="lg" />
          <Text c="dimmed">Checking authentication...</Text>
        </Stack>
      </Center>
    </Container>
  );
}

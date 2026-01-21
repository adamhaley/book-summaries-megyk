'use client';

import { Container, Center, Stack, Title, Text, Button } from '@mantine/core';
import { IconWifiOff } from '@tabler/icons-react';

export default function OfflinePage() {
  return (
    <Container size="sm" py="xl">
      <Center style={{ minHeight: '60vh' }}>
        <Stack align="center" gap="lg" ta="center">
          <IconWifiOff size={64} stroke={1.5} style={{ opacity: 0.5 }} />
          <Title order={1}>You're Offline</Title>
          <Text size="lg" c="dimmed" maw={400}>
            It looks like you've lost your internet connection.
            Your downloaded summaries are still available!
          </Text>
          <Button variant="filled" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </Stack>
      </Center>
    </Container>
  );
}

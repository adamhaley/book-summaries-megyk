import { Container, Title, Text, Button, Stack } from '@mantine/core';
import Link from 'next/link';

export default function NotFound() {
  return (
    <Container size="sm" py="xl" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Stack align="center" gap="lg" ta="center">
        <Title order={1} size="4rem" fw={800} c="#FFFFFF">
          404
        </Title>
        <Title order={2} c="#AAAAAA">
          Page Not Found
        </Title>
        <Text size="lg" c="#AAAAAA" maw={400}>
          The page you're looking for doesn't exist or has been moved.
        </Text>
        <Stack gap="sm" mt="md">
          <Button
            component={Link}
            href="/"
            size="lg"
            style={{
              fontWeight: 600,
              backgroundColor: 'rgba(0, 210, 255, 0.8)',
              color: '#000000',
            }}
          >
            Go Home
          </Button>
          <Button
            component={Link}
            href="/dashboard"
            size="lg"
            variant="outline"
            c="#FFFFFF"
            style={{
              borderColor: '#FFFFFF',
              fontWeight: 600
            }}
          >
            Go to Dashboard
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}


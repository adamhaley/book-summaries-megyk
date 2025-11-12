'use client'

import { useSearchParams } from 'next/navigation'
import { Container, Paper, Title, Text, Button, Stack, Alert } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import Link from 'next/link'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message') || 'An authentication error occurred'

  return (
    <Container size="xs" py="xl" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Paper shadow="md" p="xl" radius="md" withBorder style={{ width: '100%' }}>
        <Stack gap="lg">
          <div>
            <Title order={2} mb="xs">Authentication Error</Title>
            <Text c="dimmed" size="sm">
              There was a problem with your authentication
            </Text>
          </div>

          <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
            {message}
          </Alert>

          <Stack gap="sm">
            <Button component={Link} href="/auth/signin" fullWidth>
              Back to Sign In
            </Button>
            <Button component={Link} href="/" variant="outline" fullWidth>
              Go to Homepage
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  )
}

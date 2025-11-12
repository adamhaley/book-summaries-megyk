'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Container, Paper, Title, Text, Button, Stack, Alert, Loader } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import Link from 'next/link'

function ErrorContent() {
  const searchParams = useSearchParams()
  const message = searchParams.get('message') || 'An authentication error occurred'

  return (
    <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
      {message}
    </Alert>
  )
}

export default function AuthErrorPage() {
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

          <Suspense fallback={
            <Alert icon={<Loader size={16} />} color="gray" title="Loading">
              Loading error details...
            </Alert>
          }>
            <ErrorContent />
          </Suspense>

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

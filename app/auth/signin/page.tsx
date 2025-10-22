'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Container, Paper, Title, Text, TextInput, PasswordInput, Button, Stack, Anchor, Alert } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import { createClient } from '@/lib/supabase/client'

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      // Redirect to dashboard on success
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container size="xs" py="xl" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <Paper shadow="md" p="xl" radius="md" withBorder style={{ width: '100%' }}>
        <Stack gap="lg">
          <div>
            <Title order={2} mb="xs">Sign In</Title>
            <Text c="dimmed" size="sm">
              Welcome back! Sign in to access your book summaries
            </Text>
          </div>

          {error && (
            <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSignIn}>
            <Stack gap="md">
              <TextInput
                label="Email"
                placeholder="your@email.com"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <PasswordInput
                label="Password"
                placeholder="Your password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <Button type="submit" fullWidth loading={loading}>
                Sign In
              </Button>
            </Stack>
          </form>

          <Text size="sm" ta="center">
            Don't have an account?{' '}
            <Anchor href="/auth/signup" fw={500}>
              Sign up
            </Anchor>
          </Text>
        </Stack>
      </Paper>
    </Container>
  )
}

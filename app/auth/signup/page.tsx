'use client'

import { useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { Container, Paper, Title, Text, TextInput, PasswordInput, Button, Stack, Anchor, Alert, Loader, Center } from '@mantine/core'
import { IconAlertCircle, IconCheck } from '@tabler/icons-react'
import { createClient } from '@/lib/supabase/client'
import { useUTMTracking } from '@/hooks/useUTMTracking'

function SignUpForm() {
  const router = useRouter()
  const { utmParams } = useUTMTracking()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    // Validate password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      const emailRedirectUrl = new URL('/auth/confirm', window.location.origin)
      if (utmParams) {
        Object.entries(utmParams).forEach(([key, value]) => {
          if (value) {
            emailRedirectUrl.searchParams.set(key, value)
          }
        })
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: emailRedirectUrl.toString(),
        },
      })

      if (error) {
        setError(error.message)
        return
      }

      // Call n8n webhook after successful signup
      try {
        await fetch('/api/webhook/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'user_signup',
            email: data.user?.email,
            user_id: data.user?.id,
            utm: utmParams,
          }),
        })
      } catch (webhookError) {
        console.error('Signup webhook failed:', webhookError)
        // Don't fail the signup if webhook fails
      }

      // Check if email confirmation is required
      if (data.user && !data.user.confirmed_at) {
        setSuccess(true)
        // Don't redirect - user needs to confirm email first
      } else {
        // Auto-confirm is enabled, redirect to dashboard
        setSuccess(true)
        setTimeout(() => {
          router.push('/dashboard')
          router.refresh()
        }, 2000)
      }
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
            <Title order={2} mb="xs">Create Account</Title>
            <Text c="dimmed" size="sm">
              Sign up to start generating personalized book summaries
            </Text>
          </div>

          {error && (
            <Alert icon={<IconAlertCircle size={16} />} color="red" title="Error">
              {error}
            </Alert>
          )}

          {success && (
            <Alert icon={<IconCheck size={16} />} color="green" title="Success!">
              Account created successfully! Please check your email to verify your account.
            </Alert>
          )}

          <form onSubmit={handleSignUp}>
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
                placeholder="At least 6 characters"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <PasswordInput
                label="Confirm Password"
                placeholder="Confirm your password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              <Button type="submit" fullWidth loading={loading} disabled={success}>
                Create Account
              </Button>
            </Stack>
          </form>

          <Text size="sm" ta="center">
            Already have an account?{' '}
            <Anchor href="/auth/signin" fw={500}>
              Sign in
            </Anchor>
          </Text>
        </Stack>
      </Paper>
    </Container>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <Container size="xs" py="xl" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
        <Center style={{ width: '100%' }}>
          <Loader />
        </Center>
      </Container>
    }>
      <SignUpForm />
    </Suspense>
  )
}
